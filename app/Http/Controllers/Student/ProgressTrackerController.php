<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Game;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProgressTrackerController extends Controller
{
    /**
     * Display the progress tracker.
     */
    public function index()
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        // ===== Academic Summary =====

        // Lessons
        $totalLessons = Lesson::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedLessons = $user->lessons()->where('status', 'published')->count();

        // Assignments
        $totalAssignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $submittedAssignments = AssignmentSubmission::where('student_id', $user->id)
            ->whereIn('status', ['submitted', 'reviewed', 'graded'])
            ->count();

        // Quizzes
        $totalQuizzes = Quiz::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedQuizzes = QuizAttempt::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $quizAttempts = QuizAttempt::where('student_id', $user->id)
            ->where('status', 'completed')
            ->get();

        $quizAverage = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;

        // Games
        $totalGames = Game::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->count();

        $completedGames = GameResult::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // ===== Pending Activities =====
        $pendingActivities = collect();

        // Pending Lessons
        if ($completedLessons < $totalLessons) {
            $pendingLessons = Lesson::where('grade_level', $gradeLevel)
                ->where('status', 'published')
                ->whereDoesntHave('students', function ($query) use ($user) {
                    $query->where('student_id', $user->id);
                })
                ->limit(3)
                ->get()
                ->map(function ($lesson) {
                    return [
                        'type' => 'lesson',
                        'id' => $lesson->id,
                        'title' => $lesson->lesson_title,
                        'subject' => $lesson->subject,
                        'due_date' => $lesson->publish_date,
                        'status' => 'Not Started',
                    ];
                });

            $pendingActivities = $pendingActivities->concat($pendingLessons);
        }

        // Pending Assignments
        $pendingAssignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->whereDoesntHave('submissions', function ($query) use ($user) {
                $query->where('student_id', $user->id)
                    ->whereIn('status', ['submitted', 'reviewed', 'graded']);
            })
            ->limit(3)
            ->get()
            ->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'subject' => $assignment->subject,
                    'due_date' => $assignment->due_date,
                    'status' => 'Not Submitted',
                ];
            });

        $pendingActivities = $pendingActivities->concat($pendingAssignments);

        // Pending Quizzes
        $pendingQuizzes = Quiz::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->whereDoesntHave('attempts', function ($query) use ($user) {
                $query->where('student_id', $user->id)->where('status', 'completed');
            })
            ->limit(3)
            ->get()
            ->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'subject' => $quiz->subject,
                    'due_date' => null,
                    'status' => 'Not Taken',
                ];
            });

        $pendingActivities = $pendingActivities->concat($pendingQuizzes);

        // Pending Games
        $pendingGames = Game::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->whereDoesntHave('results', function ($query) use ($user) {
                $query->where('student_id', $user->id)->where('status', 'completed');
            })
            ->limit(3)
            ->get()
            ->map(function ($game) {
                return [
                    'type' => 'game',
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'subject' => null,
                    'due_date' => $game->due_date,
                    'status' => 'Not Started',
                ];
            });

        $pendingActivities = $pendingActivities->concat($pendingGames);

        // Sort by due date (if available)
        $pendingActivities = $pendingActivities->sortBy(function ($activity) {
            return $activity['due_date'] ?? now()->addDays(30);
        })->values();

        // ===== Participation Rate =====
        $participationRate = 0;
        $totalMetrics = 0;
        $completedMetrics = 0;

        if ($totalLessons > 0) {
            $totalMetrics++;
            $completedMetrics += ($completedLessons / $totalLessons);
        }

        if ($totalAssignments > 0) {
            $totalMetrics++;
            $completedMetrics += ($submittedAssignments / $totalAssignments);
        }

        if ($totalQuizzes > 0) {
            $totalMetrics++;
            $completedMetrics += ($completedQuizzes / $totalQuizzes);
        }

        if ($totalGames > 0) {
            $totalMetrics++;
            $completedMetrics += ($completedGames / $totalGames);
        }

        if ($totalMetrics > 0) {
            $participationRate = round(($completedMetrics / $totalMetrics) * 100);
        }

        return Inertia::render('Student/ProgressTracker', [
            'grade_level' => $gradeLevel,
            'summary' => [
                'lessons' => [
                    'completed' => $completedLessons,
                    'total' => $totalLessons,
                    'percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                ],
                'assignments' => [
                    'submitted' => $submittedAssignments,
                    'total' => $totalAssignments,
                    'percentage' => $totalAssignments > 0 ? round(($submittedAssignments / $totalAssignments) * 100) : 0,
                ],
                'quizzes' => [
                    'completed' => $completedQuizzes,
                    'total' => $totalQuizzes,
                    'average' => $quizAverage,
                    'percentage' => $totalQuizzes > 0 ? round(($completedQuizzes / $totalQuizzes) * 100) : 0,
                ],
                'games' => [
                    'completed' => $completedGames,
                    'total' => $totalGames,
                    'percentage' => $totalGames > 0 ? round(($completedGames / $totalGames) * 100) : 0,
                ],
            ],
            'pending_activities' => $pendingActivities,
            'participation_rate' => $participationRate,
            'pending_count' => $pendingActivities->count(),
        ]);
    }
}
