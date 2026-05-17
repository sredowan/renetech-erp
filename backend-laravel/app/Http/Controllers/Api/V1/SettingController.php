<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Support\ApiResponse;
use App\Support\LegacyCrypto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::query()
            ->orderBy('id')
            ->get()
            ->map(fn (SystemSetting $setting) => [
                'id' => $setting->id,
                'key' => $setting->setting_key,
                'value' => $setting->is_secret ? LegacyCrypto::decrypt($setting->setting_value) : $setting->setting_value,
                'description' => $setting->description,
                'is_secret' => $setting->is_secret,
                'category' => $setting->category ?: 'general',
            ]);

        return ApiResponse::success($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $updates = $request->all();

        if (!is_array($updates) || array_is_list($updates) === false) {
            return ApiResponse::error('Expected an array of settings to update.', 400);
        }

        foreach ($updates as $update) {
            if (!is_array($update) || !array_key_exists('key', $update)) {
                continue;
            }

            $setting = SystemSetting::query()->where('setting_key', $update['key'])->first();
            if (!$setting) {
                continue;
            }

            $value = $update['value'] ?? null;
            $setting->setting_value = $setting->is_secret && $value ? LegacyCrypto::encrypt((string) $value) : $value;
            $setting->save();
        }

        return ApiResponse::success(['message' => 'Settings updated successfully']);
    }
}
