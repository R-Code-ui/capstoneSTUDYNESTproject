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
use App\Models\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        Gate::authorize('report.view');

        $user = auth()->user();

        $gradeFilter = $request->input('grade_level');
        $subjectFilter = $request->input('subject');
        $trimesterFilter = $request->input('trimester');

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];

        // Report history
        $reportHistory = ReportExport::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'report_type' => $report->report_type,
                    'grade_level' => $report->grade_level,
                    'generated_at' => $report->generated_at->format('Y-m-d H:i'),
                    'file_name' => $report->file_name,
                ];
            });

        return Inertia::render('Teacher/Reports/Index', [
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'trimesters' => $trimesters,
            'grade_levels' => $gradeLevels,
            'report_history' => $reportHistory,
            'filters' => [
                'grade_level' => $gradeFilter,
                'subject' => $subjectFilter,
                'trimester' => $trimesterFilter,
            ],
        ]);
    }

    /**
     * Generate a report.
     */
    public function generate(Request $request)
    {
        Gate::authorize('report.view');

        $user = auth()->user();

        $validated = $request->validate([
            'report_type' => 'required|in:assignment_completion,quiz_performance,student_progress,lesson_completion,game_participation',
            'grade_level' => 'nullable|string',
            'subject' => 'nullable|string',
            'trimester' => 'nullable|string',
            'export_format' => 'nullable|in:excel,csv',
        ]);

        $reportType = $validated['report_type'];
        $gradeLevel = $validated['grade_level'] ?? null;
        $subject = $validated['subject'] ?? null;
        $trimester = $validated['trimester'] ?? null;

        // Get students based on filters
        $students = User::role('student')
            ->when($gradeLevel, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($gradeLevel === null, function ($query) use ($user) {
                return $query->whereIn('grade_level', $user->gradeAssignments()->pluck('grade_level')->toArray());
            })
            ->get();

        $reportData = [];
        $reportTitle = '';

        switch ($reportType) {
            case 'assignment_completion':
                $reportTitle = 'Assignment Completion Report';
                $reportData = $this->generateAssignmentCompletionReport($user, $students, $subject, $trimester);
                break;
            case 'quiz_performance':
                $reportTitle = 'Quiz Performance Report';
                $reportData = $this->generateQuizPerformanceReport($user, $students, $subject, $trimester);
                break;
            case 'student_progress':
                $reportTitle = 'Student Progress Report';
                $reportData = $this->generateStudentProgressReport($user, $students);
                break;
            case 'lesson_completion':
                $reportTitle = 'Lesson Completion Report';
                $reportData = $this->generateLessonCompletionReport($user, $students, $subject, $trimester);
                break;
            case 'game_participation':
                $reportTitle = 'Game Participation Report';
                $reportData = $this->generateGameParticipationReport($user, $students);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid report type.');
        }

        // Save report export record
        $reportExport = ReportExport::create([
            'user_id' => $user->id,
            'report_type' => $reportTitle,
            'grade_level' => $gradeLevel,
            'subject' => $subject,
            'trimester' => $trimester,
            'generated_at' => now(),
            'file_path' => null,
            'file_name' => $reportTitle . '_' . now()->format('Y-m-d') . '.json',
        ]);

        return Inertia::render('Teacher/Reports/Results', [
            'report_title' => $reportTitle,
            'report_data' => $reportData,
            'report_id' => $reportExport->id,
            'export_format' => $validated['export_format'] ?? null,
            'filters' => $validated,
        ]);
    }

    /**
     * Generate Assignment Completion Report.
     */
    private function generateAssignmentCompletionReport($user, $students, $subject, $trimester)
    {
        $assignments = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->when($subject, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->when($trimester, function ($query, $trimester) {
                return $query->where('trimester', $trimester);
            })
            ->get();

        $data = $assignments->map(function ($assignment) use ($students) {
            $gradeStudents = $students->where('grade_level', $assignment->grade_level);
            $total = $gradeStudents->count();
            $submitted = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->whereIn('student_id', $gradeStudents->pluck('id'))
                ->where('status', 'submitted')
                ->count();

            return [
                'assignment' => $assignment->assignment_title,
                'grade' => $assignment->grade_level,
                'subject' => $assignment->subject,
                'total_students' => $total,
                'completed' => $submitted,
                'incomplete' => $total - $submitted,
                'completion_rate' => $total > 0 ? round(($submitted / $total) * 100) : 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_assignments' => $assignments->count(),
                'average_completion_rate' => $data->avg('completion_rate') ?? 0,
                'total_students' => $students->count(),
                'total_completed' => $data->sum('completed'),
            ],
        ];
    }

    /**
     * Generate Quiz Performance Report.
     */
    private function generateQuizPerformanceReport($user, $students, $subject, $trimester)
    {
        $quizzes = Quiz::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->when($subject, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->when($trimester, function ($query, $trimester) {
                return $query->where('trimester', $trimester);
            })
            ->get();

        $data = $quizzes->map(function ($quiz) use ($students) {
            $gradeStudents = $students->where('grade_level', $quiz->grade_level);
            $attempts = QuizAttempt::where('quiz_id', $quiz->id)
                ->whereIn('student_id', $gradeStudents->pluck('id'))
                ->where('status', 'completed')
                ->get();

            $totalStudents = $gradeStudents->count();

            return [
                'quiz' => $quiz->quiz_title,
                'grade' => $quiz->grade_level,
                'subject' => $quiz->subject,
                'total_students' => $totalStudents,
                'attempts' => $attempts->count(),
                'average_score' => $attempts->count() > 0 ? round($attempts->avg('score')) : 0,
                'highest_score' => $attempts->count() > 0 ? $attempts->max('score') : 0,
                'lowest_score' => $attempts->count() > 0 ? $attempts->min('score') : 0,
                'passing_rate' => $attempts->count() > 0 ? round(($attempts->filter(function ($a) {
                    return ($a->score / $a->total_questions) * 100 >= 75;
                })->count() / $attempts->count()) * 100) : 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_quizzes' => $quizzes->count(),
                'average_score' => $data->avg('average_score') ?? 0,
                'highest_performing_quiz' => $data->sortByDesc('average_score')->first()['quiz'] ?? 'N/A',
                'lowest_performing_quiz' => $data->sortBy('average_score')->first()['quiz'] ?? 'N/A',
            ],
        ];
    }

    /**
     * Generate Student Progress Report.
     */
    private function generateStudentProgressReport($user, $students)
    {
        $data = $students->map(function ($student) use ($user) {
            $totalLessons = Lesson::where('teacher_id', $user->id)->where('status', 'published')->count();
            $totalAssignments = Assignment::where('teacher_id', $user->id)->where('status', 'published')->count();
            $totalQuizzes = Quiz::where('teacher_id', $user->id)->where('status', 'published')->count();
            $totalGames = Game::where('teacher_id', $user->id)->where('status', 'published')->count();

            $completedLessons = $student->lessons()->where('status', 'published')->count();
            $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)->where('status', 'submitted')->count();
            $quizAttempts = QuizAttempt::where('student_id', $student->id)->where('status', 'completed')->get();
            $avgQuizScore = $quizAttempts->count() > 0 ? round($quizAttempts->avg('score')) : 0;
            $completedGames = GameResult::where('student_id', $student->id)->where('status', 'completed')->count();

            $lessonProgress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;
            $assignmentProgress = $totalAssignments > 0 ? round(($submittedAssignments / $totalAssignments) * 100) : 0;
            $quizProgress = $totalQuizzes > 0 ? round(($quizAttempts->count() / $totalQuizzes) * 100) : 0;
            $gameProgress = $totalGames > 0 ? round(($completedGames / $totalGames) * 100) : 0;

            $overallProgress = round(
                ($lessonProgress * 0.3) +
                ($assignmentProgress * 0.3) +
                ($quizProgress * 0.3) +
                ($gameProgress * 0.1)
            );

            return [
                'student' => $student->name,
                'lrn' => $student->lrn,
                'grade' => $student->grade_level,
                'lessons' => $completedLessons . '/' . $totalLessons,
                'assignments' => $submittedAssignments . '/' . $totalAssignments,
                'quiz_average' => $avgQuizScore . '%',
                'games' => $completedGames . '/' . $totalGames,
                'overall_progress' => $overallProgress . '%',
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_students' => $students->count(),
                'average_progress' => $data->avg('overall_progress') ?? 0,
            ],
        ];
    }

    /**
     * Generate Lesson Completion Report.
     */
    private function generateLessonCompletionReport($user, $students, $subject, $trimester)
    {
        $lessons = Lesson::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->when($subject, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->when($trimester, function ($query, $trimester) {
                return $query->where('trimester', $trimester);
            })
            ->get();

        $data = $lessons->map(function ($lesson) use ($students) {
            $gradeStudents = $students->where('grade_level', $lesson->grade_level);
            $total = $gradeStudents->count();
            $completed = 0;

            foreach ($gradeStudents as $student) {
                if ($student->lessons()->where('lesson_id', $lesson->id)->exists()) {
                    $completed++;
                }
            }

            return [
                'lesson' => $lesson->lesson_title,
                'grade' => $lesson->grade_level,
                'subject' => $lesson->subject,
                'total_students' => $total,
                'completed' => $completed,
                'incomplete' => $total - $completed,
                'completion_rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_lessons' => $lessons->count(),
                'average_completion_rate' => $data->avg('completion_rate') ?? 0,
                'total_completed' => $data->sum('completed'),
            ],
        ];
    }

    /**
     * Generate Game Participation Report.
     */
    private function generateGameParticipationReport($user, $students)
    {
        $games = Game::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->get();

        $data = $games->map(function ($game) use ($students) {
            $gradeStudents = $students->where('grade_level', $game->grade_level);
            $total = $gradeStudents->count();
            $results = GameResult::where('game_id', $game->id)
                ->whereIn('student_id', $gradeStudents->pluck('id'))
                ->get();

            $completed = $results->where('status', 'completed')->count();
            $started = $results->where('status', 'started')->count();
            $assigned = $results->where('status', 'assigned')->count();

            return [
                'game' => $game->game_title,
                'grade' => $game->grade_level,
                'game_type' => $game->game_type,
                'total_students' => $total,
                'completed' => $completed,
                'started' => $started,
                'assigned' => $assigned,
                'participation_rate' => $total > 0 ? round(($completed / $total) * 100) : 0,
                'average_score' => $results->where('status', 'completed')->avg('score') ?? 0,
                'highest_score' => $results->where('status', 'completed')->max('score') ?? 0,
                'lowest_score' => $results->where('status', 'completed')->min('score') ?? 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_games' => $games->count(),
                'average_participation_rate' => $data->avg('participation_rate') ?? 0,
                'total_participants' => $data->sum('completed'),
            ],
        ];
    }
}
