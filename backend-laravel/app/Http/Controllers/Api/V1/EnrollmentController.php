<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $enrollments = BranchScope::apply(Enrollment::query(), $request)
            ->with(['student.user:id,name,email', 'batch.course:id,title'])
            ->latest('id')
            ->get();

        return ApiResponse::success($enrollments);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id' => ['required', 'integer'],
            'batch_id' => ['required', 'integer'],
            'total_fee' => ['required', 'numeric'],
        ]);

        $enrollment = Enrollment::query()->create(array_merge($request->all(), [
            'student_id' => $data['student_id'],
            'batch_id' => $data['batch_id'],
            'total_fee' => $data['total_fee'],
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($enrollment, 201);
    }
}
