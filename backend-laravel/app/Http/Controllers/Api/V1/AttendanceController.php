<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function myAttendance(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return ApiResponse::error('Student profile not found', 404);
        }

        return ApiResponse::success(
            Attendance::query()->where('student_id', $student->id)->with('batch:id,code,name')->latest('date')->get()
        );
    }

    public function mark(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'batch_id' => ['required', 'integer'],
            'date' => ['required', 'date'],
            'status' => ['required', 'string'],
        ]);

        $attendance = Attendance::query()->updateOrCreate(
            [
                'student_id' => $data['student_id'],
                'batch_id' => $data['batch_id'],
                'date' => $data['date'],
            ],
            [
                'status' => $data['status'],
                'method' => $request->input('method', 'manual'),
                'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            ]
        );

        return ApiResponse::success($attendance);
    }

    public function batch(Request $request): JsonResponse
    {
        $request->validate(['batch_id' => ['required', 'integer']]);

        $query = Attendance::query()->where('batch_id', $request->query('batch_id'))->with('student.user:id,name,email');
        BranchScope::apply($query, $request);

        return ApiResponse::success($query->orderByDesc('date')->get());
    }

    public function student(Request $request, int $studentId): JsonResponse
    {
        $query = Attendance::query()->where('student_id', $studentId)->with('batch:id,code,name');
        BranchScope::apply($query, $request);

        return ApiResponse::success($query->orderByDesc('date')->get());
    }
}
