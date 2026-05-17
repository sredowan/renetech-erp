<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function updateMe(Request $request): JsonResponse
    {
        $student = $request->user()->student;
        if (!$student) {
            return ApiResponse::error('Student profile not found', 404);
        }

        $student->fill($request->all());
        $student->save();

        return ApiResponse::success($student);
    }

    public function index(Request $request): JsonResponse
    {
        $students = BranchScope::apply(Student::query(), $request)
            ->with(['user:id,name,email,role,status,branch_id', 'batch:id,code,name,status'])
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success($students);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)
            ->with(['user:id,name,email,role,status,branch_id', 'batch', 'enrollments.batch.course'])
            ->find($id);

        return $student ? ApiResponse::success($student) : ApiResponse::error('Student not found', 404);
    }

    public function activities(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) {
            return ApiResponse::error('Student not found', 404);
        }

        return ApiResponse::success($student->activities()->latest('id')->get());
    }

    public function createActivity(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) {
            return ApiResponse::error('Student not found', 404);
        }

        $activity = Activity::query()->create(array_merge($request->all(), [
            'student_id' => $student->id,
            'branch_id' => $student->branch_id,
            'created_by' => $request->user()->id,
            'type' => $request->input('type', 'note'),
            'subject' => $request->input('subject', 'Student activity'),
        ]));

        return ApiResponse::success($activity, 201);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
        ]);

        return DB::transaction(function () use ($request, $data) {
            $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
            $name = $data['name'] ?? trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? ''));
            $name = $name ?: 'New Student';
            $email = $data['email'] ?? 'student_'.time().'@example.local';

            $user = User::query()->create([
                'name' => $name,
                'email' => $email,
                'password' => bin2hex(random_bytes(16)),
                'role' => 'student',
                'branch_id' => $branchId,
                'status' => 'active',
            ]);

            $student = Student::query()->create(array_merge($request->all(), [
                'user_id' => $user->id,
                'branch_id' => $branchId,
            ]));

            return ApiResponse::success($student->load('user'), 201);
        });
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) {
            return ApiResponse::error('Student not found', 404);
        }

        $student->fill($request->all());
        $student->save();

        return ApiResponse::success($student);
    }

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $student = BranchScope::apply(Student::query(), $request)->find($id);
        if (!$student) {
            return ApiResponse::error('Student not found', 404);
        }
        $request->validate(['photo' => ['required', 'file', 'image']]);

        $file = $request->file('photo');
        $name = 'student_'.time().'_'.$file->getClientOriginalName();
        $file->move(public_path('uploads'), $name);

        $student->photograph_url = '/uploads/'.$name;
        $student->save();

        return ApiResponse::success(['message' => 'Photo uploaded', 'photograph_url' => $student->photograph_url]);
    }

    public function enroll(Request $request): JsonResponse
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

    public function requestPartnerAccess(int $id): JsonResponse
    {
        return ApiResponse::success(['message' => 'Partner access request recorded.', 'student_id' => $id]);
    }
}
