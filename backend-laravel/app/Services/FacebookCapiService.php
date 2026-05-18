<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Facebook Conversions API (CAPI) service.
 * Direct port of Node.js facebookCapi.service.js.
 *
 * Reads FB_PIXEL_ID, FB_CAPI_TOKEN, FB_GRAPH_API_VERSION from system_settings.
 * Hashes PII fields with SHA-256 as required by Facebook.
 * All sends are fire-and-forget (non-blocking).
 */
class FacebookCapiService
{
    /**
     * Get a decrypted system setting value.
     */
    private static function getSettingValue(string $key, string $fallback = ''): string
    {
        $setting = SystemSetting::query()->where('setting_key', $key)->first();
        if (!$setting) {
            return env($key, $fallback);
        }

        $raw = $setting->setting_value ?? $fallback;
        if (!$raw) {
            return '';
        }

        if ($setting->is_secret && function_exists('decrypt')) {
            try {
                return decrypt($raw);
            } catch (\Throwable $e) {
                // If decryption fails, try returning raw value
                return $raw;
            }
        }

        return $raw;
    }

    /**
     * Get Facebook configuration from system settings.
     */
    public static function getConfig(): array
    {
        return [
            'pixelId' => self::getSettingValue('FB_PIXEL_ID'),
            'accessToken' => self::getSettingValue('FB_CAPI_TOKEN'),
            'apiVersion' => self::getSettingValue('FB_GRAPH_API_VERSION', 'v19.0'),
        ];
    }

    /**
     * SHA-256 hash a value (required by Facebook CAPI for PII fields).
     */
    public static function hashSHA256(?string $value): ?string
    {
        if (!$value || !is_string($value)) {
            return null;
        }

        $trimmed = strtolower(trim($value));
        if (!$trimmed) {
            return null;
        }

        // If already hashed (64 hex chars), return as-is
        if (preg_match('/^[a-f0-9]{64}$/', $trimmed)) {
            return $trimmed;
        }

        return hash('sha256', $trimmed);
    }

    /**
     * Normalize and hash user data for Facebook CAPI.
     * Facebook requires em, ph, fn, ln, ct, st, zp, country, db, ge to be SHA-256 hashed.
     */
    public static function normalizeUserData(array $userData = []): array
    {
        $normalized = [];

        // Hash PII fields
        if (!empty($userData['em'])) {
            $normalized['em'] = [self::hashSHA256($userData['em'])];
        }
        if (!empty($userData['ph'])) {
            $digits = preg_replace('/\D/', '', $userData['ph']);
            $normalized['ph'] = [self::hashSHA256($digits)];
        }
        if (!empty($userData['fn'])) {
            $normalized['fn'] = [self::hashSHA256($userData['fn'])];
        }
        if (!empty($userData['ln'])) {
            $normalized['ln'] = [self::hashSHA256($userData['ln'])];
        }
        if (!empty($userData['ct'])) {
            $normalized['ct'] = [self::hashSHA256($userData['ct'])];
        }
        if (!empty($userData['st'])) {
            $normalized['st'] = [self::hashSHA256($userData['st'])];
        }
        if (!empty($userData['zp'])) {
            $normalized['zp'] = [self::hashSHA256($userData['zp'])];
        }
        if (!empty($userData['country'])) {
            $normalized['country'] = [self::hashSHA256($userData['country'])];
        }
        if (!empty($userData['db'])) {
            $normalized['db'] = [self::hashSHA256($userData['db'])];
        }
        if (!empty($userData['ge'])) {
            $normalized['ge'] = [self::hashSHA256($userData['ge'])];
        }

        // External IDs (hash them too)
        if (!empty($userData['external_id'])) {
            $normalized['external_id'] = [self::hashSHA256((string) $userData['external_id'])];
        }

        // Non-hashed fields (sent as plain text)
        foreach (['client_ip_address', 'client_user_agent', 'fbc', 'fbp'] as $key) {
            if (!empty($userData[$key])) {
                $normalized[$key] = $userData[$key];
            }
        }

        return $normalized;
    }

    /**
     * Generate a unique event ID for deduplication.
     */
    public static function generateEventId(): string
    {
        return 'evt_' . time() . '_' . bin2hex(random_bytes(6));
    }

    /**
     * Extract tracking data from the request.
     */
    public static function getRequestTrackingData($request): array
    {
        return [
            'client_ip_address' => $request->ip(),
            'client_user_agent' => $request->userAgent(),
            'fbc' => $request->header('x-fbc') ?? $request->cookie('_fbc'),
            'fbp' => $request->header('x-fbp') ?? $request->cookie('_fbp'),
        ];
    }

    /**
     * Get the event URL from the request.
     */
    public static function getEventUrl($request, string $fallback = 'https://languageacademy.com.bd'): string
    {
        return $request->header('referer')
            ?? $request->header('origin')
            ?? $fallback;
    }

