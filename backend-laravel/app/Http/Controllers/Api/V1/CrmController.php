<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\CampaignTemplate;
use App\Models\Contact;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Student;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CrmController extends Controller
{
    public function getCourses(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Course::query(), $request)
                ->where('status', 'active')
                ->with(['batches' => fn ($q) => $q->where('status', 'active')->orderBy('start_date')])
                ->orderBy('title')
                ->get()
        );
    }

    public function getAllLeads(Request $request): JsonResponse
    {
        $leads = BranchScope::apply(Lead::query(), $request)
            ->with(['counselor:id,name,email', 'course:id,title', 'batch:id,name,code'])
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->when($request->query('source'), fn ($query, $value) => $query->where('source', $value))
            ->when($request->query('q'), function ($query, $value) {
                $query->where(fn ($inner) => $inner->where('name', 'like', "%{$value}%")->orWhere('phone', 'like', "%{$value}%")->orWhere('email', 'like', "%{$value}%"));
            })
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success($leads);
    }

    public function createLead(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $lead = Lead::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'counselor_id' => $request->input('counselor_id', $request->user()->id),
        ]));

        return ApiResponse::success($lead, 201);
    }

    public function updateLead(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(Lead::class, $request, $id, 'Lead not found');
    }

    public function updateLeadStatus(Request $request, int $id): JsonResponse
    {
        $lead = BranchScope::apply(Lead::query(), $request)->find($id);
        if (!$lead) {
            return ApiResponse::error('Lead not found', 404);
        }

        $lead->fill([
            'status' => $request->input('status', $lead->status),
            'lost_reason' => $request->input('lost_reason', $lead->lost_reason),
            'last_activity_at' => now(),
        ])->save();

        return ApiResponse::success($lead);
    }

    public function deleteLead(Request $request, int $id): JsonResponse
    {
        return $this->deleteScoped(Lead::class, $request, $id, 'Lead not found', 'Lead deleted');
    }

    public function convertLead(Request $request, int $id): JsonResponse
    {
        $lead = BranchScope::apply(Lead::query(), $request)->find($id);
        if (!$lead) {
            return ApiResponse::error('Lead not found', 404);
        }

        $contact = Contact::query()->firstOrCreate([
            'branch_id' => $lead->branch_id,
            'email' => $lead->email,
        ], [
            'name' => $lead->name,
            'phone' => $lead->phone,
            'source' => $lead->source,
            'notes' => $lead->notes,
            'tags' => $lead->tags ?: [],
        ]);

        $opportunity = Opportunity::query()->create([
            'branch_id' => $lead->branch_id,
            'title' => $request->input('title', $lead->name.' Enrollment'),
            'contact_id' => $contact->id,
            'lead_id' => $lead->id,
            'stage' => 'qualification',
            'value' => $lead->deal_value ?: 0,
            'probability' => 20,
            'assigned_to' => $lead->counselor_id,
            'course_interest' => $lead->course_id,
        ]);

        $lead->fill(['status' => 'interested', 'last_activity_at' => now()])->save();

        return ApiResponse::success(['lead' => $lead, 'contact' => $contact, 'opportunity' => $opportunity]);
    }

    public function enrollLead(Request $request, int $id): JsonResponse
    {
        $lead = BranchScope::apply(Lead::query(), $request)->find($id);
        if (!$lead) {
            return ApiResponse::error('Lead not found', 404);
        }

        $result = DB::transaction(function () use ($lead, $request) {
            // 1. Create or find user account
            $user = User::query()->firstOrCreate([
                'email' => $lead->email ?: 'lead_'.$lead->id.'@example.local',
            ], [
                'name' => $request->input('name', $lead->name),
                'password' => bcrypt($request->input('password') ?: bin2hex(random_bytes(8))),
                'branch_id' => $lead->branch_id,
                'role' => 'student',
                'status' => 'active',
            ]);

            // 2. Create or find student profile
            $student = Student::query()->firstOrCreate([
                'user_id' => $user->id,
            ], [
                'branch_id' => $lead->branch_id,
                'first_name' => $request->input('first_name', $lead->name),
                'last_name' => $request->input('last_name', ''),
                'mobile_no' => $request->input('mobile_no', $lead->phone),
                'email' => $request->input('email', $lead->email),
                'date_of_birth' => $request->input('date_of_birth'),
                'enrollment_date' => now()->toDateString(),
                'status' => 'active',
                'father_name' => $request->input('father_name'),
                'mother_name' => $request->input('mother_name'),
                'current_address' => $request->input('current_address'),
                'permanent_address' => $request->input('permanent_address'),
                'nid_birth_cert' => $request->input('nid_birth_cert'),
                'profession' => $request->input('profession'),
                'english_level' => $request->input('english_level'),
                'educational_details' => $request->input('educational_details'),
                'employment_details' => $request->input('employment_details'),
                'referred_by' => $request->input('referred_by'),
                'referral_amount' => $request->input('referral_amount'),
            ]);

            // 3. Determine fee from course
            $course = Course::find($lead->course_id);
            $dealValue = (float) $lead->deal_value;
            $courseFee = (float) ($course->base_fee ?? 0);
            $totalFee = $request->input('total_fee') ?: ($dealValue > 0 ? $dealValue : $courseFee);

            // 4. Create enrollment
            $enrollment = Enrollment::query()->create([
                'branch_id' => $lead->branch_id,
                'student_id' => $student->id,
                'batch_id' => $request->input('batch_id', $lead->batch_id),
                'total_fee' => $totalFee,
                'paid_amount' => 0,
                'status' => 'pending',
            ]);

            // 5. Create pending POS invoice so fees show up in POS
            $invoice = Invoice::query()->create([
                'branch_id' => $lead->branch_id,
                'invoice_no' => 'INV-CRM-' . now()->format('YmdHis') . '-' . $lead->id,
                'enrollment_id' => $enrollment->id,
                'student_id' => $student->id,
                'amount' => $totalFee,
                'paid' => 0,
                'status' => 'pending',
                'due_date' => now()->addDays(7)->toDateString(),
                'issued_at' => now(),
                'notes' => 'CRM Enrollment — ' . ($course->title ?? 'Course') . ' — Lead #' . $lead->id,
            ]);

            // 6. Move lead to fees_pending (awaiting POS collection)
            $lead->fill([
                'status' => 'fees_pending',
                'last_activity_at' => now(),
            ])->save();

            // 7. Store student details in lead tags for reference
            $existingTags = is_array($lead->tags) ? $lead->tags : [];
            $lead->fill([
                'tags' => array_merge($existingTags, [
                    'student_id' => $student->id,
                    'enrollment_id' => $enrollment->id,
                    'invoice_id' => $invoice->id,
                    'student_details' => $request->only([
                        'first_name', 'last_name', 'middle_name', 'mobile_no', 'email',
                        'date_of_birth', 'father_name', 'mother_name', 'current_address',
                        'permanent_address', 'nid_birth_cert', 'profession', 'english_level',
                        'course_reason', 'preferred_country', 'other_reason',
                        'educational_details', 'employment_details', 'referred_by', 'referral_amount',
                    ]),
                ]),
            ])->save();

            return compact('user', 'student', 'enrollment', 'invoice', 'lead');
        });

        return ApiResponse::success(array_merge($result, [
            'message' => 'Student created & pending invoice sent to POS. Go to Finance → POS to collect fees.',
        ]), 201);
    }

    public function markSuccessful(Request $request, int $id): JsonResponse
    {
        $lead = BranchScope::apply(Lead::query(), $request)->find($id);
        if (!$lead) {
            return ApiResponse::error('Lead not found', 404);
        }

        $lead->fill([
            'status' => 'successful',
            'destination_country' => $request->input('destination_country', $lead->destination_country),
            'last_activity_at' => now(),
        ])->save();

        return ApiResponse::success($lead);
    }

    public function getContacts(Request $request): JsonResponse
    {
        return ApiResponse::success(
            BranchScope::apply(Contact::query(), $request)
                ->when($request->query('q'), fn ($query, $value) => $query->where(fn ($inner) => $inner->where('name', 'like', "%{$value}%")->orWhere('phone', 'like', "%{$value}%")->orWhere('email', 'like', "%{$value}%")))
                ->where('is_active', true)
                ->orderByDesc('id')
                ->get()
        );
    }

    public function createContact(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $contact = Contact::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($contact, 201);
    }

    public function bulkUploadContacts(Request $request): JsonResponse
    {
        $contacts = collect($request->input('contacts', []))->map(function (array $row) use ($request) {
            return Contact::query()->create(array_merge($row, [
                'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
                'name' => $row['name'] ?? 'Unnamed Contact',
            ]));
        });

        return ApiResponse::success(['created' => $contacts->count(), 'contacts' => $contacts], 201);
    }

    public function bulkUpdateContactLeadStatus(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        Contact::query()->whereIn('id', $ids)->update(['notes' => $request->input('notes')]);

        return ApiResponse::success(['message' => 'Contacts updated', 'updated' => count($ids)]);
    }

    public function getContact(Request $request, int $id): JsonResponse
    {
        $contact = BranchScope::apply(Contact::query(), $request)->find($id);

        return $contact ? ApiResponse::success($contact) : ApiResponse::error('Contact not found', 404);
    }

    public function updateContact(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(Contact::class, $request, $id, 'Contact not found');
    }

    public function deleteContact(Request $request, int $id): JsonResponse
    {
        $contact = BranchScope::apply(Contact::query(), $request)->find($id);
        if (!$contact) {
            return ApiResponse::error('Contact not found', 404);
        }
        $contact->fill(['is_active' => false])->save();

        return ApiResponse::success(['message' => 'Contact deleted']);
    }

    public function getOpportunities(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Opportunity::query(), $request)->with(['contact', 'lead', 'assignedTo:id,name,email'])->orderByDesc('id')->get());
    }

    public function createOpportunity(Request $request): JsonResponse
    {
        $request->validate(['title' => ['required', 'string']]);
        $opportunity = Opportunity::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
        ]));

        return ApiResponse::success($opportunity, 201);
    }

    public function updateOpportunity(Request $request, int $id): JsonResponse
    {
        return $this->updateScoped(Opportunity::class, $request, $id, 'Opportunity not found');
    }

    public function deleteOpportunity(Request $request, int $id): JsonResponse
    {
        return $this->deleteScoped(Opportunity::class, $request, $id, 'Opportunity not found', 'Opportunity deleted');
    }

    public function winOpportunity(Request $request, int $id): JsonResponse
    {
        return $this->closeOpportunity($request, $id, 'won');
    }

    public function loseOpportunity(Request $request, int $id): JsonResponse
    {
        return $this->closeOpportunity($request, $id, 'lost', $request->input('lost_reason'));
    }

    public function getActivities(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Activity::query(), $request)->with('creator:id,name,email')->orderByDesc('id')->get());
    }

    public function createActivity(Request $request): JsonResponse
    {
        $request->validate(['subject' => ['required', 'string']]);
        $activity = Activity::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'created_by' => $request->user()->id,
        ]));

        return ApiResponse::success($activity, 201);
    }

    public function completeActivity(Request $request, int $id): JsonResponse
    {
        $activity = BranchScope::apply(Activity::query(), $request)->find($id);
        if (!$activity) {
            return ApiResponse::error('Activity not found', 404);
        }
        $activity->fill(['is_done' => true, 'completed_at' => now(), 'outcome' => $request->input('outcome', $activity->outcome)])->save();

        return ApiResponse::success($activity);
    }

    public function getCampaigns(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(CampaignTemplate::query(), $request)->with('creator:id,name,email')->orderByDesc('id')->get());
    }

    public function createCampaign(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string'], 'body' => ['required', 'string']]);
        $campaign = CampaignTemplate::query()->create(array_merge($request->all(), [
            'branch_id' => BranchScope::selectedBranchId($request) ?: $request->user()->branch_id,
            'created_by' => $request->user()->id,
        ]));

        return ApiResponse::success($campaign, 201);
    }

    public function sendCampaign(Request $request, int $id): JsonResponse
    {
        $campaign = BranchScope::apply(CampaignTemplate::query(), $request)->find($id);
        if (!$campaign) {
            return ApiResponse::error('Campaign not found', 404);
        }
        $campaign->fill(['status' => 'sent', 'sent_at' => now(), 'sent_count' => $campaign->sent_count + 1])->save();

        return ApiResponse::success(['message' => 'Campaign sent', 'campaign' => $campaign]);
    }

    public function deleteCampaign(Request $request, int $id): JsonResponse
    {
        return $this->deleteScoped(CampaignTemplate::class, $request, $id, 'Campaign not found', 'Campaign deleted');
    }

    public function getFunnel(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Lead::query(), $request)->selectRaw('status, COUNT(*) as count')->groupBy('status')->get());
    }

    public function getSourceAnalysis(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Lead::query(), $request)->selectRaw('COALESCE(source, "Unknown") as source, COUNT(*) as count')->groupBy('source')->get());
    }

    public function getRevenueForecast(Request $request): JsonResponse
    {
        $open = BranchScope::apply(Opportunity::query(), $request)->whereNotIn('stage', ['won', 'lost'])->get();

        return ApiResponse::success([
            'pipeline_value' => $open->sum(fn ($row) => (float) $row->value),
            'weighted_forecast' => $open->sum(fn ($row) => ((float) $row->value * (int) $row->probability) / 100),
            'opportunities' => $open,
        ]);
    }

    public function getSuccessResultsAnalysis(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Lead::query(), $request)->where('status', 'successful')->selectRaw('COALESCE(course_id, 0) as course_id, COUNT(*) as count')->groupBy('course_id')->get());
    }

    public function getSuccessDestinationAnalysis(Request $request): JsonResponse
    {
        return ApiResponse::success(BranchScope::apply(Lead::query(), $request)->where('status', 'successful')->selectRaw('COALESCE(destination_country, "Unknown") as destination_country, COUNT(*) as count')->groupBy('destination_country')->get());
    }

    private function closeOpportunity(Request $request, int $id, string $stage, ?string $lostReason = null): JsonResponse
    {
        $opportunity = BranchScope::apply(Opportunity::query(), $request)->find($id);
        if (!$opportunity) {
            return ApiResponse::error('Opportunity not found', 404);
        }

        $opportunity->fill(['stage' => $stage, 'closed_at' => now(), 'probability' => $stage === 'won' ? 100 : 0, 'lost_reason' => $lostReason])->save();

        return ApiResponse::success($opportunity);
    }

    private function updateScoped(string $model, Request $request, int $id, string $notFound): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }

        $row->fill($request->except('branch_id'))->save();

        return ApiResponse::success($row);
    }

    private function deleteScoped(string $model, Request $request, int $id, string $notFound, string $message): JsonResponse
    {
        $row = BranchScope::apply($model::query(), $request)->find($id);
        if (!$row) {
            return ApiResponse::error($notFound, 404);
        }

        $row->delete();

        return ApiResponse::success(['message' => $message]);
    }
}
