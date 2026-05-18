<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Batch;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Student;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $role = $request->query('role', $request->user()?->role);
        $activeLeadStatuses = ['new', 'contacted', 'interested', 'trial', 'fees_pending', 'payment_rejected'];
        $activeBatchStatuses = ['enrolling', 'active', 'starting_soon'];
        $leadQuery = BranchScope::apply(Lead::query(), $request);
        $batchQuery = BranchScope::apply(Batch::query(), $request);
        $studentQuery = BranchScope::apply(Student::query(), $request);
        $invoiceQuery = BranchScope::apply(Invoice::query(), $request);
        $revenue = $this->journalTotalByType($request, 'revenue', 'credit');
        $expenses = $this->journalTotalByType($request, 'expense', 'debit');
        $today = now()->toDateString();

        $payload = [
            'totalLeads' => (clone $leadQuery)->count(),
            'totalBatches' => (clone $batchQuery)->whereIn('status', $activeBatchStatuses)->count(),
            'totalStudents' => (clone $studentQuery)->count(),
            'revenue' => $revenue,
            'expenses' => $expenses,
            'netProfit' => $revenue - $expenses,
        ];

        // Admin / Branch admin — full dashboard
        if (in_array($role, ['super_admin', 'branch_admin'])) {
            $payload['pipelineValue'] = (float) (clone $leadQuery)->whereIn('status', $activeLeadStatuses)->sum('deal_value');
            $payload['leadsByStatus'] = (clone $leadQuery)->selectRaw('status, COUNT(*) as count')->groupBy('status')->get();
            $payload['leadsBySource'] = (clone $leadQuery)
                ->selectRaw("COALESCE(NULLIF(source, ''), 'Direct / Unknown') as name, COUNT(*) as value")
                ->groupBy('source')->get();
            $payload['batchByStatus'] = (clone $batchQuery)->selectRaw('status, COUNT(*) as count')->groupBy('status')->get();
            $payload['activeBatches'] = (clone $batchQuery)
                ->with('course:id,title,category')
                ->whereIn('status', $activeBatchStatuses)
                ->orderBy('start_date')->orderByDesc('id')->limit(8)
                ->get()->map(fn (Batch $batch) => $this->formatBatch($batch));
            $payload['hotLeadCount'] = (clone $leadQuery)
                ->whereIn('status', $activeLeadStatuses)->whereIn('priority', ['high', 'hot'])->count();
            $payload['hotLeads'] = (clone $leadQuery)
                ->whereIn('status', $activeLeadStatuses)->whereIn('priority', ['high', 'hot'])
                ->orderByRaw("CASE WHEN priority = 'hot' THEN 0 WHEN priority = 'high' THEN 1 ELSE 2 END")
                ->orderByDesc('score')->orderByDesc('created_at')->limit(6)
                ->get(['id', 'name', 'phone', 'email', 'source', 'status', 'priority', 'score', 'deal_value', 'last_activity_at', 'created_at']);
            $payload['recentLeads'] = (clone $leadQuery)
                ->orderByDesc('created_at')->limit(6)
                ->get(['id', 'name', 'phone', 'email', 'source', 'status', 'priority', 'score', 'deal_value', 'last_activity_at', 'created_at']);
            $payload['newLeadsToday'] = (clone $leadQuery)->whereDate('created_at', $today)->count();
            $payload['unpaidInvoices'] = (float) (clone $invoiceQuery)
                ->where('status', '!=', 'paid')->get(['amount', 'paid'])
                ->sum(fn (Invoice $invoice) => max((float) $invoice->amount - (float) $invoice->paid, 0));
            $payload['overdueInvoiceCount'] = (clone $invoiceQuery)
                ->whereIn('status', ['overdue', 'partial', 'pending'])->whereDate('due_date', '<', $today)->count();
            $payload['liquidAccounts'] = BranchScope::apply(Account::query(), $request)
                ->where('type', 'asset')->whereIn('sub_type', ['bank', 'cash'])
                ->where('is_active', true)->orderBy('name')->limit(6)
                ->get(['id', 'name', 'sub_type']);
            $payload['financialTrend'] = $this->financialTrend($request);
        }

        // Accounting role
        if (in_array($role, ['accounting', 'accounts'])) {
            $payload['liquidAccounts'] = BranchScope::apply(Account::query(), $request)
                ->where('type', 'asset')->whereIn('sub_type', ['bank', 'cash'])
                ->get(['id', 'name', 'balance', 'sub_type']);
            $payload['unpaidInvoices'] = (float) (clone $invoiceQuery)
                ->where('status', '!=', 'paid')->get(['amount', 'paid'])
                ->sum(fn (Invoice $invoice) => max((float) $invoice->amount - (float) $invoice->paid, 0));
            $payload['financialTrend'] = $this->financialTrend($request);
        }

        // CRM / Counselor role
        if (in_array($role, ['crm', 'counselor'])) {
            $payload['leadsByStatus'] = (clone $leadQuery)->selectRaw('status, COUNT(*) as count')->groupBy('status')->get();
            $payload['recentLeads'] = (clone $leadQuery)->orderByDesc('created_at')->limit(5)->get();
            $payload['newLeadsToday'] = (clone $leadQuery)->whereDate('created_at', $today)->count();
        }

        // Teacher / Trainer role
        if (in_array($role, ['teacher', 'trainer'])) {
            $payload['teacherBatches'] = (clone $batchQuery)->orderByDesc('start_date')->limit(3)->get();
        }

        // Brand Manager role
        if ($role === 'brandmanager') {
            $sourceMap = ['fb' => 'Facebook', 'org' => 'Organic', 'ref' => 'Referral', 'walk_in' => 'Walk In'];
            $payload['leadsBySource'] = (clone $leadQuery)
                ->selectRaw('source, COUNT(*) as count')->groupBy('source')->get()
                ->map(fn ($row) => ['name' => $sourceMap[$row->source] ?? $row->source ?? 'Direct', 'value' => (int) $row->count]);
            $payload['marketingSpend'] = 0;
            $payload['costPerLead'] = 0;
        }

        return ApiResponse::success($payload);
    }

    private function formatBatch(Batch $batch): array
    {
        $capacity = (int) ($batch->capacity ?? 0);
        $enrolled = (int) ($batch->enrolled ?? 0);

        return [
            'id' => $batch->id,
            'name' => $batch->name ?: $batch->code,
            'code' => $batch->code,
            'status' => $batch->status,
            'capacity' => $capacity,
            'enrolled' => $enrolled,
            'start_date' => optional($batch->start_date)->format('Y-m-d'),
            'end_date' => optional($batch->end_date)->format('Y-m-d'),
            'fillRate' => $capacity ? round(($enrolled / $capacity) * 100) : 0,
            'courseTitle' => $batch->course?->title ?? 'Course not assigned',
            'courseCategory' => $batch->course?->category ?? 'General',
        ];
    }

    private function financialTrend(Request $request): array
    {
        return collect(range(5, 0))->map(function (int $offset) use ($request) {
            $month = now()->subMonths($offset);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();
            $revenue = $this->journalTotalByType($request, 'revenue', 'credit', $start, $end);
            $expenses = $this->journalTotalByType($request, 'expense', 'debit', $start, $end);

            return [
                'name' => $month->format('M'),
                'revenue' => $revenue,
                'expenses' => $expenses,
                'expense' => $expenses,
                'netProfit' => $revenue - $expenses,
            ];
        })->all();
    }

    private function journalTotalByType(Request $request, string $accountType, string $column, ?Carbon $start = null, ?Carbon $end = null): float
    {
        $branchId = BranchScope::selectedBranchId($request);
        $query = DB::table('journal_lines')
            ->join('accounts', 'accounts.id', '=', 'journal_lines.account_id')
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_lines.journal_entry_id')
            ->where('accounts.type', $accountType);

        if ($branchId) {
            $query->where('accounts.branch_id', $branchId)
                ->where('journal_entries.branch_id', $branchId);
        }

        if ($start && $end) {
            $query->whereBetween('journal_entries.date', [$start->toDateString(), $end->toDateString()]);
        }

        return (float) $query->sum('journal_lines.'.$column);
    }
}
