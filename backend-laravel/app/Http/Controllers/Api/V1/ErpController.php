<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ErpController extends Controller
{
    public function rooms(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Room::query(), $request)->orderBy('name')->get());
    }

    public function createRoom(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string']]);
        $room = Room::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'status' => $request->input('status', 'free'),
        ]));

        return ApiResponse::success($room, 201);
    }

    public function bookings(Request $request): JsonResponse
    {
        $bookings = BranchScope::apply(RoomBooking::query(), $request)
            ->with(['room', 'batch'])
            ->when($request->query('date'), fn ($query, $date) => $query->whereDate('date', $date))
            ->when($request->query('room_id'), fn ($query, $roomId) => $query->where('room_id', $roomId))
            ->orderByDesc('date')
            ->get();

        return ApiResponse::success($bookings);
    }

    public function bookRoom(Request $request): JsonResponse
    {
        $data = $request->validate([
            'room_id' => ['required', 'integer'],
            'batch_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
        ]);

        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $room = Room::query()->where('id', $data['room_id'])->where('branch_id', $branchId)->first();
        $batch = Batch::query()->where('id', $data['batch_id'])->where('branch_id', $branchId)->first();
        if (!$room) {
            return ApiResponse::error('Room not found', 404);
        }
        if (!$batch) {
            return ApiResponse::error('Batch not found', 404);
        }

        $conflict = RoomBooking::query()
            ->where('branch_id', $branchId)
            ->where('room_id', $data['room_id'])
            ->whereDate('date', $data['date'])
            ->where(function ($query) use ($data) {
                $query->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                    ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']]);
            })
            ->exists();

        if ($conflict) {
            return ApiResponse::error('Room is already booked for this time slot.', 400);
        }

        $booking = RoomBooking::query()->create(array_merge($data, ['branch_id' => $branchId]));

        return ApiResponse::success($booking, 201);
    }

    public function deleteBooking(Request $request, int $id): JsonResponse
    {
        $booking = BranchScope::apply(RoomBooking::query(), $request)->find($id);
        if (!$booking) {
            return ApiResponse::error('Booking not found', 404);
        }
        $booking->delete();

        return ApiResponse::success(['message' => 'Booking cancelled successfully']);
    }
}
