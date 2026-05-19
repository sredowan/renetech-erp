<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Payroll;
use App\Models\PayrollBonus;
use App\Models\PayrollDeduction;
use App\Models\StaffPayRule;
use App\Models\StaffProfile;
use App\Models\TeacherSession;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function getStaff(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = User::query()
            ->with(['tokens', 'staffProfile', 'staffPayRule'])
            ->whereNotIn('role', ['student', 'guardian']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return ApiResponse::success($query->orderBy('name')->get());
    }

    public function updateStaffProfile(Request $request): JsonResponse
    {
        $request->validate(['user_id' => ['required', 'integer']]);
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;

        $profile = StaffProfile::query()->updateOrCreate([
            'user_id' => $request->input('user_id'),
        ], array_merge($request->except('user_id'), [
            'user_id' => $request->input('user_id'),
            'branch_id' => $branchId,
        ]));

        if ($request->hasAny(['employment_type', 'salary_mode', 'pay_type', 'base_salary', 'class_rate', 'hourly_rate'])) {
            StaffPayRule::query()->updateOrCreate([
                'user_id' => $request->input('user_id'),
            ], array_merge($request->only([
                'employment_type', 'salary_mode', 'work_shift', 'pay_type', 'base_salary', 'class_rate',
                'hourly_rate', 'festival_bonus', 'conveyance_fee', 'other_allowance', 'deduction',
                'student_rate', 'is_payroll_active',
            ]), [
                'user_id' => $request->input('user_id'),
                'branch_id' => $branchId,
            ]));
        }

        return ApiResponse::success($profile->load('user'));
    }

    public function updateStaffStatus(Request $request, int $id): JsonResponse
    {
        $profile = StaffProfile::query()->where('user_id', $id)->first();
        if (!$profile) {
            return ApiResponse::error('Staff profile not found', 404);
        }

        $profile->fill($request->only([
            'employment_status', 'exit_date', 'exit_reason', 'notice_start_date', 'notice_end_date',
            'final_settlement_status', 'final_settlement_notes',
        ]))->save();

        return ApiResponse::success($profile);
    }

    public function getPayrollHistory(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;

        $payrolls = BranchScope::apply(Payroll::query(), $request)
            ->with('staff:id,name,email')
            ->when($month, fn ($q) => $q->where('month', $month))
            ->when($year, fn ($q) => $q->where('year', $year))
            ->orderByDesc('year')->orderByDesc('month')
            ->get();

        $enriched = $payrolls->map(function ($payroll) use ($branchId, $month, $year) {
            $item = $payroll->toArray();
            $staffId = $item['staff_id'];
            $m = $item['month'] ?? $month;
            $y = $item['year'] ?? $year;

            // Pay rule
            $payRule = StaffPayRule::query()->where('user_id', $staffId)->where('branch_id', $branchId)->first();
            $item['pay_rule'] = $payRule;

            // Accounting expense
            $expense = $payroll->expense_id
                ? Expense::query()->where('id', $payroll->expense_id)->where('branch_id', $branchId)->first()
                : Expense::query()->where('payroll_id', $payroll->id)->where('branch_id', $branchId)->first();
            $item['accounting_expense'] = $expense;

            // Teacher sessions
            $sessions = $m && $y ? TeacherSession::query()
                ->where('teacher_id', $staffId)->where('branch_id', $branchId)
                ->where('status', 'approved')
                ->whereBetween('session_date', [
                    sprintf('%d-%02d-01', $y, $m),
                    date('Y-m-t', mktime(0, 0, 0, $m, 1, $y)),
                ])->get() : collect();

            $item['session_summary'] = [
                'session_count' => $sessions->count(),
                'total_hours' => $sessions->sum('duration_hours'),
                'student_count' => $sessions->sum('student_count'),
                'amount' => $sessions->sum('amount'),
            ];

            // Deductions
            $deductions = $m && $y ? PayrollDeduction::query()
                ->where('staff_id', $staffId)->where('branch_id', $branchId)
                ->where('month', $m)->where('year', $y)->get() : collect();
            $item['deductions_detail'] = $deductions;
            $item['deductions_summary'] = $this->summarizeAdjustments($deductions);

            // Bonuses
            $bonuses = $m && $y ? PayrollBonus::query()
                ->where('staff_id', $staffId)->where('branch_id', $branchId)
                ->where('month', $m)->where('year', $y)->get() : collect();
            $item['bonuses_detail'] = $bonuses;
            $item['bonuses_summary'] = $this->summarizeAdjustments($bonuses);

            return $item;
        });

        return ApiResponse::success($enriched);
    }

    private function summarizeAdjustments($items): array
    {
        $summary = ['total_count' => 0, 'approved' => 0, 'pending' => 0, 'applied' => 0, 'rejected' => 0];
        foreach ($items as $item) {
            $status = $item->status ?? 'pending';
            $summary['total_count']++;
            $summary[$status] = ($summary[$status] ?? 0) + (float) ($item->amount ?? 0);
        }
        return $summary;
    }

    public function getDeductions(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(PayrollDeduction::query(), $request)->with('staff:id,name,email')->orderByDesc('id')->get());
    }

    public function createDeduction(Request $request): JsonResponse
    {
        return $this->createPayrollAdjustment($request, PayrollDeduction::class, 'deduction_type');
    }

    public function updateDeduction(Request $request, int $id): JsonResponse
    {
        return $this->updateAdjustment($request, PayrollDeduction::class, $id, 'Deduction not found');
    }

    public function deleteDeduction(Request $request, int $id): JsonResponse
    {
        return $this->deleteAdjustment($request, PayrollDeduction::class, $id, 'Deduction not found', 'Deduction deleted');
    }

    public function getBonuses(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(PayrollBonus::query(), $request)->with('staff:id,name,email')->orderByDesc('id')->get());
    }

    public function createBonus(Request $request): JsonResponse
    {
        return $this->createPayrollAdjustment($request, PayrollBonus::class, 'bonus_type');
    }

    public function updateBonus(Request $request, int $id): JsonResponse
    {
        return $this->updateAdjustment($request, PayrollBonus::class, $id, 'Bonus not found');
    }

    public function deleteBonus(Request $request, int $id): JsonResponse
    {
        return $this->deleteAdjustment($request, PayrollBonus::class, $id, 'Bonus not found', 'Bonus deleted');
    }

    public function getTeacherSessions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(TeacherSession::query(), $request)
                ->with(['teacher:id,name,email', 'batch:id,name,code', 'course:id,title'])
                ->orderByDesc('session_date')
                ->get()
        );
    }

    public function createTeacherSession(Request $request): JsonResponse
    {
        $request->validate(['teacher_id' => ['required', 'integer'], 'session_date' => ['required', 'date']]);
        $session = TeacherSession::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'approved_by' => $request->input('approved_by', $request->user()->id),
            'approved_at' => $request->input('approved_at', now()),
        ]));

        return ApiResponse::success($session, 201);
    }

    public function updateTeacherSession(Request $request, int $id): JsonResponse
    {
        $session = BranchScope::apply(TeacherSession::query(), $request)->find($id);
        if (!$session) {
            return ApiResponse::error('Teacher session not found', 404);
        }
        $session->fill($request->except('branch_id'))->save();

        return ApiResponse::success($session);
    }

    public function deleteTeacherSession(Request $request, int $id): JsonResponse
    {
        $session = BranchScope::apply(TeacherSession::query(), $request)->find($id);
        if (!$session) {
            return ApiResponse::error('Teacher session not found', 404);
        }
        $session->delete();

        return ApiResponse::success(['message' => 'Teacher session deleted']);
    }

    public function generateDraftPayroll(Request $request): JsonResponse
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;

        $profiles = StaffProfile::query()->where('branch_id', $branchId)->where('employment_status', 'active')->get();
        $payrolls = $profiles->map(function (StaffProfile $profile) use ($month, $year, $branchId) {
            $allowances = (float) PayrollBonus::query()->where('staff_id', $profile->user_id)->where('month', $month)->where('year', $year)->whereIn('status', ['approved', 'applied'])->sum('amount');
            $deductions = (float) PayrollDeduction::query()->where('staff_id', $profile->user_id)->where('month', $month)->where('year', $year)->whereIn('status', ['approved', 'applied'])->sum('amount');
            $baseSalary = (float) $profile->base_salary;

            return Payroll::query()->updateOrCreate([
                'branch_id' => $branchId,
                'staff_id' => $profile->user_id,
                'month' => $month,
                'year' => $year,
            ], [
                'base_salary' => $baseSalary,
                'allowances' => $allowances,
                'deductions' => $deductions,
                'net_salary' => $baseSalary + $allowances - $deductions,
                'status' => 'draft',
            ]);
        });

        return ApiResponse::success(['message' => 'Draft payroll generated', 'payrolls' => $payrolls], 201);
    }

    public function processPayment(Request $request, int $id): JsonResponse
    {
        $payroll = BranchScope::apply(Payroll::query(), $request)->find($id);
        if (!$payroll) {
            return ApiResponse::error('Payroll not found', 404);
        }

        $expense = $payroll->expense_id
            ? Expense::query()->where('id', $payroll->expense_id)->where('branch_id', $payroll->branch_id)->first()
            : Expense::query()->where('payroll_id', $payroll->id)->where('branch_id', $payroll->branch_id)->first();

        $payload = [
            'branch_id' => $payroll->branch_id,
            'amount' => $payroll->net_salary,
            'description' => "Payroll payment for {$payroll->month}/{$payroll->year}",
            'category' => 'Payroll',
            'date' => now()->toDateString(),
            'status' => 'pending',
            'expense_origin' => 'payroll',
            'payroll_id' => $payroll->id,
            'payment_source_selected' => false,
            'payment_source_selected_by' => null,
            'payment_source_selected_at' => null,
            'account_id' => null,
            'payment_method' => null,
            'approved_by' => null,
        ];

        if ($expense) {
            if ($expense->status === 'approved') {
                return ApiResponse::error('Payroll has already been approved for disbursement', 422);
            }

            $expense->fill($payload)->save();
        } else {
            $expense = Expense::query()->create($payload);
        }

        $payroll->fill(['status' => 'pending_accounting', 'expense_id' => $expense->id, 'rejection_reason' => null])->save();

        return ApiResponse::success(['payroll' => $payroll, 'expense' => $expense]);
    }

    public function reopenPayroll(Request $request): JsonResponse
    {
        $payroll = BranchScope::apply(Payroll::query(), $request)->find($request->input('id'));
        if (!$payroll) {
            return ApiResponse::error('Payroll not found', 404);
        }

        $payroll->fill(['status' => 'draft', 'rejection_reason' => $request->input('reason')])->save();

        return ApiResponse::success($payroll);
    }

    private function createPayrollAdjustment(Request $request, string $model, string $typeField): JsonResponse
    {
        $request->validate(['staff_id' => ['required', 'integer'], 'month' => ['required', 'integer'], 'year' => ['required', 'integer'], 'amount' => ['required', 'numeric']]);
        $row = $model::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            $typeField => $request->input($typeField, 'other'),
            'created_by' => $request->user()->id,
            'approved_by' => $request->user()->id,
            'status' => $request->input('status', 'approved'),
        ]));

        return ApiResponse::success($row, 201);
    }

    private function updateAdjustment(Request $request, string $model, int $id, string $notFound): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }
        $row->fill($request->except('branch_id'))->save();

        return ApiResponse::success($row);
    }

    private function deleteAdjustment(Request $request, string $model, int $id, string $notFound, string $message): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }
        $row->delete();

        return ApiResponse::success(['message' => $message]);
    }
}
