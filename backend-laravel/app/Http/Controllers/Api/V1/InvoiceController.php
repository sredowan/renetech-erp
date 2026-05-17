<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\IncomeCategory;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $invoices = BranchScope::apply(Invoice::query(), $request)
            ->with(['student.user:id,name,email', 'incomeCategory:id,name', 'customer:id,name,phone,email'])
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->orderByDesc('issued_at')
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success($invoices);
    }

    public function stats(Request $request): JsonResponse
    {
        $query = BranchScope::apply(Invoice::query(), $request);

        return ApiResponse::success([
            'total' => (clone $query)->count(),
            'totalAmount' => (float) (clone $query)->sum('amount'),
            'paidAmount' => (float) (clone $query)->sum('paid'),
            'pending' => (clone $query)->whereIn('status', ['pending', 'partial', 'overdue'])->count(),
        ]);
    }

    public function aging(Request $request): JsonResponse
    {
        $today = now()->toDateString();
        $invoices = BranchScope::apply(Invoice::query(), $request)
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->whereNotNull('due_date')
            ->get();

        return ApiResponse::success([
            'current' => $invoices->filter(fn ($invoice) => $invoice->due_date >= $today)->sum(fn ($invoice) => (float) $invoice->amount - (float) $invoice->paid),
            'overdue' => $invoices->filter(fn ($invoice) => $invoice->due_date < $today)->sum(fn ($invoice) => (float) $invoice->amount - (float) $invoice->paid),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['amount' => ['required', 'numeric']]);
        $invoice = Invoice::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'invoice_no' => $request->input('invoice_no') ?: 'INV-'.now()->format('YmdHis'),
            'issued_at' => $request->input('issued_at') ?: now(),
        ]));

        return ApiResponse::success($invoice, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $invoice = BranchScope::apply(Invoice::query(), $request)->find($id);
        if (!$invoice) {
            return ApiResponse::error('Invoice not found', 404);
        }

        $invoice->fill($request->except('branch_id'))->save();

        return ApiResponse::success($invoice);
    }

    public function categories(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(IncomeCategory::query(), $request)->with('children')->whereNull('parent_id')->orderBy('name')->get());
    }

    public function categoriesFlat(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(IncomeCategory::query(), $request)->orderBy('name')->get());
    }

    public function createCategory(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $category = IncomeCategory::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($category, 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = BranchScope::apply(IncomeCategory::query(), $request)->find($id);
        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        $category->fill($request->except('branch_id'))->save();

        return ApiResponse::success($category);
    }

    public function deleteCategory(Request $request, int $id): JsonResponse
    {
        $category = BranchScope::apply(IncomeCategory::query(), $request)->find($id);
        if (!$category) {
            return ApiResponse::error('Category not found', 404);
        }

        $category->delete();

        return ApiResponse::success(['message' => 'Category deleted']);
    }

    public function customers(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Customer::query(), $request)->where('is_active', true)->orderBy('name')->get());
    }

    public function createCustomer(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $customer = Customer::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($customer, 201);
    }

    public function updateCustomer(Request $request, int $id): JsonResponse
    {
        $customer = BranchScope::apply(Customer::query(), $request)->find($id);
        if (!$customer) {
            return ApiResponse::error('Customer not found', 404);
        }

        $customer->fill($request->except('branch_id'))->save();

        return ApiResponse::success($customer);
    }

    public function deleteCustomer(Request $request, int $id): JsonResponse
    {
        $customer = BranchScope::apply(Customer::query(), $request)->find($id);
        if (!$customer) {
            return ApiResponse::error('Customer not found', 404);
        }

        $customer->fill(['is_active' => false])->save();

        return ApiResponse::success(['message' => 'Customer deleted']);
    }

    public function pay(Request $request, int $id): JsonResponse
    {
        $invoice = BranchScope::apply(Invoice::query(), $request)->find($id);
        if (!$invoice) {
            return ApiResponse::error('Invoice not found', 404);
        }

        $amount = (float) $request->input('amount', ((float) $invoice->amount - (float) $invoice->paid));
        $invoice->paid = (float) $invoice->paid + $amount;
        $invoice->status = $invoice->paid >= $invoice->amount ? 'paid' : 'partial';
        $invoice->save();

        $transaction = Transaction::query()->create([
            'branch_id' => $invoice->branch_id,
            'invoice_id' => $invoice->id,
            'receipt_no' => 'REC-'.now()->format('YmdHis'),
            'amount' => $amount,
            'method' => $request->input('method', 'cash'),
            'source' => 'manual',
            'status' => 'success',
            'paid_at' => now(),
            'recorded_by' => $request->user()->id,
        ]);

        return ApiResponse::success(['invoice' => $invoice, 'transaction' => $transaction]);
    }
}
