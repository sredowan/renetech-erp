<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class RateLimitServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // ── Login: 5 attempts per minute per IP (prevents brute force) ──
        RateLimiter::for('login', function (Request $request) {
            $key = $request->input('email', '') . '|' . $request->ip();

            return Limit::perMinute(5)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'error' => 'Too many login attempts. Please wait 60 seconds.',
                    ], 429);
                });
        });

        // ── Public API: 30 requests per minute per IP ──
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(30)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'error' => 'Rate limit exceeded. Please try again later.',
                    ], 429);
                });
        });

        // ── Authenticated API: 120 requests per minute per user ──
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            $key = $user ? 'user:' . $user->id : 'ip:' . $request->ip();

            // Super admins get higher limits
            $limit = ($user && $user->role === 'super_admin') ? 200 : 120;

            return Limit::perMinute($limit)
                ->by($key)
                ->response(function () {
                    return response()->json([
                        'error' => 'Rate limit exceeded. Please slow down.',
                    ], 429);
                });
        });

        // ── File uploads: 10 per minute ──
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'error' => 'Upload limit reached. Try again shortly.',
                    ], 429);
                });
        });

        // ── Enrollment/Payment: 5 per minute (prevents duplicate submissions) ──
        RateLimiter::for('critical', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'error' => 'Too many requests for this action. Wait a moment.',
                    ], 429);
                });
        });
    }
}
