<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadController;

Route::get('/uploads/{path}', [UploadController::class, 'show'])->where('path', '.*');

$siteMime = function (string $file): string {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    return [
        'html' => 'text/html; charset=UTF-8',
        'txt' => 'text/plain; charset=UTF-8',
        'js' => 'application/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'webmanifest' => 'application/manifest+json; charset=UTF-8',
        'css' => 'text/css; charset=UTF-8',
        'woff2' => 'font/woff2',
        'woff' => 'font/woff',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
    ][$ext] ?? 'application/octet-stream';
};

$siteHeaders = function (string $profile, string $file) use ($siteMime): array {
    $cache = match ($profile) {
        'immutable' => 'public, max-age=31536000, immutable',
        'manifest' => 'public, max-age=3600, stale-while-revalidate=86400',
        'service-worker' => 'no-cache, no-store, must-revalidate, max-age=0',
        default => 'public, max-age=0, must-revalidate',
    };

    return [
        'Content-Type' => $profile === 'manifest' ? 'application/manifest+json; charset=UTF-8' : $siteMime($file),
        'Cache-Control' => $cache,
        'X-Content-Type-Options' => 'nosniff',
    ];
};

$siteFileResponse = function (string $relativePath, string $profile = 'html') use ($siteHeaders) {
    $file = public_path('site/'.ltrim($relativePath, '/'));
    if (!is_file($file)) abort(404);

    $headers = $siteHeaders($profile, $file);
    $response = response()->file($file, $headers);
    $response->headers->set('Cache-Control', $headers['Cache-Control'], true);

    return $response;
};

// Serve Next.js static assets from the site export directory
Route::get('/_next/{path}', function (string $path) {
    $file = public_path("site/_next/{$path}");
    if (!is_file($file)) abort(404);
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $mimeMap = ['js' => 'application/javascript', 'css' => 'text/css', 'woff2' => 'font/woff2', 'woff' => 'font/woff', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'webp' => 'image/webp', 'svg' => 'image/svg+xml'];
    return response()->file($file, ['Content-Type' => $mimeMap[$ext] ?? 'application/octet-stream', 'Cache-Control' => 'public, max-age=31536000, immutable']);
})->where('path', '.*');

Route::get('/sw.js', fn () => $siteFileResponse('sw.js', 'service-worker'));
Route::get('/manifest.json', fn () => $siteFileResponse('manifest.json', 'manifest'));
Route::get('/offline.html', fn () => $siteFileResponse('offline.html', 'html'));

Route::get('/{asset}', fn (string $asset) => $siteFileResponse($asset, 'immutable'))
    ->where('asset', '[^/]+\.(?:png|jpe?g|webp|svg|ico|txt)');

Route::redirect('/admin', '/admin/');
Route::redirect('/student', '/student/');
Route::redirect('/teacher', '/teacher/');
Route::redirect('/hrm', '/hrm/');
Route::redirect('/brandmanager', '/brandmanager/');
Route::redirect('/accounting', '/accounting/');

Route::get('/admin/{path?}', function () {
    return response()->file(public_path('admin/index.html'));
})->where('path', '.*');

Route::get('/student/{path?}', function () {
    return response()->file(public_path('student/index.html'));
})->where('path', '.*');

Route::get('/teacher/{path?}', function () {
    return response()->file(public_path('teacher/index.html'));
})->where('path', '.*');

Route::get('/hrm/{path?}', function () {
    return response()->file(public_path('hrm/index.html'));
})->where('path', '.*');

Route::get('/brandmanager/{path?}', function () {
    return response()->file(public_path('brandmanager/index.html'));
})->where('path', '.*');

Route::get('/accounting/{path?}', function () {
    return response()->file(public_path('accounting/index.html'));
})->where('path', '.*');

Route::get('/', fn () => $siteFileResponse('index.html'));

Route::get('/{page}', function (string $page) use ($siteFileResponse) {
    $file = public_path("site/{$page}.html");

    if (is_file($file)) {
        return $siteFileResponse("{$page}.html");
    }

    abort(404);
})->whereIn('page', [
    'about',
    'contact',
    'enroll',
    'materials',
    'student-booking',
    'trial-class',
]);

Route::get('/payment/success', fn () => $siteFileResponse('payment/success.html'));

Route::get('/enroll/success', function () use ($siteFileResponse) {
    $file = public_path('site/enroll/success.html');
    if (is_file($file)) return $siteFileResponse('enroll/success.html');
    return $siteFileResponse('enroll.html');
});

// Dynamic website pages — statically exported from Next.js
Route::get('/courses', fn () => $siteFileResponse('courses.html'));

Route::get('/courses/{slug}', function (string $slug) use ($siteFileResponse) {
    $file = public_path("site/courses/{$slug}.html");
    if (is_file($file)) return $siteFileResponse("courses/{$slug}.html");
    return $siteFileResponse('courses.html');
});

Route::get('/blog', fn () => $siteFileResponse('blog.html'));

Route::get('/blog/{slug}', function (string $slug) use ($siteFileResponse) {
    $file = public_path("site/blog/{$slug}.html");
    if (is_file($file)) return $siteFileResponse("blog/{$slug}.html");
    return $siteFileResponse('blog.html');
});

Route::get('/branches', fn () => $siteFileResponse('branches.html'));

Route::get('/branches/{slug}', function (string $slug) use ($siteFileResponse) {
    $file = public_path("site/branches/{$slug}.html");
    if (is_file($file)) return $siteFileResponse("branches/{$slug}.html");
    return $siteFileResponse('branches.html');
});
