<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Expense;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Budget::query(), $request)->with('account:id,name,code,type')->orderByDesc('period_start')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'account_id' => ['required', 'integer'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date'],
            'allocated' => ['required', 'numeric'],
        ]);

        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $account = Account::query()->where('id', $data['account_id'])->where('branch_id', $branchId)->first();
        if (!$account) {
            return ApiResponse::error('Account not found', 404);
        }

        $budget = Budget::query()->create(array_merge($request->all(), ['branch_id' => $branchId]));

        return ApiResponse::success($budget, 201);
    }

    public function vsActual(Request $request): JsonResponse
    {
        $budgets = BranchScope::apply(Budget::query(), $request)->with('account:id,name,code')->get();

        $result = $budgets->map(function (Budget $budget) {
            $spent = (float) Expense::query()
                ->where('branch_id', $budget->branch_id)
                ->where('account_id', $budget->account_id)
                ->whereBetween('date', [$budget->period_start, $budget->period_end])
                ->where('status', 'approved')
                ->sum('amount');

            $allocated = (float) $budget->allocated;

            return [
                'id' => $budget->id,
                'accountName' => $budget->account?->name,
                'accountCode' => $budget->account?->code,
                'period' => $budget->period,
                'periodStart' => $budget->period_start,
                'periodEnd' => $budget->period_end,
                'allocated' => $allocated,
                'spent' => $spent,
                'remaining' => $allocated - $spent,
                'utilization' => $allocated > 0 ? round(($spent / $allocated) * 100, 1) : 0,
            ];
        });

        return ApiResponse::success($result);
    }
}
