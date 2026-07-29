<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
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

class ProgressTrackingController extends Controller
{
    /**
     * Display the progress tracking dashboard.
     */
    public function index(Request $request)
    {
        Gate::authorize('progress.view');

        $user = auth()->user();

        $gradeFilter = $request->input('grade_level');
        $subjectFilter = $request->input('subject');
        $trimesterFilter = $request->input('trimester');
        $search = $request->input('search');

        // Get assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        // All students for statistics (not paginated)
        $allStudents = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->when($gradeFilter, fn($q, $g) => $q->where('grade_level', $g))
            ->when($search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('lrn', 'like', "%{$s}%"))
            ->get();

        $totalStudents = $allStudents->count();

        // Paginated students for the table
        $studentsPaginated = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->when($gradeFilter, fn($q, $g) => $q->where('grade_level', $g))
            ->when($search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('lrn', 'like', "%{$s}%"))
            ->paginate(10);

        // ---------- Teacher‑scoped content IDs ----------
        $teacherLessonIds = Lesson::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->pluck('id');

        $teacherAssignmentIds = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->pluck('id');

        $teacherQuizIds = Quiz::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->pluck('id');

        $teacherGameIds = Game::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->pluck('id');

        // ---------- Totals ----------
        $totalLessons = $teacherLessonIds->count();
        $totalAssignments = $teacherAssignmentIds->count();
        $totalQuizzes = $teacherQuizIds->count();
        $totalGames = $teacherGameIds->count();

        // ---------- Statistics ----------
        $lessonCompletionRate = 0;
        $assignmentCompletionRate = 0;
        $averageQuizScore = 0;
        $gameParticipationRate = 0;

        if ($totalStudents > 0) {
            // Lesson completion
            if ($totalLessons > 0) {
                $completedLessons = 0;
                foreach ($allStudents as $student) {
                    $completedLessons += $student->completedLessons()
                        ->whereIn('lesson_id', $teacherLessonIds)
                        ->count();
                }
                $lessonCompletionRate = round(($completedLessons / ($totalLessons * $totalStudents)) * 100);
            }

            // Assignment completion (all relevant statuses)
            if ($totalAssignments > 0) {
                $submittedAssignments = AssignmentSubmission::whereIn('student_id', $allStudents->pluck('id'))
                    ->whereIn('assignment_id', $teacherAssignmentIds)
                    ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])
                    ->count();
                $assignmentCompletionRate = round(($submittedAssignments / ($totalAssignments * $totalStudents)) * 100);
            }

            // Average quiz score
            if ($totalQuizzes > 0) {
                $quizAttempts = QuizAttempt::whereIn('student_id', $allStudents->pluck('id'))
                    ->whereIn('quiz_id', $teacherQuizIds)
                    ->where('status', 'completed')
                    ->get();
                if ($quizAttempts->count() > 0) {
                    $averageQuizScore = round($quizAttempts->avg('score'));
                }
            }

