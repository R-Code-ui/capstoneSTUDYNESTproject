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
        $user = auth()->user();

        $gradeFilter = $request->input('grade_level');
        $subjectFilter = $request->input('subject');
        $trimesterFilter = $request->input('trimester');
        $search = $request->input('search');

        // Get assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        // Get students for assigned grades
        $students = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            })
            ->get();

        $totalStudents = $students->count();

        // Calculate overall statistics
        $totalLessons = Lesson::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->count();

        $totalAssignments = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->count();

        $totalQuizzes = Quiz::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->count();

        $totalGames = Game::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->count();

        // Calculate averages
        $lessonCompletionRate = 0;
        $assignmentCompletionRate = 0;
        $averageQuizScore = 0;
        $gameParticipationRate = 0;

        if ($totalStudents > 0) {
            if ($totalLessons > 0) {
                $completedLessons = 0;
                foreach ($students as $student) {
                    $completedLessons += $student->lessons()->where('status', 'published')->count();
                }
                $lessonCompletionRate = round(($completedLessons / ($totalLessons * $totalStudents)) * 100);
            }

            if ($totalAssignments > 0) {
                $submittedAssignments = AssignmentSubmission::whereIn('student_id', $students->pluck('id'))
                    ->where('status', 'submitted')
                    ->count();
                $assignmentCompletionRate = round(($submittedAssignments / ($totalAssignments * $totalStudents)) * 100);
            }

            if ($totalQuizzes > 0) {
                $quizAttempts = QuizAttempt::whereIn('student_id', $students->pluck('id'))
                    ->where('status', 'completed')
                    ->get();
                if ($quizAttempts->count() > 0) {
                    $averageQuizScore = round($quizAttempts->avg('score'));
                }
            }

            if ($totalGames > 0) {
                $gameResults = GameResult::whereIn('student_id', $students->pluck('id'))
                    ->where('status', 'completed')
                    ->count();
                $gameParticipationRate = round(($gameResults / ($totalGames * $totalStudents)) * 100);
            }
        }

        // Student progress data
        $studentProgress = $students->map(function ($student) use ($user, $totalLessons, $totalAssignments, $totalQuizzes, $totalGames) {
            $completedLessons = $student->lessons()->where('status', 'published')->count();
            $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
                ->where('status', 'submitted')
                ->count();
            $quizAttempts = QuizAttempt::where('student_id', $student->id)
                ->where('status', 'completed')
                ->get();
            $avgQuizScore = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;
            $completedGames = GameResult::where('student_id', $student->id)
                ->where('status', 'completed')
                ->count();

            // Calculate overall progress (weighted: 30% lessons, 30% assignments, 30% quizzes, 10% games)
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

            // Determine status
            $status = 'Excellent';
            if ($overallProgress < 60) {
                $status = 'Needs Support';
            } elseif ($overallProgress < 80) {
                $status = 'Needs Monitoring';
            }

            return [
                'student_id' => $student->id,
                'name' => $student->name,
                'lrn' => $student->lrn,
                'grade_level' => $student->grade_level,
                'lessons' => $completedLessons . '/' . $totalLessons,
                'assignments' => $submittedAssignments . '/' . $totalAssignments,
                'quiz_average' => $avgQuizScore . '%',
                'games' => $completedGames . '/' . $totalGames,
                'overall_progress' => $overallProgress,
                'status' => $status,
            ];
        });

        // At-risk students (below 60%)
        $atRiskStudents = $studentProgress->filter(function ($student) {
            return $student['overall_progress'] < 60;
        })->values();

        // Grade levels for filter
        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];

        return Inertia::render('Teacher/ProgressTracking/Index', [
            'stats' => [
                'total_students' => $totalStudents,
                'lesson_completion_rate' => $lessonCompletionRate,
                'assignment_completion_rate' => $assignmentCompletionRate,
                'average_quiz_score' => $averageQuizScore,
                'game_participation' => $gameParticipationRate,
            ],
            'student_progress' => $studentProgress,
            'at_risk_students' => $atRiskStudents,
            'grade_levels' => $gradeLevels,
            'subjects' => $subjects,
            'trimesters' => $trimesters,
            'filters' => [
                'grade_level' => $gradeFilter,
                'subject' => $subjectFilter,
                'trimester' => $trimesterFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display detailed progress for a specific student.
     */
    public function show($studentId)
    {
        $user = auth()->user();

        $student = User::role('student')->findOrFail($studentId);

        // Ensure this student is in the teacher's assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        if (!in_array($student->grade_level, $assignedGrades)) {
            abort(403);
        }

        // Get all lessons, assignments, quizzes, games for this teacher
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

        // Lesson completion
        $completedLessons = $student->lessons()->where('status', 'published')->count();

        // Assignment completion
        $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
            ->where('status', 'submitted')
            ->count();

        // Quiz performance
        $quizAttempts = QuizAttempt::where('student_id', $student->id)
            ->where('status', 'completed')
            ->with('quiz')
            ->get();

        $quizPerformance = $quizAttempts->map(function ($attempt) {
            return [
                'quiz_title' => $attempt->quiz->quiz_title,
                'score' => $attempt->score,
                'total' => $attempt->total_questions,
                'percentage' => round(($attempt->score / $attempt->total_questions) * 100),
                'completed_at' => $attempt->completed_at ? $attempt->completed_at->format('Y-m-d') : null,
            ];
        });

        // Game results
        $gameResults = GameResult::where('student_id', $student->id)
            ->where('status', 'completed')
            ->with('game')
            ->get();

        $gamePerformance = $gameResults->map(function ($result) {
            return [
                'game_title' => $result->game->game_title,
                'score' => $result->score,
                'game_type' => $result->game->game_type,
                'completed_at' => $result->completed_at ? $result->completed_at->format('Y-m-d') : null,
            ];
        });

        // Calculate overall progress
        $totalLessons = $lessons->count();
        $totalAssignments = $assignments->count();
        $totalQuizzes = $quizzes->count();
        $totalGames = $games->count();

        $lessonProgress = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;
        $assignmentProgress = $totalAssignments > 0 ? ($submittedAssignments / $totalAssignments) * 100 : 0;
        $quizProgress = $totalQuizzes > 0 ? ($quizAttempts->count() / $totalQuizzes) * 100 : 0;
        $gameProgress = $totalGames > 0 ? ($gameResults->count() / $totalGames) * 100 : 0;

        $overallProgress = round(
            ($lessonProgress * 0.3) +
            ($assignmentProgress * 0.3) +
            ($quizProgress * 0.3) +
            ($gameProgress * 0.1)
        );

        return Inertia::render('Teacher/ProgressTracking/Show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'lrn' => $student->lrn,
                'grade_level' => $student->grade_level,
            ],
            'progress' => [
                'lessons' => [
                    'completed' => $completedLessons,
                    'total' => $totalLessons,
                    'percentage' => round($lessonProgress),
                ],
                'assignments' => [
                    'submitted' => $submittedAssignments,
                    'total' => $totalAssignments,
                    'percentage' => round($assignmentProgress),
                ],
                'quizzes' => [
                    'attempts' => $quizAttempts->count(),
                    'total' => $totalQuizzes,
                    'average_score' => $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0,
                    'performance' => $quizPerformance,
                ],
                'games' => [
                    'completed' => $gameResults->count(),
                    'total' => $totalGames,
                    'performance' => $gamePerformance,
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
        $user = auth()->user();

        $students = User::role('student')
            ->whereIn('grade_level', $user->gradeAssignments()->pluck('grade_level')->toArray())
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="progress_report_' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($students, $user) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Grade', 'Lessons', 'Assignments', 'Quiz Average', 'Games', 'Overall Progress', 'Status']);

            foreach ($students as $student) {
                $completedLessons = $student->lessons()->where('status', 'published')->count();
                $totalLessons = Lesson::where('teacher_id', $user->id)->where('status', 'published')->count();

                $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
                    ->where('status', 'submitted')
                    ->count();
                $totalAssignments = Assignment::where('teacher_id', $user->id)->where('status', 'published')->count();

                $quizAttempts = QuizAttempt::where('student_id', $student->id)
                    ->where('status', 'completed')
                    ->get();
                $avgQuizScore = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;
                $totalQuizzes = Quiz::where('teacher_id', $user->id)->where('status', 'published')->count();

                $completedGames = GameResult::where('student_id', $student->id)
                    ->where('status', 'completed')
                    ->count();
                $totalGames = Game::where('teacher_id', $user->id)->where('status', 'published')->count();

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
