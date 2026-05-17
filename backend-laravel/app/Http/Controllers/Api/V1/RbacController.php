<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RbacConfig;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RbacController extends Controller
{
    public function show(): JsonResponse
    {
        $config = RbacConfig::query()->latest('id')->first();

        if (!$config) {
            return ApiResponse::success(['permissions' => null, 'customRoles' => []]);
        }

        return ApiResponse::success([
            'permissions' => $config->config_json,
            'customRoles' => $config->custom_roles_json,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'customRoles' => ['nullable', 'array'],
        ]);

        $config = RbacConfig::query()->latest('id')->first() ?: new RbacConfig();
        $config->config_json = $data['permissions'];
        $config->custom_roles_json = $data['customRoles'] ?? [];
        $config->updated_by = $request->user()?->id;
        $config->save();

        return ApiResponse::success([
            'message' => 'RBAC configuration saved successfully.',
            'id' => $config->id,
        ]);
    }
}
