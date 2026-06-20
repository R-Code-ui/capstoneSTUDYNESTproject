<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'auth' => [
            'user' => auth()->user(),
        ],
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ========== AUTHENTICATED ROUTES ==========
Route::middleware('auth')->group(function () {

    // ===== DASHBOARD REDIRECT ROUTE =====
    // This handles the generic /dashboard route and redirects based on role
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->hasRole('principal')) {
            return redirect()->route('principal.dashboard');
        } elseif ($user->hasRole('teacher')) {
            return redirect()->route('teacher.dashboard');
        } elseif ($user->hasRole('student')) {
            return redirect()->route('student.dashboard');
        }

        // Fallback
        return redirect('/');
    })->name('dashboard');

    // ===== Profile Routes (All Authenticated Users) =====
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ===== Dashboard Routes (Role-Based) =====
    Route::get('/principal/dashboard', function () {
        return Inertia::render('Principal/Dashboard');
    })->middleware(['auth', 'role:principal'])->name('principal.dashboard');

    Route::get('/teacher/dashboard', function () {
        return Inertia::render('Teacher/Dashboard');
    })->middleware(['auth', 'role:teacher'])->name('teacher.dashboard');

    Route::get('/student/dashboard', function () {
        return Inertia::render('Student/Dashboard');
    })->middleware(['auth', 'role:student'])->name('student.dashboard');

    // ===== Example Protected Routes with Permission Middleware =====
    // Use these as templates for your module routes
    Route::prefix('lessons')->middleware(['auth', 'permission:lesson.view'])->group(function () {
        // Route::get('/', [LessonController::class, 'index'])->name('lessons.index');
        // Route::get('/create', [LessonController::class, 'create'])->middleware(['permission:lesson.create'])->name('lessons.create');
        // Route::post('/', [LessonController::class, 'store'])->middleware(['permission:lesson.create'])->name('lessons.store');
        // Route::get('/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        // Route::get('/{lesson}/edit', [LessonController::class, 'edit'])->middleware(['permission:lesson.edit'])->name('lessons.edit');
        // Route::put('/{lesson}', [LessonController::class, 'update'])->middleware(['permission:lesson.edit'])->name('lessons.update');
        // Route::delete('/{lesson}', [LessonController::class, 'destroy'])->middleware(['permission:lesson.delete'])->name('lessons.destroy');
    });
});

// ========== AUTH ROUTES ==========
require __DIR__.'/auth.php';
