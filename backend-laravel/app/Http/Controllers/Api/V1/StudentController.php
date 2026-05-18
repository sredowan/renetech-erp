<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    private const OPEN_FEE_STATUSES = ['pending', 'partial', 'overdue'];

    // ─── Derived State ───────────────────────────────────────────

    private function deriveStudentState(array $student, ?array $feeSummary, array $rejectedFees, ?array $enrollmentSummary): string
    {
        $status = $student['status'] ?? 'active';
        if ($status === 'dropped') return 'dropped';
        if ($feeSummary && ($feeSummary['due'] ?? 0) > 0 && in_array($feeSummary['status'] ?? '', self::OPEN_FEE_STATUSES)) return 'fees_pending';
        if (!empty($rejectedFees)) return 'payment_rejected';
        if ($enrollmentSummary && ($enrollmentSummary['status'] ?? '') === 'pending' && ($enrollmentSummary['paid_amount'] ?? 0) == 0) return 'fees_pending';
        if (($student['batch_id'] ?? null) && ($student['batch'] ?? $student['Batch'] ?? null) && !$enrollmentSummary && !$feeSummary) return 'fees_pending';
        if (!($student['batch_id'] ?? null)) return 'unassigned';

        $batchEndDate = $student['batch']['end_date'] ?? $student['Batch']['end_date'] ?? null;
        if ($batchEndDate && strtotime($batchEndDate) <= strtotime(date('Y-m-d'))) return 'course_completed';

        return 'enrolled';
    }

    private function decorateStudent(Student $student, ?array $feeSummary, array $rejectedFees, ?array $enrollmentSummary): array
    {
        $data = $student->toArray();
        $derivedState = $this->deriveStudentState($data, $feeSummary, $rejectedFees, $enrollmentSummary);

        return array_merge($data, [
            'derived_state' => $derivedState,
            'fee_summary' => $feeSummary,
            'rejected_fees' => $rejectedFees,
            'enrollment_summary' => $enrollmentSummary,
            'is_course_completed' => $derivedState === 'course_completed',
            'has_success_record' => !empty($student->final_course_result) || !empty($student->success_destination_country) || !empty($student->success_recorded_at),
            'course_completion_date' => $derivedState === 'course_completed' ? ($student->batch?->end_date ?? null) : null,
            'is_premium_pte' => ($student->plan_type ?? null) === 'premium',
        ]);
    }

    // ─── Fee / Enrollment Maps ───────────────────────────────────

    private function buildFeeSummaryMap(int $branchId, array $studentIds): array
    {
        if (empty($studentIds)) return [];

        $invoices = Invoice::query()
            ->where('branch_id', $branchId)
            ->whereIn('student_id', $studentIds)
            ->select(['id', 'student_id', 'enrollment_id', 'amount', 'paid', 'status', 'due_date', 'invoice_no'])
            ->orderByDesc('issued_at')
            ->get();

        $map = [];
        foreach ($invoices as $inv) {
            $due = max((float)$inv->amount - (float)$inv->paid, 0);
            $candidate = [
                'invoice_id' => $inv->id,
                'enrollment_id' => $inv->enrollment_id,
                'invoice_no' => $inv->invoice_no,
                'amount' => (float)$inv->amount,
                'paid' => (float)$inv->paid,
                'due' => $due,
                'status' => $inv->status,
                'due_date' => $inv->due_date,
            ];

            if (!isset($map[$inv->student_id]) || ($due > 0 && in_array($inv->status, self::OPEN_FEE_STATUSES))) {
                $map[$inv->student_id] = $candidate;
            }
        }
        return $map;
    }

    private function buildRejectedFeeMap(int $branchId, array $studentIds): array
    {
        if (empty($studentIds)) return [];

        $invoices = Invoice::query()
            ->where('branch_id', $branchId)
            ->where('status', 'rejected')
            ->select(['id', 'student_id', 'enrollment_id', 'invoice_no', 'amount', 'paid', 'status', 'notes', 'updated_at'])
            ->orderByDesc('updated_at')
            ->get();

        $map = [];
        foreach ($invoices as $inv) {
            $sid = $inv->student_id;
            if (!$sid || !in_array($sid, $studentIds)) continue;
            $map[$sid][] = [
                'invoice_id' => $inv->id,
                'enrollment_id' => $inv->enrollment_id,
                'invoice_no' => $inv->invoice_no,
                'amount' => (float)$inv->amount,
                'paid' => (float)$inv->paid,
                'status' => $inv->status,
                'note' => $inv->notes,
                'rejected_at' => $inv->updated_at,
            ];
        }
        return $map;
    }

    private function buildEnrollmentSummaryMap(int $branchId, array $studentIds): array
    {
        if (empty($studentIds)) return [];

        $enrollments = Enrollment::query()
            ->where('branch_id', $branchId)
            ->whereIn('student_id', $studentIds)
            ->select(['id', 'student_id', 'batch_id', 'total_fee', 'paid_amount', 'status'])
            ->orderByDesc('created_at')
            ->get();

        $map = [];
        foreach ($enrollments as $e) {
            if (!isset($map[$e->student_id])) {
                $map[$e->student_id] = [
                    'enrollment_id' => $e->id,
                    'total_fee' => (float)$e->total_fee,
                    'paid_amount' => (float)$e->paid_amount,
                    'status' => $e->status,
                ];
            }
        }
        return $map;
    }

    // ─── INDEX — full student list with derived state ────────────

    public function index(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;

        $students = Student::query()
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->with(['user', 'batch.course:id,title'])
            ->orderByDesc('created_at')
            ->get();

        $studentIds = $students->pluck('id')->all();
        $feeMap = $this->buildFeeSummaryMap($branchId, $studentIds);
        $rejMap = $this->buildRejectedFeeMap($branchId, $studentIds);
        $enrollMap = $this->buildEnrollmentSummaryMap($branchId, $studentIds);

        $result = $students->map(fn(Student $s) => $this->decorateStudent(
            $s,
            $feeMap[$s->id] ?? null,
            $rejMap[$s->id] ?? [],
            $enrollMap[$s->id] ?? null
        ));

        return ApiResponse::success($result);
    }

    // ─── SHOW — single student detail ────────────────────────────

    public function show(Request $request, int $id): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;

        $student = Student::query()
            ->where('id', $id)
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->with(['user', 'batch.course:id,title,duration_weeks', 'enrollments.batch.course'])
            ->first();

        if (!$student) return ApiResponse::error('Student not found', 404);

        $feeMap = $this->buildFeeSummaryMap($branchId, [$student->id]);
        $rejMap = $this->buildRejectedFeeMap($branchId, [$student->id]);
        $enrollMap = $this->buildEnrollmentSummaryMap($branchId, [$student->id]);

        return ApiResponse::success($this->decorateStudent(
            $student,
            $feeMap[$student->id] ?? null,
            $rejMap[$student->id] ?? [],
            $enrollMap[$student->id] ?? null
        ));
    }

    // ─── CREATE STUDENT ──────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        return DB::transaction(function () use ($request) {
            $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
            $firstName = $request->input('first_name', '');
            $lastName = $request->input('last_name', '');
            $name = $request->input('name') ?: trim("$firstName $lastName") ?: 'New Student';
            $email = $request->input('email') ?: 'student_' . time() . '@example.local';

            $generatedPassword = $request->input('password') ? null : bin2hex(random_bytes(12));
            $rawPassword = $request->input('password') ?: $generatedPassword;

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($rawPassword),
                'role' => 'student',
                'branch_id' => $branchId,
                'status' => 'active',
            ]);

            $student = Student::query()->create(array_merge($request->except(['name', 'email', 'password']), [
                'user_id' => $user->id,
                'branch_id' => $branchId,
                'first_name' => $firstName ?: explode(' ', $name)[0],
                'last_name' => $lastName ?: implode(' ', array_slice(explode(' ', $name), 1)),
                'enrollment_date' => now()->toDateString(),
                'status' => 'active',
            ]));

            $invoice = null;
            $enrollment = null;
            $courseId = $request->input('course_id');

            if ($courseId) {
                $course = Course::find($courseId);
                if ($course) {
                    $enrollment = Enrollment::query()->create([
                        'branch_id' => $branchId,
                        'student_id' => $student->id,
                        'batch_id' => $request->input('batch_id'),
                        'total_fee' => $course->base_fee,
                        'discount' => 0,
                        'paid_amount' => 0,
                        'status' => 'pending',
                    ]);

                    $invoice = Invoice::query()->create([
                        'branch_id' => $branchId,
                        'invoice_no' => 'INV-STU-' . now()->format('YmdHis') . '-' . $student->id,
                        'enrollment_id' => $enrollment->id,
                        'student_id' => $student->id,
                        'amount' => $course->base_fee,
                        'paid' => 0,
                        'status' => 'pending',
                        'due_date' => now()->addDays(7)->toDateString(),
                        'issued_at' => now(),
                        'notes' => "Direct student entry for {$course->title}. Pending fee collection via POS.",
                    ]);
                }
            }

            $student->load(['user', 'batch.course:id,title']);
            $feeMap = $this->buildFeeSummaryMap($branchId, [$student->id]);
            $rejMap = $this->buildRejectedFeeMap($branchId, [$student->id]);
            $enrollMap = $this->buildEnrollmentSummaryMap($branchId, [$student->id]);

            return ApiResponse::success([
                'user' => $user,
                'student' => $this->decorateStudent(
                    $student,
                    $feeMap[$student->id] ?? null,
                    $rejMap[$student->id] ?? [],
                    $enrollMap[$student->id] ?? null
                ),
                'enrollment' => $enrollment,
                'invoice' => $invoice,
                'temporary_password' => $generatedPassword,
            ], 201);
        });
    }

    // ─── UPDATE STUDENT ──────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $student = Student::query()->where('id', $id)->when($branchId, fn($q) => $q->where('branch_id', $branchId))->first();
        if (!$student) return ApiResponse::error('Student not found', 404);

        $fillable = $request->except(['id', 'user_id', 'branch_id']);
        $student->fill($fillable);
        $student->save();

        // Sync user name if first/last name changed
        if ($request->has('first_name') || $request->has('last_name')) {
            $user = User::find($student->user_id);
            if ($user) {
                $user->name = trim(($student->first_name ?? '') . ' ' . ($student->last_name ?? '')) ?: 'No Name';
                $user->save();
            }
        }

        $student->load(['user', 'batch.course:id,title']);
        $feeMap = $this->buildFeeSummaryMap($branchId, [$student->id]);
        $rejMap = $this->buildRejectedFeeMap($branchId, [$student->id]);
        $enrollMap = $this->buildEnrollmentSummaryMap($branchId, [$student->id]);

        return ApiResponse::success($this->decorateStudent(
            $student,
            $feeMap[$student->id] ?? null,
            $rejMap[$student->id] ?? [],
            $enrollMap[$student->id] ?? null
        ));
    }

    // ─── UPDATE MANAGEMENT (batch/status change) ─────────────────

    public function updateManagement(Request $request, int $id): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $student = Student::query()->where('id', $id)->when($branchId, fn($q) => $q->where('branch_id', $branchId))->first();
        if (!$student) return ApiResponse::error('Student not found', 404);

        if ($request->has('batch_id')) {
            $batchId = $request->input('batch_id');
            if ($batchId) {
                $batch = Batch::query()->where('id', $batchId)->where('branch_id', $branchId)->first();
                if (!$batch) return ApiResponse::error('Invalid batch selected for this branch', 400);
                $student->batch_id = $batch->id;
            } else {
                $student->batch_id = null;
            }
        }

        if ($request->has('status')) {
            $status = $request->input('status');
            if (!in_array($status, ['active', 'dropped'])) return ApiResponse::error('Allowed status values are active or dropped', 400);
            $student->status = $status;
        }

        $student->save();
        $student->load(['user', 'batch.course:id,title']);

        $feeMap = $this->buildFeeSummaryMap($branchId, [$student->id]);
        $rejMap = $this->buildRejectedFeeMap($branchId, [$student->id]);
        $enrollMap = $this->buildEnrollmentSummaryMap($branchId, [$student->id]);

        return ApiResponse::success($this->decorateStudent(
            $student,
            $feeMap[$student->id] ?? null,
            $rejMap[$student->id] ?? [],
            $enrollMap[$student->id] ?? null
        ));
    }

    // ─── UPDATE SUCCESS RECORD ───────────────────────────────────

    public function updateSuccessRecord(Request $request, int $id): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $student = Student::query()->where('id', $id)->when($branchId, fn($q) => $q->where('branch_id', $branchId))->first();
        if (!$student) return ApiResponse::error('Student not found', 404);

        $wasRecorded = (bool) $student->success_recorded_at;
        $finalResult = trim($request->input('final_course_result', '') ?: '') ?: null;
        $successCountry = trim($request->input('success_destination_country', '') ?: '') ?: null;
        $successNotes = trim($request->input('success_notes', '') ?: '') ?: null;

        $student->final_course_result = $finalResult;
        $student->success_destination_country = $successCountry;
        $student->success_notes = $successNotes;
        $student->success_recorded_at = ($finalResult || $successCountry || $successNotes) ? ($request->input('success_recorded_at') ?: now()) : null;
        $student->save();

        if (!$wasRecorded && $student->success_recorded_at) {
            Activity::query()->create([
                'branch_id' => $branchId,
                'student_id' => $student->id,
                'type' => 'task',
                'subject' => 'Passed Course',
                'description' => "Student achieved result: " . ($finalResult ?: 'N/A') . ". Destination: " . ($successCountry ?: 'N/A') . ".",
                'created_by' => $request->user()->id,
                'is_done' => true,
                'completed_at' => now(),
            ]);
        }

        $student->load(['user', 'batch.course:id,title,duration_weeks']);
        $feeMap = $this->buildFeeSummaryMap($branchId, [$student->id]);
        $rejMap = $this->buildRejectedFeeMap($branchId, [$student->id]);
        $enrollMap = $this->buildEnrollmentSummaryMap($branchId, [$student->id]);

        return ApiResponse::success($this->decorateStudent(
            $student,
            $feeMap[$student->id] ?? null,
            $rejMap[$student->id] ?? [],
            $enrollMap[$student->id] ?? null
        ));
    }

    // ─── UPLOAD PHOTO ────────────────────────────────────────────

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) return ApiResponse::error('Student not found', 404);
        $request->validate(['photo' => ['required', 'file', 'image']]);

        $file = $request->file('photo');
        $name = 'student_' . time() . '_' . $file->getClientOriginalName();
        $file->move(public_path('uploads'), $name);

        $student->photograph_url = '/uploads/' . $name;
        $student->save();

        return ApiResponse::success(['message' => 'Photo uploaded', 'photograph_url' => $student->photograph_url]);
    }

    // ─── ACTIVITIES ──────────────────────────────────────────────

    public function activities(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) return ApiResponse::error('Student not found', 404);

        return ApiResponse::success(
            Activity::query()->where('student_id', $id)->where('branch_id', $student->branch_id)
                ->with('creator:id,name')
                ->orderByDesc('created_at')->get()
        );
    }

    public function createActivity(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) return ApiResponse::error('Student not found', 404);

        $activity = Activity::query()->create([
            'branch_id' => $student->branch_id,
            'student_id' => $student->id,
            'type' => $request->input('type', 'note'),
            'subject' => $request->input('subject', 'Student Activity'),
            'description' => $request->input('description'),
            'created_by' => $request->user()->id,
        ]);

        return ApiResponse::success($activity->load('creator:id,name'), 201);
    }

    // ─── ENROLL IN BATCH ─────────────────────────────────────────

    public function enrollInBatch(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $student = Student::query()->where('id', $request->input('student_id'))->where('branch_id', $branchId)->first();
        if (!$student) return ApiResponse::error('Student not found', 404);

        $batch = Batch::query()->where('id', $request->input('batch_id'))->where('branch_id', $branchId)->first();
        if (!$batch) return ApiResponse::error('Invalid batch selected for this branch', 400);

        $student->batch_id = $batch->id;
        $student->save();

        return ApiResponse::success(['message' => 'Student enrolled in batch', 'student' => $student]);
    }

    // ─── UPDATE ME (self-service) ────────────────────────────────

    public function updateMe(Request $request): JsonResponse
    {
        $student = Student::query()->where('user_id', $request->user()->id)->first();
        if (!$student) return ApiResponse::error('Student profile not found', 404);

        $student->fill($request->only(['target_score', 'exam_date', 'mobile_no', 'current_address']));
        $student->save();

        return ApiResponse::success(['message' => 'Profile updated successfully', 'student' => $student]);
    }

    // ─── PARTNER ACCESS ──────────────────────────────────────────

    public function requestPartnerAccess(int $id): JsonResponse
    {
        return ApiResponse::success(['message' => 'Partner access request recorded.', 'student_id' => $id]);
    }
}
