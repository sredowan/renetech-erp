<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AuditLog;
use App\Models\BankAccount;
use App\Models\BankAccountLedgerMap;
use App\Models\Expense;
use App\Models\LiquidityMovement;
use App\Models\ReconciliationEvent;
use App\Models\ReconciliationLine;
use App\Models\ReconciliationSession;
use App\Models\Transaction;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReconciliationController extends Controller
{
    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private function getBranchId(Request $request): ?int
    {
        return BranchScope::selectedBranchId($request) ?: $request->user()?->branch_id;
    }

    private function formatDateLocal(\DateTimeInterface|string|null $d = null): string
    {
        $dt = $d ? Carbon::parse($d) : now();
        return $dt->timezone('Asia/Dhaka')->format('Y-m-d');
    }

    private function toDateOnly($value): string
    {
        if (!$value) return $this->formatDateLocal();
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return $value;
        return $this->formatDateLocal($value);
    }

    private function getLiquidAccounts(int $branchId)
    {
        return Account::query()
            ->where('branch_id', $branchId)
            ->where('type', 'asset')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where('code', 'like', '10%')
                  ->orWhereIn('sub_type', ['cash', 'bank', 'mfs']);
            })
            ->orderBy('code')
            ->get();
    }

    // ─── Liquidity Snapshot Builder ───────────────────────────────────────────────

    private function buildLiquiditySnapshot(int $branchId, string $from, string $to): array
    {
        $liquidAccounts = $this->getLiquidAccounts($branchId);
        $accountIds = $liquidAccounts->pluck('id')->all();

        if (empty($accountIds)) {
            return $this->emptySnapshot($from, $to);
        }

        // Fetch raw data
        $transactions = Transaction::query()
            ->where('branch_id', $branchId)->where('status', 'success')
            ->whereIn('account_id', $accountIds)
            ->where('paid_at', '<=', "$to 23:59:59")
            ->with(['account:id,name,code,sub_type', 'enrollment.student.user:id,name', 'enrollment.batch.course:id,title'])
            ->orderBy('paid_at')->orderBy('id')->get();

        $expenses = Expense::query()
            ->where('branch_id', $branchId)->where('status', 'approved')
            ->whereIn('account_id', $accountIds)
            ->where('date', '<=', $to)
            ->with('account:id,name,code,sub_type')
            ->orderBy('date')->orderBy('id')->get();

        $manualMovements = LiquidityMovement::query()
            ->where('branch_id', $branchId)
            ->whereIn('account_id', $accountIds)
            ->where('movement_date', '<=', $to)
            ->with(['account:id,name,code,sub_type', 'relatedAccount:id,name,code,sub_type', 'creator:id,name'])
            ->orderBy('movement_date')->orderBy('id')->get();

        // Build closing cutoffs for double-count prevention
        $latestClosingDateByAccount = [];
        foreach ($manualMovements as $mv) {
            if ($mv->transaction_type === 'closing_submission') {
                $accId = $mv->account_id;
                $mDate = $mv->movement_date;
                if (!isset($latestClosingDateByAccount[$accId]) || $mDate >= $latestClosingDateByAccount[$accId]) {
                    $latestClosingDateByAccount[$accId] = $mDate;
                }
            }
        }

        // Build unified rows
        $rows = [];
        foreach ($transactions as $tx) {
            $txDate = $this->toDateOnly($tx->paid_at);
            $cutoff = $latestClosingDateByAccount[$tx->account_id] ?? null;
            if ($cutoff && $txDate < $cutoff) continue;

            $account = $tx->account;
            $subType = $account->sub_type ?? 'cash';
            $studentName = $tx->enrollment?->student?->user?->name ?? 'Walk-in / Manual';
            $courseTitle = $tx->enrollment?->batch?->course?->title ?? 'General Income';

            $rows[] = [
                'unique_key' => "tx-{$tx->id}",
                'account_id' => $tx->account_id,
                'movement_date' => $txDate,
                'event_time' => strtotime($tx->paid_at ?? $tx->created_at ?? 'now') * 1000,
                'transaction_type' => $subType === 'bank' ? 'direct_bank_receipt' : ($subType === 'mfs' ? 'mobile_receipt' : 'collection'),
                'direction' => 'inflow',
                'amount' => (float) ($tx->amount ?? 0),
                'reference' => $tx->transaction_ref ?: $tx->receipt_no,
                'remarks' => "$studentName · $courseTitle",
                'source_model' => 'Transaction',
                'source_id' => (string) $tx->id,
                'account_name' => $account->name ?? 'Unknown',
                'account_code' => $account->code ?? '',
                'account_type' => $subType,
                'created_by_name' => 'System',
            ];
        }

        foreach ($expenses as $exp) {
            $expDate = $this->toDateOnly($exp->date);
            $cutoff = $latestClosingDateByAccount[$exp->account_id] ?? null;
            if ($cutoff && $expDate < $cutoff) continue;

            $account = $exp->account;
            $rows[] = [
                'unique_key' => "expense-{$exp->id}",
                'account_id' => $exp->account_id,
                'movement_date' => $expDate,
                'event_time' => strtotime($exp->date) * 1000,
                'transaction_type' => ($exp->expense_origin === 'payroll') ? 'payroll_expense' : 'expense',
                'direction' => 'outflow',
                'amount' => (float) ($exp->amount ?? 0),
                'reference' => ($exp->expense_origin === 'payroll') ? "PAYROLL-" . ($exp->payroll_id ?? $exp->id) : $exp->category,
                'remarks' => $exp->description,
                'source_model' => 'Expense',
                'source_id' => (string) $exp->id,
                'account_name' => $account->name ?? 'Unknown',
                'account_code' => $account->code ?? '',
                'account_type' => $account->sub_type ?? 'cash',
                'created_by_name' => 'System',
            ];
        }

        foreach ($manualMovements as $mv) {
            $rows[] = [
                'unique_key' => "manual-{$mv->id}",
                'account_id' => $mv->account_id,
                'movement_date' => $mv->movement_date,
                'event_time' => strtotime($mv->created_at ?? $mv->movement_date) * 1000,
                'transaction_type' => $mv->transaction_type,
                'direction' => $mv->direction,
                'amount' => (float) ($mv->amount ?? 0),
                'actual_balance' => (float) ($mv->actual_balance ?? 0),
                'variance_amount' => (float) ($mv->variance_amount ?? 0),
                'previous_balance' => (float) ($mv->previous_balance ?? 0),
                'new_balance' => (float) ($mv->new_balance ?? 0),
                'reference' => $mv->reference,
                'remarks' => $mv->remarks,
                'reason' => $mv->reason,
                'source_model' => $mv->source_model ?? 'LiquidityMovement',
                'source_id' => $mv->source_id ?? (string) $mv->id,
                'account_name' => $mv->account->name ?? 'Unknown',
                'account_code' => $mv->account->code ?? '',
                'account_type' => $mv->account->sub_type ?? 'cash',
                'related_account_name' => $mv->relatedAccount->name ?? '',
                'created_by_name' => $mv->creator->name ?? 'System',
            ];
        }

        // Sort rows
        usort($rows, function ($a, $b) {
            $dc = strcmp($a['movement_date'], $b['movement_date']);
            if ($dc !== 0) return $dc;
            $ca = ($a['transaction_type'] === 'closing_submission') ? 1 : 0;
            $cb = ($b['transaction_type'] === 'closing_submission') ? 1 : 0;
            if ($ca !== $cb) return $ca - $cb;
            if ($a['event_time'] !== $b['event_time']) return $a['event_time'] - $b['event_time'];
            return strcmp($a['unique_key'], $b['unique_key']);
        });

        // Build account summaries
        $balances = [];
        $summaries = [];
        foreach ($liquidAccounts as $acc) {
            $summaries[$acc->id] = [
                'account_id' => $acc->id,
                'account_name' => $acc->name,
                'account_code' => $acc->code,
                'account_type' => $acc->sub_type ?? 'cash',
                'opening_balance' => 0, 'inflows' => 0, 'outflows' => 0,
                'expected_closing_balance' => 0, 'actual_closing_balance' => null,
                'discrepancy_amount' => 0, 'discrepancy_reason' => '', 'status' => 'open',
                'last_reference' => '',
                'closing_source' => 'pending', 'closing_source_label' => 'Pending',
                'closing_recorded_by' => null, 'closing_recorded_at' => null,
                'opening_source' => 'not_set', 'opening_source_label' => 'Not set',
            ];
        }

        $rangeRows = [];
        foreach ($rows as &$row) {
            $accId = $row['account_id'];
            if (!isset($summaries[$accId])) continue;
            $summary = &$summaries[$accId];
            $previousBalance = $balances[$accId] ?? 0;
            $signedAmount = $row['direction'] === 'inflow' ? $row['amount'] : ($row['direction'] === 'outflow' ? -$row['amount'] : 0);
            $computedBalance = ($row['transaction_type'] === 'closing_submission')
                ? (float) ($row['actual_balance'] ?? 0)
                : $previousBalance + $signedAmount;

            $isOpening = in_array($row['transaction_type'], ['opening_balance', 'opening_adjustment']);
            $row['previous_balance'] = $previousBalance;
            $row['new_balance'] = $computedBalance;
            $balances[$accId] = $computedBalance;

            if ($row['movement_date'] < $from) {
                $summary['opening_balance'] = $computedBalance;
                $summary['expected_closing_balance'] = $computedBalance;
                continue;
            }

            if ($row['movement_date'] > $to) continue;

            if ($isOpening && $row['movement_date'] === $from) {
                $summary['opening_balance'] = $computedBalance;
                $summary['expected_closing_balance'] = $computedBalance;
                $summary['opening_source'] = $row['transaction_type'];
                $summary['opening_source_label'] = $row['transaction_type'] === 'opening_balance' ? 'Manual opening' : 'Opening adjustment';
                $rangeRows[] = $row;
                continue;
            }

            if ($row['direction'] === 'inflow') $summary['inflows'] += $row['amount'];
            if ($row['direction'] === 'outflow') $summary['outflows'] += $row['amount'];
            $summary['last_reference'] = $row['reference'] ?? $summary['last_reference'];

            if ($row['transaction_type'] === 'closing_submission') {
                $summary['actual_closing_balance'] = (float) ($row['actual_balance'] ?? 0);
                $summary['discrepancy_amount'] = (float) ($row['variance_amount'] ?? 0);
                $summary['discrepancy_reason'] = $row['reason'] ?? $row['remarks'] ?? '';
                $summary['status'] = abs($summary['discrepancy_amount']) > 0.009 ? 'discrepancy' : 'reconciled';
                $summary['closing_source'] = 'closing_submission';
                $summary['closing_source_label'] = 'Manual submission';
                $summary['closing_recorded_by'] = $row['created_by_name'] ?? 'System';
                $summary['closing_recorded_at'] = $row['movement_date'];
            }

            $rangeRows[] = $row;
        }
        unset($row, $summary);

        // Finalize summaries
        foreach ($summaries as &$s) {
            if ($s['actual_closing_balance'] === null) {
                $s['status'] = ($s['inflows'] || $s['outflows']) ? 'open' : 'idle';
            }
            $s['expected_closing_balance'] = $s['opening_balance'] + $s['inflows'] - $s['outflows'];
        }
        unset($s);

        // Build sub-views
        $operationalMovements = array_filter($rangeRows, fn($r) => !in_array($r['transaction_type'], ['opening_balance', 'opening_adjustment', 'carry_forward']));
        $transfers = array_filter($rangeRows, fn($r) => in_array($r['transaction_type'], ['transfer_in', 'transfer_out']));
        $directBankReceipts = array_filter($rangeRows, fn($r) => in_array($r['transaction_type'], ['direct_bank_receipt', 'mobile_receipt']));
        $adjustments = array_filter($rangeRows, fn($r) => in_array($r['transaction_type'], ['opening_balance', 'opening_adjustment', 'closing_adjustment', 'manual_adjustment', 'reversal']));
        $discrepancies = array_filter(array_values($summaries), fn($s) => abs($s['discrepancy_amount'] ?? 0) > 0.009);

        $totalInflows = array_reduce(array_values($operationalMovements), fn($s, $r) => $s + ($r['direction'] === 'inflow' ? $r['amount'] : 0), 0.0);
        $totalOutflows = array_reduce(array_values($operationalMovements), fn($s, $r) => $s + ($r['direction'] === 'outflow' ? $r['amount'] : 0), 0.0);
        $totalDiscrepancy = array_reduce($discrepancies, fn($s, $r) => $s + abs($r['discrepancy_amount'] ?? 0), 0.0);

        // Sort movements DESC for display
        usort($rangeRows, function ($a, $b) {
            $dc = strcmp($b['movement_date'], $a['movement_date']);
            return $dc !== 0 ? $dc : $b['event_time'] - $a['event_time'];
        });

        // Audit trail
        $auditTrail = AuditLog::query()
            ->where('branch_id', $branchId)
            ->whereIn('entity', ['LiquidityMovement', 'ReconciliationSession', 'ReconciliationLine'])
            ->when($from, fn($q) => $q->where('created_at', '>=', "$from 00:00:00"))
            ->when($to, fn($q) => $q->where('created_at', '<=', "$to 23:59:59"))
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(250)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'timestamp' => $item->created_at,
                'user_name' => $item->user?->name ?? 'System',
                'action' => $item->action,
                'entity' => $item->entity,
                'entity_id' => $item->entity_id,
                'old_value' => $item->old_value,
                'new_value' => $item->new_value,
            ]);

        $accountsArray = array_values($summaries);
        $reconciledCount = count(array_filter($accountsArray, fn($s) => $s['status'] === 'reconciled'));
        $openCount = count(array_filter($accountsArray, fn($s) => $s['status'] === 'open'));

        return [
            'range' => ['from' => $from, 'to' => $to],
            'summary' => [
                'total_accounts' => count($liquidAccounts),
                'total_inflows' => $totalInflows,
                'total_outflows' => $totalOutflows,
                'total_discrepancy' => $totalDiscrepancy,
                'reconciled_accounts' => $reconciledCount,
                'open_accounts' => $openCount,
            ],
            'accounts' => $accountsArray,
            'movements' => array_values($rangeRows),
            'transfers' => array_values($transfers),
            'direct_bank_receipts' => array_values($directBankReceipts),
            'discrepancies' => array_values($discrepancies),
            'adjustment_history' => array_values($adjustments),
            'opening_closing_report' => $accountsArray,
            'full_audit_trail' => $auditTrail,
        ];
    }

    private function emptySnapshot(string $from, string $to): array
    {
        return [
            'range' => ['from' => $from, 'to' => $to],
            'summary' => ['total_accounts' => 0, 'total_inflows' => 0, 'total_outflows' => 0, 'total_discrepancy' => 0, 'reconciled_accounts' => 0, 'open_accounts' => 0],
            'accounts' => [], 'movements' => [], 'transfers' => [],
            'direct_bank_receipts' => [], 'discrepancies' => [],
            'adjustment_history' => [], 'opening_closing_report' => [],
            'full_audit_trail' => [],
        ];
    }

    // ─── Public Endpoints ─────────────────────────────────────────────────────────

    public function stats(Request $request): JsonResponse
    {
        $sessions = BranchScope::apply(ReconciliationSession::query(), $request)->get();
        return ApiResponse::success([
            'total' => $sessions->count(),
            'draft' => $sessions->where('status', 'draft')->count(),
            'reviewed' => $sessions->where('status', 'reviewed')->count(),
            'approved' => $sessions->where('status', 'approved')->count(),
            'locked' => $sessions->where('status', 'locked')->count(),
            'totalVariance' => $sessions->sum(fn ($s) => (float) $s->total_variance),
        ]);
    }

    /**
     * Dashboard — returns the full liquidity snapshot matching the Node.js API shape
     * that the Reconciliation.jsx frontend expects.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $branchId = $this->getBranchId($request);
        $from = $this->toDateOnly($request->query('from'));
        $to = $this->toDateOnly($request->query('to') ?: $request->query('from'));
        $snapshot = $this->buildLiquiditySnapshot($branchId, $from, $to);
        return ApiResponse::success($snapshot);
    }

    public function reports(Request $request): JsonResponse
    {
        $branchId = $this->getBranchId($request);
        $from = $this->toDateOnly($request->query('from'));
        $to = $this->toDateOnly($request->query('to') ?: $request->query('from'));
        $snapshot = $this->buildLiquiditySnapshot($branchId, $from, $to);
        return ApiResponse::success($snapshot);
    }

    public function bankAccounts(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = BankAccount::query()->orderBy('account_name');
        if ($branchId) $query->where('branch_id', $branchId);
        return ApiResponse::success($query->get());
    }

    public function mappings(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(BankAccountLedgerMap::query(), $request)
                ->with(['bankAccount', 'account:id,code,name,type'])
                ->get()
        );
    }

    public function createMapping(Request $request): JsonResponse
    {
        $request->validate(['bank_account_id' => ['required'], 'account_id' => ['required', 'integer'], 'channel' => ['required', 'string']]);
        $mapping = BankAccountLedgerMap::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'is_active' => true,
        ]));
        return ApiResponse::success($mapping, 201);
    }

    public function updateMapping(Request $request, int $id): JsonResponse
    {
        $mapping = BranchScope::apply(BankAccountLedgerMap::query(), $request)->find($id);
        if (!$mapping) return ApiResponse::error('Mapping not found', 404);
        $mapping->fill($request->except('branch_id'))->save();
        return ApiResponse::success($mapping);
    }

    public function deleteMapping(Request $request, int $id): JsonResponse
    {
        $mapping = BranchScope::apply(BankAccountLedgerMap::query(), $request)->find($id);
        if (!$mapping) return ApiResponse::error('Mapping not found', 404);
        $mapping->delete();
        return ApiResponse::success(['message' => 'Mapping deleted']);
    }

    public function generateSession(Request $request): JsonResponse
    {
        $date = $request->input('recon_date', now()->toDateString());
        $session = ReconciliationSession::query()->firstOrCreate([
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'recon_date' => $date,
        ], [
            'status' => 'draft',
            'prepared_by' => $request->user()->id,
        ]);
        return ApiResponse::success($session->load('lines'), 201);
    }

    public function recordOpeningBalance(Request $request): JsonResponse
    {
        return $this->recordMovement($request, 'opening_balance', 'neutral');
    }

    public function recordCollection(Request $request): JsonResponse
    {
        return $this->recordMovement($request, 'collection', 'inflow');
    }

    public function recordTransfer(Request $request): JsonResponse
    {
        $request->validate([
            'from_account_id' => ['required', 'integer'],
            'to_account_id' => ['required', 'integer'],
            'amount' => ['required', 'numeric'],
        ]);

        $branchId = $this->getBranchId($request);
        $date = $request->input('movement_date', now()->toDateString());
        $ref = $request->input('reference', 'TRF-' . time());
        $amount = (float) $request->input('amount');

        $outflow = LiquidityMovement::query()->create([
            'branch_id' => $branchId,
            'account_id' => $request->input('from_account_id'),
            'related_account_id' => $request->input('to_account_id'),
            'movement_date' => $date,
            'transaction_type' => 'transfer_out',
            'direction' => 'outflow',
            'amount' => $amount,
            'reference' => $ref,
            'remarks' => $request->input('remarks', 'Inter-account transfer'),
            'created_by' => $request->user()->id,
        ]);

        $inflow = LiquidityMovement::query()->create([
            'branch_id' => $branchId,
            'account_id' => $request->input('to_account_id'),
            'related_account_id' => $request->input('from_account_id'),
            'movement_date' => $date,
            'transaction_type' => 'transfer_in',
            'direction' => 'inflow',
            'amount' => $amount,
            'reference' => $ref,
            'remarks' => $request->input('remarks', 'Inter-account transfer'),
            'created_by' => $request->user()->id,
        ]);

        return ApiResponse::success([
            'message' => 'Transfer recorded successfully.',
            'outflow_id' => $outflow->id,
            'inflow_id' => $inflow->id,
        ], 201);
    }

    public function recordClosingBalance(Request $request): JsonResponse
    {
        return $this->recordMovement($request, 'closing_submission', 'neutral');
    }

    public function sessions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(ReconciliationSession::query(), $request)->orderByDesc('recon_date')->get()
        );
    }

    public function sessionDetail(Request $request, int $id): JsonResponse
    {
        $session = BranchScope::apply(ReconciliationSession::query(), $request)
            ->with(['lines.account', 'events'])->find($id);
        return $session ? ApiResponse::success($session) : ApiResponse::error('Session not found', 404);
    }

    public function reviewSession(Request $request, int $id): JsonResponse
    {
        return $this->setSessionStatus($request, $id, 'reviewed', ['reviewed_by' => $request->user()->id]);
    }

    public function approveSession(Request $request, int $id): JsonResponse
    {
        return $this->setSessionStatus($request, $id, 'approved', ['approved_by' => $request->user()->id]);
    }

    public function reopenSession(Request $request, int $id): JsonResponse
    {
        return $this->setSessionStatus($request, $id, 'draft', ['reopen_reason' => $request->input('reason')]);
    }

    public function lockSession(Request $request, int $id): JsonResponse
    {
        return $this->setSessionStatus($request, $id, 'locked', ['locked_at' => now()]);
    }

    public function lineDetail(int $lineId): JsonResponse
    {
        $line = ReconciliationLine::query()->with('account')->find($lineId);
        return $line ? ApiResponse::success($line) : ApiResponse::error('Line not found', 404);
    }

    public function updateLineNotes(Request $request, int $lineId): JsonResponse
    {
        $line = ReconciliationLine::query()->find($lineId);
        if (!$line) return ApiResponse::error('Line not found', 404);
        $line->fill($request->only(['notes', 'discrepancy_reason', 'actual_closing_balance']))->save();
        return ApiResponse::success($line);
    }

    // ─── Private ──────────────────────────────────────────────────────────────────

    private function setSessionStatus(Request $request, int $id, string $status, array $extra): JsonResponse
    {
        $session = BranchScope::apply(ReconciliationSession::query(), $request)->find($id);
        if (!$session) return ApiResponse::error('Session not found', 404);

        $old = $session->toArray();
        $session->fill(array_merge(['status' => $status], $extra))->save();
        ReconciliationEvent::query()->create([
            'session_id' => $session->id,
            'branch_id' => $session->branch_id,
            'user_id' => $request->user()->id,
            'action' => $status,
            'new_value' => $session->toArray(),
            'old_value' => $old,
        ]);
        return ApiResponse::success($session);
    }

    private function recordMovement(Request $request, string $type, string $direction): JsonResponse
    {
        $request->validate(['account_id' => ['required', 'integer']]);
        $movement = LiquidityMovement::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'movement_date' => $request->input('movement_date', now()->toDateString()),
            'transaction_type' => $type,
            'direction' => $direction,
            'created_by' => $request->user()->id,
        ]));
        return ApiResponse::success(['message' => ucfirst(str_replace('_', ' ', $type)) . ' recorded.', 'movement_id' => $movement->id], 201);
    }
}
