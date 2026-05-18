<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RbacConfig;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\PasswordVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private const ASSIGNABLE_ROLES = ['super_admin', 'branch_admin', 'counselor', 'trainer', 'accounts', 'hr', 'staff', 'unassigned'];
    private const BRANCH_ADMIN_ROLES = ['counselor', 'trainer', 'accounts', 'hr', 'staff', 'unassigned'];
    private const LEGACY_ROLE_ALIASES = [
        'accounting' => 'accounts',
        'teacher' => 'trainer',
        'crm' => 'counselor',
        'hrm' => 'hr',
    ];

    public function login(Request $request): JsonResponse
    {
        if (!$request->filled('email') || !$request->filled('password')) {
            return ApiResponse::error('Email and password are required.', 400);
        }

        $data = $request->only(['email', 'password']);

        $user = User::query()->where('email', $data['email'])->first();

        if (!$user) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        $passwordCheck = PasswordVerifier::verify($data['password'], $user->password);
        if (!$passwordCheck['valid']) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        if ($passwordCheck['needs_rehash']) {
            $user->password = $data['password'];
            $user->save();
        }

        if ($user->status && $user->status !== 'active') {
            return ApiResponse::error('Account is suspended. Contact your administrator.', 403);
        }

        $token = $user->createToken('portal-api')->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'user' => $this->safeUser($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return ApiResponse::success(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(['user' => $this->safeUser($request->user())]);
    }

    public function register(Request $request): JsonResponse
    {
        $actor = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'branch_id' => ['nullable', 'integer'],
            'role' => ['nullable', 'string'],
        ]);

        $role = $this->normalizeRole($data['role'] ?? 'unassigned');
        if (!$this->canAssignRole($actor, $role)) {
            return ApiResponse::error('You cannot assign that role.', 403);
        }

        $branchId = $actor->role === 'super_admin' ? ($data['branch_id'] ?? null) : $actor->branch_id;
        if (!$branchId) {
            return ApiResponse::error('branch_id is required.', 400);
        }

        $password = $data['password'] ?? bin2hex(random_bytes(16));
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $password,
            'branch_id' => $branchId,
            'role' => $role,
            'status' => 'active',
        ]);

        return ApiResponse::success([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function staff(Request $request): JsonResponse
    {
        $query = User::query()
            ->with('branch:id,name,code,type')
            ->whereNotIn('role', ['student', 'guardian'])
            ->orderBy('branch_id')
            ->orderBy('name');

        if (!$this->isHeadSuperAdmin($request->user())) {
            $query->where('branch_id', $request->user()->branch_id);
        }

        return ApiResponse::success($query->get(['id', 'name', 'email', 'role', 'status', 'branch_id']));
    }

    public function updateRole(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'integer'],
            'role' => ['required', 'string'],
        ]);

        $role = $this->normalizeRole($data['role']);
        if (!$this->canAssignRole($request->user(), $role)) {
            return ApiResponse::error('You cannot assign that role.', 403);
        }

        $user = $this->manageableUsers($request->user())->find($data['userId']);
        if (!$user) {
            return ApiResponse::error('User not found or you do not have permission.', 404);
        }

        $user->role = $role;
        $user->save();

        return ApiResponse::success([
            'message' => 'User role updated successfully.',
            'user' => ['id' => $user->id, 'name' => $user->name, 'role' => $user->role],
        ]);
    }

    public function setStaffPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'integer'],
            'newPassword' => ['required', 'string', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $user = $this->manageableUsers($request->user())->find($data['userId']);
        if (!$user) {
            return ApiResponse::error('User not found', 404);
        }

        $user->password = $data['newPassword'];
        $user->save();

        return ApiResponse::success(['message' => 'Password updated successfully.']);
    }

    private function safeUser(?User $user): ?array
    {
        if (!$user) {
            return null;
        }

        $user->loadMissing('branch:id,name,code,type');
        if ($user->role === 'student') {
            $user->loadMissing('student:id,user_id,branch_id,plan_type,premium_expiry_date,status');
        }

        $data = $user->only(['id', 'name', 'email', 'role', 'branch_id', 'status']);
        if ($user->relationLoaded('branch') && $user->branch) {
            $data['Branch'] = $user->branch;
        }
        if ($user->relationLoaded('student') && $user->student) {
            $data['Student'] = $user->student;
        }

        return $data;
    }

    private function normalizeRole(?string $role): string
    {
        return self::LEGACY_ROLE_ALIASES[$role] ?? ($role ?: 'unassigned');
    }

    private function canAssignRole(User $actor, string $role): bool
    {
        $customRoleKeys = RbacConfig::query()
            ->latest('id')
            ->first()?->custom_roles_json ?? [];
        $customRoleKeys = collect($customRoleKeys)->pluck('key')->filter()->all();

        if (!in_array($role, [...self::ASSIGNABLE_ROLES, ...$customRoleKeys], true)) {
            return false;
        }

        if ($actor->role === 'super_admin') {
            return true;
        }

        return in_array($role, [...self::BRANCH_ADMIN_ROLES, ...$customRoleKeys], true);
    }

    private function isHeadSuperAdmin(User $user): bool
    {
        $user->loadMissing('branch:id,type');

        return $user->role === 'super_admin' && $user->branch?->type === 'head';
    }

    private function manageableUsers(User $actor)
    {
        $query = User::query();
        if (!$this->isHeadSuperAdmin($actor)) {
            $query->where('branch_id', $actor->branch_id);
        }

        return $query;
    }
}
