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
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $teacher = auth()->user();
        $grades = $teacher->gradeAssignments()->pluck('grade_level')->values();

        $subjects = collect([
            ...$teacher->lessons()->pluck('subject'),
            ...$teacher->assignments()->pluck('subject'),
            ...$teacher->quizzes()->pluck('subject'),
        ])->filter()->unique()->sort()->values();

        return Inertia::render('Teacher/Reports/Index', [
            'assigned_grades' => $grades,
            'subjects' => $subjects,
            'school_years' => config('school.school_years'),
            'trimesters' => ['1st Term', '2nd Term', '3rd Term'],
        ]);
    }

    public function downloadPdf(Request $request)
    {
        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->all();

        $validated = $request->validate([
            'report_type' => ['required', Rule::in(['student_directory', 'assignment_completion', 'quiz_performance', 'student_progress'])],
            'grade_level' => ['required', Rule::in($assignedGrades)],
            'status' => ['nullable', Rule::in(['all', 'active', 'inactive'])],
            'school_year' => ['nullable', Rule::in(config('school.school_years'))],
            'subject' => 'nullable|string|max:255',
            'trimester' => ['nullable', Rule::in(['all', '1st Term', '2nd Term', '3rd Term'])],
        ]);

        $grade = $validated['grade_level'];
        $status = $validated['status'] ?? 'active';
        $schoolYear = $validated['school_year'] ?? config('school.school_years')[0] ?? null;
        $subject = $validated['subject'] ?? 'all';
        $trimester = $validated['trimester'] ?? 'all';

        [$title, $columns, $rows, $summary] = match ($validated['report_type']) {
            'student_directory' => $this->studentDirectory($grade, $status),
            'assignment_completion' => $this->assignmentCompletion($teacher->id, $grade, $status, $schoolYear, $subject, $trimester),
            'quiz_performance' => $this->quizPerformance($teacher->id, $grade, $status, $schoolYear, $subject, $trimester),
            'student_progress' => $this->studentProgress($teacher->id, $grade, $status, $schoolYear, $subject, $trimester),
        };

        $filters = ['Grade Level' => $grade, 'Student Status' => ucfirst($status)];
        if ($validated['report_type'] !== 'student_directory') {
            if ($schoolYear) $filters['School Year'] = $schoolYear;
            if ($subject !== 'all') $filters['Subject'] = $subject;
            if ($trimester !== 'all') $filters['Term'] = $trimester;
        }

        if ($validated['report_type'] === 'student_directory') {
            return Pdf::loadView('pdf.student-directory', ['title' => $title, 'students' => $rows, 'summary' => $summary, 'filters' => $filters, 'reportOwner' => 'Teacher'])
                ->setPaper('a4', 'portrait')
                ->download(str($title)->slug('-') . '-' . now()->format('Y-m-d') . '.pdf');
        }

        return Pdf::loadView('pdf.principal-report', ['title' => $title, 'columns' => $columns, 'rows' => $rows, 'summary' => $summary, 'filters' => $filters, 'reportOwner' => 'Teacher'])
            ->setPaper('a4', 'portrait')
            ->download(str($title)->slug('-') . '-' . now()->format('Y-m-d') . '.pdf');
    }

    private function studentDirectory(string $grade, string $status): array
    {
        $students = $this->students($grade, $status)->with('currentEnrollment')->orderBy('name')->get();
        $rows = $students->values()->map(fn (User $student, int $index) => $this->studentDetails($student, $index))->all();
        return ['Student Directory Report', [], $rows, ['Total Students' => $students->count(), 'Active Students' => $students->where('is_active', true)->count(), 'Inactive Students' => $students->where('is_active', false)->count()]];
    }

    private function assignmentCompletion(int $teacherId, string $grade, string $status, ?string $schoolYear, string $subject, string $trimester): array
    {
        $students = $this->students($grade, $status)->orderBy('name')->get();
        $assignmentIds = $this->contentQuery(Assignment::query(), $teacherId, $grade, $schoolYear, $subject, $trimester)->pluck('id');
        $submissions = AssignmentSubmission::whereIn('student_id', $students->pluck('id'))->whereIn('assignment_id', $assignmentIds)->get()->groupBy('student_id');
        $totalAssignments = $assignmentIds->count();
        $completedStatuses = ['submitted', 'late_submission', 'reviewed', 'graded'];
        $rows = $students->values()->map(function (User $student, int $index) use ($submissions, $totalAssignments, $completedStatuses) {
            $studentSubmissions = $submissions->get($student->id, collect());
            $submitted = $studentSubmissions->whereIn('status', $completedStatuses)->pluck('assignment_id')->unique()->count();
            return ['no' => $index + 1, 'student_name' => $student->name, 'total_assignments' => $totalAssignments, 'submitted' => $submitted, 'late' => $studentSubmissions->where('status', 'late_submission')->pluck('assignment_id')->unique()->count(), 'graded' => $studentSubmissions->where('status', 'graded')->pluck('assignment_id')->unique()->count(), 'missing' => max($totalAssignments - $submitted, 0)];
        })->all();
        return ['Assignment Completion Report', ['no' => 'No.', 'student_name' => 'Student Name', 'total_assignments' => 'Assigned', 'submitted' => 'Submitted', 'late' => 'Late', 'graded' => 'Graded', 'missing' => 'Missing'], $rows, ['Students' => $students->count(), 'Published Assignments' => $totalAssignments, 'Total Submitted' => collect($rows)->sum('submitted'), 'Total Missing' => collect($rows)->sum('missing')]];
    }

    private function quizPerformance(int $teacherId, string $grade, string $status, ?string $schoolYear, string $subject, string $trimester): array
    {
        $students = $this->students($grade, $status)->orderBy('name')->get();
        $quizIds = $this->contentQuery(Quiz::query(), $teacherId, $grade, $schoolYear, $subject, $trimester)->pluck('id');
        $attempts = QuizAttempt::whereIn('student_id', $students->pluck('id'))->whereIn('quiz_id', $quizIds)->where('status', 'completed')->get()->groupBy('student_id');
        $totalQuizzes = $quizIds->count();
        $rows = $students->values()->map(function (User $student, int $index) use ($attempts, $totalQuizzes) {
            $studentAttempts = $attempts->get($student->id, collect());
            $completed = $studentAttempts->pluck('quiz_id')->unique()->count();
            $percentages = $studentAttempts->filter(fn ($attempt) => $attempt->total_questions > 0)->map(fn ($attempt) => ($attempt->score / $attempt->total_questions) * 100);
            return ['no' => $index + 1, 'student_name' => $student->name, 'assigned_quizzes' => $totalQuizzes, 'completed_quizzes' => $completed, 'average_score' => $percentages->isNotEmpty() ? round($percentages->avg()) . '%' : 'N/A', 'completion_rate' => $totalQuizzes ? round(($completed / $totalQuizzes) * 100) . '%' : 'N/A'];
        })->all();
        return ['Quiz Performance Report', ['no' => 'No.', 'student_name' => 'Student Name', 'assigned_quizzes' => 'Assigned', 'completed_quizzes' => 'Completed', 'average_score' => 'Average Score', 'completion_rate' => 'Completion'], $rows, ['Students' => $students->count(), 'Published Quizzes' => $totalQuizzes, 'Average Completion' => count($rows) && $totalQuizzes ? round(collect($rows)->avg(fn ($row) => (int) $row['completion_rate'])) . '%' : 'N/A']];
    }

    private function studentProgress(int $teacherId, string $grade, string $status, ?string $schoolYear, string $subject, string $trimester): array
    {
        $students = $this->students($grade, $status)->orderBy('name')->get();
        $lessonIds = $this->contentQuery(Lesson::query(), $teacherId, $grade, $schoolYear, $subject, $trimester)->pluck('id');
        $assignmentIds = $this->contentQuery(Assignment::query(), $teacherId, $grade, $schoolYear, $subject, $trimester)->pluck('id');
        $quizIds = $this->contentQuery(Quiz::query(), $teacherId, $grade, $schoolYear, $subject, $trimester)->pluck('id');
        $gameIds = Game::where('teacher_id', $teacherId)->where('grade_level', $grade)->currentlyPublished()->pluck('id');
        $ids = $students->pluck('id');
        $lessonCounts = DB::table('lesson_user')->whereIn('user_id', $ids)->whereIn('lesson_id', $lessonIds)->whereNotNull('completed_at')->selectRaw('user_id, count(distinct lesson_id) as total')->groupBy('user_id')->pluck('total', 'user_id');
        $assignmentCounts = AssignmentSubmission::whereIn('student_id', $ids)->whereIn('assignment_id', $assignmentIds)->whereIn('status', ['submitted', 'late_submission', 'reviewed', 'graded'])->selectRaw('student_id, count(distinct assignment_id) as total')->groupBy('student_id')->pluck('total', 'student_id');
        $quizCounts = QuizAttempt::whereIn('student_id', $ids)->whereIn('quiz_id', $quizIds)->where('status', 'completed')->selectRaw('student_id, count(distinct quiz_id) as total')->groupBy('student_id')->pluck('total', 'student_id');
        $gameCounts = GameResult::whereIn('student_id', $ids)->whereIn('game_id', $gameIds)->whereNotNull('completed_at')->selectRaw('student_id, count(distinct game_id) as total')->groupBy('student_id')->pluck('total', 'student_id');
        $available = $lessonIds->count() + $assignmentIds->count() + $quizIds->count() + $gameIds->count();
        $rows = $students->values()->map(function (User $student, int $index) use ($lessonCounts, $assignmentCounts, $quizCounts, $gameCounts, $lessonIds, $assignmentIds, $quizIds, $gameIds, $available) {
            $lesson = min((int) ($lessonCounts[$student->id] ?? 0), $lessonIds->count()); $assignment = min((int) ($assignmentCounts[$student->id] ?? 0), $assignmentIds->count()); $quiz = min((int) ($quizCounts[$student->id] ?? 0), $quizIds->count()); $game = min((int) ($gameCounts[$student->id] ?? 0), $gameIds->count());
            return ['no' => $index + 1, 'student_name' => $student->name, 'lessons' => "$lesson / {$lessonIds->count()}", 'assignments' => "$assignment / {$assignmentIds->count()}", 'quizzes' => "$quiz / {$quizIds->count()}", 'games' => "$game / {$gameIds->count()}", 'overall_progress' => $available ? round((($lesson + $assignment + $quiz + $game) / $available) * 100) . '%' : 'N/A'];
        })->all();
        return ['Student Learning Progress Report', ['no' => 'No.', 'student_name' => 'Student Name', 'lessons' => 'Lessons', 'assignments' => 'Assignments', 'quizzes' => 'Quizzes', 'games' => 'Games', 'overall_progress' => 'Overall'], $rows, ['Students' => $students->count(), 'Learning Resources' => $available, 'Average Progress' => count($rows) && $available ? round(collect($rows)->avg(fn ($row) => (int) $row['overall_progress'])) . '%' : 'N/A']];
    }

    private function students(string $grade, string $status)
    {
        return User::role('student')->where('grade_level', $grade)->when($status !== 'all', fn ($query) => $query->where('is_active', $status === 'active'));
    }

    private function studentDetails(User $student, int $index): array
    {
        $names = preg_split('/\s+/', trim($student->name), -1, PREG_SPLIT_NO_EMPTY);
        $firstName = $names[0] ?? '—';
        $lastName = count($names) > 1 ? array_pop($names) : '—';

        return ['no' => $index + 1, 'student_id' => $student->lrn ?: '—', 'first_name' => $firstName, 'middle_name' => implode(' ', array_slice($names, 1)) ?: '—', 'last_name' => $lastName, 'grade_level' => $student->grade_level ?: '—', 'school_year' => $student->currentEnrollment?->school_year ?: '—', 'gender' => $student->gender ? ucfirst($student->gender) : '—', 'status' => $student->is_active ? 'Active' : 'Inactive'];
    }

    private function contentQuery($query, int $teacherId, string $grade, ?string $schoolYear, string $subject, string $trimester)
    {
        return $query->where('teacher_id', $teacherId)->where('grade_level', $grade)->currentlyPublished()->when($schoolYear, fn ($content) => $content->where('school_year', $schoolYear))->when($subject !== 'all', fn ($content) => $content->where('subject', $subject))->when($trimester !== 'all', fn ($content) => $content->where('trimester', $trimester));
    }
}
