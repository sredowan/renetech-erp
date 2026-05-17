<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeviceMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('device_id', $request->header('x-device-id'));

        return $next($request);
    }
}
