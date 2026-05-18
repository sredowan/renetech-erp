<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use App\Console\Commands\Phase10ContractCompareCommand;
use App\Console\Commands\Phase9SafeDbCommand;
use App\Http\Middleware\DeviceMiddleware;
use App\Http\Middleware\PascalCaseRelations;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeaders;
use App\Support\ApiResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands([
        Phase9SafeDbCommand::class,
        Phase10ContractCompareCommand::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(SecurityHeaders::class);
        $middleware->redirectGuestsTo(fn () => null);
        $middleware->alias([
            'device' => DeviceMiddleware::class,
            'role' => RoleMiddleware::class,
        ]);
        $middleware->api(append: [
            PascalCaseRelations::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (AuthenticationException $exception, $request) {
            if ($request->is('api/*')) {
                return ApiResponse::error('Unauthenticated.', 401);
            }

            return null;
        });
    })->create();
