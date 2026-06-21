<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Game;
use App\Models\Announcement;
use App\Models\Message;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard.
     */
    public function index()
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        // ===== Recent Announcements =====
        $recentAnnouncements = Announcement::where('status', 'published')
            ->where(function ($query) use ($gradeLevel) {
                $query->where('target_audience', 'all_users')
                    ->orWhere('target_audience', 'all_grades')
                    ->orWhere('target_audience', $gradeLevel);
            })
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => substr($announcement->content, 0, 100) . (strlen($announcement->content) > 100 ? '...' : ''),
                    'posted_by' => $announcement->user->name ?? 'Unknown',
                    'date' => $announcement->created_at->diffForHumans(),
                ];
            });

        // ===== Recent Lessons =====
        $recentLessons = Lesson::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'subject' => $lesson->subject,
                    'grade_level' => $lesson->grade_level,
                    'date' => $lesson->created_at->format('M d, Y'),
                ];
            });

        // ===== Upcoming Assignments =====
        $upcomingAssignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->limit(3)
            ->get()
            ->map(function ($assignment) use ($user) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $user->id)
                    ->first();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'subject' => $assignment->subject,
                    'due_date' => $assignment->due_date->format('M d, Y'),
                    'status' => $submission ? $submission->status : 'not_submitted',
                ];
            });

        // ===== Available Quizzes =====
        $availableQuizzes = Quiz::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($quiz) use ($user) {
                $attempt = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->first();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'subject' => $quiz->subject,
                    'questions' => $quiz->total_questions,
                    'status' => $attempt ? 'completed' : 'pending',
                    'score' => $attempt ? $attempt->score : null,
                ];
            });

        // ===== Assigned Games =====
        $assignedGames = Game::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($game) use ($user) {
                $result = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->first();

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'game_type' => $game->game_type,
                    'status' => $result ? $result->status : 'assigned',
                    'score' => $result && $result->status === 'completed' ? $result->score : null,
                ];
            });

        // ===== Learning Progress Summary =====
        $totalLessons = Lesson::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedLessons = $user->lessons()->where('status', 'published')->count();

        $totalAssignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $submittedAssignments = AssignmentSubmission::where('student_id', $user->id)
            ->where('status', 'submitted')
            ->count();

        $totalQuizzes = Quiz::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedQuizzes = QuizAttempt::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $totalGames = Game::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedGames = GameResult::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // Quiz average
        $quizAttempts = QuizAttempt::where('student_id', $user->id)
            ->where('status', 'completed')
            ->get();

        $quizAverage = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;

        $progressSummary = [
            'lessons' => [
                'completed' => $completedLessons,
                'total' => $totalLessons,
            ],
            'assignments' => [
                'submitted' => $submittedAssignments,
                'total' => $totalAssignments,
            ],
            'quizzes' => [
                'completed' => $completedQuizzes,
                'total' => $totalQuizzes,
                'average' => $quizAverage,
            ],
            'games' => [
                'completed' => $completedGames,
                'total' => $totalGames,
            ],
        ];

        // ===== Unread Messages Count =====
        $unreadMessagesCount = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();

        return Inertia::render('Student/Dashboard', [
            'grade_level' => $gradeLevel,
            'recent_announcements' => $recentAnnouncements,
            'recent_lessons' => $recentLessons,
            'upcoming_assignments' => $upcomingAssignments,
            'available_quizzes' => $availableQuizzes,
            'assigned_games' => $assignedGames,
            'progress_summary' => $progressSummary,
            'unread_messages' => $unreadMessagesCount,
        ]);
    }
}
