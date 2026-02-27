<?php

use App\Http\Middleware\EnsureUserIsAdminOrEditor;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Necessario dietro reverse proxy (es. Hostinger) per HTTPS e host corretti
        $middleware->trustProxies(at: '*');
        // SPA: cookie/session auth per richieste API dallo stesso dominio
        $middleware->statefulApi();
        // Le API usano la sessione Sanctum, non il CSRF token classico
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->alias([
            'admin' => EnsureUserIsAdminOrEditor::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
