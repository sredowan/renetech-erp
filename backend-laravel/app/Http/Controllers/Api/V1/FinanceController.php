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
        $branchId = BranchScope::selectedBranchId($request);
        $from = $request->query('from');
        $to = $request->query('to');

        // ── Income rows (successful transactions) ──
        $txQuery = BranchScope::apply(Transaction::query(), $request)
            ->where('status', 'success')
            ->with([
                'enrollment.student.user:id,name,email',
                'enrollment.batch.course:id,title',
                'account:id,name,code',
            ])
            ->orderByDesc('paid_at');

        if ($from) $txQuery->whereDate('paid_at', '>=', $from);
        if ($to) $txQuery->whereDate('paid_at', '<=', $to);

        $transactions = $txQuery->get();
        $incomeRows = $transactions->map(function ($tx) {
            $enrollment = $tx->enrollment ?? $tx->Enrollment ?? null;
            $student = $enrollment?->student ?? $enrollment?->Student ?? null;
            $user = $student?->user ?? $student?->User ?? null;
            $batch = $enrollment?->batch ?? $enrollment?->Batch ?? $student?->batch ?? $student?->Batch ?? null;
            $course = $batch?->course ?? $batch?->Course ?? null;
            $account = $tx->account ?? $tx->Account ?? null;
            $studentName = $user?->name ?? 'Walk-in / Manual';
            $courseName = $course?->title ?? 'General Income';
            return [
                'id' => $tx->id,
                'date' => $tx->paid_at,
                'receipt_no' => $tx->receipt_no,
                'transaction_ref' => $tx->transaction_ref,
                'amount' => (float) ($tx->amount ?? 0),
                'method' => $tx->method,
                'source' => $tx->source ?? 'pos_fee',
                'source_label' => ucfirst(str_replace('_', ' ', $tx->source ?? 'POS Fee')),
                'student_name' => $studentName,
                'account_name' => $account?->name ?? 'Unmapped',
                'description' => $studentName !== 'Walk-in / Manual'
                    ? "{$studentName} · {$courseName}"
                    : ucfirst(str_replace('_', ' ', $tx->source ?? 'POS Fee')),
            ];
        })->values()->all();
        $totalIncome = array_sum(array_column($incomeRows, 'amount'));

        // ── Expense rows ──
        $expQuery = BranchScope::apply(Expense::query(), $request)
            ->where('status', 'approved')
            ->with('account:id,name,code')
            ->orderByDesc('date');
        if ($from) $expQuery->whereDate('date', '>=', $from);
        if ($to) $expQuery->whereDate('date', '<=', $to);

        $expenses = $expQuery->get();
        $expenseRows = $expenses->map(function ($e) {
            $account = $e->account ?? $e->Account ?? null;
            return [
                'id' => $e->id,
                'date' => $e->date,
                'category' => $e->category ?? $account?->name ?? 'Uncategorized',
                'description' => $e->description,
                'amount' => (float) ($e->amount ?? 0),
                'status' => $e->status,
                'payment_method' => $e->payment_method,
                'account_name' => $account?->name ?? 'Unknown',
            ];
        })->values()->all();
        $totalExpense = array_sum(array_column($expenseRows, 'amount'));

        // ── Bank statement (journal lines for liquid accounts) ──
        $liquidAccounts = Account::query()
            ->where('type', 'asset')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('code', 'like', '10%')
                  ->orWhereIn('sub_type', ['cash', 'bank', 'mfs']);
            })
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderBy('code')
            ->get();

        $liquidIds = $liquidAccounts->pluck('id')->all();
        $bankRows = [];
        if ($liquidIds) {
            $bankQuery = JournalLine::query()
                ->whereIn('account_id', $liquidIds)
                ->with([
                    'account:id,name,code,sub_type',
                    'journalEntry:id,date,ref_no,description,branch_id',
                ])
                ->whereHas('journalEntry', function ($q) use ($branchId, $from, $to) {
                    if ($branchId) $q->where('branch_id', $branchId);
                    if ($from) $q->whereDate('date', '>=', $from);
                    if ($to) $q->whereDate('date', '<=', $to);
                })
                ->orderByDesc('id');

            $bankRows = $bankQuery->get()->map(function ($line) {
                $je = $line->journalEntry ?? $line->JournalEntry ?? null;
                $acc = $line->account ?? $line->Account ?? null;
                $debit = (float) ($line->debit ?? 0);
                $credit = (float) ($line->credit ?? 0);
                return [
                    'id' => $line->id,
                    'date' => $je?->date,
                    'reference' => $je?->ref_no,
                    'description' => $je?->description,
                    'account_name' => $acc?->name ?? 'Account',
                    'account_code' => $acc?->code ?? '',
                    'debit' => $debit,
                    'credit' => $credit,
                    'amount' => max($debit, $credit),
                    'entry_type' => $debit > 0 ? 'inflow' : 'outflow',
                    'balance_effect' => $debit - $credit,
                ];
            })->values()->all();
        }

        // ── Receivables (unpaid invoices) ──
        $invQuery = BranchScope::apply(Invoice::query(), $request)
            ->with([
                'student.user:id,name,email',
                'student.batch.course:id,title',
                'enrollment.batch.course:id,title',
            ])
            ->orderByDesc('due_date');
        if ($from) $invQuery->whereDate('due_date', '>=', $from);
        if ($to) $invQuery->whereDate('due_date', '<=', $to);

        $receivableRows = $invQuery->get()
            ->map(function ($inv) {
                $student = $inv->student ?? $inv->Student ?? null;
                $user = $student?->user ?? $student?->User ?? null;
                $batch = $student?->batch ?? $student?->Batch ?? null;
                if (!$batch) {
                    $enrollment = $inv->enrollment ?? $inv->Enrollment ?? null;
                    $batch = $enrollment?->batch ?? $enrollment?->Batch ?? null;
                }
                $due = max((float) ($inv->amount ?? 0) - (float) ($inv->paid ?? 0), 0);
                return [
                    'invoice_id' => $inv->id,
                    'invoice_no' => $inv->invoice_no,
                    'invoice_number' => $inv->invoice_no,
                    'due_date' => $inv->due_date,
                    'student_name' => $user?->name ?? 'Unknown',
                    'batch_name' => $batch?->code ?? $batch?->name ?? 'N/A',
                    'course_name' => ($batch?->course ?? $batch?->Course)?->title ?? 'N/A',
                    'amount' => (float) ($inv->amount ?? 0),
                    'paid' => (float) ($inv->paid ?? 0),
                    'due' => $due,
                    'status' => $inv->status,
                ];
            })
            ->filter(fn ($r) => $r['due'] > 0)
            ->values()->all();

        // ── Referral rows ──
        $refRows = [];
        if (class_exists(\App\Models\Student::class)) {
            $refQuery = \App\Models\Student::query()
                ->where('referral_amount', '>', 0)
                ->with(['user:id,name,email', 'batch.course:id,title']);
            if ($branchId) $refQuery->where('branch_id', $branchId);
            if ($from) $refQuery->whereDate('updated_at', '>=', $from);
            if ($to) $refQuery->whereDate('updated_at', '<=', $to);

            $refRows = $refQuery->orderByDesc('enrollment_date')->get()->map(function ($s) {
                $user = $s->user ?? $s->User ?? null;
                $batch = $s->batch ?? $s->Batch ?? null;
                $course = $batch?->course ?? $batch?->Course ?? null;
                return [
                    'id' => $s->id,
                    'student_name' => $user?->name ?? 'Unknown',
                    'course_name' => $course?->title ?? 'N/A',
                    'batch_name' => $batch?->code ?? 'Unassigned',
                    'enrollment_date' => $s->enrollment_date,
                    'referred_by' => $s->referred_by ?? 'Unknown',
                    'amount' => (float) ($s->referral_amount ?? 0),
                ];
            })->values()->all();
        }

        // ── Trial balance ──
        $tbQuery = DB::table('accounts')
            ->leftJoin('journal_lines', 'journal_lines.account_id', '=', 'accounts.id')
            ->leftJoin('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->select('accounts.id', 'accounts.code as account_code', 'accounts.name as account_name', 'accounts.type')
            ->selectRaw('COALESCE(SUM(journal_lines.debit), 0) as debit, COALESCE(SUM(journal_lines.credit), 0) as credit')
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');
        if ($branchId) $tbQuery->where('accounts.branch_id', $branchId);
        if ($from) $tbQuery->where('journal_entries.date', '>=', $from);
        if ($to) $tbQuery->where('journal_entries.date', '<=', $to);

        $tbRows = $tbQuery->get()->filter(fn ($r) => (float) $r->debit > 0 || (float) $r->credit > 0)
            ->map(function ($r) {
                return [
                    'account_name' => $r->account_name,
                    'account_code' => $r->account_code,
                    'type' => $r->type,
                    'debit' => (float) $r->debit,
                    'credit' => (float) $r->credit,
                    'balance' => (float) $r->debit - (float) $r->credit,
                ];
            })->values()->all();

        $tbDebits = array_sum(array_column($tbRows, 'debit'));
        $tbCredits = array_sum(array_column($tbRows, 'credit'));

        // ── Summary ──
        $totalReferralPayout = array_sum(array_column($refRows, 'amount'));
        $totalReceivables = array_sum(array_column($receivableRows, 'due'));

        return ApiResponse::success([
            'range' => ['from' => $from, 'to' => $to],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_profit' => $totalIncome - $totalExpense,
                'total_receivables' => $totalReceivables,
                'income_transactions' => count($incomeRows),
                'expense_transactions' => count($expenseRows),
                'total_referral_payout' => $totalReferralPayout,
            ],
            'income' => [
                'total' => $totalIncome,
                'rows' => $incomeRows,
            ],
            'expenses' => [
                'total' => $totalExpense,
                'rows' => $expenseRows,
            ],
            'receivables' => [
                'total_due' => $totalReceivables,
                'rows' => $receivableRows,
            ],
            'bank_statement' => [
                'rows' => $bankRows,
            ],
            'trial_balance' => [
                'rows' => $tbRows,
                'total_debits' => $tbDebits,
                'total_credits' => $tbCredits,
                'difference' => $tbDebits - $tbCredits,
            ],
            'referrals' => [
                'total' => $totalReferralPayout,
                'rows' => $refRows,
            ],
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

        $rows = $query->get();

        $totalDebits = $rows->sum(fn ($r) => (float) $r->debit);
        $totalCredits = $rows->sum(fn ($r) => (float) $r->credit);
        $difference = round($totalDebits - $totalCredits, 2);

        return ApiResponse::success([
            'accounts' => $rows,
            'totalDebits' => $totalDebits,
            'totalCredits' => $totalCredits,
            'difference' => $difference,
            'isBalanced' => abs($difference) < 0.01,
        ]);
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
