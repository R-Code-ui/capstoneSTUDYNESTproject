<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
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
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReportController extends Controller
{
    private const GRADE_LEVELS = ['Grade 4', 'Grade 5', 'Grade 6'];

    public function index()
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('Principal/Reports', [
            'grade_levels' => self::GRADE_LEVELS,
            'school_years' => config('school.school_years'),
        ]);
    }

    public function downloadPdf(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $validated = $request->validate([
            'report_type' => ['required', Rule::in(['student_directory', 'teacher_activity', 'student_progress', 'school_summary'])],
            'grade_level' => ['nullable', Rule::in(['all', ...self::GRADE_LEVELS])],
            'status' => ['nullable', Rule::in(['all', 'active', 'inactive'])],
            'school_year' => ['nullable', Rule::in(config('school.school_years'))],
        ]);

        $gradeLevel = $validated['grade_level'] ?? 'all';
        $status = $validated['status'] ?? 'active';
        $schoolYear = $validated['school_year'] ?? config('school.school_years')[0] ?? null;

        [$title, $columns, $rows, $summary] = match ($validated['report_type']) {
            'student_directory' => $this->studentDirectory($gradeLevel, $status),
            'teacher_activity' => $this->teacherActivity($gradeLevel, $schoolYear),
            'student_progress' => $this->studentProgress($gradeLevel, $status, $schoolYear),
            'school_summary' => $this->schoolSummary($gradeLevel, $status, $schoolYear),
        };

        $filters = ['Grade Level' => $gradeLevel === 'all' ? 'All Grades' : $gradeLevel];
        if (in_array($validated['report_type'], ['student_directory', 'student_progress', 'school_summary'], true)) {
            $filters['Student Status'] = ucfirst($status);
        }
        if ($validated['report_type'] !== 'student_directory' && $schoolYear) {
            $filters['School Year'] = $schoolYear;
        }

        if ($validated['report_type'] === 'student_directory') {
            return Pdf::loadView('pdf.student-directory', ['title' => $title, 'students' => $rows, 'summary' => $summary, 'filters' => $filters, 'reportOwner' => 'Principal'])
                ->setPaper('a4', 'portrait')
                ->download(str($title)->slug('-') . '-' . now()->format('Y-m-d') . '.pdf');
        }

        return Pdf::loadView('pdf.principal-report', compact('title', 'columns', 'rows', 'summary', 'filters'))
            ->setPaper('a4', 'portrait')
            ->download(str($title)->slug('-') . '-' . now()->format('Y-m-d') . '.pdf');
    }

    private function studentDirectory(string $gradeLevel, string $status): array
    {
        $students = $this->studentsQuery($gradeLevel, $status)->with('currentEnrollment')->orderBy('grade_level')->orderBy('name')->get();
        $rows = $students->values()->map(fn (User $student, int $index) => $this->studentDetails($student, $index))->all();

        return [
            'Student Directory Report',
            [],
            $rows,
            ['Total Students' => $students->count(), 'Grade 4' => $students->where('grade_level', 'Grade 4')->count(), 'Grade 5' => $students->where('grade_level', 'Grade 5')->count(), 'Grade 6' => $students->where('grade_level', 'Grade 6')->count()],
        ];
    }

    private function teacherActivity(string $gradeLevel, ?string $schoolYear): array
    {
        $publishedForYear = fn ($query) => $query->where('status', 'published')
            ->when($schoolYear, fn ($content) => $content->where('school_year', $schoolYear))
            ->when($gradeLevel !== 'all', fn ($content) => $content->where('grade_level', $gradeLevel));

        $teachers = User::role('teacher')->with('gradeAssignments')
            ->when($gradeLevel !== 'all', fn ($query) => $query->whereHas('gradeAssignments', fn ($grades) => $grades->where('grade_level', $gradeLevel)))
            ->withCount([
                'lessons' => $publishedForYear,
                'assignments' => $publishedForYear,
                'quizzes' => $publishedForYear,
                'games' => fn ($query) => $query->where('status', 'published')->when($gradeLevel !== 'all', fn ($games) => $games->where('grade_level', $gradeLevel)),
            ])->orderBy('name')->get();

        $rows = $teachers->values()->map(fn (User $teacher, int $index) => [
            'no' => $index + 1,
            'teacher_id' => $teacher->teacher_id ?: '—',
            'teacher_name' => $teacher->name,
            'assigned_grades' => $teacher->gradeAssignments->pluck('grade_level')->join(', ') ?: '—',
            'lessons' => $teacher->lessons_count,
            'assignments' => $teacher->assignments_count,
            'quizzes' => $teacher->quizzes_count,
            'games' => $teacher->games_count,
        ])->all();

        return [
            'Teacher Activity Report',
            ['no' => 'No.', 'teacher_id' => 'Teacher ID', 'teacher_name' => 'Teacher Name', 'assigned_grades' => 'Assigned Grades', 'lessons' => 'Lessons', 'assignments' => 'Assignments', 'quizzes' => 'Quizzes', 'games' => 'Games'],
            $rows,
            ['Total Teachers' => $teachers->count(), 'Published Lessons' => $teachers->sum('lessons_count'), 'Published Assignments' => $teachers->sum('assignments_count'), 'Published Quizzes' => $teachers->sum('quizzes_count'), 'Published Games' => $teachers->sum('games_count')],
        ];
    }

    private function studentProgress(string $gradeLevel, string $status, ?string $schoolYear): array
    {
        $students = $this->studentsQuery($gradeLevel, $status)->orderBy('grade_level')->orderBy('name')->get();
        $contentCounts = [
            'lessons' => $this->contentCounts(Lesson::query(), $gradeLevel, $schoolYear),
            'assignments' => $this->contentCounts(Assignment::query(), $gradeLevel, $schoolYear),
            'quizzes' => $this->contentCounts(Quiz::query(), $gradeLevel, $schoolYear),
            'games' => Game::where('status', 'published')->when($gradeLevel !== 'all', fn ($query) => $query->where('grade_level', $gradeLevel))->selectRaw('grade_level, count(*) as total')->groupBy('grade_level')->pluck('total', 'grade_level'),
        ];

        $studentIds = $students->pluck('id');
        $lessonCompleted = $this->completionCounts('lesson_user', 'lesson_id', 'lessons', 'user_id', $studentIds, $gradeLevel, $schoolYear, 'completed_at');
        $assignmentCompleted = $this->completionCounts('assignment_submissions', 'assignment_id', 'assignments', 'student_id', $studentIds, $gradeLevel, $schoolYear, 'submitted_at', ['submitted', 'late_submission', 'reviewed', 'graded']);
        $quizCompleted = $this->completionCounts('quiz_attempts', 'quiz_id', 'quizzes', 'student_id', $studentIds, $gradeLevel, $schoolYear, 'completed_at', ['completed']);
        $gameCompleted = GameResult::query()->join('games', 'games.id', '=', 'game_results.game_id')->whereIn('game_results.student_id', $studentIds)->where('games.status', 'published')->whereNotNull('game_results.completed_at')->when($gradeLevel !== 'all', fn ($query) => $query->where('games.grade_level', $gradeLevel))->selectRaw('game_results.student_id, count(distinct game_results.game_id) as total')->groupBy('game_results.student_id')->pluck('total', 'game_results.student_id');

        $rows = $students->values()->map(function (User $student, int $index) use ($contentCounts, $lessonCompleted, $assignmentCompleted, $quizCompleted, $gameCompleted) {
            $grade = $student->grade_level;
            $totals = collect($contentCounts)->map(fn ($counts) => (int) ($counts[$grade] ?? 0));
            $completed = [
                'lessons' => (int) ($lessonCompleted[$student->id] ?? 0),
                'assignments' => (int) ($assignmentCompleted[$student->id] ?? 0),
                'quizzes' => (int) ($quizCompleted[$student->id] ?? 0),
                'games' => (int) ($gameCompleted[$student->id] ?? 0),
            ];
            $totalAvailable = $totals->sum();
            $totalCompleted = min($completed['lessons'], $totals['lessons']) + min($completed['assignments'], $totals['assignments']) + min($completed['quizzes'], $totals['quizzes']) + min($completed['games'], $totals['games']);

            return ['no' => $index + 1, 'student_name' => $student->name, 'grade_level' => $grade, 'lessons' => "{$completed['lessons']} / {$totals['lessons']}", 'assignments' => "{$completed['assignments']} / {$totals['assignments']}", 'quizzes' => "{$completed['quizzes']} / {$totals['quizzes']}", 'games' => "{$completed['games']} / {$totals['games']}", 'overall_progress' => $totalAvailable ? round(($totalCompleted / $totalAvailable) * 100) . '%' : 'N/A'];
        })->all();

        return ['Student Learning Progress Report', ['no' => 'No.', 'student_name' => 'Student Name', 'grade_level' => 'Grade', 'lessons' => 'Lessons', 'assignments' => 'Assignments', 'quizzes' => 'Quizzes', 'games' => 'Games', 'overall_progress' => 'Overall'], $rows, ['Total Students' => $students->count(), 'Average Progress' => count($rows) ? round(collect($rows)->filter(fn ($row) => $row['overall_progress'] !== 'N/A')->avg(fn ($row) => (int) $row['overall_progress'])) . '%' : 'N/A']];
    }

    private function schoolSummary(string $gradeLevel, string $status, ?string $schoolYear): array
    {
        $students = $this->studentsQuery($gradeLevel, $status)->count();
        $teachers = User::role('teacher')->when($gradeLevel !== 'all', fn ($query) => $query->whereHas('gradeAssignments', fn ($grades) => $grades->where('grade_level', $gradeLevel)))->where('is_active', true)->count();
        $contentCount = fn ($model) => $this->contentCounts($model::query(), $gradeLevel, $schoolYear)->sum();
        $rows = [
            ['metric' => 'Active Teachers', 'value' => $teachers], ['metric' => 'Students', 'value' => $students], ['metric' => 'Published Lessons', 'value' => $contentCount(Lesson::class)], ['metric' => 'Published Assignments', 'value' => $contentCount(Assignment::class)], ['metric' => 'Published Quizzes', 'value' => $contentCount(Quiz::class)], ['metric' => 'Published Games', 'value' => Game::where('status', 'published')->when($gradeLevel !== 'all', fn ($query) => $query->where('grade_level', $gradeLevel))->count()], ['metric' => 'Published Announcements', 'value' => Announcement::where('status', 'published')->count()],
        ];
        return ['School Activity Summary', ['metric' => 'Metric', 'value' => 'Total'], $rows, ['Report Scope' => $gradeLevel === 'all' ? 'All Grades' : $gradeLevel, 'Generated' => now()->format('F j, Y g:i A')]];
    }

    private function studentsQuery(string $gradeLevel, string $status)
    {
        return User::role('student')->when($gradeLevel !== 'all', fn ($query) => $query->where('grade_level', $gradeLevel))->when($status !== 'all', fn ($query) => $query->where('is_active', $status === 'active'));
    }

    private function studentDetails(User $student, int $index): array
    {
        $names = preg_split('/\s+/', trim($student->name), -1, PREG_SPLIT_NO_EMPTY);
        $firstName = $names[0] ?? '—';
        $lastName = count($names) > 1 ? array_pop($names) : '—';

        return ['no' => $index + 1, 'student_id' => $student->lrn ?: '—', 'first_name' => $firstName, 'middle_name' => implode(' ', array_slice($names, 1)) ?: '—', 'last_name' => $lastName, 'grade_level' => $student->grade_level ?: '—', 'school_year' => $student->currentEnrollment?->school_year ?: '—', 'gender' => $student->gender ? ucfirst($student->gender) : '—', 'status' => $student->is_active ? 'Active' : 'Inactive'];
    }

    private function contentCounts($query, string $gradeLevel, ?string $schoolYear)
    {
        return $query->where('status', 'published')->when($schoolYear, fn ($content) => $content->where('school_year', $schoolYear))->when($gradeLevel !== 'all', fn ($content) => $content->where('grade_level', $gradeLevel))->selectRaw('grade_level, count(*) as total')->groupBy('grade_level')->pluck('total', 'grade_level');
    }

    private function completionCounts(string $table, string $contentId, string $contentTable, string $studentId, $studentIds, string $gradeLevel, ?string $schoolYear, string $completionColumn, ?array $statuses = null)
    {
        return DB::table($table)->join($contentTable, "{$contentTable}.id", '=', "{$table}.{$contentId}")->join('users', 'users.id', '=', "{$table}.{$studentId}")->whereIn("{$table}.{$studentId}", $studentIds)->where("{$contentTable}.status", 'published')->whereNotNull("{$table}.{$completionColumn}")->whereColumn('users.grade_level', "{$contentTable}.grade_level")->when($schoolYear, fn ($query) => $query->where("{$contentTable}.school_year", $schoolYear))->when($gradeLevel !== 'all', fn ($query) => $query->where("{$contentTable}.grade_level", $gradeLevel))->when($statuses, fn ($query) => $query->whereIn("{$table}.status", $statuses))->selectRaw("{$table}.{$studentId} as student_id, count(distinct {$table}.{$contentId}) as total")->groupBy("{$table}.{$studentId}")->pluck('total', 'student_id');
    }
}
