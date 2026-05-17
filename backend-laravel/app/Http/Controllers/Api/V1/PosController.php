<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosController extends Controller
{
    public function transactions(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Transaction::query(), $request)
                ->with(['invoice:id,invoice_no,status,amount,paid', 'enrollment.student.user:id,name,email'])
                ->orderByDesc('paid_at')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function pending(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Invoice::query(), $request)
                ->with(['student.user:id,name,email', 'customer:id,name,phone,email'])
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->orderBy('due_date')
                ->get()
        );
    }

    public function collectFee(Request $request): JsonResponse
    {
        return $this->collectInvoice($request, 'pos_fee');
    }

    public function collectCustomIncome(Request $request): JsonResponse
    {
        return $this->collectInvoice($request, 'manual');
    }

    public function rejectPendingInvoice(Request $request): JsonResponse
    {
        $invoice = BranchScope::apply(Invoice::query(), $request)->find($request->input('invoice_id'));
        if (!$invoice) {
            return ApiResponse::error('Invoice not found', 404);
        }

        $invoice->fill(['status' => 'rejected', 'notes' => $request->input('reason', $invoice->notes)])->save();

        return ApiResponse::success($invoice);
    }

    private function collectInvoice(Request $request, string $source): JsonResponse
    {
        $invoice = BranchScope::apply(Invoice::query(), $request)->find($request->input('invoice_id'));
        if (!$invoice) {
            return ApiResponse::error('Invoice not found', 404);
        }

        $amount = (float) $request->input('amount', ((float) $invoice->amount - (float) $invoice->paid));
        $invoice->paid = (float) $invoice->paid + $amount;
        $invoice->status = $invoice->paid >= $invoice->amount ? 'paid' : 'partial';
        $invoice->save();

        $transaction = Transaction::query()->create([
            'branch_id' => $invoice->branch_id,
            'enrollment_id' => $invoice->enrollment_id,
            'invoice_id' => $invoice->id,
            'receipt_no' => 'REC-'.now()->format('YmdHis'),
            'amount' => $amount,
            'method' => $request->input('method', 'cash'),
            'transaction_ref' => $request->input('transaction_ref'),
            'source' => $source,
            'account_id' => $request->input('account_id'),
            'status' => 'success',
            'paid_at' => now(),
            'recorded_by' => $request->user()->id,
        ]);

        return ApiResponse::success(['invoice' => $invoice, 'transaction' => $transaction]);
    }
}
