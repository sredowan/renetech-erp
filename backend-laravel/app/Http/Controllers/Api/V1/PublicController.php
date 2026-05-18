<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BlogPost;
use App\Models\Branch;
use App\Models\Contact;
use App\Models\Course;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Resource;
use App\Models\SystemSetting;
use App\Services\FacebookCapiService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    public function trackingConfig(): JsonResponse
    {
        $pixelId = SystemSetting::query()->where('setting_key', 'FB_PIXEL_ID')->value('setting_value') ?: env('FB_PIXEL_ID', '');

        return response()->json(['facebook' => ['pixel_id' => $pixelId]])->header('Cache-Control', 'no-store');
    }

    public function branches(): JsonResponse
    {
        return ApiResponse::success(Branch::query()->where('is_active', true)->orderBy('type')->orderBy('name')->get());
    }

    public function branchDetails(string $slug): JsonResponse
    {
        $branch = Branch::query()->where('is_active', true)->where(fn ($query) => $query->where('slug', $slug)->orWhere('code', $slug))->first();

        return $branch ? ApiResponse::success($branch) : ApiResponse::error('Branch not found', 404, ['message' => 'Branch not found']);
    }

    public function branchCourses(string $slug): JsonResponse
    {
        $branch = Branch::query()->where('is_active', true)->where(fn ($query) => $query->where('slug', $slug)->orWhere('code', $slug))->first();
        if (!$branch) {
            return ApiResponse::error('Branch not found', 404, ['message' => 'Branch not found']);
        }

        return ApiResponse::success($this->publishedCoursesQuery($branch->id)->get());
    }

    public function branchBlogs(string $slug): JsonResponse
    {
        $branch = Branch::query()->where('is_active', true)->where(fn ($query) => $query->where('slug', $slug)->orWhere('code', $slug))->first();
        if (!$branch) {
            return ApiResponse::error('Branch not found', 404, ['message' => 'Branch not found']);
        }

        return ApiResponse::success(BlogPost::query()->where('branch_id', $branch->id)->where('is_published', true)->orderByDesc('published_at')->get());
    }

    public function courses(Request $request): JsonResponse
    {
        $branchId = $this->publicBranchId($request);

        return ApiResponse::success($this->publishedCoursesQuery($branchId, $request->query('booking') === 'true')->with('branch:id,name,slug')->get());
    }

    public function courseDetails(Request $request, string $slug): JsonResponse
    {
        $course = $this->publishedCoursesQuery($this->publicBranchId($request), $request->query('booking') === 'true')
            ->with('batches')
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('id', is_numeric($slug) ? (int) $slug : 0))
            ->first();

        return $course ? ApiResponse::success($course) : ApiResponse::error('Course not found', 404, ['message' => 'Course not found']);
    }

    public function courseBatches(Request $request, string $slug): JsonResponse
    {
        $course = $this->publishedCoursesQuery($this->publicBranchId($request), $request->query('booking') === 'true')
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('id', is_numeric($slug) ? (int) $slug : 0))
            ->first();

        if (!$course) {
            return ApiResponse::error('Course not found', 404, ['message' => 'Course not found']);
        }

        return ApiResponse::success(Batch::query()->where('course_id', $course->id)->whereIn('status', ['enrolling', 'starting_soon'])->orderBy('start_date')->get());
    }

    public function blogs(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BlogPost::query()
                ->where('is_published', true)
                ->when($this->publicBranchId($request), fn ($query, $branchId) => $query->where('branch_id', $branchId))
                ->orderByDesc('published_at')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function blogDetails(Request $request, string $slug): JsonResponse
    {
        $blog = BlogPost::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->when($this->publicBranchId($request), fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->with('resources')
            ->first();

        return $blog ? ApiResponse::success($blog) : ApiResponse::error('Blog post not found', 404, ['message' => 'Blog post not found']);
    }

    public function resources(Request $request): JsonResponse
    {
        return ApiResponse::success(Resource::query()->where('status', 'published')->when($this->publicBranchId($request), fn ($query, $branchId) => $query->where('branch_id', $branchId))->orderByDesc('created_at')->get());
    }

    public function resourceDetails(Request $request, string $slug): JsonResponse
    {
        $resource = Resource::query()->where('slug', $slug)->where('status', 'published')->when($this->publicBranchId($request), fn ($query, $branchId) => $query->where('branch_id', $branchId))->first();

        return $resource ? ApiResponse::success($resource) : ApiResponse::error('Resource not found', 404, ['message' => 'Resource not found']);
    }

    public function submitContactForm(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string'], 'email' => ['nullable', 'email']]);

        $result = $this->createPublicLead($request, 'Website Enquiry', $request->input('message'));

        // Fire Facebook CAPI 'Lead' event (non-blocking)
        try {
            $lead = $result['lead'];
            $course = $lead->course_id ? Course::find($lead->course_id) : null;
            FacebookCapiService::sendLeadEvent($request, [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'courseName' => $course?->title ?? 'Website Enquiry',
                'value' => (float) ($course?->base_fee ?? 0),
            ]);
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return ApiResponse::success(['message' => 'Enquiry submitted successfully! We will contact you shortly.', 'leadId' => $result['lead']->id], 201);
    }

    public function submitCourseEnquiry(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string'], 'email' => ['nullable', 'email']]);

        $result = $this->createPublicLead($request, 'website', $request->input('message'));

        // Fire Facebook CAPI 'Lead' event (non-blocking)
        try {
            $lead = $result['lead'];
            $course = $lead->course_id ? Course::find($lead->course_id) : null;
            FacebookCapiService::sendLeadEvent($request, [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'courseName' => $course?->title ?? 'Course Enquiry',
                'value' => (float) ($course?->base_fee ?? 0),
            ]);
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return ApiResponse::success(['message' => 'Enquiry submitted successfully! We will get in touch shortly.', 'leadId' => $result['lead']->id], 201);
    }

    public function submitStudentBooking(Request $request): JsonResponse
    {
        $name = trim($request->input('name') ?: trim($request->input('first_name', '').' '.$request->input('last_name', '')));
        $request->merge(['name' => $name, 'phone' => $request->input('phone') ?: $request->input('mobile_no')]);
        $request->validate(['name' => ['required', 'string'], 'phone' => ['required', 'string'], 'email' => ['required', 'email']]);

        $result = $this->createPublicLead($request, 'Student Booking', $request->input('message'));

        // Fire Facebook CAPI 'Lead' event (non-blocking)
        try {
            $lead = $result['lead'];
            $course = $lead->course_id ? Course::find($lead->course_id) : null;
            FacebookCapiService::sendLeadEvent($request, [
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'courseName' => $course?->title ?? 'Student Booking',
                'value' => (float) ($course?->base_fee ?? 0),
            ]);
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return ApiResponse::success(['message' => 'Booking submitted successfully! We will contact you shortly.', 'leadId' => $result['lead']->id], 201);
    }

    private function publishedCoursesQuery(?int $branchId, bool $includeUnpublished = false)
    {
        return Course::query()
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when(!$includeUnpublished, fn ($query) => $query->where('is_published', true))
            ->where('status', 'active')
            ->orderByDesc('created_at');
    }

    private function publicBranchId(Request $request): ?int
    {
        $branch = $request->query('branch_id') ?: $request->query('branchId') ?: $request->query('branch');

        return $branch ? (int) $branch : null;
    }

    private function createPublicLead(Request $request, string $source, ?string $message): array
    {
        return DB::transaction(function () use ($request, $source, $message) {
            $branchId = $this->publicBranchId($request) ?: (int) (Branch::query()->where('type', 'head')->value('id') ?: Branch::query()->value('id') ?: 1);
            $course = $request->input('course_id') ? Course::query()->find($request->input('course_id')) : null;
            $batch = $request->input('batch_id') ? Batch::query()->find($request->input('batch_id')) : null;
            $name = $request->input('name');

            $lead = Lead::query()->create([
                'branch_id' => $branchId,
                'name' => $name,
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'destination_country' => $request->input('destination_country') ?: $request->input('preferred_country'),
                'source' => $source,
                'status' => $source === 'Student Booking' ? 'trial' : 'interested',
                'priority' => 'high',
                'score' => 50,
                'course_id' => $course?->id,
                'batch_id' => $batch?->id,
                'batch_interest' => $batch?->name ?: $course?->title,
                'deal_value' => $course?->base_fee ?: 0,
                'notes' => $message,
                'last_activity_at' => now(),
            ]);

            $contact = Contact::query()->firstOrCreate([
                'branch_id' => $branchId,
                'email' => $request->input('email'),
            ], [
                'name' => $name,
                'phone' => $request->input('phone'),
                'source' => $source,
                'notes' => $message,
            ]);

            $opportunity = Opportunity::query()->create([
                'branch_id' => $branchId,
                'title' => $name.' - '.$source,
                'contact_id' => $contact->id,
                'lead_id' => $lead->id,
                'value' => $course?->base_fee ?: 0,
                'stage' => 'qualification',
                'course_interest' => $batch?->name ?: $course?->title,
            ]);

            return compact('lead', 'contact', 'opportunity');
        });
    }
}
