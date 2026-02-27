<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Registrazione utente. Assegna role 'user' di default.
     * Per consentire accesso backoffice, impostare manualmente role 'admin' o 'editor' dal DB.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'user',
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => $this->userResource($user),
            'message' => 'Registrazione completata.',
        ], 201);
    }

    /**
     * Login con email e password. Session-based.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::guard('web')->attempt($validated, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'Credenziali non valide.',
            ], 422);
        }

        $request->session()->regenerate();
        $user = Auth::user();

        $user->update(['last_login_at' => now()]);

        return response()->json([
            'user' => $this->userResource($user),
            'message' => 'Accesso effettuato.',
        ]);
    }

    /**
     * Logout: invalida sessione.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Disconnesso.']);
    }

    private function userResource(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];
    }
}
