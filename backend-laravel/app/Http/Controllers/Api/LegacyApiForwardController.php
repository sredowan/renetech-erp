<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LegacyApiForwardController extends Controller
{
    public function __invoke(Request $request, string $legacyPath, Kernel $kernel): Response
    {
        $legacyPath = ltrim($legacyPath, '/');
        if ($legacyPath === 'v1' || str_starts_with($legacyPath, 'v1/')) {
            abort(404);
        }

        $targetUri = '/api/v1/'.$legacyPath;
        if ($request->getQueryString()) {
            $targetUri .= '?'.$request->getQueryString();
        }

        $forwarded = Request::create(
            $targetUri,
            $request->method(),
            $request->request->all(),
            $request->cookies->all(),
            $request->files->all(),
            [],
            $request->getContent()
        );
        $forwarded->headers->replace($request->headers->all());

        return $kernel->handle($forwarded);
    }
}
