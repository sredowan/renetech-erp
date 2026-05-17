<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return ApiResponse::success(Notification::query()->where('user_id', $request->user()->id)->orderByDesc('created_at')->get());
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::query()->where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$notification) {
            return ApiResponse::error('Notification not found', 404);
        }

        $notification->fill(['is_read' => true])->save();

        return ApiResponse::success(['message' => 'Notification marked as read', 'notification' => $notification]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer'],
            'title' => ['required', 'string'],
            'message' => ['required', 'string'],
        ]);

        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $target = User::query()->where('id', $data['user_id'])->where('branch_id', $branchId)->first();
        if (!$target) {
            return ApiResponse::error('Target user not found in this branch', 404);
        }

        $notification = Notification::query()->create([
            'user_id' => $data['user_id'],
            'branch_id' => $branchId,
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $request->input('type', 'info'),
        ]);

        return ApiResponse::success($notification, 201);
    }
}
