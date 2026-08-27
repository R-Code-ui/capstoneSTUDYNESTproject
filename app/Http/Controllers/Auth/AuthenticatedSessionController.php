<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ActivityLog;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        $role = $user->roles->first()->name ?? 'unknown';
        $user->update(['last_login_at' => now()]);

        ActivityLog::create([
            'user_id' => $user->id,
            'user_role' => $role,
            'activity_type' => 'login',
            'activity_description' => ucfirst($role) . ' logged in.',
            'related_module' => null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($user->must_change_password) {
            return redirect()->route('password.force-change');
        }

        // ✅ Log login
        // Redirect based on user role
        if ($user->hasRole('principal')) {
            return redirect()->intended(route('principal.dashboard'));
        } elseif ($user->hasRole('teacher')) {
            return redirect()->intended(route('teacher.dashboard'));
        } elseif ($user->hasRole('student')) {
            return redirect()->intended(route('student.dashboard'));
        }

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
