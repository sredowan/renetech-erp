<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadController;

Route::get('/uploads/{path}', [UploadController::class, 'show'])->where('path', '.*');

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

Route::get('/', function () {
    return response()->file(public_path('site/index.html'));
});

Route::get('/{page}', function (string $page) {
    $file = public_path("site/{$page}.html");

    if (is_file($file)) {
        return response()->file($file);
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

Route::get('/payment/success', function () {
    return response()->file(public_path('site/payment/success.html'));
});

Route::get('/enroll/success', function () {
    $file = public_path('site/enroll/success.html');
    if (is_file($file)) return response()->file($file);
    return response()->file(public_path('site/enroll.html'));
});

// Dynamic website pages — statically exported from Next.js
Route::get('/courses', function () {
    return response()->file(public_path('site/courses.html'));
});

Route::get('/courses/{slug}', function (string $slug) {
    $file = public_path("site/courses/{$slug}.html");
    if (is_file($file)) return response()->file($file);
    return response()->file(public_path('site/courses.html'));
});

Route::get('/blog', function () {
    return response()->file(public_path('site/blog.html'));
});

Route::get('/blog/{slug}', function (string $slug) {
    $file = public_path("site/blog/{$slug}.html");
    if (is_file($file)) return response()->file($file);
    return response()->file(public_path('site/blog.html'));
});

Route::get('/branches', function () {
    return response()->file(public_path('site/branches.html'));
});

Route::get('/branches/{slug}', function (string $slug) {
    $file = public_path("site/branches/{$slug}.html");
    if (is_file($file)) return response()->file($file);
    return response()->file(public_path('site/branches.html'));
});

