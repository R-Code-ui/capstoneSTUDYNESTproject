<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Principal\DashboardController;
use App\Http\Controllers\Principal\UserManagementController;
use App\Http\Controllers\Principal\StudentDirectoryController;
use App\Http\Controllers\Principal\TeacherMonitoringController;
use App\Http\Controllers\Principal\AnnouncementController;
use App\Http\Controllers\Principal\ReportController;
use App\Http\Controllers\Principal\ActivityLogController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\AssignmentController;
use App\Http\Controllers\Teacher\AssignmentGradingController;
use App\Http\Controllers\Teacher\QuizController;
use App\Http\Controllers\Teacher\QuizResultsController;
use App\Http\Controllers\Teacher\GameController;
use App\Http\Controllers\Teacher\GameResultsController;
use App\Http\Controllers\Teacher\MessageController;
use App\Http\Controllers\Teacher\MessageGroupController as TeacherMessageGroupController;
use App\Http\Controllers\Teacher\ProgressTrackingController;
use App\Http\Controllers\Teacher\AnnouncementController as TeacherAnnouncementController;
use App\Http\Controllers\Teacher\ReportController as TeacherReportController;
use App\Http\Controllers\Teacher\StudentManagementController;   // ✅ New import for teacher student management
use App\Http\Controllers\Teacher\StudentActivityLogController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\LessonController as StudentLessonController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\QuizController as StudentQuizController;
use App\Http\Controllers\Student\GameController as StudentGameController;
use App\Http\Controllers\Student\ProgressTrackerController;
use App\Http\Controllers\Student\MessageController as StudentMessageController;
use App\Http\Controllers\Student\MessageGroupController as StudentMessageGroupController;
use App\Http\Controllers\Student\AnnouncementController as StudentAnnouncementController;
use App\Http\Controllers\NotificationController;
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
Route::middleware(['auth', 'force.password.change'])->group(function () {

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

    // ===== System Notifications (All Authenticated Users) =====
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

    // ===========================================================
    // ===== PRINCIPAL ROUTES =====
    // ===========================================================
    Route::middleware(['role:principal'])->prefix('principal')->name('principal.')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // User Management – Teachers only (student routes removed)
        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('/users/teacher', [UserManagementController::class, 'storeTeacher'])->name('users.store.teacher');
        Route::put('/users/teacher/{id}', [UserManagementController::class, 'updateTeacher'])->name('users.update.teacher');
        Route::put('/users/reset-password/{id}', [UserManagementController::class, 'resetPassword'])->name('users.reset-password');
        Route::delete('/users/archive/{id}', [UserManagementController::class, 'archive'])->name('users.archive');
        Route::post('/users/restore/{id}', [UserManagementController::class, 'restore'])->name('users.restore');
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy'])->name('users.destroy');

        Route::get('/students', [StudentDirectoryController::class, 'index'])->name('students.index');

        Route::get('/teachers', [TeacherMonitoringController::class, 'index'])->name('teachers.index');
        Route::get('/teachers/{id}', [TeacherMonitoringController::class, 'show'])->name('teachers.show');

        Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::post('/announcements/{id}/archive', [AnnouncementController::class, 'archive'])->name('announcements.archive');
        Route::post('/announcements/{id}/publish', [AnnouncementController::class, 'publish'])->name('announcements.publish');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/pdf', [ReportController::class, 'downloadPdf'])->name('reports.pdf');

        Route::get('/logs', [ActivityLogController::class, 'index'])->name('logs.index');
    });

    // ===========================================================
    // ===== TEACHER ROUTES =====
    // ===========================================================
    Route::middleware(['role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {

        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');

        // ===== Lessons =====
        Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
        Route::get('/lessons/create', [LessonController::class, 'create'])->name('lessons.create');
        Route::post('/lessons', [LessonController::class, 'store'])->name('lessons.store');
        Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        Route::get('/lessons/{lesson}/edit', [LessonController::class, 'edit'])->name('lessons.edit');
        Route::put('/lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
        Route::delete('/lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');
        Route::post('/lessons/{lesson}/publish', [LessonController::class, 'publish'])->name('lessons.publish');
        Route::post('/lessons/{lesson}/archive', [LessonController::class, 'archive'])->name('lessons.archive');
        Route::get('/lessons/download-resource/{resource}', [LessonController::class, 'downloadResource'])->name('lessons.download-resource');
        Route::get('/lessons/view-resource/{resource}', [LessonController::class, 'viewResource'])->name('lessons.view-resource');

        // ===== Assignments =====
        Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
        Route::get('/assignments/create', [AssignmentController::class, 'create'])->name('assignments.create');
        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
        Route::get('/assignments/{assignment}/edit', [AssignmentController::class, 'edit'])->name('assignments.edit');
        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
        Route::post('/assignments/{assignment}/publish', [AssignmentController::class, 'publish'])->name('assignments.publish');
        Route::get('/assignments/download-resource/{resource}', [AssignmentController::class, 'downloadResource'])->name('assignments.download-resource');
        Route::get('/assignments/view-resource/{resource}', [AssignmentController::class, 'viewResource'])->name('assignments.view-resource');

        // ===== Assignment Grading =====
        Route::get('/assignments/{assignment}/grade', [AssignmentGradingController::class, 'index'])->name('assignments.grade');
        Route::post('/assignments/{assignment}/grade/{submission}', [AssignmentGradingController::class, 'grade'])->name('assignments.grade.store');
        Route::post('/assignments/{assignment}/mark-paper/{studentId}', [AssignmentGradingController::class, 'markPaper'])->name('assignments.grade.mark-paper');
        Route::get('/assignments/view-file/{submissionId}/{index?}', [AssignmentGradingController::class, 'viewFile'])->name('assignments.view-file');
        Route::get('/assignments/download-file/{submissionId}/{index?}', [AssignmentGradingController::class, 'downloadFile'])->name('assignments.download-file');
        Route::get('/assignments/submission/{submission}/files', [AssignmentGradingController::class, 'showFiles'])->name('assignments.submission.files');

        // ===== Quizzes =====
        Route::get('/quizzes', [QuizController::class, 'index'])->name('quizzes.index');
        Route::get('/quizzes/create', [QuizController::class, 'create'])->name('quizzes.create');
        Route::post('/quizzes', [QuizController::class, 'store'])->name('quizzes.store');
        Route::get('/quizzes/{quiz}', [QuizController::class, 'show'])->name('quizzes.show');
        Route::get('/quizzes/{quiz}/edit', [QuizController::class, 'edit'])->name('quizzes.edit');
        Route::put('/quizzes/{quiz}', [QuizController::class, 'update'])->name('quizzes.update');
        Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy'])->name('quizzes.destroy');
        Route::post('/quizzes/{quiz}/publish', [QuizController::class, 'publish'])->name('quizzes.publish');

        // ===== Quiz Results =====
        Route::get('/quizzes/{quiz}/results', [QuizResultsController::class, 'index'])->name('quizzes.results');
        Route::get('/quizzes/{quiz}/export', [QuizResultsController::class, 'export'])->name('quizzes.export');
        Route::get('/quizzes/{quiz}/attempt/{attempt}', [QuizResultsController::class, 'show'])->name('quizzes.attempt-details');

        // ===== Games =====
        Route::get('/games', [GameController::class, 'index'])->name('games.index');
        Route::get('/games/create', [GameController::class, 'create'])->name('games.create');
        Route::post('/games', [GameController::class, 'store'])->name('games.store');
        Route::get('/games/{game}', [GameController::class, 'show'])->name('games.show');
        Route::get('/games/{game}/edit', [GameController::class, 'edit'])->name('games.edit');
        Route::put('/games/{game}', [GameController::class, 'update'])->name('games.update');
        Route::delete('/games/{game}', [GameController::class, 'destroy'])->name('games.destroy');
        Route::post('/games/{game}/publish', [GameController::class, 'publish'])->name('games.publish');

        // ===== Game Results =====
        Route::get('/games/{game}/results', [GameResultsController::class, 'index'])->name('games.results');
        Route::get('/games/{game}/export', [GameResultsController::class, 'export'])->name('games.export');

        // ===== Messages =====
        Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/create', [MessageController::class, 'create'])->name('messages.create');
        Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
        Route::get('/messages/api/students-by-grade', [MessageController::class, 'getStudentsByGrade'])->name('messages.students-by-grade');
        Route::get('/messages/groups/create', [TeacherMessageGroupController::class, 'create'])->name('messages.groups.create');
        Route::post('/messages/groups', [TeacherMessageGroupController::class, 'store'])->name('messages.groups.store');
        Route::get('/messages/groups/{messageGroup}/edit', [TeacherMessageGroupController::class, 'edit'])->name('messages.groups.edit');
        Route::put('/messages/groups/{messageGroup}', [TeacherMessageGroupController::class, 'update'])->name('messages.groups.update');
        Route::post('/messages/groups/{messageGroup}/send', [TeacherMessageGroupController::class, 'send'])->name('messages.groups.send');
        Route::delete('/messages/groups/{messageGroup}/messages/{groupMessage}', [TeacherMessageGroupController::class, 'destroyMessage'])->name('messages.groups.messages.destroy');
        Route::delete('/messages/groups/{messageGroup}/members/{user}', [TeacherMessageGroupController::class, 'removeMember'])->name('messages.groups.members.remove');
        Route::post('/messages/groups/{messageGroup}/archive', [TeacherMessageGroupController::class, 'archive'])->name('messages.groups.archive');
        Route::post('/messages/groups/{messageGroup}/restore', [TeacherMessageGroupController::class, 'restore'])->name('messages.groups.restore');
        Route::delete('/messages/groups/{messageGroup}', [TeacherMessageGroupController::class, 'destroy'])->name('messages.groups.destroy');
        Route::get('/messages/groups/{messageGroup}', [TeacherMessageGroupController::class, 'show'])->name('messages.groups.show');
        Route::get('/messages/{message}', [MessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{message}/reply', [MessageController::class, 'reply'])->name('messages.reply');
        Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
        Route::delete('/messages/conversation/{student}', [MessageController::class, 'destroyConversation'])
            ->name('messages.destroy-conversation');

        // ===== Progress Tracking =====
        Route::get('/progress', [ProgressTrackingController::class, 'index'])->name('progress.index');
        Route::get('/progress/export', [ProgressTrackingController::class, 'export'])->name('progress.export');
        Route::get('/progress/{studentId}', [ProgressTrackingController::class, 'show'])->name('progress.show');

        // ===== Announcements =====
        Route::get('/announcements', [TeacherAnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('/announcements/create', [TeacherAnnouncementController::class, 'create'])->name('announcements.create');
        Route::post('/announcements', [TeacherAnnouncementController::class, 'store'])->name('announcements.store');
        Route::get('/announcements/{announcement}', [TeacherAnnouncementController::class, 'show'])->name('announcements.show');
        Route::get('/announcements/{announcement}/edit', [TeacherAnnouncementController::class, 'edit'])->name('announcements.edit');
        Route::put('/announcements/{announcement}', [TeacherAnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('/announcements/{announcement}', [TeacherAnnouncementController::class, 'destroy'])->name('announcements.destroy');
        Route::post('/announcements/{announcement}/publish', [TeacherAnnouncementController::class, 'publish'])->name('announcements.publish');
        Route::post('/announcements/{announcement}/archive', [TeacherAnnouncementController::class, 'archive'])->name('announcements.archive');

        Route::get('/reports', [TeacherReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/pdf', [TeacherReportController::class, 'downloadPdf'])->name('reports.pdf');

        // ===== Student Activity Logs =====
        Route::get('/activity-logs', [StudentActivityLogController::class, 'index'])->name('activity-logs.index');

        // ===== Student Management (Teacher) =====
        Route::get('/students', [StudentManagementController::class, 'index'])->name('students.index');
        Route::post('/students', [StudentManagementController::class, 'store'])->name('students.store');
        Route::put('/students/{id}', [StudentManagementController::class, 'update'])->name('students.update');
        Route::put('/students/reset-password/{id}', [StudentManagementController::class, 'resetPassword'])->name('students.reset-password');
        Route::delete('/students/archive/{id}', [StudentManagementController::class, 'archive'])->name('students.archive');
        Route::post('/students/restore/{id}', [StudentManagementController::class, 'restore'])->name('students.restore');
        Route::delete('/students/{id}', [StudentManagementController::class, 'destroy'])->name('students.destroy');
    });

    // ===========================================================
    // ===== STUDENT ROUTES =====
    // ===========================================================
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('dashboard');

        // ===== Lessons =====
        Route::get('/lessons', [StudentLessonController::class, 'index'])->name('lessons.index');
        Route::get('/lessons/{lesson}', [StudentLessonController::class, 'show'])->name('lessons.show');
        Route::post('/lessons/{lesson}/complete', [StudentLessonController::class, 'complete'])->name('lessons.complete');
        Route::get('/lessons/download-resource/{id}', [StudentLessonController::class, 'downloadResource'])->name('lessons.download-resource');
        Route::get('/lessons/view-resource/{id}', [StudentLessonController::class, 'viewResource'])->name('lessons.view-resource');

        // ===== Assignments =====
        Route::get('/assignments', [StudentAssignmentController::class, 'index'])->name('assignments.index');
        Route::get('/assignments/{assignment}', [StudentAssignmentController::class, 'show'])->name('assignments.show');
        Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');
        Route::get('/assignments/download-resource/{id}', [StudentAssignmentController::class, 'downloadResource'])->name('assignments.download-resource');
        Route::get('/assignments/view-resource/{id}', [StudentAssignmentController::class, 'viewResource'])->name('assignments.view-resource');

        // ===== Quizzes =====
        Route::get('/quizzes', [StudentQuizController::class, 'index'])->name('quizzes.index');
        Route::get('/quizzes/{quiz}', [StudentQuizController::class, 'show'])->name('quizzes.show');
        Route::post('/quizzes/{quiz}/start', [StudentQuizController::class, 'start'])->name('quizzes.start');
        Route::get('/quizzes/take/{attempt}', [StudentQuizController::class, 'take'])->name('quizzes.take');
        Route::post('/quizzes/submit/{attempt}', [StudentQuizController::class, 'submit'])->name('quizzes.submit');
        Route::get('/quizzes/results/{attempt}', [StudentQuizController::class, 'results'])->name('quizzes.results');

        // ===== Games =====
        Route::get('/games', [StudentGameController::class, 'index'])->name('games.index');
        Route::get('/games/{game}', [StudentGameController::class, 'show'])->name('games.show');
        Route::post('/games/{game}/play', [StudentGameController::class, 'play'])->name('games.play');
        Route::get('/games/play/{result}', [StudentGameController::class, 'showPlay'])->name('games.play.show');
        Route::post('/games/submit/{result}', [StudentGameController::class, 'submitResult'])->name('games.submit-result');
        Route::get('/games/results/{result}', [StudentGameController::class, 'results'])->name('games.results');
        Route::post('/games/save-progress/{result}', [StudentGameController::class, 'saveProgress'])
            ->name('games.save-progress');

        // ===== Progress Tracker =====
        Route::get('/progress', [ProgressTrackerController::class, 'index'])->name('progress.index');

        // ===== Messages =====
        Route::get('/messages', [StudentMessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/create', [StudentMessageController::class, 'create'])->name('messages.create');
        Route::post('/messages', [StudentMessageController::class, 'store'])->name('messages.store');
        Route::get('/messages/groups/{messageGroup}', [StudentMessageGroupController::class, 'show'])->name('messages.groups.show');
        Route::post('/messages/groups/{messageGroup}/send', [StudentMessageGroupController::class, 'send'])->name('messages.groups.send');
        Route::delete('/messages/groups/{messageGroup}/messages/{groupMessage}', [StudentMessageGroupController::class, 'destroyMessage'])->name('messages.groups.messages.destroy');
        Route::get('/messages/{message}', [StudentMessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{message}/reply', [StudentMessageController::class, 'reply'])->name('messages.reply');
        Route::delete('/messages/{message}', [StudentMessageController::class, 'destroy'])->name('messages.destroy');
        Route::delete('/messages/conversation/{teacher}', [StudentMessageController::class, 'destroyConversation'])
            ->name('messages.destroy-conversation');

        // ===== Announcements =====
        Route::get('/announcements', [StudentAnnouncementController::class, 'index'])->name('announcements.index');
        Route::get('/announcements/{announcement}', [StudentAnnouncementController::class, 'show'])->name('announcements.show');
    });
});

// ========== AUTH ROUTES ==========
require __DIR__ . '/auth.php';