            // Game participation
            if ($totalGames > 0) {
                $gameResultsCount = GameResult::whereIn('student_id', $allStudents->pluck('id'))
                    ->whereIn('game_id', $teacherGameIds)
                    ->where('status', 'completed')
                    ->count();
                $gameParticipationRate = round(($gameResultsCount / ($totalGames * $totalStudents)) * 100);
            }
        }

        // ---------- Student progress for table ----------
        $studentProgress = collect($studentsPaginated->items())->map(function ($student) use ($totalLessons, $totalAssignments, $totalQuizzes, $totalGames, $teacherLessonIds, $teacherAssignmentIds, $teacherQuizIds, $teacherGameIds) {
            $completedLessons = $student->completedLessons()
                ->whereIn('lesson_id', $teacherLessonIds)
                ->count();

            $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
                ->whereIn('assignment_id', $teacherAssignmentIds)
                ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])
                ->count();

            $quizAttempts = QuizAttempt::where('student_id', $student->id)
                ->whereIn('quiz_id', $teacherQuizIds)
                ->where('status', 'completed')
                ->get();
            $avgQuizScore = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;

            $completedGames = GameResult::where('student_id', $student->id)
                ->whereIn('game_id', $teacherGameIds)
                ->where('status', 'completed')
                ->count();

            $lessonProgress = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
            $assignmentProgress = $totalAssignments > 0 ? ($submittedAssignments / $totalAssignments) * 100 : 0;
            $quizProgress = $totalQuizzes > 0 ? ($quizAttempts->count() / $totalQuizzes) * 100 : 0;
            $gameProgress = $totalGames > 0 ? ($completedGames / $totalGames) * 100 : 0;

            $overallProgress = round(
                ($lessonProgress * 0.3) +
                ($assignmentProgress * 0.3) +
                ($quizProgress * 0.3) +
                ($gameProgress * 0.1)
            );

            $status = 'Excellent';
            if ($overallProgress < 60) {
                $status = 'Needs Support';
            } elseif ($overallProgress < 80) {
                $status = 'Needs Monitoring';
            }

            return [
                'student_id'       => $student->id,
                'name'             => $student->name,
                'lrn'              => $student->lrn,
                'grade_level'      => $student->grade_level,
                'lessons'          => $completedLessons . '/' . $totalLessons,
                'assignments'      => $submittedAssignments . '/' . $totalAssignments,
                'quiz_average'     => $avgQuizScore . '%',
                'games'            => $completedGames . '/' . $totalGames,
                'overall_progress' => $overallProgress,
                'status'           => $status,
            ];
        });

        $atRiskStudents = $studentProgress->filter(fn($s) => $s['overall_progress'] < 60)->values();

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];

        return Inertia::render('Teacher/ProgressTracking/Index', [
            'stats' => [
                'total_students'            => $totalStudents,
                'lesson_completion_rate'    => $lessonCompletionRate,
                'assignment_completion_rate'=> $assignmentCompletionRate,
                'average_quiz_score'        => $averageQuizScore,
                'game_participation'        => $gameParticipationRate,
            ],
            'student_progress' => $studentProgress,
            'at_risk_students' => $atRiskStudents,
            'grade_levels'     => $gradeLevels,
            'subjects'         => $subjects,
            'trimesters'       => $trimesters,
            'filters'          => [
                'grade_level' => $gradeFilter,
                'subject'     => $subjectFilter,
                'trimester'   => $trimesterFilter,
                'search'      => $search,
            ],
            'pagination'       => $studentsPaginated->toArray(),
        ]);
    }

    /**
     * Display detailed progress for a specific student.
     */
    public function show($studentId)
    {
        Gate::authorize('progress.view');

        $user = auth()->user();

        $student = User::role('student')->findOrFail($studentId);

        // Ensure this student is in the teacher's assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        if (!in_array($student->grade_level, $assignedGrades)) {
            abort(403);
        }

        // Teacher‑scoped content for this grade level
        $lessons = Lesson::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('grade_level', $student->grade_level)
            ->get();

        $assignments = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('grade_level', $student->grade_level)
            ->get();

        $quizzes = Quiz::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('grade_level', $student->grade_level)
            ->get();

        $games = Game::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('grade_level', $student->grade_level)
            ->get();

        // Lesson completion (using pivot)
        $completedLessons = $student->completedLessons()
            ->whereIn('lesson_id', $lessons->pluck('id'))
            ->count();

        // Assignment submissions (multiple statuses)
        $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])
            ->count();

        // Quiz performance
        $quizAttempts = QuizAttempt::where('student_id', $student->id)
            ->whereIn('quiz_id', $quizzes->pluck('id'))
            ->where('status', 'completed')
            ->with('quiz')
            ->get();

        $quizPerformance = $quizAttempts->map(function ($attempt) {
            return [
                'quiz_title'   => $attempt->quiz->quiz_title,
                'score'        => $attempt->score,
                'total'        => $attempt->total_questions,
                'percentage'   => $attempt->total_questions > 0
                                    ? round(($attempt->score / $attempt->total_questions) * 100)
                                    : 0,
                'completed_at' => $attempt->completed_at?->format('Y-m-d'),
            ];
        });

        // Game results
        $gameResults = GameResult::where('student_id', $student->id)
            ->whereIn('game_id', $games->pluck('id'))
            ->where('status', 'completed')
            ->with('game')
            ->get();

        $gamePerformance = $gameResults->map(function ($result) {
            return [
                'game_title'   => $result->game->game_title,
                'score'        => $result->score,
                'game_type'    => $result->game->game_type,
                'completed_at' => $result->completed_at?->format('Y-m-d'),
            ];
        });

        // Overall progress calculation
        $totalLessons     = $lessons->count();
        $totalAssignments = $assignments->count();
        $totalQuizzes     = $quizzes->count();
        $totalGames       = $games->count();

        $lessonProgress    = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
        $assignmentProgress= $totalAssignments > 0 ? ($submittedAssignments / $totalAssignments) * 100 : 0;
        $quizProgress      = $totalQuizzes > 0 ? ($quizAttempts->count() / $totalQuizzes) * 100 : 0;
        $gameProgress      = $totalGames > 0 ? ($gameResults->count() / $totalGames) * 100 : 0;

        $overallProgress = round(
            ($lessonProgress * 0.3) +
            ($assignmentProgress * 0.3) +
            ($quizProgress * 0.3) +
            ($gameProgress * 0.1)
        );

        return Inertia::render('Teacher/ProgressTracking/Show', [
            'student' => [
                'id'          => $student->id,
                'name'        => $student->name,
                'lrn'         => $student->lrn,
                'grade_level' => $student->grade_level,
            ],
            'progress' => [
                'lessons' => [
                    'completed'  => $completedLessons,
                    'total'      => $totalLessons,
                    'percentage' => round($lessonProgress),
                ],
                'assignments' => [
                    'submitted'  => $submittedAssignments,
                    'total'      => $totalAssignments,
                    'percentage' => round($assignmentProgress),
                ],
                'quizzes' => [
                    'attempts'      => $quizAttempts->count(),
                    'total'         => $totalQuizzes,
                    'average_score' => $quizAttempts->avg('score') !== null ? round($quizAttempts->avg('score')) : 0,
                    'performance'   => $quizPerformance,
                ],
                'games' => [
                    'completed'  => $gameResults->count(),
                    'total'      => $totalGames,
                    'performance'=> $gamePerformance,
                ],
                'overall_progress' => $overallProgress,
            ],
        ]);
    }

    /**
     * Export progress data to CSV.
     */
    public function export(Request $request)
    {
        Gate::authorize('progress.view');

        $user = auth()->user();

        $students = User::role('student')
            ->whereIn('grade_level', $user->gradeAssignments()->pluck('grade_level')->toArray())
            ->get();

        $teacherLessonIds = Lesson::where('teacher_id', $user->id)->where('status', 'published')->pluck('id');
        $teacherAssignmentIds = Assignment::where('teacher_id', $user->id)->where('status', 'published')->pluck('id');
        $teacherQuizIds = Quiz::where('teacher_id', $user->id)->where('status', 'published')->pluck('id');
        $teacherGameIds = Game::where('teacher_id', $user->id)->where('status', 'published')->pluck('id');

        $totalLessons = $teacherLessonIds->count();
        $totalAssignments = $teacherAssignmentIds->count();
        $totalQuizzes = $teacherQuizIds->count();
        $totalGames = $teacherGameIds->count();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="progress_report_' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($students, $totalLessons, $totalAssignments, $totalQuizzes, $totalGames, $teacherLessonIds, $teacherAssignmentIds, $teacherQuizIds, $teacherGameIds) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Grade', 'Lessons', 'Assignments', 'Quiz Average', 'Games', 'Overall Progress', 'Status']);

            foreach ($students as $student) {
                $completedLessons = $student->completedLessons()->whereIn('lesson_id', $teacherLessonIds)->count();
                $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
                    ->whereIn('assignment_id', $teacherAssignmentIds)
                    ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])
                    ->count();
                $quizAttempts = QuizAttempt::where('student_id', $student->id)
                    ->whereIn('quiz_id', $teacherQuizIds)
                    ->where('status', 'completed')
                    ->get();
                $avgQuizScore = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;
                $completedGames = GameResult::where('student_id', $student->id)
                    ->whereIn('game_id', $teacherGameIds)
                    ->where('status', 'completed')
                    ->count();

                $lessonProgress = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
                $assignmentProgress = $totalAssignments > 0 ? ($submittedAssignments / $totalAssignments) * 100 : 0;
                $quizProgress = $totalQuizzes > 0 ? ($quizAttempts->count() / $totalQuizzes) * 100 : 0;
                $gameProgress = $totalGames > 0 ? ($completedGames / $totalGames) * 100 : 0;

                $overallProgress = round(
                    ($lessonProgress * 0.3) +
                    ($assignmentProgress * 0.3) +
                    ($quizProgress * 0.3) +
                    ($gameProgress * 0.1)
                );

                $status = 'Excellent';
                if ($overallProgress < 60) {
                    $status = 'Needs Support';
                } elseif ($overallProgress < 80) {
                    $status = 'Needs Monitoring';
                }

                fputcsv($file, [
                    $student->name,
                    $student->lrn,
                    $student->grade_level,
                    $completedLessons . '/' . $totalLessons,
                    $submittedAssignments . '/' . $totalAssignments,
                    $avgQuizScore . '%',
                    $completedGames . '/' . $totalGames,
                    $overallProgress . '%',
                    $status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
