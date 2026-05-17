<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\BankAccount;
use App\Models\BankAccountLedgerMap;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\LiquidityMovement;
use App\Models\Transaction;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FinanceController extends Controller
{
    public function recordExpense(Request $request): JsonResponse
    {
        $request->validate(['amount' => ['required', 'numeric'], 'description' => ['required', 'string']]);

        $expense = Expense::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'date' => $request->input('date', now()->toDateString()),
            'status' => $request->input('status', 'approved'),
            'approved_by' => $request->user()->id,
        ]));

        return ApiResponse::success($expense, 201);
    }

    public function stats(Request $request): JsonResponse
    {
        $income = (float) BranchScope::apply(Transaction::query(), $request)->where('status', 'success')->sum('amount');
        $expenses = (float) BranchScope::apply(Expense::query(), $request)->where('status', 'approved')->sum('amount');

        return ApiResponse::success([
            'income' => $income,
            'expenses' => $expenses,
            'net' => $income - $expenses,
            'pendingInvoices' => BranchScope::apply(Invoice::query(), $request)->whereIn('status', ['pending', 'partial', 'overdue'])->count(),
        ]);
    }

    public function overview(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'stats' => $this->stats($request)->getData(true),
            'recentTransactions' => BranchScope::apply(Transaction::query(), $request)->orderByDesc('paid_at')->limit(10)->get(),
            'recentExpenses' => BranchScope::apply(Expense::query(), $request)->orderByDesc('date')->limit(10)->get(),
        ]);
    }

    public function reportSuite(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'overview' => $this->overview($request)->getData(true),
            'profitLoss' => $this->profitLoss($request)->getData(true),
            'trialBalance' => $this->trialBalance($request)->getData(true),
            'cashflow' => $this->cashflow($request)->getData(true),
        ]);
    }

    public function profitLoss(Request $request): JsonResponse
    {
        $revenueAccountIds = BranchScope::apply(Account::query(), $request)->where('type', 'revenue')->pluck('id');
        $expenseAccountIds = BranchScope::apply(Account::query(), $request)->where('type', 'expense')->pluck('id');

        $revenue = $this->journalTotal($request, $revenueAccountIds->all(), 'credit') - $this->journalTotal($request, $revenueAccountIds->all(), 'debit');
        $expenses = $this->journalTotal($request, $expenseAccountIds->all(), 'debit') - $this->journalTotal($request, $expenseAccountIds->all(), 'credit');

        return ApiResponse::success(['revenue' => $revenue, 'expenses' => $expenses, 'netProfit' => $revenue - $expenses]);
    }

    public function trialBalance(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = DB::table('accounts')
            ->leftJoin('journal_lines', 'journal_lines.account_id', '=', 'accounts.id')
            ->leftJoin('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->select('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->selectRaw('COALESCE(SUM(journal_lines.debit), 0) as debit, COALESCE(SUM(journal_lines.credit), 0) as credit')
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');

        if ($branchId) {
            $query->where('accounts.branch_id', $branchId);
        }

        return ApiResponse::success($query->get());
    }

    public function cashflow(Request $request): JsonResponse
    {
        $movements = BranchScope::apply(LiquidityMovement::query(), $request)
            ->when($request->query('start'), fn ($query, $value) => $query->whereDate('movement_date', '>=', $value))
            ->when($request->query('end'), fn ($query, $value) => $query->whereDate('movement_date', '<=', $value))
            ->orderByDesc('movement_date')
            ->get();

        return ApiResponse::success([
            'inflows' => $movements->where('direction', 'inflow')->sum(fn ($row) => (float) $row->amount),
            'outflows' => $movements->where('direction', 'outflow')->sum(fn ($row) => (float) $row->amount),
            'movements' => $movements,
        ]);
    }

    public function incomeExpense(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'income' => BranchScope::apply(Transaction::query(), $request)->selectRaw('DATE(paid_at) as date, SUM(amount) as amount')->groupByRaw('DATE(paid_at)')->orderBy('date')->get(),
            'expenses' => BranchScope::apply(Expense::query(), $request)->selectRaw('date, SUM(amount) as amount')->groupBy('date')->orderBy('date')->get(),
        ]);
    }

    public function studentIncome(Request $request): JsonResponse
    {
        $rows = BranchScope::apply(Transaction::query(), $request)
            ->with('enrollment.student.user:id,name,email')
            ->whereNotNull('enrollment_id')
            ->orderByDesc('paid_at')
            ->get();

        return ApiResponse::success($rows);
    }

    public function liquidAccounts(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(BankAccountLedgerMap::query(), $request)
                ->with(['bankAccount', 'account:id,code,name,type'])
                ->where('is_active', true)
                ->get()
        );
    }

    public function createLiquidAccount(Request $request): JsonResponse
    {
        $request->validate([
            'account_name' => ['required', 'string'],
            'account_number' => ['required', 'string'],
            'bank_name' => ['required', 'string'],
            'account_id' => ['required', 'integer'],
            'channel' => ['required', 'string'],
        ]);

        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $bankAccount = BankAccount::query()->create([
            'id' => (string) Str::uuid(),
            'branch_id' => $branchId,
            'account_name' => $request->input('account_name'),
            'account_number' => $request->input('account_number'),
            'bank_name' => $request->input('bank_name'),
            'currency' => $request->input('currency', 'BDT'),
            'balance' => $request->input('balance', 0),
        ]);

        $mapping = BankAccountLedgerMap::query()->create([
            'bank_account_id' => $bankAccount->id,
            'account_id' => $request->input('account_id'),
            'branch_id' => $branchId,
            'channel' => $request->input('channel'),
            'is_active' => true,
        ]);

        return ApiResponse::success(['bankAccount' => $bankAccount, 'mapping' => $mapping], 201);
    }

    private function journalTotal(Request $request, array $accountIds, string $column): float
    {
        if (!$accountIds) {
            return 0;
        }

        $branchId = BranchScope::selectedBranchId($request);
        $query = DB::table('journal_lines')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->whereIn('journal_lines.account_id', $accountIds);

        if ($branchId) {
            $query->where('journal_entries.branch_id', $branchId);
        }

        return (float) $query->sum('journal_lines.'.$column);
    }
}
