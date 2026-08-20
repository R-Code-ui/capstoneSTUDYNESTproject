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
use App\Models\ReportExport;
use App\Models\User;
use App\Services\StudyNestNotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ReportController extends Controller
{
    private const SUBJECTS = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
    private const TERMS = ['1st Term', '2nd Term', '3rd Term'];

    public function index(Request $request)
    {
        Gate::authorize('report.view');
        $assignedGrades = auth()->user()->gradeAssignments()->pluck('grade_level')->values()->all();
        return Inertia::render('Teacher/Reports/Index', [
            'assigned_grades' => $assignedGrades,
            'subjects' => self::SUBJECTS,
            'terms' => self::TERMS,
            'school_years' => config('school.school_years', []),
            'grade_levels' => $assignedGrades,
            'filters' => [
                'grade_level' => $request->input('grade_level'),
                'subject' => $request->input('subject'),
                'term' => $request->input('term'),
                'school_year' => $request->input('school_year'),
                'gender' => $request->input('gender'),
                'status' => $request->input('status'),
                'search' => $request->input('search'),
            ],
        ]);
    }

    public function generatePdf(Request $request)
    {
        Gate::authorize('report.view');
        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->values()->all();
        $reportType = $request->input('report_type');
        $grade = $request->input('grade_level');
        $subject = $request->input('subject');
        $term = $request->input('term'); // UI name; stored/query column is trimester.
        $schoolYear = $request->input('school_year');
        $gender = $request->input('gender');
        $status = $request->input('status');
        $search = $request->input('search');
        $types = ['assignment_completion', 'quiz_performance', 'student_progress', 'lesson_completion', 'game_participation', 'student_information'];

        if (!in_array($reportType, $types, true) || ($grade !== null && $grade !== '' && !in_array($grade, $assignedGrades, true))
            || ($subject !== null && $subject !== '' && !in_array($subject, self::SUBJECTS, true))
            || ($term !== null && $term !== '' && !in_array($term, self::TERMS, true))
            || ($schoolYear !== null && $schoolYear !== '' && !in_array($schoolYear, config('school.school_years', []), true))
            || ($gender !== null && $gender !== '' && !in_array($gender, ['male', 'female'], true))
            || ($status !== null && $status !== '' && !in_array($status, ['active', 'inactive'], true))
            || ($search !== null && strlen($search) > 255)) {
            return redirect()->back()->with('error', 'Invalid report filters.');
        }

        $title = $reportType === 'student_information'
            ? 'Student Information Report'
            : ucwords(str_replace('_', ' ', $reportType)) . ' Report';

        if ($reportType === 'student_information') {
            $students = User::role('student')
                ->whereIn('grade_level', $assignedGrades)
                ->whereHas('enrollments', function ($query) use ($schoolYear) {
                    $query->where('status', 'active')
                        ->when($schoolYear, fn ($q) => $q->where('school_year', $schoolYear));
                })
                ->when($grade, fn ($q) => $q->where('grade_level', $grade))
                ->when($gender, fn ($q) => $q->where('gender', $gender))
                ->when($status === 'active', fn ($q) => $q->where('is_active', true))
                ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
                ->when($search, fn ($q) => $q->where(fn ($nested) => $nested
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")))
                ->with('currentEnrollment')
                ->orderBy('name')
                ->get();
        } else {
            $students = User::role('student')->whereIn('grade_level', $assignedGrades)
                ->when($grade, fn ($q) => $q->where('grade_level', $grade))->get();
        }

        $report = match ($reportType) {
            'assignment_completion' => $this->assignmentReport($user, $students, $subject, $term),
            'quiz_performance' => $this->quizReport($user, $students, $subject, $term),
            'student_progress' => $this->progressReport($user, $students, $subject, $term),
            'lesson_completion' => $this->lessonReport($user, $students, $subject, $term),
            'game_participation' => $this->gameReport($user, $students),
            'student_information' => $this->studentInformationReport($students),
        };

        $export = ReportExport::create([
            'user_id' => $user->id, 'report_type' => $title, 'grade_level' => $grade ?: null,
            'subject' => $reportType === 'student_information' ? null : ($subject ?: null),
            'trimester' => $reportType === 'student_information' ? null : ($term ?: null), 'generated_at' => now(),
            'file_path' => null, 'file_name' => $title . '_' . now()->format('Y-m-d') . '.pdf',
        ]);
        app(StudyNestNotificationService::class)->reportGenerated($user, $title, $export->id);
        $pdf = Pdf::loadView('pdf.teacher-report', [
            'reportTitle' => $title, 'data' => $report['data'], 'summary' => $report['summary'],
            'filters' => [
                'grade_level' => $grade, 'subject' => $reportType === 'student_information' ? null : $subject,
                'term' => $reportType === 'student_information' ? null : $term,
                'school_year' => $reportType === 'student_information' ? $schoolYear : null,
                'gender' => $reportType === 'student_information' ? $gender : null,
                'status' => $reportType === 'student_information' ? $status : null,
                'search' => $reportType === 'student_information' ? $search : null,
            ],
            'generatedAt' => now()->format('Y-m-d H:i'),
        ]);
        return $pdf->download($title . '_' . now()->format('Y-m-d') . '.pdf');
    }

    private function studentInformationReport($students): array
    {
        $data = $students->map(function ($student) {
            $parts = preg_split('/\s+/', trim($student->name), -1, PREG_SPLIT_NO_EMPTY);
            $firstName = $parts[0] ?? '';
            $lastName = count($parts) > 1 ? array_pop($parts) : '';

            return [
                'student_id' => $student->lrn,
                'last_name' => $lastName,
                'first_name' => $firstName,
                'middle_name' => implode(' ', array_slice($parts, 1)),
                'grade_level' => $student->grade_level,
                'school_year' => $student->currentEnrollment?->school_year ?? '',
                'gender' => ucfirst($student->gender ?? ''),
                'account_status' => $student->is_active ? 'Active' : 'Inactive',
            ];
        });

        return [
            'data' => $data->all(),
            'summary' => ['total_students' => $data->count()],
        ];
    }

    private function assignmentReport($user, $students, ?string $subject, ?string $term): array
    {
        $items = Assignment::where('teacher_id', $user->id)->where('status', 'published')
            ->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $data = $items->map(function ($item) use ($students) {
            $eligible = $students->where('grade_level', $item->grade_level); $ids = $eligible->pluck('id'); $total = $ids->count();
            $completed = AssignmentSubmission::where('assignment_id', $item->id)->whereIn('student_id', $ids)
                ->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])->count();
            return ['assignment' => $item->assignment_title, 'grade' => $item->grade_level, 'subject' => $item->subject, 'total_students' => $total, 'completed' => $completed, 'incomplete' => max(0, $total - $completed), 'completion_rate' => $total ? round($completed / $total * 100) : 0];
        });
        return ['data' => $data->all(), 'summary' => ['total_assignments' => $items->count(), 'average_completion_rate' => $data->avg('completion_rate') ?? 0, 'total_students' => $students->count(), 'total_completed' => $data->sum('completed')]];
    }

    private function quizReport($user, $students, ?string $subject, ?string $term): array
    {
        $items = Quiz::where('teacher_id', $user->id)->where('status', 'published')
            ->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $data = $items->map(function ($item) use ($students) {
            $eligible = $students->where('grade_level', $item->grade_level); $ids = $eligible->pluck('id');
            $attempts = QuizAttempt::where('quiz_id', $item->id)->whereIn('student_id', $ids)->where('status', 'completed')
                ->orderBy('attempt_number')->orderBy('created_at')->get()->groupBy('student_id')->map(fn ($rows) => $rows->first())->values()
                ->map(fn ($a) => (object) ['percentage' => $a->total_questions > 0 ? round($a->score / $a->total_questions * 100) : 0]);
            return ['quiz' => $item->quiz_title, 'grade' => $item->grade_level, 'subject' => $item->subject, 'total_students' => $ids->count(), 'attempts' => $attempts->count(), 'average_score' => $attempts->avg('percentage') ?? 0, 'highest_score' => $attempts->max('percentage') ?? 0, 'lowest_score' => $attempts->min('percentage') ?? 0, 'passing_rate' => $attempts->count() ? round($attempts->where('percentage', '>=', 75)->count() / $attempts->count() * 100) : 0];
        });
        return ['data' => $data->all(), 'summary' => ['total_quizzes' => $items->count(), 'average_score' => $data->avg('average_score') ?? 0, 'highest_performing_quiz' => $data->sortByDesc('average_score')->first()['quiz'] ?? 'N/A', 'lowest_performing_quiz' => $data->sortBy('average_score')->first()['quiz'] ?? 'N/A']];
    }

    private function progressReport($user, $students, ?string $subject, ?string $term): array
    {
        $lessons = Lesson::where('teacher_id', $user->id)->where('status', 'published')->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $assignments = Assignment::where('teacher_id', $user->id)->where('status', 'published')->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $quizzes = Quiz::where('teacher_id', $user->id)->where('status', 'published')->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $games = Game::where('teacher_id', $user->id)->where('status', 'published')->get();
        $data = $students->map(fn ($student) => $this->studentProgress($student, $lessons, $assignments, $quizzes, $games));
        return ['data' => $data->all(), 'summary' => ['total_students' => $students->count(), 'average_progress' => $data->avg('overall_progress') ?? 0]];
    }

    private function studentProgress($student, $lessons, $assignments, $quizzes, $games): array
    {
        $lessons = $lessons->where('grade_level', $student->grade_level); $assignments = $assignments->where('grade_level', $student->grade_level); $quizzes = $quizzes->where('grade_level', $student->grade_level); $games = $games->where('grade_level', $student->grade_level);
        $lt = $lessons->count(); $at = $assignments->count(); $qt = $quizzes->count(); $gt = $games->count();
        $lc = $student->completedLessons()->whereIn('lesson_id', $lessons->pluck('id'))->count();
        $ac = AssignmentSubmission::where('student_id', $student->id)->whereIn('assignment_id', $assignments->pluck('id'))->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])->count();
        $attempts = QuizAttempt::where('student_id', $student->id)->whereIn('quiz_id', $quizzes->pluck('id'))->where('status', 'completed')->orderBy('attempt_number')->orderBy('created_at')->get()->groupBy('quiz_id')->map(fn ($rows) => $rows->first())->values();
        $scores = $attempts->map(fn ($a) => $a->total_questions > 0 ? $a->score / $a->total_questions * 100 : 0); $avg = $scores->isNotEmpty() ? round($scores->avg()) : 0;
        $gc = GameResult::where('student_id', $student->id)->whereIn('game_id', $games->pluck('id'))->where('status', 'completed')->distinct('game_id')->count('game_id');
        $lp = $lt ? min(100, $lc / $lt * 100) : 0; $ap = $at ? min(100, $ac / $at * 100) : 0; $qp = $qt ? min(100, $attempts->count() / $qt * 100) : 0; $gp = $gt ? min(100, $gc / $gt * 100) : 0;
        $overall = min(100, round($lp * .3 + $ap * .3 + $qp * .3 + $gp * .1));
        return ['student' => $student->name, 'student_id' => $student->lrn, 'grade' => $student->grade_level, 'lessons' => "$lc/$lt", 'assignments' => "$ac/$at", 'quiz_average' => "$avg%", 'games' => "$gc/$gt", 'overall_progress' => $overall, 'status' => $overall < 60 ? 'Needs Support' : ($overall < 80 ? 'Needs Monitoring' : 'Excellent')];
    }

    private function lessonReport($user, $students, ?string $subject, ?string $term): array
    {
        $items = Lesson::where('teacher_id', $user->id)->where('status', 'published')->when($subject, fn ($q) => $q->where('subject', $subject))->when($term, fn ($q) => $q->where('trimester', $term))->get();
        $data = $items->map(function ($item) use ($students) { $eligible = $students->where('grade_level', $item->grade_level); $total = $eligible->count(); $completed = $eligible->filter(fn ($s) => $s->completedLessons()->where('lesson_id', $item->id)->exists())->count(); return ['lesson' => $item->lesson_title, 'grade' => $item->grade_level, 'subject' => $item->subject, 'total_students' => $total, 'completed' => $completed, 'incomplete' => max(0, $total - $completed), 'completion_rate' => $total ? round($completed / $total * 100) : 0]; });
        return ['data' => $data->all(), 'summary' => ['total_lessons' => $items->count(), 'average_completion_rate' => $data->avg('completion_rate') ?? 0, 'total_completed' => $data->sum('completed')]];
    }

    private function gameReport($user, $students): array
    {
        $items = Game::where('teacher_id', $user->id)->where('status', 'published')->get();
        $data = $items->map(function ($item) use ($students) { $eligible = $students->where('grade_level', $item->grade_level); $ids = $eligible->pluck('id'); $results = GameResult::where('game_id', $item->id)->whereIn('student_id', $ids)->get(); $completed = $results->where('status', 'completed')->pluck('student_id')->unique()->count(); $started = $results->where('status', 'started')->pluck('student_id')->unique()->count(); $assigned = $results->where('status', 'assigned')->pluck('student_id')->unique()->count(); $scores = $results->where('status', 'completed')->groupBy('student_id')->map(fn ($rows) => $rows->sortBy('attempt_number')->first()->score); return ['game' => $item->game_title, 'grade' => $item->grade_level, 'game_type' => $item->game_type, 'total_students' => $ids->count(), 'completed' => $completed, 'started' => $started, 'assigned' => $assigned, 'participation_rate' => $ids->count() ? round($completed / $ids->count() * 100) : 0, 'average_score' => $scores->avg() ?? 0, 'highest_score' => $scores->max() ?? 0, 'lowest_score' => $scores->min() ?? 0]; });
        return ['data' => $data->all(), 'summary' => ['total_games' => $items->count(), 'average_participation_rate' => $data->avg('participation_rate') ?? 0, 'total_participants' => $data->sum('completed')]];
    }
}
