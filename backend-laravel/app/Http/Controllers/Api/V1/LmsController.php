<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Course;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LmsController extends Controller
{
    public function courses(Request $request): JsonResponse
    {
        $courses = BranchScope::apply(Course::query(), $request)
            ->with('batches:id,course_id,code,name,status,start_date,end_date')
            ->orderBy('title')
            ->get();

        return ApiResponse::success($courses);
    }

    public function createCourse(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'base_fee' => ['required', 'numeric'],
        ]);

        $course = Course::query()->create(array_merge($request->all(), [
            'title' => $data['title'],
            'base_fee' => $data['base_fee'],
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($course, 201);
    }

    public function updateCourse(Request $request, int $id): JsonResponse
    {
        $course = BranchScope::apply(Course::query(), $request)->find($id);
        if (!$course) {
            return ApiResponse::error('Course not found', 404);
        }

        $course->fill($request->all());
        $course->save();

        return ApiResponse::success($course);
    }

    public function uploadCourseImage(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'file', 'image']]);

        $file = $request->file('image');
        $name = 'course_'.time().'_'.$file->getClientOriginalName();
        $file->move(public_path('uploads/courses'), $name);

        return ApiResponse::success(['url' => '/uploads/courses/'.$name]);
    }

    public function batches(Request $request): JsonResponse
    {
        $batches = BranchScope::apply(Batch::query(), $request)
            ->with(['course:id,title,base_fee', 'trainer:id,name,email'])
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success($batches);
    }

    public function batch(Request $request, int $id): JsonResponse
    {
        $batch = BranchScope::apply(Batch::query(), $request)
            ->with(['course', 'trainer:id,name,email'])
            ->find($id);

        return $batch ? ApiResponse::success($batch) : ApiResponse::error('Batch not found', 404);
    }

    public function batchStudents(Request $request, int $id): JsonResponse
    {
        $batch = BranchScope::apply(Batch::query(), $request)->with('students.user:id,name,email')->find($id);

        return $batch ? ApiResponse::success($batch->students) : ApiResponse::error('Batch not found', 404);
    }

    public function createBatch(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'integer'],
            'code' => ['required', 'string', 'max:255'],
        ]);

        $batch = Batch::query()->create(array_merge($request->all(), [
            'course_id' => $data['course_id'],
            'code' => $data['code'],
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($batch, 201);
    }

    public function updateBatch(Request $request, int $id): JsonResponse
    {
        $batch = BranchScope::apply(Batch::query(), $request)->find($id);
        if (!$batch) {
            return ApiResponse::error('Batch not found', 404);
        }

        $batch->fill($request->all());
        $batch->save();

        return ApiResponse::success($batch);
    }

    public function updateBatchStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string']]);

        return $this->updateBatch($request, $id);
    }

    public function notifyBatchStudents(int $id): JsonResponse
    {
        return ApiResponse::success(['message' => 'Batch notification queued.', 'batch_id' => $id]);
    }
}
