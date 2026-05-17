<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PteAttempt;
use App\Models\PteTask;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PteController extends Controller
{
    public function tasks(Request $request): JsonResponse
    {
        $query = PteTask::query()->orderBy('section')->orderBy('type');

        if ($request->filled('section')) {
            $query->where('section', $request->query('section'));
        }

        return ApiResponse::success($query->get());
    }

    public function createAttempt(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return ApiResponse::error('Student profile not found', 404);
        }

        $data = $request->validate([
            'task_id' => ['required', 'integer'],
            'response' => ['nullable', 'array'],
            'score' => ['nullable', 'numeric'],
            'evaluation' => ['nullable', 'array'],
        ]);

        $attempt = PteAttempt::query()->create(array_merge($data, [
            'student_id' => $student->id,
            'branch_id' => BranchScope::selectedBranchId($request) ?: $student->branch_id,
            'is_mock_test' => (bool) $request->input('is_mock_test', false),
        ]));

        return ApiResponse::success($attempt, 201);
    }

    public function performance(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return ApiResponse::error('Student profile not found', 404);
        }

        $attempts = PteAttempt::query()->where('student_id', $student->id)->with('task:id,section,type')->latest('id')->get();

        return ApiResponse::success([
            'attempts' => $attempts,
            'averageScore' => round((float) $attempts->avg('score'), 2),
            'attemptCount' => $attempts->count(),
        ]);
    }

    public function branchPerformance(Request $request): JsonResponse
    {
        $query = PteAttempt::query()->select('branch_id', DB::raw('COUNT(*) as attempt_count'), DB::raw('AVG(score) as average_score'));
        BranchScope::apply($query, $request);

        return ApiResponse::success($query->groupBy('branch_id')->get());
    }
}