    /**
     * Send an event to Facebook Conversions API (CAPI).
     * Fire-and-forget: errors are logged, never thrown.
     */
    public static function sendEvent(
        string $eventName,
        array $userData,
        array $customData = [],
        string $eventUrl = '',
        ?string $eventId = null
    ): ?array {
        $config = self::getConfig();

        if (empty($config['pixelId']) || empty($config['accessToken']) || $config['pixelId'] === 'YOUR_PIXEL_ID_HERE') {
            Log::debug("[FB CAPI] Not configured. Skipping event: {$eventName}");
            return null;
        }

        $normalizedUserData = self::normalizeUserData($userData);
        $dedupEventId = $eventId ?: self::generateEventId();

        $eventData = [
            'event_name' => $eventName,
            'event_time' => time(),
            'action_source' => 'website',
            'event_id' => $dedupEventId,
            'user_data' => $normalizedUserData,
        ];

        if ($eventUrl) {
            $eventData['event_source_url'] = $eventUrl;
        }
        if (!empty($customData)) {
            $eventData['custom_data'] = $customData;
        }

        $payload = ['data' => [$eventData]];

        try {
            $url = "https://graph.facebook.com/{$config['apiVersion']}/{$config['pixelId']}/events?access_token={$config['accessToken']}";

            $response = Http::timeout(10)
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                Log::info("[FB CAPI] ✓ '{$eventName}' sent | event_id: {$dedupEventId} | trace: " . ($data['fbtrace_id'] ?? 'n/a'));
                return array_merge($data, ['event_id' => $dedupEventId]);
            }

            $error = $response->json('error');
            Log::error("[FB CAPI] ✗ '{$eventName}' failed: " . ($error['message'] ?? $response->body()));
            return null;
        } catch (\Throwable $e) {
            Log::error("[FB CAPI] ✗ '{$eventName}' exception: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Send a Lead event (new lead/enquiry from website).
     */
    public static function sendLeadEvent($request, array $data): ?array
    {
        $nameParts = preg_split('/\s+/', trim($data['name'] ?? ''), 2);

        return self::sendEvent(
            'Lead',
            array_merge([
                'em' => $data['email'] ?? null,
                'ph' => $data['phone'] ?? null,
                'fn' => $nameParts[0] ?? null,
                'ln' => $nameParts[1] ?? null,
            ], self::getRequestTrackingData($request)),
            [
                'content_name' => $data['courseName'] ?? 'General Enquiry',
                'currency' => 'BDT',
                'value' => $data['value'] ?? 0,
            ],
            self::getEventUrl($request),
            $request->header('x-event-id')
        );
    }

    /**
     * Send a CompleteRegistration event (student enrollment finalized).
     */
    public static function sendRegistrationEvent($request, array $data): ?array
    {
        $nameParts = preg_split('/\s+/', trim($data['name'] ?? ''), 2);

        return self::sendEvent(
            'CompleteRegistration',
            array_merge([
                'em' => $data['email'] ?? null,
                'ph' => $data['phone'] ?? null,
                'fn' => $nameParts[0] ?? null,
                'ln' => $nameParts[1] ?? null,
            ], self::getRequestTrackingData($request)),
            [
                'content_name' => $data['courseName'] ?? 'Course Enrollment',
                'currency' => 'BDT',
                'value' => $data['value'] ?? 0,
                'status' => 'enrolled',
            ],
            self::getEventUrl($request)
        );
    }

    /**
     * Send a Purchase event (money collected/verified).
     */
    public static function sendPurchaseEvent($request, array $data): ?array
    {
        $nameParts = preg_split('/\s+/', trim($data['name'] ?? ''), 2);

        $customData = array_filter([
            'currency' => 'BDT',
            'value' => (float) ($data['value'] ?? 0),
            'content_name' => $data['courseName'] ?? 'Course Enrollment',
            'content_type' => 'product',
            'content_ids' => !empty($data['courseId']) ? [(string) $data['courseId']] : null,
            'num_items' => 1,
            'order_id' => !empty($data['orderId']) ? (string) $data['orderId'] : null,
            'payment_method' => $data['paymentMethod'] ?? null,
            'branch_id' => !empty($data['branchId']) ? (string) $data['branchId'] : null,
        ], fn ($v) => $v !== null && $v !== '');

        return self::sendEvent(
            'Purchase',
            array_merge([
                'em' => $data['email'] ?? null,
                'ph' => $data['phone'] ?? null,
                'fn' => $nameParts[0] ?? null,
                'ln' => $nameParts[1] ?? null,
                'external_id' => !empty($data['externalId']) ? (string) $data['externalId'] : null,
            ], self::getRequestTrackingData($request)),
            $customData,
            $data['eventUrl'] ?? self::getEventUrl($request, 'https://languageacademy.com.bd/payment/success'),
            $data['eventId'] ?? $request->header('x-event-id')
        );
    }

    /**
     * Send a Contact event (contact form submitted).
     */
    public static function sendContactEvent($request, array $data): ?array
    {
        $nameParts = preg_split('/\s+/', trim($data['name'] ?? ''), 2);

        return self::sendEvent(
            'Contact',
            array_merge([
                'em' => $data['email'] ?? null,
                'ph' => $data['phone'] ?? null,
                'fn' => $nameParts[0] ?? null,
                'ln' => $nameParts[1] ?? null,
            ], self::getRequestTrackingData($request)),
            [],
            self::getEventUrl($request)
        );
    }
}
