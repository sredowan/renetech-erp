<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Customer;
use App\Models\Enrollment;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PosController extends Controller
{
    // ─── GET TRANSACTIONS ────────────────────────────────────────

    public function transactions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Transaction::query(), $request)
                ->with([
                    'enrollment.student.user:id,name,email',
                    'enrollment.batch.course:id,title',
                    'invoice.customer',
                    'account:id,name,code',
                ])
                ->orderByDesc('paid_at')
                ->orderByDesc('id')
                ->limit(50)
                ->get()
        );
    }

    // ─── GET PENDING INVOICES ────────────────────────────────────

    public function pending(Request $request): JsonResponse
    {
        $invoices = BranchScope::apply(Invoice::query(), $request)
            ->with([
                'student.user:id,name,email',
                'enrollment.student.user:id,name,email',
                'enrollment.batch.course:id,title',
                'customer',
            ])
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('due_date')
            ->get();

        // Filter to only those with remaining balance and parse website payment notes
        $pending = $invoices->filter(fn($inv) => max((float)$inv->amount - (float)$inv->paid, 0) > 0)
            ->map(function ($inv) {
                $data = $inv->toArray();
                $data['website_payment'] = $this->parseWebsitePaymentDetails($inv->notes);
                // Frontend expects PascalCase relations
                $data['Student'] = $inv->student ?? null;
                $data['Enrollment'] = $inv->enrollment ?? null;
                return $data;
            })->values();

        return ApiResponse::success($pending);
    }

    // ─── COLLECT ENROLLMENT FEE ──────────────────────────────────

    public function collectFee(Request $request): JsonResponse
    {
        $request->validate(['amount' => ['required', 'numeric', 'min:0.01']]);

        return DB::transaction(function () use ($request) {
            $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
            $invoiceId = $request->input('invoice_id');
            $enrollmentId = $request->input('enrollment_id');
            $amount = (float) $request->input('amount');
            $method = $request->input('method', 'cash');
            $transactionRef = $request->input('transaction_ref');
            $notes = $request->input('notes');
            $accountId = $request->input('account_id');
            $paidDate = $request->input('paid_date');
            $paymentTimestamp = $paidDate ? Carbon::parse($paidDate)->setHour(12) : now();

            // Find linked invoice
            $linkedInvoice = $invoiceId
                ? Invoice::query()->where('id', $invoiceId)->where('branch_id', $branchId)->lockForUpdate()->first()
                : Invoice::query()->where('enrollment_id', $enrollmentId)->where('branch_id', $branchId)->lockForUpdate()->first();

            $resolvedEnrollmentId = $linkedInvoice?->enrollment_id ?: $enrollmentId;
            $enrollment = Enrollment::query()->where('id', $resolvedEnrollmentId)->where('branch_id', $branchId)->lockForUpdate()->first();
            if (!$enrollment) return ApiResponse::error('Enrollment not found', 404);

            $dueAmount = $linkedInvoice
                ? max((float)$linkedInvoice->amount - (float)$linkedInvoice->paid, 0)
                : max((float)$enrollment->total_fee - (float)$enrollment->paid_amount, 0);

            if ($dueAmount <= 0) return ApiResponse::error('Invoice or enrollment is already fully paid', 400);
            if ($amount > $dueAmount) return ApiResponse::error("Payment amount exceeds outstanding due ({$dueAmount})", 400);

            // Duplicate check
            if ($transactionRef) {
                $dup = Transaction::query()->where('branch_id', $branchId)->where('transaction_ref', $transactionRef)->where('source', 'pos_fee')->where('status', 'success')->first();
                if ($dup) return ApiResponse::error('Duplicate payment reference already recorded', 409);
            }

            // Resolve debit/credit accounts
            $debitAccount = $this->resolveDebitAccount($branchId, $accountId, $method);
            $creditAccount = $this->resolveRevenueAccount($branchId, '4000');
            if (!$debitAccount || !$creditAccount) return ApiResponse::error('Financial accounts not configured properly', 500);

            // Create transaction
            $txn = Transaction::query()->create([
                'branch_id' => $branchId,
                'enrollment_id' => $enrollment->id,
                'invoice_id' => $linkedInvoice?->id,
                'receipt_no' => 'REC-' . now()->format('YmdHis'),
                'amount' => $amount,
                'method' => $method,
                'transaction_ref' => $transactionRef,
                'source' => 'pos_fee',
                'account_id' => $debitAccount->id,
                'recorded_by' => $request->user()->id,
                'status' => 'success',
                'paid_at' => $paymentTimestamp,
            ]);

            // Update enrollment
            $previouslyPaid = (float) $enrollment->paid_amount;
            $newPaidAmount = $previouslyPaid + $amount;
            $enrollment->paid_amount = $newPaidAmount;
            $enrollment->status = $newPaidAmount >= (float) $enrollment->total_fee ? 'paid' : 'partial';
            $enrollment->save();

            // Update invoice
            if ($linkedInvoice) {
                $newInvoicePaid = (float) $linkedInvoice->paid + $amount;
                $linkedInvoice->paid = $newInvoicePaid;
                $linkedInvoice->status = $newInvoicePaid >= (float) $linkedInvoice->amount ? 'paid' : 'partial';
                $linkedInvoice->save();
            }

            // CRM Integration — update lead/opportunity status
            $this->handleCrmIntegration($branchId, $linkedInvoice, $enrollment, $newPaidAmount);

            // Referral expense
            $refAmount = (float) $request->input('referral_amount', 0);
            if ($refAmount > 0) {
                $this->upsertReferralExpense($branchId, $enrollment, $linkedInvoice?->id, $debitAccount->id, $method, $refAmount, $request->input('referred_by'));
            }

            // Double-entry journal
            $entry = JournalEntry::query()->create([
                'branch_id' => $branchId,
                'ref_no' => "PAY-{$txn->id}",
                'description' => "Fee Collection - Enrollment: {$enrollment->id} | Ref: " . ($transactionRef ?: 'N/A'),
                'date' => $paymentTimestamp,
                'posted_by' => $request->user()->id,
            ]);
            JournalLine::query()->insert([
                ['journal_entry_id' => $entry->id, 'account_id' => $debitAccount->id, 'debit' => $amount, 'credit' => 0, 'notes' => $notes ?: 'POS Payment', 'created_at' => now(), 'updated_at' => now()],
                ['journal_entry_id' => $entry->id, 'account_id' => $creditAccount->id, 'debit' => 0, 'credit' => $amount, 'notes' => 'Tuition Revenue', 'created_at' => now(), 'updated_at' => now()],
            ]);

            return ApiResponse::success([
                'message' => 'Fee collected successfully',
                'transaction' => $txn,
            ], 201);
        });
    }

    // ─── COLLECT CUSTOM INCOME ───────────────────────────────────

    public function collectCustomIncome(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => ['required', 'integer'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        return DB::transaction(function () use ($request) {
            $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
            $amount = (float) $request->input('amount');
            $method = $request->input('method', 'cash');
            $transactionRef = $request->input('transaction_ref');
            $notes = $request->input('notes');
            $accountId = $request->input('account_id');
            $paidDate = $request->input('paid_date');
            $paymentTimestamp = $paidDate ? Carbon::parse($paidDate)->setHour(12) : now();

            $invoice = Invoice::query()->where('id', $request->input('invoice_id'))->where('branch_id', $branchId)->lockForUpdate()->first();
            if (!$invoice) return ApiResponse::error('Invoice not found', 404);

            $due = max((float) $invoice->amount - (float) $invoice->paid, 0);
            if ($due <= 0) return ApiResponse::error('Invoice is already fully paid', 400);
            if ($amount > $due) return ApiResponse::error("Payment amount exceeds outstanding due ({$due})", 400);

            $debitAccount = $this->resolveDebitAccount($branchId, $accountId, $method);
            $creditAccount = $this->resolveRevenueAccount($branchId, '4010');
            if (!$debitAccount || !$creditAccount) return ApiResponse::error('Financial accounts not configured properly', 500);

            $receiptNo = 'MR-CUST-' . now()->format('YmdHis');
            $txn = Transaction::query()->create([
                'branch_id' => $branchId,
                'enrollment_id' => null,
                'invoice_id' => $invoice->id,
                'receipt_no' => $receiptNo,
                'amount' => $amount,
                'method' => $method,
                'transaction_ref' => $transactionRef,
                'source' => 'manual',
                'account_id' => $debitAccount->id,
                'recorded_by' => $request->user()->id,
                'status' => 'success',
                'paid_at' => $paymentTimestamp,
            ]);

            $newPaid = (float) $invoice->paid + $amount;
            $invoice->paid = $newPaid;
            $invoice->status = $newPaid >= (float) $invoice->amount ? 'paid' : 'partial';
            $invoice->save();

            $entry = JournalEntry::query()->create([
                'branch_id' => $branchId,
                'ref_no' => $receiptNo,
                'description' => "Custom Income Collection",
                'date' => $paymentTimestamp,
                'posted_by' => $request->user()->id,
            ]);
            JournalLine::query()->insert([
                ['journal_entry_id' => $entry->id, 'account_id' => $debitAccount->id, 'debit' => $amount, 'credit' => 0, 'notes' => $notes ?: 'Custom Income', 'created_at' => now(), 'updated_at' => now()],
                ['journal_entry_id' => $entry->id, 'account_id' => $creditAccount->id, 'debit' => 0, 'credit' => $amount, 'notes' => 'Custom Income Revenue', 'created_at' => now(), 'updated_at' => now()],
            ]);

            return ApiResponse::success(['message' => 'Custom income collected successfully', 'transaction' => $txn], 201);
        });
    }

    // ─── REJECT PENDING INVOICE ──────────────────────────────────

    public function rejectPendingInvoice(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => ['required', 'integer'],
            'rejection_note' => ['required', 'string'],
        ]);

        return DB::transaction(function () use ($request) {
            $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
            $invoice = Invoice::query()
                ->where('id', $request->input('invoice_id'))
                ->where('branch_id', $branchId)
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->with(['student.user', 'enrollment.student.user'])
                ->lockForUpdate()->first();

            if (!$invoice) return ApiResponse::error('Pending invoice not found', 404);

            $studentName = $invoice->student?->user?->name ?? $invoice->enrollment?->student?->user?->name ?? 'Unknown Student';
            $noteBlock = "[Fee Rejected " . now()->toIso8601String() . " by " . ($request->user()->name ?? 'System') . "] " . trim($request->input('rejection_note')) . " | Student: $studentName";
            $nextNotes = $invoice->notes ? $invoice->notes . "\n" . $noteBlock : $noteBlock;

            // Cancel enrollment
            if ($invoice->enrollment_id) {
                $enrollment = Enrollment::find($invoice->enrollment_id);
                if ($enrollment) {
                    $enrollment->status = 'cancelled';
                    $enrollment->save();

                    if ($enrollment->batch_id) {
                        Batch::query()->where('id', $enrollment->batch_id)->where('branch_id', $branchId)->decrement('enrolled');
                    }
                }
            }

            $invoice->status = 'rejected';
            $invoice->notes = $nextNotes;
            $invoice->save();

            // CRM: Update lead + opportunity if linked
            $leadIdMatch = [];
            preg_match('/CRM Lead ID:\s*(\d+)/', $nextNotes, $leadIdMatch);
            if (!empty($leadIdMatch[1])) {
                $lead = Lead::query()->where('id', $leadIdMatch[1])->where('branch_id', $branchId)->first();
                if ($lead) {
                    $lead->status = 'payment_rejected';
                    $lead->last_activity_at = now();
                    $lead->save();
                }
            }

            $oppMatch = [];
            preg_match('/Opportunity ID:\s*(\d+)/', $nextNotes, $oppMatch);
            if (!empty($oppMatch[1])) {
                $opp = Opportunity::query()->where('id', $oppMatch[1])->where('branch_id', $branchId)->first();
                if ($opp) {
                    $opp->fill(['stage' => 'lost', 'closed_at' => now(), 'probability' => 0, 'lost_reason' => 'Payment rejected: ' . trim($request->input('rejection_note'))])->save();
                }
            }

            return ApiResponse::success(['message' => 'Pending fee rejected and noted.', 'invoice' => $invoice]);
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────

    private function resolveDebitAccount(int $branchId, ?int $accountId, string $method): ?Account
    {
        if ($accountId) {
            return Account::query()->where('id', $accountId)->where('branch_id', $branchId)->first();
        }

        $cashCode = '1000';
        $bankCode = '1010';
        $code = $method === 'cash' ? $cashCode : $bankCode;

        return Account::query()->where('code', $code)->where('branch_id', $branchId)->first()
            ?: Account::query()->create([
                'code' => $code,
                'name' => $method === 'cash' ? 'Cash in Hand' : 'Cash at Bank',
                'type' => 'asset',
                'sub_type' => $method === 'cash' ? 'cash' : 'bank',
                'branch_id' => $branchId,
                'is_active' => true,
            ]);
    }

    private function resolveRevenueAccount(int $branchId, string $code): ?Account
    {
        return Account::query()->where('code', $code)->where('branch_id', $branchId)->first()
            ?: Account::query()->create([
                'code' => $code,
                'name' => $code === '4000' ? 'Tuition Revenue' : 'Custom Income Revenue',
                'type' => 'revenue',
                'branch_id' => $branchId,
                'is_active' => true,
            ]);
    }

    private function handleCrmIntegration(int $branchId, ?Invoice $invoice, Enrollment $enrollment, float $newPaidAmount): void
    {
        if (!$invoice?->notes) return;

        $leadIdMatch = [];
        preg_match('/CRM Lead ID:\s*(\d+)/', $invoice->notes, $leadIdMatch);
        $lead = !empty($leadIdMatch[1]) ? Lead::query()->where('id', $leadIdMatch[1])->where('branch_id', $branchId)->first() : null;

        if (!$lead) {
            $nameMatch = [];
            preg_match('/CRM Lead: (.+?) —/', $invoice->notes, $nameMatch);
            if (!empty($nameMatch[1])) {
                $lead = Lead::query()->where('name', $nameMatch[1])->where('branch_id', $branchId)->first();
            }
        }

        $oppMatch = [];
        preg_match('/Opportunity ID:\s*(\d+)/', $invoice->notes, $oppMatch);
        $opp = !empty($oppMatch[1]) ? Opportunity::query()->where('id', $oppMatch[1])->where('branch_id', $branchId)->first() : null;

        if (!$opp && $lead) {
            $opp = Opportunity::query()->where('lead_id', $lead->id)->where('branch_id', $branchId)->orderByDesc('created_at')->first();
        }

        if ($lead && $newPaidAmount >= (float) $enrollment->total_fee) {
            $lead->fill(['status' => 'successful', 'last_activity_at' => now()])->save();
            if ($opp) {
                $opp->fill(['stage' => 'won', 'closed_at' => now(), 'probability' => 100, 'invoice_id' => $invoice->id])->save();
            }
        }
    }

    private function upsertReferralExpense(int $branchId, Enrollment $enrollment, ?int $invoiceId, int $payoutAccountId, string $method, float $amount, ?string $referredBy): void
    {
        if ($amount <= 0) return;

        $referenceTag = "[REF:{$enrollment->id}:" . ($invoiceId ?: 0) . "]";
        $description = "Referral Fee payout: " . ($referredBy ?: 'Unknown') . " $referenceTag";

        $existing = Expense::query()
            ->where('branch_id', $branchId)
            ->where('description', 'like', "%$referenceTag%")
            ->whereNotIn('status', ['rejected', 'deleted'])
            ->first();

        if ($existing) {
            if ($existing->status === 'pending') {
                $existing->fill(['account_id' => $payoutAccountId, 'amount' => $amount, 'description' => $description, 'payment_method' => $method, 'date' => now()])->save();
            }
            return;
        }

        Expense::query()->create([
            'branch_id' => $branchId,
            'account_id' => $payoutAccountId,
            'amount' => $amount,
            'description' => $description,
            'category' => 'Referral Expense',
            'payment_method' => $method,
            'date' => now(),
            'status' => 'pending',
        ]);
    }

    private function parseWebsitePaymentDetails(?string $notes): ?array
    {
        if (!$notes) return null;
        $method = $this->pickNoteValue($notes, 'Payment Method Initiated');
        if (!$method) return null;
        return [
            'method' => $method,
            'merchant_no' => $this->pickNoteValue($notes, 'bKash Merchant No'),
            'bkash_number' => $this->pickNoteValue($notes, 'Student bKash Number'),
            'bkash_transaction_id' => $this->pickNoteValue($notes, 'bKash Transaction ID'),
        ];
    }

    private function pickNoteValue(string $notes, string $label): string
    {
        preg_match("/$label:\s*([^\r\n]+)/i", $notes, $m);
        return trim($m[1] ?? '');
    }
}
