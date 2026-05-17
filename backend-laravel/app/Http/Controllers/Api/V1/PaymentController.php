<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function config(): JsonResponse
    {
        $merchant = SystemSetting::query()->where('setting_key', 'BKASH_MERCHANT_NO')->value('setting_value')
            ?: env('BKASH_MERCHANT_NO', '01913-373581');

        return ApiResponse::success(['bkash_merchant_no' => $merchant]);
    }

    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'course_id' => ['required'],
            'batch_id' => ['required'],
            'branch_id' => ['required'],
        ]);

        $paymentRef = 'PAY-'.Str::upper(Str::substr((string) Str::uuid(), 0, 8));

        return ApiResponse::success([
            'message' => 'Checkout initiated',
            'payment_ref' => $paymentRef,
            'redirect_url' => '/payment/success?ref='.$paymentRef,
        ]);
    }

    public function success(Request $request): JsonResponse
    {
        $paymentRef = $request->input('payment_ref');
        if (!$paymentRef) {
            return ApiResponse::error('Payment reference required', 400);
        }

        return ApiResponse::success([
            'message' => 'Payment processed and enrollment successful',
            'payment_ref' => $paymentRef,
            'portal_access' => 'after_payment_verification',
        ]);
    }

    public function fail(): JsonResponse
    {
        return ApiResponse::success(['message' => 'Payment failed']);
    }

    public function cancel(): JsonResponse
    {
        return ApiResponse::success(['message' => 'Payment cancelled']);
    }

    public function status(string $reference): JsonResponse
    {
        return ApiResponse::success(['reference' => $reference, 'status' => 'pending']);
    }

    public function simulate(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'message' => 'Payment simulated successfully',
            'user_id' => $request->user()->id,
        ]);
    }
}
