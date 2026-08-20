<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ProgressTrackingController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('progress.view');
        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $gradeFilter = $request->input('grade_level');
        $gradeFilter = in_array($gradeFilter, $assignedGrades, true) ? $gradeFilter : null;
        $subjectFilter = $request->input('subject');
        $trimesterFilter = $request->input('trimester');
        $search = trim((string) $request->input('search', ''));

        $studentQuery = fn () => User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->when($gradeFilter, fn ($q) => $q->where('grade_level', $gradeFilter))
            ->when($search !== '', fn ($q) => $q->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            }));

        $allStudents = $studentQuery()->get();
        $studentsPaginated = $studentQuery()->paginate(10)->withQueryString();
        $content = $this->publishedContent($user->id, $subjectFilter, $trimesterFilter);
        $allProgress = $allStudents->map(fn ($student) => $this->calculateStudentProgress($student, $content));
        $studentProgress = collect($studentsPaginated->items())
            ->map(fn ($student) => $this->calculateStudentProgress($student, $content));

        $lessonTotal = $allProgress->sum('lesson_total');
        $assignmentTotal = $allProgress->sum('assignment_total');
        $gameTotal = $allProgress->sum('game_total');
        $quizScores = $allProgress->pluck('quiz_score')->filter(fn ($score) => $score !== null);

        $atRiskStudents = $allProgress->filter(fn ($student) => $student['overall_progress'] < 60)->values();
        return Inertia::render('Teacher/ProgressTracking/Index', [
            'stats' => [
                'total_students' => $allStudents->count(),
                'lesson_completion_rate' => $lessonTotal > 0 ? round(($allProgress->sum('lessons_completed') / $lessonTotal) * 100) : 0,
                'assignment_completion_rate' => $assignmentTotal > 0 ? round(($allProgress->sum('assignments_completed') / $assignmentTotal) * 100) : 0,
                'average_quiz_score' => $quizScores->isNotEmpty() ? round($quizScores->avg()) : 0,
                'game_participation' => $gameTotal > 0 ? round(($allProgress->sum('games_completed') / $gameTotal) * 100) : 0,
            ],
            'student_progress' => $studentProgress,
            'at_risk_students' => $atRiskStudents,
            'grade_levels' => $assignedGrades,
            'subjects' => ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'],
            'trimesters' => ['1st Term', '2nd Term', '3rd Term'],
            'filters' => [
                'grade_level' => $gradeFilter,
                'subject' => $subjectFilter,
                'trimester' => $trimesterFilter,
                'search' => $search,
            ],
            'pagination' => $studentsPaginated->toArray(),
        ]);
    }

    public function show($studentId)
    {
        Gate::authorize('progress.view');
        $user = auth()->user();
        $student = User::role('student')->findOrFail($studentId);
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        abort_unless(in_array($student->grade_level, $assignedGrades, true), 403);

        $content = $this->publishedContent($user->id, null, null);
        $lessons = $content['lessons']->where('grade_level', $student->grade_level)->values();
        $assignments = $content['assignments']->where('grade_level', $student->grade_level)->values();
        $quizzes = $content['quizzes']->where('grade_level', $student->grade_level)->values();
        $games = $content['games']->where('grade_level', $student->grade_level)->values();

        $completedLessons = $student->completedLessons()->whereIn('lesson_id', $lessons->pluck('id'))->count();
        $submittedAssignments = AssignmentSubmission::where('student_id', $student->id)
            ->whereIn('assignment_id', $assignments->pluck('id'))
            ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])->count();

        $quizAttempts = QuizAttempt::where('student_id', $student->id)
            ->whereIn('quiz_id', $quizzes->pluck('id'))->where('status', 'completed')
            ->with('quiz')->orderBy('attempt_number')->orderBy('created_at')->get()
            ->groupBy('quiz_id')->map->first()->values();
        $quizPerformance = $quizAttempts->map(fn ($attempt) => [
            'quiz_title' => $attempt->quiz?->quiz_title,
            'score' => $attempt->score,
            'total' => $attempt->total_questions,
            'percentage' => $attempt->total_questions > 0 ? round(($attempt->score / $attempt->total_questions) * 100) : 0,
            'completed_at' => $attempt->completed_at?->format('Y-m-d'),
        ]);

        $gameResults = GameResult::where('student_id', $student->id)
            ->whereIn('game_id', $games->pluck('id'))->where('status', 'completed')
            ->with('game')->get();
        $gamePerformance = $gameResults->map(fn ($result) => [
            'game_title' => $result->game?->game_title,
            'score' => $result->score,
            'game_type' => $result->game?->game_type,
            'completed_at' => $result->completed_at?->format('Y-m-d'),
        ]);

        $totalLessons = $lessons->count(); $totalAssignments = $assignments->count();
        $totalQuizzes = $quizzes->count(); $totalGames = $games->count();
        $lessonProgress = $totalLessons ? ($completedLessons / $totalLessons) * 100 : 0;
        $assignmentProgress = $totalAssignments ? ($submittedAssignments / $totalAssignments) * 100 : 0;
        $quizProgress = $totalQuizzes ? ($quizAttempts->count() / $totalQuizzes) * 100 : 0;
        $gameProgress = $totalGames ? ($gameResults->pluck('game_id')->unique()->count() / $totalGames) * 100 : 0;
        $overallProgress = min(100, round(($lessonProgress * .3) + ($assignmentProgress * .3) + ($quizProgress * .3) + ($gameProgress * .1)));
        $quizPercentages = $quizPerformance->pluck('percentage');

        return Inertia::render('Teacher/ProgressTracking/Show', [
            'student' => ['id' => $student->id, 'name' => $student->name, 'lrn' => $student->lrn, 'grade_level' => $student->grade_level],
            'progress' => [
                'lessons' => ['completed' => $completedLessons, 'total' => $totalLessons, 'percentage' => round($lessonProgress)],
                'assignments' => ['submitted' => $submittedAssignments, 'total' => $totalAssignments, 'percentage' => round($assignmentProgress)],
                'quizzes' => ['attempts' => $quizAttempts->count(), 'total' => $totalQuizzes, 'average_score' => $quizPercentages->isNotEmpty() ? round($quizPercentages->avg()) : 0, 'performance' => $quizPerformance],
                'games' => ['completed' => $gameResults->pluck('game_id')->unique()->count(), 'total' => $totalGames, 'performance' => $gamePerformance],
                'overall_progress' => $overallProgress,
            ],
        ]);
    }

    public function export(Request $request)
    {
        Gate::authorize('progress.view');
        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $gradeFilter = in_array($request->input('grade_level'), $assignedGrades, true) ? $request->input('grade_level') : null;
        $search = trim((string) $request->input('search', ''));
        $students = User::role('student')->whereIn('grade_level', $assignedGrades)
            ->when($gradeFilter, fn ($q) => $q->where('grade_level', $gradeFilter))
            ->when($search !== '', fn ($q) => $q->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")->orWhere('lrn', 'like', "%{$search}%");
            }))->get();
        $content = $this->publishedContent($user->id, $request->input('subject'), $request->input('trimester'));
        $progress = $students->map(fn ($student) => $this->calculateStudentProgress($student, $content));
        $headers = ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="progress_report_' . now()->format('Y-m-d') . '.csv"'];

        return response()->stream(function () use ($progress) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Grade', 'Lessons', 'Assignments', 'Quiz Average', 'Games', 'Overall Progress', 'Status']);
            foreach ($progress as $row) {
                fputcsv($file, [$row['name'], $row['lrn'], $row['grade_level'], $row['lessons'], $row['assignments'], $row['quiz_average'], $row['games'], $row['overall_progress'] . '%', $row['status']]);
            }
            fclose($file);
        }, 200, $headers);
    }

    private function publishedContent(int $teacherId, ?string $subject, ?string $trimester): array
    {
        $query = fn ($model) => $model::where('teacher_id', $teacherId)->where('status', 'published')
            ->when($subject, fn ($q) => $q->where('subject', $subject))
            ->when($trimester, fn ($q) => $q->where('trimester', $trimester))
            ->get(['id', 'grade_level']);
        return ['lessons' => $query(Lesson::class), 'assignments' => $query(Assignment::class), 'quizzes' => $query(Quiz::class),
            'games' => Game::where('teacher_id', $teacherId)->where('status', 'published')->get(['id', 'grade_level'])];
    }

    private function calculateStudentProgress(User $student, array $content): array
    {
        $lessons = $content['lessons']->where('grade_level', $student->grade_level); $assignments = $content['assignments']->where('grade_level', $student->grade_level);
        $quizzes = $content['quizzes']->where('grade_level', $student->grade_level); $games = $content['games']->where('grade_level', $student->grade_level);
        $lessonTotal = $lessons->count(); $assignmentTotal = $assignments->count(); $quizTotal = $quizzes->count(); $gameTotal = $games->count();
        $lessonsCompleted = $student->completedLessons()->whereIn('lesson_id', $lessons->pluck('id'))->count();
        $assignmentsCompleted = AssignmentSubmission::where('student_id', $student->id)->whereIn('assignment_id', $assignments->pluck('id'))
            ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])->count();
        $attempts = QuizAttempt::where('student_id', $student->id)->whereIn('quiz_id', $quizzes->pluck('id'))->where('status', 'completed')
            ->orderBy('attempt_number')->orderBy('created_at')->get()->groupBy('quiz_id')->map->first();
        $quizScores = $attempts->map(fn ($attempt) => $attempt->total_questions > 0 ? ($attempt->score / $attempt->total_questions) * 100 : 0);
        $quizScore = $quizScores->isNotEmpty() ? round($quizScores->avg()) : null;
        $gamesCompleted = GameResult::where('student_id', $student->id)->whereIn('game_id', $games->pluck('id'))->where('status', 'completed')->distinct('game_id')->count('game_id');
        $lessonProgress = $lessonTotal ? min(100, ($lessonsCompleted / $lessonTotal) * 100) : 0;
        $assignmentProgress = $assignmentTotal ? min(100, ($assignmentsCompleted / $assignmentTotal) * 100) : 0;
        $quizProgress = $quizTotal ? min(100, ($attempts->count() / $quizTotal) * 100) : 0;
        $gameProgress = $gameTotal ? min(100, ($gamesCompleted / $gameTotal) * 100) : 0;
        $overall = min(100, round(($lessonProgress * .3) + ($assignmentProgress * .3) + ($quizProgress * .3) + ($gameProgress * .1)));
        return ['student_id' => $student->id, 'name' => $student->name, 'lrn' => $student->lrn, 'grade_level' => $student->grade_level,
            'lessons' => "$lessonsCompleted/$lessonTotal", 'assignments' => "$assignmentsCompleted/$assignmentTotal", 'quiz_average' => ($quizScore ?? 0) . '%',
            'games' => "$gamesCompleted/$gameTotal", 'overall_progress' => $overall, 'status' => $overall < 60 ? 'Needs Support' : ($overall < 80 ? 'Needs Monitoring' : 'Excellent'),
            'lessons_completed' => $lessonsCompleted, 'assignments_completed' => $assignmentsCompleted, 'games_completed' => $gamesCompleted,
            'lesson_total' => $lessonTotal, 'assignment_total' => $assignmentTotal, 'quiz_total' => $quizTotal, 'game_total' => $gameTotal, 'quiz_score' => $quizScore];
    }
}
