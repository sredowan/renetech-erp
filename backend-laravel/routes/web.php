<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadController;

Route::get('/uploads/{path}', [UploadController::class, 'show'])->where('path', '.*');

Route::get('/', function () {
    return view('welcome');
});
