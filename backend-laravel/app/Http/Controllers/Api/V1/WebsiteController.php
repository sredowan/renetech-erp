<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Course;
use App\Models\Resource;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebsiteController extends Controller
{
    public function blogs(): JsonResponse
    {
        return ApiResponse::success(BlogPost::query()->with('author:id,name')->orderByDesc('created_at')->get());
    }

    public function createBlog(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string'], 'content' => ['required', 'string']]);
        $published = (bool) $request->input('is_published', false);
        $blog = BlogPost::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'author_id' => $request->user()->id,
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')).'-'.time(),
            'published_at' => $published ? now() : null,
        ]));

        return ApiResponse::success($blog, 201);
    }

    public function updateBlog(Request $request, int $id): JsonResponse
    {
        $blog = BranchScope::apply(BlogPost::query(), $request)->find($id);
        if (!$blog) {
            return ApiResponse::error('Blog post not found', 404);
        }

        $payload = $request->except(['branch_id', 'author_id']);
        if ($request->has('is_published')) {
            $payload['published_at'] = $request->boolean('is_published') ? ($blog->published_at ?: now()) : null;
        }
        $blog->fill($payload)->save();

        return ApiResponse::success($blog);
    }

    public function deleteBlog(Request $request, int $id): JsonResponse
    {
        $blog = BranchScope::apply(BlogPost::query(), $request)->find($id);
        if (!$blog) {
            return ApiResponse::error('Blog post not found', 404);
        }
        $blog->delete();

        return ApiResponse::success(['message' => 'Blog post deleted successfully']);
    }

    public function uploadBlogImage(Request $request): JsonResponse
    {
        return $this->uploadFile($request, 'uploads/blogs', 'image', 'No image file provided');
    }

    public function courses(): JsonResponse
    {
        return ApiResponse::success(Course::query()->orderByDesc('created_at')->get());
    }

    public function updateCourse(Request $request, int $id): JsonResponse
    {
        $course = BranchScope::apply(Course::query(), $request)->find($id);
        if (!$course) {
            return ApiResponse::error('Course not found', 404);
        }

        $course->fill($request->only(['is_published', 'image_url', 'short_description']))->save();

        return ApiResponse::success($course);
    }

    public function uploadCourseImage(Request $request): JsonResponse
    {
        return $this->uploadFile($request, 'uploads/courses', 'image', 'No image file provided');
    }

    public function resources(): JsonResponse
    {
        return ApiResponse::success(Resource::query()->orderByDesc('created_at')->get());
    }

    public function createResource(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string'], 'type' => ['required', 'string']]);
        $resource = Resource::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'slug' => $request->input('slug') ?: Str::slug($request->input('title')).'-'.time(),
        ]));

        return ApiResponse::success($resource, 201);
    }

    public function updateResource(Request $request, int $id): JsonResponse
    {
        $resource = BranchScope::apply(Resource::query(), $request)->find($id);
        if (!$resource) {
            return ApiResponse::error('Resource not found', 404);
        }

        $resource->fill($request->except('branch_id'))->save();

        return ApiResponse::success($resource);
    }

    public function deleteResource(Request $request, int $id): JsonResponse
    {
        $resource = BranchScope::apply(Resource::query(), $request)->find($id);
        if (!$resource) {
            return ApiResponse::error('Resource not found', 404);
        }

        $resource->delete();

        return ApiResponse::success(['message' => 'Resource deleted successfully']);
    }

    public function uploadResourceFile(Request $request): JsonResponse
    {
        return $this->uploadFile($request, 'uploads/resources', 'file', 'No file provided');
    }

    private function uploadFile(Request $request, string $directory, string $field, string $missingMessage): JsonResponse
    {
        if (!$request->hasFile($field)) {
            return ApiResponse::error($missingMessage, 400);
        }

        $file = $request->file($field);
        $name = time().'_'.$file->getClientOriginalName();
        $file->move(public_path($directory), $name);

        return ApiResponse::success(['url' => '/'.$directory.'/'.$name]);
    }
}
