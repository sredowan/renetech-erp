<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Expense;
use App\Models\Payroll;
use App\Models\ExpenseCategory;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $expenses = BranchScope::apply(Expense::query(), $request)
            ->with(['account:id,code,name,type,sub_type', 'branch:id,name'])
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->when($request->query('category'), fn ($query, $value) => $query->where('category', $value))
            ->when($request->query('from') ?: $request->query('start'), fn ($query, $value) => $query->whereDate('date', '>=', $value))
            ->when($request->query('to') ?: $request->query('end'), fn ($query, $value) => $query->whereDate('date', '<=', $value))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        // The frontend reads expense.Account.name — alias the 'account' relation key
        $expenses->each(function ($exp) {
            if ($exp->relationLoaded('account') && $exp->account) {
                $exp->setAttribute('Account', $exp->account);
            }
            if ($exp->relationLoaded('branch') && $exp->branch) {
                $exp->setAttribute('Branch', $exp->branch);
            }
        });

        return ApiResponse::success($expenses);
    }

    public function split(Request $request): JsonResponse
    {
        $query = BranchScope::apply(Expense::query(), $request)->where('status', '!=', 'deleted');

        $from = $request->query('from');
        $to = $request->query('to');
        if ($from) $query->whereDate('date', '>=', $from);
        if ($to) $query->whereDate('date', '<=', $to);

        $rows = $query->selectRaw('COALESCE(category, "Uncategorized") as category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $rows->sum('total');
        $split = $rows->map(function ($row) use ($grandTotal) {
            return [
                'category' => $row->category,
                'total' => (float) $row->total,
                'percentage' => $grandTotal > 0 ? round(((float) $row->total / $grandTotal) * 100, 1) : 0,
            ];
        });

        return ApiResponse::success([
            'split' => $split,
            'grandTotal' => $grandTotal,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric'],
            'description' => ['required', 'string'],
        ]);

        $payload = array_merge($request->except('receipt'), $data, [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'date' => $request->input('date', now()->toDateString()),
        ]);

        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $name = 'expense_'.time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/expenses'), $name);
            $payload['receipt_url'] = '/uploads/expenses/'.$name;
        }

        return ApiResponse::success(Expense::query()->create($payload), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $expense = BranchScope::apply(Expense::query(), $request)->find($id);
        if (!$expense) {
            return ApiResponse::error('Expense not found', 404);
        }

        $payload = $request->except(['branch_id', 'receipt']);
        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $name = 'expense_'.time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/expenses'), $name);
            $payload['receipt_url'] = '/uploads/expenses/'.$name;
        }

        $expense->fill($payload)->save();

        return ApiResponse::success($expense);
    }

    public function selectPaymentSource(Request $request, int $id): JsonResponse
    {
        $request->validate(['account_id' => ['required', 'integer']]);

        $expense = BranchScope::apply(Expense::query(), $request)->find($id);
        if (!$expense) {
            return ApiResponse::error('Expense not found', 404);
        }

        if (in_array($expense->status, ['approved', 'deleted'], true)) {
            return ApiResponse::error('Payment source cannot be changed after approval or deletion', 422);
        }

        $account = Account::query()
            ->where('id', $request->input('account_id'))
            ->where('branch_id', $expense->branch_id)
            ->where('type', 'asset')
            ->whereIn('sub_type', ['cash', 'bank', 'mfs'])
            ->first();

        if (!$account) {
            return ApiResponse::error('Choose a valid cash, bank, or mobile wallet account for this branch', 422);
        }

        $expense->fill([
            'account_id' => $account->id,
            'payment_method' => $account->sub_type ?: $expense->payment_method,
            'payment_source_selected' => true,
            'payment_source_selected_by' => $request->user()->id,
            'payment_source_selected_at' => now(),
        ])->save();

        return ApiResponse::success($expense);
    }

    public function verify(Request $request, int $id): JsonResponse
    {
        return $this->setStatus($request, $id, 'verified', ['verified_by' => $request->user()->id, 'verification_date' => now()]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        return $this->setStatus($request, $id, 'approved', ['approved_by' => $request->user()->id]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        return $this->setStatus($request, $id, 'rejected', ['rejection_reason' => $request->input('reason') ?: $request->input('rejection_reason')]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        return $this->setStatus($request, $id, 'deleted', [
            'deletion_reason' => $request->input('reason'),
            'deleted_by' => $request->user()->id,
            'deleted_at' => now(),
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        $categories = BranchScope::apply(ExpenseCategory::query(), $request)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        // Frontend expects PascalCase 'Children' key (Sequelize convention)
        $categories->each(function ($cat) {
            if ($cat->relationLoaded('children')) {
                $cat->setAttribute('Children', $cat->children);
            }
        });

        return ApiResponse::success($categories);
    }

    public function categoriesFlat(Request $request): JsonResponse
    {
        $flat = BranchScope::apply(ExpenseCategory::query(), $request)
            ->with('parent')
            ->orderBy('name')
            ->get();

        // Frontend expects PascalCase 'Parent' key (Sequelize convention)
        $flat->each(function ($cat) {
            if ($cat->relationLoaded('parent') && $cat->parent) {
                $cat->setAttribute('Parent', $cat->parent);
            }
        });

        return ApiResponse::success($flat);
    }

    public function createCategory(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $category = ExpenseCategory::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($category, 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = BranchScope::apply(ExpenseCategory::query(), $request)->find($id);
        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        $category->fill($request->except('branch_id'))->save();

        return ApiResponse::success($category);
    }

    public function deleteCategory(Request $request, int $id): JsonResponse
    {
        $category = BranchScope::apply(ExpenseCategory::query(), $request)->find($id);
        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        $category->delete();

        return ApiResponse::success(['message' => 'Category deleted']);
    }

    private function setStatus(Request $request, int $id, string $status, array $extra = []): JsonResponse
    {
        $expense = BranchScope::apply(Expense::query(), $request)->find($id);
        if (!$expense) {
            return ApiResponse::error('Expense not found', 404);
        }

        if ($status === 'approved' && $expense->expense_origin === 'payroll') {
            if (!$expense->payment_source_selected || !$expense->account_id) {
                return ApiResponse::error('Select a payroll disbursement account before approval', 422);
            }
        }

        $expense->fill(array_merge(['status' => $status], $extra))->save();

        if ($expense->expense_origin === 'payroll' && $expense->payroll_id) {
            $payrollStatus = match ($status) {
                'approved' => 'paid',
                'rejected' => 'rejected',
                'deleted' => 'draft',
                default => 'pending_accounting',
            };

            Payroll::query()
                ->where('id', $expense->payroll_id)
                ->where('branch_id', $expense->branch_id)
                ->update([
                    'status' => $payrollStatus,
                    'expense_id' => $expense->id,
                    'rejection_reason' => $status === 'rejected' ? ($request->input('reason') ?: $request->input('rejection_reason')) : null,
                ]);
        }

        return ApiResponse::success($expense);
    }
}
