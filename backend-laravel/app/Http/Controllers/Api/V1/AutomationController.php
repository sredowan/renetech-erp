<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AutomationRule;
use App\Models\Lead;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiResponse::success(AutomationRule::query()->orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string'], 'trigger_type' => ['required', 'string'], 'action_type' => ['required', 'string'], 'template' => ['required', 'string']]);

        return ApiResponse::success(AutomationRule::query()->create($request->all()), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = AutomationRule::query()->find($id);
        if (!$rule) {
            return ApiResponse::error('Rule not found', 404);
        }

        $rule->fill($request->only(['name', 'trigger_type', 'action_type', 'template', 'config', 'branch_id', 'is_active']))->save();

        return ApiResponse::success($rule);
    }

    public function toggle(int $id): JsonResponse
    {
        $rule = AutomationRule::query()->find($id);
        if (!$rule) {
            return ApiResponse::error('Rule not found', 404);
        }

        $rule->fill(['is_active' => !$rule->is_active])->save();

        return ApiResponse::success($rule);
    }

    public function destroy(int $id): JsonResponse
    {
        $rule = AutomationRule::query()->find($id);
        if (!$rule) {
            return ApiResponse::error('Rule not found', 404);
        }

        $rule->delete();

        return ApiResponse::success(['message' => 'Rule deleted']);
    }

    public function runBirthdayCheck(): JsonResponse
    {
        $today = now('Asia/Dhaka');
        $leads = Lead::query()
            ->whereMonth('date_of_birth', $today->month)
            ->whereDay('date_of_birth', $today->day)
            ->get();

        return ApiResponse::success([
            'message' => 'Birthday check completed',
            'matched' => $leads->count(),
        ]);
    }
}
