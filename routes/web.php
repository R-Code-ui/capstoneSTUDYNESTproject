<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Principal\DashboardController;
use App\Http\Controllers\Principal\UserManagementController;
use App\Http\Controllers\Principal\TeacherMonitoringController;
use App\Http\Controllers\Principal\AnnouncementController;
use App\Http\Controllers\Principal\ReportController;
use App\Http\Controllers\Principal\ActivityLogController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\LessonController; // ✅ ADDED FOR LESSON ROUTES
use App\Http\Controllers\Teacher\AssignmentController; // ✅ ADDED FOR FUTURE USE
use App\Http\Controllers\Teacher\QuizController; // ✅ ADDED FOR FUTURE USE
use App\Http\Controllers\Teacher\GameController; // ✅ ADDED FOR FUTURE USE
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
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->hasRole('principal')) {
            return redirect()->route('principal.dashboard');
        } elseif ($user->hasRole('teacher')) {
            return redirect()->route('teacher.dashboard');
        } elseif ($user->hasRole('student')) {
            return redirect()->route('student.dashboard');
        }

        return redirect('/');
    })->name('dashboard');

    // ===== Profile Routes (All Authenticated Users) =====
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ===========================================================
    // ===== PRINCIPAL ROUTES =====
    // ===========================================================
    Route::middleware(['role:principal'])->prefix('principal')->name('principal.')->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // ===== User Management =====
        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('/users/teacher', [UserManagementController::class, 'storeTeacher'])->name('users.store.teacher');
        Route::post('/users/student', [UserManagementController::class, 'storeStudent'])->name('users.store.student');
        Route::put('/users/teacher/{id}', [UserManagementController::class, 'updateTeacher'])->name('users.update.teacher');
        Route::put('/users/student/{id}', [UserManagementController::class, 'updateStudent'])->name('users.update.student');
        Route::put('/users/reset-password/{id}', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
        Route::delete('/users/archive/{id}', [UserManagementController::class, 'archive'])->name('users.archive');
        Route::post('/users/restore/{id}', [UserManagementController::class, 'restore'])->name('users.restore');

        // ===== Teacher Monitoring =====
        Route::get('/teachers', [TeacherMonitoringController::class, 'index'])->name('teachers.index');
        Route::get('/teachers/{id}', [TeacherMonitoringController::class, 'show'])->name('teachers.show');

        // ===== Announcements =====
        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::post('/announcements/{id}/archive', [AnnouncementController::class, 'archive'])->name('announcements.archive');
        Route::post('/announcements/{id}/publish', [AnnouncementController::class, 'publish'])->name('announcements.publish');

        // ===== Reports =====
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
        Route::get('/reports/export/pdf/{reportId}', [ReportController::class, 'exportPdf'])->name('reports.export.pdf');

        // View a specific report
        Route::get('/reports/{reportId}', [ReportController::class, 'show'])->name('reports.show');

        // ===== Activity Logs =====
        Route::get('/logs', [ActivityLogController::class, 'index'])->name('logs.index');
    });

    // ===========================================================
    // ===== TEACHER ROUTES =====
    // ===========================================================
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');

        // ===== Lessons =====
        // ✅ UNCOMMENTED - Full CRUD routes
        Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
        Route::get('/lessons/create', [LessonController::class, 'create'])->name('lessons.create');
        Route::post('/lessons', [LessonController::class, 'store'])->name('lessons.store');
        Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        Route::get('/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('lessons.edit');
        Route::put('/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');

        // ✅ ADDED - Custom Lesson routes
        Route::post('/lessons/{lesson}/publish', [LessonController::class, 'publish'])->name('lessons.publish');
        Route::post('/lessons/{lesson}/archive', [LessonController::class, 'archive'])->name('lessons.archive');
        Route::get('/lessons/download-resource/{resource}', [LessonController::class, 'downloadResource'])->name('lessons.download-resource');

        // ===== Assignments (coming soon) =====
        // Route::resource('assignments', AssignmentController::class);

        // ===== Quizzes (coming soon) =====
        // Route::resource('quizzes', QuizController::class);

        // ===== Games (coming soon) =====
        // Route::resource('games', GameController::class);

        // ===== Announcements (coming soon) =====
        // Route::resource('announcements', AnnouncementController::class);

        // ===== Messages (coming soon) =====
        // Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');

        // ===== Progress Tracking (coming soon) =====
        // Route::get('/progress', [ProgressTrackingController::class, 'index'])->name('progress.index');

        // ===== Reports (coming soon) =====
        // Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });

    // ===========================================================
    // ===== STUDENT ROUTES =====
    // ===========================================================
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Student/Dashboard');
        })->name('dashboard');

        // Lessons (coming soon)
        // Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');

        // Assignments (coming soon)
        // Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');

        // Quizzes (coming soon)
        // Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');

        // Games (coming soon)
        // Route::get('/games', [GameController::class, 'index'])->name('games.index');

        // Messages (coming soon)
        // Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');

        // Announcements (coming soon)
        // Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');

        // Progress (coming soon)
        // Route::get('/progress', [ProgressTrackerController::class, 'index'])->name('progress.index');
    });
});

// ========== AUTH ROUTES ==========
require __DIR__ . '/auth.php';
