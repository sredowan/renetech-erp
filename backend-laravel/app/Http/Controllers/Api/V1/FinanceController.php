<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\BankAccount;
use App\Models\BankAccountLedgerMap;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JournalLine;
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

    /**
     * Finance Overview — returns flat keys matching the original Node.js API shape
     * so that the POS page can read feeCollected, receivablesDue, overdueReceivables.
     */
    public function overview(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);

        // Revenue & Expenses from journal lines
        $revenueAccountIds = $this->accountIdsByType($branchId, 'revenue');
        $expenseAccountIds = $this->accountIdsByType($branchId, 'expense');
        $revenue = $this->journalTotal($request, $revenueAccountIds, 'credit');
        $expenses = $this->journalTotal($request, $expenseAccountIds, 'debit');

        // Fee collection from transactions
        $feeCollected = (float) BranchScope::apply(Transaction::query(), $request)
            ->where('status', 'success')
            ->sum('amount');

        // Salary & scholarship expenses
        $salaryExpense = (float) BranchScope::apply(Expense::query(), $request)
            ->where('category', 'like', '%Salary%')
            ->sum('amount');
        $scholarshipGiven = (float) BranchScope::apply(Expense::query(), $request)
            ->where('category', 'like', '%Scholarship%')
            ->sum('amount');

        // Invoice stats
        $totalInvoices = BranchScope::apply(Invoice::query(), $request)->count();
        $openInvoices = BranchScope::apply(Invoice::query(), $request)
            ->whereNotIn('status', ['paid', 'rejected'])
            ->get(['amount', 'paid', 'status']);

        $receivablesDue = $openInvoices->reduce(function ($sum, $inv) {
            return $sum + max((float) $inv->amount - (float) $inv->paid, 0);
        }, 0.0);

        $unpaidInvoices = $openInvoices->filter(function ($inv) {
            return max((float) $inv->amount - (float) $inv->paid, 0) > 0;
        })->count();

        $overdueReceivables = $openInvoices->filter(function ($inv) {
            return $inv->status === 'overdue';
        })->reduce(function ($sum, $inv) {
            return $sum + max((float) $inv->amount - (float) $inv->paid, 0);
        }, 0.0);

        return ApiResponse::success([
            'revenue' => $revenue,
            'expenses' => $expenses,
            'netProfit' => $revenue - $expenses,
            'receivablesDue' => $receivablesDue,
            'overdueReceivables' => $overdueReceivables,
            'totalInvoices' => $totalInvoices,
            'unpaidInvoices' => $unpaidInvoices,
            'feeCollected' => $feeCollected,
            'salaryExpense' => $salaryExpense,
            'scholarshipGiven' => $scholarshipGiven,
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
        $branchId = BranchScope::selectedBranchId($request);
        $revenueAccountIds = $this->accountIdsByType($branchId, 'revenue');
        $expenseAccountIds = $this->accountIdsByType($branchId, 'expense');

        $revenue = $this->journalTotal($request, $revenueAccountIds, 'credit') - $this->journalTotal($request, $revenueAccountIds, 'debit');
        $expenses = $this->journalTotal($request, $expenseAccountIds, 'debit') - $this->journalTotal($request, $expenseAccountIds, 'credit');

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

    /**
     * Liquid Accounts — returns flat Account records with computed balances.
     * This matches the original Node.js API shape expected by the frontend:
     * [{ id, code, name, sub_type, balance }, ...]
     */
    public function liquidAccounts(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $branchFilter = $branchId ? ['branch_id' => $branchId] : [];

        $accounts = Account::query()
            ->where(array_merge($branchFilter, [
                'type' => 'asset',
                'is_active' => true,
            ]))
            ->where(function ($q) {
                $q->where('code', 'like', '10%')
                  ->orWhereIn('sub_type', ['cash', 'bank', 'mfs']);
            })
            ->orderBy('code')
            ->get();

        $detailedAccounts = [];
        foreach ($accounts as $acc) {
            $accountBranchId = $acc->branch_id;

            // Find latest closing submission for this account
            $latestClosing = LiquidityMovement::query()
                ->where('branch_id', $accountBranchId)
                ->where('account_id', $acc->id)
                ->where('transaction_type', 'closing_submission')
                ->orderByDesc('movement_date')
                ->orderByDesc('id')
                ->first(['actual_balance', 'movement_date']);

            if ($latestClosing) {
                $balance = (float) ($latestClosing->actual_balance ?? 0);

                // Add movements after closing date
                $subsequentMovements = LiquidityMovement::query()
                    ->where('branch_id', $accountBranchId)
                    ->where('account_id', $acc->id)
                    ->where('movement_date', '>', $latestClosing->movement_date)
                    ->where('transaction_type', '!=', 'closing_submission')
                    ->get(['direction', 'amount']);

                foreach ($subsequentMovements as $mv) {
                    $amt = (float) ($mv->amount ?? 0);
                    if ($mv->direction === 'inflow') {
                        $balance += $amt;
                    }
                    if ($mv->direction === 'outflow') {
                        $balance -= $amt;
                    }
                }

                // Add transactions after closing date
                $subsequentTx = (float) Transaction::query()
                    ->where('branch_id', $accountBranchId)
                    ->where('account_id', $acc->id)
                    ->where('status', 'success')
                    ->where('paid_at', '>', $latestClosing->movement_date.' 23:59:59')
                    ->sum('amount');
                $balance += $subsequentTx;

                // Subtract expenses after closing date
                $subsequentExp = (float) Expense::query()
                    ->where('branch_id', $accountBranchId)
                    ->where('account_id', $acc->id)
                    ->where('status', 'approved')
                    ->where('date', '>', $latestClosing->movement_date)
                    ->sum('amount');
                $balance -= $subsequentExp;
            } else {
                // No closing exists — fall back to journal-based balance
                $debitTotal = (float) JournalLine::query()->where('account_id', $acc->id)->sum('debit');
                $creditTotal = (float) JournalLine::query()->where('account_id', $acc->id)->sum('credit');
                $balance = $debitTotal - $creditTotal;
            }

            $detailedAccounts[] = [
                'id' => $acc->id,
                'code' => $acc->code,
                'name' => $acc->name,
                'sub_type' => $acc->sub_type ?? 'cash',
                'balance' => $balance,
            ];
        }

        return ApiResponse::success($detailedAccounts);
    }

    /**
     * Create Liquid Account — mirrors original Node.js behaviour
     * Creates an Account record (not a BankAccountLedgerMap).
     */
    public function createLiquidAccount(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string'],
            'sub_type' => ['sometimes', 'string'],
        ]);

        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        if (!$branchId) {
            return ApiResponse::error('Select a specific branch before creating an account', 400);
        }

        // Find highest existing code starting with '10'
        $existingCodes = Account::query()
            ->where('type', 'asset')
            ->where('code', 'like', '10%')
            ->where('branch_id', $branchId)
            ->pluck('code');

        $maxCode = 1000;
        foreach ($existingCodes as $code) {
            $codeInt = (int) explode('-', $code)[0];
            if ($codeInt > $maxCode && $codeInt < 1100) {
                $maxCode = $codeInt;
            }
        }

        $newCodePrefix = (string) ($maxCode + 1);
        $newCode = $branchId === 1 ? $newCodePrefix : $newCodePrefix.'-U';

        $newAccount = Account::query()->create([
            'branch_id' => $branchId,
            'code' => $newCode,
            'name' => $request->input('name'),
            'type' => 'asset',
            'sub_type' => $request->input('sub_type', 'bank'),
            'is_active' => true,
        ]);

        return ApiResponse::success($newAccount, 201);
    }

    /**
     * Get account IDs by type for a given branch.
     */
    private function accountIdsByType(?int $branchId, string $type): array
    {
        $query = Account::query()->where('type', $type);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        return $query->pluck('id')->all();
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
