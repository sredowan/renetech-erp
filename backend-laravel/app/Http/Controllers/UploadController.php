<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class UploadController extends Controller
{
    private const PUBLIC_DIRECTORIES = ['courses', 'branches', 'resources', 'blogs'];

    public function show(Request $request, string $path): Response|JsonResponse|BinaryFileResponse
    {
        $path = $this->normalizePath($path);
        if ($path === null) {
            abort(404);
        }

        $directory = Str::before($path, '/');
        if (!in_array($directory, self::PUBLIC_DIRECTORIES, true) && !$this->hasValidToken($request)) {
            return response()->json(['error' => $this->tokenFromRequest($request) ? 'Invalid token' : 'Authentication required'], 401);
        }

        $file = $this->findUploadFile($path);
        if (!$file) {
            abort(404);
        }

        return response()->file($file, [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    private function normalizePath(string $path): ?string
    {
        $path = str_replace('\\', '/', rawurldecode($path));
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..') || str_contains($path, "\0")) {
            return null;
        }

        return $path;
    }

    private function hasValidToken(Request $request): bool
    {
        $token = $this->tokenFromRequest($request);

        return $token !== null && PersonalAccessToken::findToken($token)?->tokenable !== null;
    }

    private function tokenFromRequest(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && str_starts_with($header, 'Bearer ')) {
            return trim(substr($header, 7));
        }

        return $request->query('token') ? (string) $request->query('token') : null;
    }

    private function findUploadFile(string $path): ?string
    {
        foreach ($this->uploadRoots() as $root) {
            $root = realpath($root);
            if (!$root) {
                continue;
            }

            $file = realpath($root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path));
            if ($file && is_file($file) && str_starts_with($file, $root.DIRECTORY_SEPARATOR)) {
                return $file;
            }
        }

        return null;
    }

    private function uploadRoots(): array
    {
        return array_filter([
            public_path('uploads'),
            env('LEGACY_UPLOADS_PATH'),
            base_path('../backend/uploads'),
        ]);
    }
}
