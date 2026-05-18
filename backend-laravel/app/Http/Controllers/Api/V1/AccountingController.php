<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AuditLog;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingController extends Controller
{
    public function getAccounts(Request $request): JsonResponse
    {
        $accounts = BranchScope::apply(Account::query(), $request)
            ->with('parent:id,code,name')
            ->orderBy('code')
            ->get();

        return ApiResponse::success($accounts);
    }

    public function createJournalEntry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'integer'],
            'lines.*.debit' => ['nullable', 'numeric'],
            'lines.*.credit' => ['nullable', 'numeric'],
            'lines.*.notes' => ['nullable', 'string'],
        ]);

        $debit = collect($data['lines'])->sum(fn ($line) => (float) ($line['debit'] ?? 0));
        $credit = collect($data['lines'])->sum(fn ($line) => (float) ($line['credit'] ?? 0));
        if (round($debit, 4) !== round($credit, 4)) {
            return ApiResponse::error('Debit and credit totals must match.', 400);
        }

        $entry = DB::transaction(function () use ($request, $data) {
            $entry = JournalEntry::query()->create([
                'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
                'ref_no' => $request->input('ref_no') ?: 'JNL-'.now()->format('YmdHis'),
                'description' => $data['description'] ?? null,
                'date' => $data['date'],
                'posted_by' => $request->user()->id,
            ]);

            foreach ($data['lines'] as $line) {
                $entry->lines()->create([
                    'account_id' => $line['account_id'],
                    'debit' => $line['debit'] ?? 0,
                    'credit' => $line['credit'] ?? 0,
                    'notes' => $line['notes'] ?? null,
                ]);
            }

            return $entry->load('lines.account:id,code,name,type');
        });

        return ApiResponse::success($entry, 201);
    }

    public function getJournal(Request $request): JsonResponse
    {
        // The frontend (AdminJournal.jsx) expects flat JournalLine records
        // with nested JournalEntry and Account relations, not grouped entries.
        $query = JournalLine::query()
            ->with([
                'journalEntry:id,ref_no,description,date,branch_id,posted_by',
                'journalEntry.poster:id,name,email',
                'account:id,code,name,type',
            ])
            ->whereHas('journalEntry', function ($q) use ($request) {
                BranchScope::apply($q, $request);

                // Date filters — frontend sends 'from'/'to'
                if ($request->query('from')) {
                    $q->whereDate('date', '>=', $request->query('from'));
                }
                if ($request->query('to')) {
                    $q->whereDate('date', '<=', $request->query('to'));
                }
            });

        // Search filter
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('journalEntry', fn ($je) => $je->where('description', 'like', "%{$search}%")
                    ->orWhere('ref_no', 'like', "%{$search}%"))
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Account type filter
        if ($type = $request->query('type')) {
            if ($type !== 'all') {
                $query->whereHas('account', fn ($q) => $q->where('type', $type));
            }
        }

        // Account ID filter
        if ($accountId = $request->query('account_id')) {
            if ($accountId !== 'all') {
                $query->where('account_id', $accountId);
            }
        }

        $lines = $query->orderByDesc('id')->get();

        // Rename relations to PascalCase to match frontend expectations
        // (line.JournalEntry, line.Account, line.JournalEntry.Poster)
        $result = $lines->map(function ($line) {
            $data = $line->toArray();
            // Rename snake_case keys to PascalCase for the frontend
            if (isset($data['journal_entry'])) {
                $data['JournalEntry'] = $data['journal_entry'];
                if (isset($data['JournalEntry']['poster'])) {
                    $data['JournalEntry']['Poster'] = $data['JournalEntry']['poster'];
                    unset($data['JournalEntry']['poster']);
                }
                unset($data['journal_entry']);
            }
            if (isset($data['account'])) {
                $data['Account'] = $data['account'];
                unset($data['account']);
            }
            return $data;
        });

        return ApiResponse::success($result);
    }

    public function getLedgerSummary(Request $request): JsonResponse
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = JournalLine::query()
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->join('accounts', 'accounts.id', '=', 'journal_lines.account_id')
            ->select('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->selectRaw('SUM(journal_lines.debit) as total_debit, SUM(journal_lines.credit) as total_credit')
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->orderBy('accounts.code');

        if ($branchId) {
            $query->where('journal_entries.branch_id', $branchId);
        }

        return ApiResponse::success($query->get());
    }

    public function getLedgerAccountDetails(Request $request, int $id): JsonResponse
    {
        $account = BranchScope::apply(Account::query(), $request)->find($id);
        if (!$account) {
            return ApiResponse::error('Account not found', 404);
        }

        $lines = JournalLine::query()
            ->with('journalEntry:id,ref_no,description,date,branch_id')
            ->where('account_id', $id)
            ->whereHas('journalEntry', fn ($query) => BranchScope::apply($query, $request))
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(['account' => $account, 'lines' => $lines]);
    }

    public function getAuditLog(Request $request): JsonResponse
    {
        $logs = BranchScope::apply(AuditLog::query(), $request)
            ->with('user:id,name,email')
            ->orderByDesc('id')
            ->limit((int) $request->query('limit', 100))
            ->get();

        return ApiResponse::success($logs);
    }
}
