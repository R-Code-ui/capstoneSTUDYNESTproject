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
    public function index(Request $request)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        // ===== Academic Summary =====

        // Lessons
        $totalLessons = Lesson::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->count();

        $lessonIds = Lesson::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->pluck('id');
        $completedLessons = $user->completedLessons()
            ->whereIn('lessons.id', $lessonIds)
            ->count();

        // Assignments
        $totalAssignments = Assignment::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->count();
        $assignmentIds = Assignment::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->pluck('id');

        $submittedAssignments = AssignmentSubmission::where('student_id', $user->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->whereIn('status', ['submitted', 'reviewed', 'graded'])
            ->count();

        // Quizzes – official stats from first attempts only
        $quizIds = Quiz::where('grade_level', $gradeLevel)->currentlyPublished()->pluck('id');
        $totalQuizzes = count($quizIds);

        // Get all completed attempts, ordered so first attempt comes first
        $completedAttempts = QuizAttempt::where('student_id', $user->id)
            ->whereIn('quiz_id', $quizIds)
            ->where('status', 'completed')
            ->orderBy('quiz_id')
            ->orderBy('attempt_number', 'asc')
            ->get();

        // Unique by quiz_id gives the first attempt for each quiz
        $firstAttempts = $completedAttempts->unique('quiz_id');

        $completedQuizzes = $firstAttempts->count();
        $quizPercentages = $firstAttempts->map(function ($attempt) {
            return $attempt->total_questions > 0
                ? min(100, max(0, ($attempt->score / $attempt->total_questions) * 100))
                : 0;
        });
        $quizAverage = $quizPercentages->isNotEmpty() ? round($quizPercentages->avg()) : 0;

        // Games
        $totalGames = Game::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->count();

        $gameIds = Game::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->pluck('id');
        $completedGames = GameResult::where('student_id', $user->id)
            ->whereIn('game_id', $gameIds)
            ->where('status', 'completed')
            ->distinct('game_id')
            ->count('game_id');

        // ===== Pending Activities =====
        $pendingActivities = collect();

        // Pending Lessons
        if ($completedLessons < $totalLessons) {
            $pendingLessons = Lesson::where('grade_level', $gradeLevel)
                ->currentlyPublished()
                ->whereDoesntHave('students', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->get()
                ->map(function ($lesson) {
                    return [
                        'type' => 'lesson',
                        'id' => $lesson->id,
                        'title' => $lesson->lesson_title,
                        'subject' => $lesson->subject,
                        'due_date' => $lesson->publish_date ? $lesson->publish_date->format('M d, Y') : null,
                        'status' => 'Not Started',
                    ];
                });

            $pendingActivities = $pendingActivities->concat($pendingLessons);
        }

        // Pending Assignments
        $pendingAssignments = Assignment::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->whereDoesntHave('submissions', function ($query) use ($user) {
                $query->where('student_id', $user->id)
                    ->whereIn('status', ['submitted', 'late_submission', 'reviewed', 'graded']);
            })
            ->get()
            ->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'subject' => $assignment->subject,
                    'due_date' => $assignment->due_date ? $assignment->due_date->format('M d, Y') : null,
                    'status' => 'Not Submitted',
                ];
            });

        $pendingActivities = $pendingActivities->concat($pendingAssignments);

        // Pending Quizzes (no completed first attempt)
        $pendingQuizzes = Quiz::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->whereDoesntHave('attempts', function ($query) use ($user) {
                $query->where('student_id', $user->id)->where('status', 'completed');
            })
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
            ->currentlyPublished()
            ->whereDoesntHave('results', function ($query) use ($user) {
                $query->where('student_id', $user->id)->where('status', 'completed');
            })
            ->get()
            ->map(function ($game) {
                return [
                    'type' => 'game',
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'subject' => null,
                    'due_date' => $game->due_date ? $game->due_date->format('M d, Y') : null,
                    'status' => 'Not Started',
                ];
            });

        $pendingActivities = $pendingActivities->concat($pendingGames);

        // Sort by due date (if available)
        $pendingActivities = $pendingActivities->sortBy(function ($activity) {
            return $activity['due_date'] ?? now()->addDays(30);
        })->values();

        // ✅ PAGINATION: Paginate the pending activities
        $page = $request->input('page', 1);
        $perPage = 10;
        $offset = ($page - 1) * $perPage;
        $paginatedPending = $pendingActivities->slice($offset, $perPage)->values();

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
            $participationRate = min(100, max(0, round(($completedMetrics / $totalMetrics) * 100)));
        }

        return Inertia::render('Student/ProgressTracker', [
            'grade_level' => $gradeLevel,
            'summary' => [
                'lessons' => [
                    'completed' => $completedLessons,
                    'total' => $totalLessons,
            'percentage' => $totalLessons > 0 ? min(100, max(0, round(($completedLessons / $totalLessons) * 100))) : 0,
                ],
                'assignments' => [
                    'submitted' => $submittedAssignments,
                    'total' => $totalAssignments,
                    'percentage' => $totalAssignments > 0 ? min(100, max(0, round(($submittedAssignments / $totalAssignments) * 100))) : 0,
                ],
                'quizzes' => [
                    'completed' => $completedQuizzes,
                    'total' => $totalQuizzes,
                    'average' => $quizAverage,
                    'percentage' => $totalQuizzes > 0 ? min(100, max(0, round(($completedQuizzes / $totalQuizzes) * 100))) : 0,
                ],
                'games' => [
                    'completed' => $completedGames,
                    'total' => $totalGames,
                    'percentage' => $totalGames > 0 ? min(100, max(0, round(($completedGames / $totalGames) * 100))) : 0,
                ],
            ],
            'pending_activities' => $paginatedPending,
            'participation_rate' => $participationRate,
            'pending_count' => $pendingActivities->count(),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $pendingActivities->count(),
                'last_page' => max(1, (int) ceil($pendingActivities->count() / $perPage)),
            ],
        ]);
    }
}
