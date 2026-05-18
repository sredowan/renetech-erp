<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Asset;
use App\Models\Batch;
use App\Models\Branch;
use App\Models\Contact;
use App\Models\Course;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Lead;
use App\Models\StaffProfile;
use App\Models\Student;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BranchController extends Controller
{
    private const STAFF_EXCLUDED_ROLES = ['student', 'guardian'];

    // ─── GET ALL BRANCHES (with quick counts) ────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Branch::query()->with('manager:id,name,email')->orderBy('type')->orderBy('name');

        if ($request->user()->role === 'branch_admin') {
            $query->where('id', $request->user()->branch_id);
        }

        $branches = $query->get()->map(function (Branch $branch) {
            $data = $branch->toArray();
            $data['Manager'] = $branch->manager;
            unset($data['manager']);

            $bid = $branch->id;
            $data['studentCount'] = $this->safeCount('students', $bid);
            $data['staffCount'] = DB::table('users')
                ->where('branch_id', $bid)
                ->whereNotIn('role', self::STAFF_EXCLUDED_ROLES)
                ->count();
            $data['courseCount'] = $this->safeCount('courses', $bid);
            $data['leadCount'] = $this->safeCount('leads', $bid);

            return $data;
        });

        return ApiResponse::success($branches);
    }

    // ─── CREATE BRANCH + ADMIN USER ──────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email'],
            'admin_password' => ['required', 'string', 'min:6'],
        ]);

        return DB::transaction(function () use ($request) {
            $slug = Str::slug($request->input('slug', $request->input('name')));
            // Ensure unique slug
            $baseSlug = $slug;
            $counter = 1;
            while (Branch::query()->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }

            $branch = Branch::query()->create([
                'name' => $request->input('name'),
                'code' => $request->input('code'),
                'slug' => $slug,
                'type' => 'branch',
                'address' => $request->input('address'),
                'phone' => $request->input('phone'),
                'email' => $request->input('email'),
                'is_active' => true,
                'public_title' => $request->input('public_title'),
                'public_description' => $request->input('public_description'),
                'seo_title' => $request->input('seo_title'),
                'seo_description' => $request->input('seo_description'),
                'hero_image_url' => $request->input('hero_image_url'),
                'opening_hours' => $request->input('opening_hours'),
                'map_url' => $request->input('map_url'),
                'coming_soon_message' => $request->input('coming_soon_message'),
            ]);

            $adminUser = User::query()->create([
                'name' => $request->input('admin_name', $request->input('name') . ' Admin'),
                'email' => $request->input('admin_email'),
                'password' => Hash::make($request->input('admin_password')),
                'role' => 'branch_admin',
                'branch_id' => $branch->id,
                'status' => 'active',
            ]);

            $branch->manager_id = $adminUser->id;
            $branch->save();

            return ApiResponse::success([
                'branch' => $branch,
                'user' => ['id' => $adminUser->id, 'name' => $adminUser->name, 'email' => $adminUser->email],
            ], 201);
        });
    }

    // ─── UPDATE BRANCH ───────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::query()->find($id);
        if (!$branch) return ApiResponse::error('Branch not found', 404);

        if ($request->user()->role === 'branch_admin' && (int)$request->user()->branch_id !== $branch->id) {
            return ApiResponse::error('Access denied', 403);
        }

        $editableFields = [
            'name', 'address', 'phone', 'email', 'manager_id',
            'public_title', 'public_description', 'seo_title', 'seo_description',
            'hero_image_url', 'opening_hours', 'map_url', 'coming_soon_message',
        ];

        foreach ($editableFields as $field) {
            if ($request->has($field)) {
                $branch->$field = $request->input($field) === '' ? null : $request->input($field);
            }
        }

        if ($request->has('slug')) {
            $slug = Str::slug($request->input('slug', $branch->name));
            $baseSlug = $slug;
            $counter = 1;
            while (Branch::query()->where('slug', $slug)->where('id', '!=', $branch->id)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }
            $branch->slug = $slug;
        }

        $branch->save();
        return ApiResponse::success($branch);
    }

    // ─── UPLOAD BRANCH IMAGE ─────────────────────────────────────

    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $branch = Branch::query()->find($id);
        if (!$branch) return ApiResponse::error('Branch not found', 404);
        if (!$request->hasFile('image')) return ApiResponse::error('No image file provided', 400);

        $file = $request->file('image');
        $name = 'branch_' . time() . '_' . $file->getClientOriginalName();
        $file->move(public_path('uploads/branches'), $name);

        $branch->hero_image_url = '/uploads/branches/' . $name;
        $branch->save();

        return ApiResponse::success(['url' => $branch->hero_image_url, 'branch' => $branch]);
    }

    // ─── DEACTIVATE BRANCH ───────────────────────────────────────

    public function deactivate(Request $request, int $id): JsonResponse
    {
        $branch = Branch::query()->find($id);
        if (!$branch) return ApiResponse::error('Branch not found', 404);
        if ($branch->type === 'head') return ApiResponse::error('Cannot deactivate the head branch', 400);

        $branch->is_active = false;
        $branch->save();

        User::query()->where('branch_id', $id)->whereNotIn('role', ['student'])->update(['status' => 'inactive']);

        return ApiResponse::success(['message' => 'Branch deactivated. Student data preserved.', 'branch' => $branch]);
    }

    // ─── TOGGLE BRANCH STATUS ────────────────────────────────────

    public function toggleStatus(int $id): JsonResponse
    {
        $branch = Branch::query()->find($id);
        if (!$branch) return ApiResponse::error('Branch not found', 404);

        $branch->is_active = !$branch->is_active;
        $branch->save();
        return ApiResponse::success($branch);
    }

    // ─── BRANCH SUMMARY (aggregate stats) ────────────────────────

    public function summary(Request $request, int $id): JsonResponse
    {
        $branch = Branch::query()->with('manager:id,name,email')->find($id);
        if (!$branch) return ApiResponse::error('Branch not found', 404);

        if ($request->user()->role === 'branch_admin' && (int)$request->user()->branch_id !== $id) {
            return ApiResponse::error('Access denied', 403);
        }

        $w = ['branch_id' => $id];

        $studentCount = $this->safeCount('students', $id);
        $activeStudents = DB::table('students')->where($w)->where('status', 'active')->count();
        $staffCount = DB::table('users')->where('branch_id', $id)->whereNotIn('role', self::STAFF_EXCLUDED_ROLES)->count();
        $courseCount = $this->safeCount('courses', $id);
        $batchCount = $this->safeCount('batches', $id);
        $leadCount = $this->safeCount('leads', $id);
        $contactCount = $this->safeCount('contacts', $id);
        $assetCount = $this->safeCount('assets', $id);

        // Financial aggregates
        $revenue = 0;
        $expenses = 0;
        $bankBalance = 0;
        $cashBalance = 0;
        try {
            $revenue = (float) JournalLine::query()
                ->whereHas('account', fn($q) => $q->where('branch_id', $id)->where('type', 'revenue'))
                ->sum('credit');
            $expenses = (float) JournalLine::query()
                ->whereHas('account', fn($q) => $q->where('branch_id', $id)->where('type', 'expense'))
                ->sum('debit');

            $liquidAccounts = Account::query()
                ->where('branch_id', $id)->where('type', 'asset')
                ->whereIn('sub_type', ['bank', 'cash'])
                ->selectRaw('sub_type, SUM(COALESCE(balance, 0)) as total')
                ->groupBy('sub_type')
                ->get();
            foreach ($liquidAccounts as $a) {
                if ($a->sub_type === 'bank') $bankBalance = (float) $a->total;
                if ($a->sub_type === 'cash') $cashBalance = (float) $a->total;
            }
        } catch (\Throwable) {}

        return ApiResponse::success([
            'branch' => $branch,
            'stats' => [
                'studentCount' => $studentCount, 'activeStudents' => $activeStudents,
                'staffCount' => $staffCount, 'courseCount' => $courseCount,
                'batchCount' => $batchCount, 'leadCount' => $leadCount,
                'contactCount' => $contactCount, 'assetCount' => $assetCount,
                'revenue' => $revenue, 'expenses' => $expenses,
                'netProfit' => $revenue - $expenses,
                'bankBalance' => $bankBalance, 'cashBalance' => $cashBalance,
            ],
        ]);
    }

    // ─── BRANCH STUDENTS ─────────────────────────────────────────

    public function students(Request $request, int $id): JsonResponse
    {
        return ApiResponse::success(
            Student::query()->where('branch_id', $id)
                ->with(['user:id,name,email,status', 'batch:id,name,start_date'])
                ->orderByDesc('created_at')->get()
        );
    }

    // ─── BRANCH STAFF ────────────────────────────────────────────

    public function staff(Request $request, int $id): JsonResponse
    {
        $staffUsers = User::query()->where('branch_id', $id)
            ->whereNotIn('role', self::STAFF_EXCLUDED_ROLES)
            ->with('staffProfile')
            ->orderByDesc('created_at')->get();

        $staff = $staffUsers->map(function ($user) use ($id) {
            $profile = $user->staffProfile;
            return [
                'id' => $profile?->id ?? 'user-' . $user->id,
                'user_id' => $user->id,
                'branch_id' => $id,
                'designation' => $profile?->designation ?? $user->role ?? 'Staff',
                'phone' => $profile?->phone ?? $profile?->contact_details ?? null,
                'base_salary' => $profile?->base_salary ?? 0,
                'joining_date' => $profile?->joining_date ?? null,
                'employment_status' => $profile?->employment_status ?? $user->status ?? 'active',
                'User' => $user->toArray(),
            ];
        });

        return ApiResponse::success($staff);
    }

    // ─── BRANCH COURSES + BATCHES ────────────────────────────────

    public function courses(int $id): JsonResponse
    {
        return ApiResponse::success(
            Course::query()->where('branch_id', $id)
                ->with('batches:id,course_id,name,start_date,status')
                ->orderByDesc('created_at')->get()
        );
    }

    // ─── BRANCH CONTACTS / LEADS ─────────────────────────────────

    public function contacts(int $id): JsonResponse
    {
        return ApiResponse::success([
            'contacts' => Contact::query()->where('branch_id', $id)->orderByDesc('created_at')->limit(200)->get(),
            'leads' => Lead::query()->where('branch_id', $id)->orderByDesc('created_at')->limit(200)->get(),
        ]);
    }

    // ─── BRANCH ASSETS ───────────────────────────────────────────

    public function assets(int $id): JsonResponse
    {
        return ApiResponse::success(Asset::query()->where('branch_id', $id)->orderByDesc('created_at')->get());
    }

    // ─── BRANCH ACCOUNTING ───────────────────────────────────────

    public function accounting(int $id): JsonResponse
    {
        $w = ['branch_id' => $id];

        $accounts = Account::query()->where($w)->orderBy('type')->orderBy('name')->get();
        $expenses = Expense::query()->where($w)->orderByDesc('created_at')->limit(100)->get();
        $invoices = Invoice::query()->where($w)->orderByDesc('created_at')->limit(100)->get();
        $journals = JournalEntry::query()->where($w)
            ->with(['lines.account:id,name,type'])
            ->orderByDesc('created_at')->limit(100)->get();

        $computeBalance = function (int $accountId) {
            $debit = (float) JournalLine::query()->where('account_id', $accountId)->sum('debit');
            $credit = (float) JournalLine::query()->where('account_id', $accountId)->sum('credit');
            return $debit - $credit;
        };

        $bankCash = $accounts->filter(fn($a) => $a->type === 'asset' && in_array($a->sub_type, ['bank', 'cash']))
            ->map(fn($a) => array_merge($a->toArray(), ['balance' => $computeBalance($a->id)]))->values();

        $incomeAccounts = $accounts->filter(fn($a) => $a->type === 'revenue')
            ->map(fn($a) => array_merge($a->toArray(), ['balance' => (float) JournalLine::query()->where('account_id', $a->id)->sum('credit')]))->values();

        $expenseAccounts = $accounts->filter(fn($a) => $a->type === 'expense')
            ->map(fn($a) => array_merge($a->toArray(), ['balance' => (float) JournalLine::query()->where('account_id', $a->id)->sum('debit')]))->values();

        return ApiResponse::success([
            'bankCash' => $bankCash,
            'incomeAccounts' => $incomeAccounts,
            'expenseAccounts' => $expenseAccounts,
            'expenses' => $expenses,
            'invoices' => $invoices,
            'journals' => $journals,
            'allAccounts' => $accounts,
        ]);
    }

    private function safeCount(string $table, int $branchId): int
    {
        try {
            return DB::table($table)->where('branch_id', $branchId)->count();
        } catch (\Throwable) {
            return 0;
        }
    }
}
