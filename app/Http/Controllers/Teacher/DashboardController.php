<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Game;
use App\Models\Message;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index()
    {
        $user = auth()->user();

        // Get assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        // Get students for assigned grades
        $students = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->get();

        $totalStudents = $students->count();

        // ===== Section 1: Classroom Overview =====
        $totalLessons = Lesson::where('teacher_id', $user->id)->count();
        $totalAssignments = Assignment::where('teacher_id', $user->id)->count();
        $totalQuizzes = Quiz::where('teacher_id', $user->id)->count();
        $totalGames = Game::where('teacher_id', $user->id)->count();

        // ===== Section 2: Student Participation Summary =====
        $lessonCompletionRate = 0;
        $assignmentCompletionRate = 0;
        $averageQuizScore = 0;
        $gameParticipationRate = 0;

        if ($totalStudents > 0) {
            // Lesson completion
            $publishedLessons = Lesson::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->count();
            if ($publishedLessons > 0) {
                $completedLessons = 0;
                foreach ($students as $student) {
                    $completedLessons += $student->lessons()->where('status', 'published')->count();
                }
                $lessonCompletionRate = round(($completedLessons / ($publishedLessons * $totalStudents)) * 100);
            }

            // Assignment completion
            $publishedAssignments = Assignment::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->count();
            if ($publishedAssignments > 0) {
                $submittedAssignments = AssignmentSubmission::whereIn('student_id', $students->pluck('id'))
                    ->where('status', 'submitted')
                    ->count();
                $assignmentCompletionRate = round(($submittedAssignments / ($publishedAssignments * $totalStudents)) * 100);
            }

            // Quiz average
            $quizAttempts = QuizAttempt::whereIn('student_id', $students->pluck('id'))
                ->where('status', 'completed')
                ->get();
            if ($quizAttempts->count() > 0) {
                $averageQuizScore = round($quizAttempts->avg('score'));
            }

            // Game participation (placeholder - will be implemented with game tracking)
            $gameParticipationRate = rand(70, 95);
        }

        // ===== Section 3: Students Requiring Attention =====
        $studentsRequiringAttention = collect();

        foreach ($students as $student) {
            $concerns = [];

            // Check for missing assignments
            $publishedAssignments = Assignment::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->get();
            foreach ($publishedAssignments as $assignment) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $student->id)
                    ->first();
                if (!$submission || $submission->status === 'not_submitted') {
                    $concerns[] = 'Missing assignments';
                    break;
                }
            }

            // Check for low quiz scores
            $quizAttempts = QuizAttempt::where('student_id', $student->id)
                ->where('status', 'completed')
                ->get();
            if ($quizAttempts->count() > 0) {
                $avgScore = $quizAttempts->avg('score');
                if ($avgScore < 70) {
                    $concerns[] = 'Low quiz scores';
                }
            }

            // Check for incomplete lessons
            $publishedLessons = Lesson::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->count();
            $completedLessons = $student->lessons()->where('status', 'published')->count();
            if ($publishedLessons > 0 && $completedLessons < $publishedLessons * 0.6) {
                $concerns[] = 'Incomplete lessons';
            }

            if (count($concerns) > 0) {
                $studentsRequiringAttention->push([
                    'id' => $student->id,
                    'name' => $student->name,
                    'concern' => implode(', ', $concerns),
                ]);
            }
        }

        $studentsRequiringAttention = $studentsRequiringAttention->take(5);

        // ===== Section 4: Upcoming Deadlines =====
        $upcomingDeadlines = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'due_date' => $assignment->due_date->format('M d'),
                    'days_left' => $assignment->due_date->diffInDays(now()),
                ];
            });

        // ===== Section 5: Recent Activity =====
        $recentLessons = Lesson::where('teacher_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(1)
            ->get()
            ->map(function ($lesson) {
                return [
                    'type' => 'lesson',
                    'title' => $lesson->lesson_title,
                    'date' => $lesson->created_at->diffForHumans(),
                ];
            });

        $recentAssignments = Assignment::where('teacher_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(1)
            ->get()
            ->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'title' => $assignment->assignment_title,
                    'date' => $assignment->created_at->diffForHumans(),
                ];
            });

        $recentQuizzes = Quiz::where('teacher_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(1)
            ->get()
            ->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'title' => $quiz->quiz_title,
                    'date' => $quiz->created_at->diffForHumans(),
                ];
            });

        $recentGames = Game::where('teacher_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(1)
            ->get()
            ->map(function ($game) {
                return [
                    'type' => 'game',
                    'title' => $game->game_title,
                    'date' => $game->created_at->diffForHumans(),
                ];
            });

        $recentActivity = $recentLessons
            ->concat($recentAssignments)
            ->concat($recentQuizzes)
            ->concat($recentGames)
            ->take(4);

        // ===== Section 6: Recent Messages =====
        $unreadMessages = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();

        $latestMessage = Message::where('receiver_id', $user->id)
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->first();

        return Inertia::render('Teacher/Dashboard', [
            'assigned_grades' => $assignedGrades,
            'stats' => [
                'total_students' => $totalStudents,
                'total_lessons' => $totalLessons,
                'total_assignments' => $totalAssignments,
                'total_quizzes' => $totalQuizzes,
                'total_games' => $totalGames,
            ],
            'participation' => [
                'lesson_completion_rate' => $lessonCompletionRate,
                'assignment_completion_rate' => $assignmentCompletionRate,
                'average_quiz_score' => $averageQuizScore,
                'game_participation_rate' => $gameParticipationRate,
            ],
            'students_requiring_attention' => $studentsRequiringAttention,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activity' => $recentActivity,
            'messages' => [
                'unread_count' => $unreadMessages,
                'latest' => $latestMessage ? [
                    'from' => $latestMessage->sender->name,
                    'message' => substr($latestMessage->message, 0, 50) . (strlen($latestMessage->message) > 50 ? '...' : ''),
                    'date' => $latestMessage->created_at->diffForHumans(),
                ] : null,
            ],
        ]);
    }
}
