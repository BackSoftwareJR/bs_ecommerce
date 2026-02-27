<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdminOrEditor
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return response()->json(['message' => 'Non autenticato.'], 401);
        }

        if (! in_array($request->user()->role, ['admin', 'editor'], true)) {
            return response()->json(['message' => 'Accesso non autorizzato al backoffice.'], 403);
        }

        if (! $request->user()->is_active) {
            return response()->json(['message' => 'Account disattivato.'], 403);
        }

        return $next($request);
    }
}
