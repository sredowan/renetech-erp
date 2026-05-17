<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankAccountLedgerMap;
use App\Models\LiquidityMovement;
use App\Models\ReconciliationEvent;
use App\Models\ReconciliationLine;
use App\Models\ReconciliationSession;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReconciliationController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $sessions = BranchScope::apply(ReconciliationSession::query(), $request)->get();

        return ApiResponse::success([
            'total' => $sessions->count(),
            'draft' => $sessions->where('status', 'draft')->count(),
            'reviewed' => $sessions->where('status', 'reviewed')->count(),
            'approved' => $sessions->where('status', 'approved')->count(),
            'locked' => $sessions->where('status', 'locked')->count(),
            'totalVariance' => $sessions->sum(fn ($session) => (float) $session->total_variance),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'stats' => $this->stats($request)->getData(true),
            'recentSessions' => BranchScope::apply(ReconciliationSession::query(), $request)->orderByDesc('recon_date')->limit(10)->get(),
            'recentMovements' => BranchScope::apply(LiquidityMovement::query(), $request)->orderByDesc('movement_date')->limit(10)->get(),
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'sessions' => BranchScope::apply(ReconciliationSession::query(), $request)->with('lines')->orderByDesc('recon_date')->get(),
            'movements' => BranchScope::apply(LiquidityMovement::query(), $request)->orderByDesc('movement_date')->get(),
        ]);
    }

    public function bankAccounts(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = BankAccount::query()->orderBy('account_name');
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return ApiResponse::success($query->get());
    }

    public function mappings(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(BankAccountLedgerMap::query(), $request)->with(['bankAccount', 'account:id,code,name,type'])->get());
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
        if (!$mapping) {
            return ApiResponse::error('Mapping not found', 404);
        }

        $mapping->fill($request->except('branch_id'))->save();

        return ApiResponse::success($mapping);
    }

    public function deleteMapping(Request $request, int $id): JsonResponse
    {
        $mapping = BranchScope::apply(BankAccountLedgerMap::query(), $request)->find($id);
        if (!$mapping) {
            return ApiResponse::error('Mapping not found', 404);
        }

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
        return $this->recordMovement($request, 'transfer_out', 'outflow');
    }

    public function recordClosingBalance(Request $request): JsonResponse
    {
        return $this->recordMovement($request, 'closing_submission', 'neutral');
    }

    public function sessions(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(ReconciliationSession::query(), $request)->orderByDesc('recon_date')->get());
    }

    public function sessionDetail(Request $request, int $id): JsonResponse
    {
        $session = BranchScope::apply(ReconciliationSession::query(), $request)->with(['lines.account', 'events'])->find($id);

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
        if (!$line) {
            return ApiResponse::error('Line not found', 404);
        }

        $line->fill($request->only(['notes', 'discrepancy_reason', 'actual_closing_balance']))->save();

        return ApiResponse::success($line);
    }

    private function setSessionStatus(Request $request, int $id, string $status, array $extra): JsonResponse
    {
        $session = BranchScope::apply(ReconciliationSession::query(), $request)->find($id);
        if (!$session) {
            return ApiResponse::error('Session not found', 404);
        }

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
        $request->validate(['account_id' => ['required', 'integer'], 'amount' => ['required', 'numeric']]);
        $movement = LiquidityMovement::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'movement_date' => $request->input('movement_date', now()->toDateString()),
            'transaction_type' => $type,
            'direction' => $direction,
            'created_by' => $request->user()->id,
        ]));

        return ApiResponse::success($movement, 201);
    }
}
