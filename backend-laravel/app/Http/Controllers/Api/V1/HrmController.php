<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Models\JobPosting;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\PerformanceReview;
use App\Models\Shift;
use App\Models\StaffAttendance;
use App\Models\StaffDocument;
use App\Models\StaffProfile;
use App\Models\StaffSchedule;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrmController extends Controller
{
    public function selfCheckin(Request $request): JsonResponse
    {
        if (in_array($request->user()->role, ['student', 'guardian'], true)) {
            return ApiResponse::error('Only staff users can check in or out.', 403);
        }

        $today = now('Asia/Dhaka')->toDateString();
        $now = now('Asia/Dhaka')->format('H:i:s');
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $record = StaffAttendance::query()->where('user_id', $request->user()->id)->whereDate('date', $today)->first();

        if ($request->input('action') === 'out' || ($record?->check_in && !$record?->check_out)) {
            if (!$record?->check_in) {
                return ApiResponse::error('Check in first before checking out.', 400);
            }
            if ($record->check_out) {
                return ApiResponse::error('Already checked out for today.', 400);
            }

            $record->fill(['check_out' => $now, 'ip_address' => $request->ip(), 'branch_id' => $branchId])->save();

            return ApiResponse::success(['message' => 'Checked out successfully!', 'type' => 'checkout', 'record' => $record]);
        }

        if ($record?->check_in) {
            return ApiResponse::error($record->check_out ? 'Already checked in and out for today.' : 'Already checked in today.', 400);
        }

        $record = StaffAttendance::query()->create([
            'user_id' => $request->user()->id,
            'branch_id' => $branchId,
            'date' => $today,
            'status' => 'present',
            'check_in' => $now,
            'method' => 'mobile',
            'ip_address' => $request->ip(),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
        ]);

        return ApiResponse::success(['message' => 'Checked in successfully!', 'type' => 'checkin', 'record' => $record]);
    }

    public function markStaffAttendance(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer'], 'date' => ['required', 'date']]);
        $record = StaffAttendance::query()->updateOrCreate([
            'user_id' => $request->input('user_id'),
            'date' => $request->input('date'),
        ], array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'method' => $request->input('method', 'manual'),
        ]));

        return ApiResponse::success($record);
    }

    public function getStaffAttendance(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $date = $request->query('date', now('Asia/Dhaka')->toDateString());

        // Frontend expects {staff: [...]} where each item is a User with StaffProfile + StaffAttendances
        $staffUsers = User::query()
            ->where('branch_id', $branchId)
            ->whereNotIn('role', ['student', 'guardian'])
            ->with([
                'staffProfile',
                'staffAttendances' => fn($q) => $q->whereDate('date', $date),
            ])
            ->orderBy('name')
            ->get();

        return ApiResponse::success(['staff' => $staffUsers]);
    }

    public function getStaffAttendanceSummary(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        // Get all staff users for this branch
        $staffUsers = User::query()
            ->where('branch_id', $branchId)
            ->whereNotIn('role', ['student', 'guardian'])
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        // Get all attendance records for this month
        $records = StaffAttendance::query()
            ->where('branch_id', $branchId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get()
            ->groupBy('user_id');

        // Build per-user summary: {user: {name}, entries: {day: {status}}, present: count}
        $summary = $staffUsers->map(function ($user) use ($records) {
            $userRecords = $records->get($user->id, collect());
            $entries = [];
            $presentCount = 0;
            foreach ($userRecords as $rec) {
                $day = (int) date('j', strtotime($rec->date));
                $entries[$day] = [
                    'status' => $rec->status,
                    'check_in' => $rec->check_in,
                    'check_out' => $rec->check_out,
                    'notes' => $rec->notes,
                ];
                if (in_array($rec->status, ['present', 'late'])) {
                    $presentCount++;
                }
            }
            return [
                'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                'entries' => $entries,
                'present' => $presentCount,
            ];
        });

        return ApiResponse::success($summary->values());
    }

    public function getMyStaffAttendance(Request $request): JsonResponse
    {
        return ApiResponse::success(StaffAttendance::query()->where('user_id', $request->user()->id)->orderByDesc('date')->get());
    }

    public function getLeaveTypes(): JsonResponse
    {
        return ApiResponse::success(LeaveType::query()->orderBy('name')->get());
    }

    public function createLeaveType(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);

        return ApiResponse::success(LeaveType::query()->create($request->all()), 201);
    }

    public function getLeaveRequests(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(LeaveRequest::query(), $request)
                ->with(['employee:id,name,email', 'approver:id,name,email', 'leaveType'])
                ->orderByDesc('id')
                ->get()
        );
    }

    public function createLeaveRequest(Request $request): JsonResponse
    {
        $request->validate(['leave_type_id' => ['required', 'integer'], 'start_date' => ['required', 'date'], 'end_date' => ['required', 'date']]);
        $leave = LeaveRequest::query()->create(array_merge($request->all(), [
            'user_id' => $request->input('user_id', $request->user()->id),
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'total_days' => $request->input('total_days', 1),
            'status' => 'pending',
        ]));

        return ApiResponse::success($leave, 201);
    }

    public function approveLeave(Request $request, int $id): JsonResponse
    {
        return $this->setLeaveStatus($request, $id, 'approved');
    }

    public function rejectLeave(Request $request, int $id): JsonResponse
    {
        return $this->setLeaveStatus($request, $id, 'rejected', ['rejection_note' => $request->input('rejection_note')]);
    }

    public function getMyLeaves(Request $request): JsonResponse
    {
        return ApiResponse::success(LeaveRequest::query()->with('leaveType')->where('user_id', $request->user()->id)->orderByDesc('id')->get());
    }

    public function getLeaveBalance(Request $request): JsonResponse
    {
        return ApiResponse::success(LeaveBalance::query()->with('leaveType')->where('user_id', $request->input('user_id', $request->user()->id))->where('year', $request->input('year', now()->year))->get());
    }

    public function getJobPostings(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(JobPosting::query(), $request)->withCount('applicants')->orderByDesc('id')->get());
    }

    public function createJobPosting(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string', 'max:255']]);
        $job = JobPosting::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'posted_by' => $request->user()->id,
        ]));

        return ApiResponse::success($job, 201);
    }

    public function updateJobPosting(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(JobPosting::class, $request, $id, 'Job not found');
    }

    public function deleteJobPosting(Request $request, int $id): JsonResponse
    {
        return $this->deleteScoped(JobPosting::class, $request, $id, 'Job not found', 'Job deleted');
    }

    public function getApplicants(Request $request): JsonResponse
    {
        $query = Applicant::query()->with('jobPosting:id,title,branch_id');
        $branchId = BranchScope::selectedBranchId($request);
        if ($branchId) {
            $query->whereHas('jobPosting', fn ($job) => $job->where('branch_id', $branchId));
        }

        return ApiResponse::success($query->orderByDesc('id')->get());
    }

    public function createApplicant(Request $request): JsonResponse
    {
        $request->validate(['job_posting_id' => ['required', 'integer'], 'name' => ['required', 'string']]);

        return ApiResponse::success(Applicant::query()->create($request->all()), 201);
    }

    public function updateApplicant(Request $request, int $id): JsonResponse
    {
        $applicant = Applicant::query()->find($id);
        if (!$applicant) {
            return ApiResponse::error('Applicant not found', 404);
        }
        $applicant->fill($request->all())->save();

        return ApiResponse::success($applicant);
    }

    public function hireApplicant(int $id): JsonResponse
    {
        $applicant = Applicant::query()->find($id);
        if (!$applicant) {
            return ApiResponse::error('Applicant not found', 404);
        }
        $applicant->fill(['stage' => 'hired'])->save();

        return ApiResponse::success($applicant);
    }

    public function getDocuments(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(StaffDocument::query(), $request)->with(['staff:id,name,email', 'uploader:id,name,email'])->orderByDesc('id')->get());
    }

    public function createDocument(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer'], 'title' => ['required', 'string']]);
        $payload = array_merge($request->except('file'), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'uploaded_by' => $request->user()->id,
        ]);
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $name = 'doc_'.time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads'), $name);
            $payload['file_url'] = '/uploads/'.$name;
            $payload['file_type'] = $file->getClientMimeType();
        }
        $payload['file_url'] = $payload['file_url'] ?? '';

        return ApiResponse::success(StaffDocument::query()->create($payload), 201);
    }

    public function deleteDocument(Request $request, int $id): JsonResponse
    {
        return $this->deleteScoped(StaffDocument::class, $request, $id, 'Document not found', 'Document deleted');
    }

    public function getExpiringDocuments(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(StaffDocument::query(), $request)->whereDate('expiry_date', '<=', now()->addDays(30)->toDateString())->orderBy('expiry_date')->get());
    }

    public function getReviews(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(PerformanceReview::query(), $request)->with(['employee:id,name,email', 'reviewer:id,name,email'])->orderByDesc('id')->get());
    }

    public function createReview(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer']]);
        $review = PerformanceReview::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'reviewer_id' => $request->input('reviewer_id', $request->user()->id),
        ]));

        return ApiResponse::success($review, 201);
    }

    public function updateReview(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(PerformanceReview::class, $request, $id, 'Review not found');
    }

    public function getMyReviews(Request $request): JsonResponse
    {
        return ApiResponse::success(PerformanceReview::query()->with('reviewer:id,name,email')->where('user_id', $request->user()->id)->orderByDesc('id')->get());
    }

    public function getShifts(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Shift::query(), $request)->orderBy('start_time')->get());
    }

    public function createShift(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string'], 'start_time' => ['required'], 'end_time' => ['required']]);
        return ApiResponse::success(Shift::query()->create(array_merge($request->all(), ['branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id])), 201);
    }

    public function updateShift(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(Shift::class, $request, $id, 'Shift not found');
    }

    public function getSchedules(Request $request): JsonResponse
    {
        $query = StaffSchedule::query()->with(['user:id,name,email', 'shift']);
        $branchId = BranchScope::selectedBranchId($request);
        if ($branchId) {
            $query->whereHas('shift', fn ($shift) => $shift->where('branch_id', $branchId));
        }

        return ApiResponse::success($query->orderByDesc('date')->get());
    }

    public function createSchedule(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer'], 'shift_id' => ['required', 'integer'], 'date' => ['required', 'date']]);

        return ApiResponse::success(StaffSchedule::query()->create($request->all()), 201);
    }

    public function deleteSchedule(int $id): JsonResponse
    {
        $schedule = StaffSchedule::query()->find($id);
        if (!$schedule) {
            return ApiResponse::error('Schedule not found', 404);
        }
        $schedule->delete();

        return ApiResponse::success(['message' => 'Schedule deleted']);
    }

    public function getOrgChart(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(StaffProfile::query(), $request)->with('user:id,name,email,role')->orderBy('department')->get());
    }

    public function getDashboardStats(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'staff' => BranchScope::apply(StaffProfile::query(), $request)->count(),
            'presentToday' => BranchScope::apply(StaffAttendance::query(), $request)->whereDate('date', now('Asia/Dhaka')->toDateString())->where('status', 'present')->count(),
            'pendingLeaves' => BranchScope::apply(LeaveRequest::query(), $request)->where('status', 'pending')->count(),
            'openJobs' => BranchScope::apply(JobPosting::query(), $request)->where('status', 'open')->count(),
        ]);
    }

    public function getBirthdays(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(StaffProfile::query(), $request)->with('user:id,name,email')->whereMonth('date_of_birth', now()->month)->orderBy('date_of_birth')->get());
    }

    public function getAnniversaries(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(StaffProfile::query(), $request)->with('user:id,name,email')->whereMonth('joining_date', now()->month)->orderBy('joining_date')->get());
    }

    private function setLeaveStatus(Request $request, int $id, string $status, array $extra = []): JsonResponse
    {
        $leave = BranchScope::apply(LeaveRequest::query(), $request)->find($id);
        if (!$leave) {
            return ApiResponse::error('Leave request not found', 404);
        }
        $leave->fill(array_merge(['status' => $status, 'approved_by' => $request->user()->id, 'approved_at' => now()], $extra))->save();

        return ApiResponse::success($leave);
    }

    private function updateScoped(string $model, Request $request, int $id, string $notFound): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }
        $row->fill($request->except('branch_id'))->save();

        return ApiResponse::success($row);
    }

    private function deleteScoped(string $model, Request $request, int $id, string $notFound, string $message): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }
        $row->delete();

        return ApiResponse::success(['message' => $message]);
    }
}
