<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Announcement;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use App\Models\GameResult;
use App\Models\ReportExport;
use App\Services\StudyNestNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        Gate::authorize('report.view');

        $schoolYear = $request->input('school_year', 'SY 2026-2027');
        $gradeLevel = $request->input('grade_level');
        $teacherId = $request->input('teacher_id');
        $trimester = $request->input('trimester');

        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $gradeLevels = ['All Grades', 'Grade 4', 'Grade 5', 'Grade 6'];
        $teachers = User::role('teacher')->select('id', 'name', 'teacher_id')
            ->paginate(10);
        $trimesters = ['All Terms', '1st Term', '2nd Term', '3rd Term']; // ✅ CHANGED

        $reportTitle = session('report_title');
        $reportData = session('report_data');
        $reportId = session('report_id');
        $showResults = session('show_results', false);

        return Inertia::render('Principal/Reports', [
            'school_years' => $schoolYears,
            'grade_levels' => $gradeLevels,
            'teachers' => $teachers->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'teacher_id' => $teacher->teacher_id,
                ];
            }),
            'trimesters' => $trimesters,
            'filters' => [
                'school_year' => $schoolYear,
                'grade_level' => $gradeLevel,
                'teacher_id' => $teacherId,
                'trimester' => $trimester,
            ],
            'report_title' => $reportTitle,
            'report_data' => $reportData,
            'report_id' => $reportId,
            'show_results' => $showResults,
            'pagination' => $teachers->toArray(),
        ]);
    }

    /**
     * Generate a report.
     */
    public function generate(Request $request)
    {
        Gate::authorize('report.view');

        $validated = $request->validate([
            'report_type' => 'required|in:teacher_activity,student_participation,school_summary',
            'school_year' => 'nullable|in:SY 2026-2027,SY 2027-2028',
            'grade_level' => 'nullable|in:All Grades,Grade 4,Grade 5,Grade 6',
            'teacher_id'   => 'nullable|exists:users,id',
            'trimester'    => 'nullable|in:All Terms,1st Term,2nd Term,3rd Term',
        ]);

        $reportType  = $validated['report_type'];
        $gradeLevel = $validated['grade_level'] ?? null;
        $teacherId  = $validated['teacher_id'] ?? null;
        $trimester  = $validated['trimester'] ?? null;
        $schoolYear = $validated['school_year'] ?? 'SY 2026-2027';

        $reportData = [];
        $reportTitle = '';

        switch ($reportType) {
            case 'teacher_activity':
                $reportTitle = 'Teacher Activity Report';
                $reportData = $this->generateTeacherActivityReport($schoolYear, $gradeLevel, $trimester, $teacherId);
                break;
            case 'student_participation':
                $reportTitle = 'Student Participation Report';
                $reportData = $this->generateStudentParticipationReport($schoolYear, $gradeLevel, $trimester, $teacherId);
                break;
            case 'school_summary':
                $reportTitle = 'School Activity Summary Report';
                $reportData = $this->generateSchoolSummaryReport($schoolYear, $gradeLevel, $trimester, $teacherId);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid report type.');
        }

        $reportExport = ReportExport::create([
            'user_id' => auth()->id(),
            'report_type' => $reportTitle,
            'grade_level' => $gradeLevel,
            'subject' => null,
            'trimester' => $trimester,
            'generated_at' => now(),
            'file_path' => null,
            'file_name' => $reportTitle . '_' . now()->format('Y-m-d'),
            'data' => $reportData,
        ]);

        app(StudyNestNotificationService::class)->reportGenerated(auth()->user(), $reportTitle, $reportExport->id);

        session(['report_data_' . $reportExport->id => $reportData]);

        return redirect()->route('principal.reports.index')->with([
            'success' => 'Report generated successfully!',
            'report_title' => $reportTitle,
            'report_data' => $reportData,
            'report_id' => $reportExport->id,
            'show_results' => true,
        ]);
    }

    /**
     * Generate Teacher Activity Report.
     */
    private function generateTeacherActivityReport($schoolYear, $gradeLevel, $trimester, $teacherId = null)
    {
        $teachers = User::role('teacher')
            ->when($teacherId, fn ($query) => $query->whereKey($teacherId))
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->whereHas('gradeAssignments', function ($q) use ($gradeLevel) {
                    $q->where('grade_level', $gradeLevel);
                });
            })
            ->get();

        $data = $teachers->map(function ($teacher) use ($schoolYear, $gradeLevel, $trimester) {
            $contentFilter = fn ($query) => $query->where('status', 'published')
                ->where('school_year', $schoolYear)
                ->when($gradeLevel && $gradeLevel !== 'All Grades', fn ($q) => $q->where('grade_level', $gradeLevel))
                ->when($trimester && $trimester !== 'All Terms', fn ($q) => $q->where('trimester', $trimester));
            $lessons = $contentFilter($teacher->lessons())->count();
            $assignments = $contentFilter($teacher->assignments())->count();
            $quizzes = $contentFilter($teacher->quizzes())->count();
            $announcements = $teacher->announcements()->where('status', 'published')->count();

            return [
                'teacher'       => $teacher->name,
                'teacher_id'    => $teacher->teacher_id,
                'lessons'       => $lessons,
                'assignments'   => $assignments,
                'quizzes'       => $quizzes,
                'announcements' => $announcements,
                'last_activity' => $teacher->last_login_at ? $teacher->last_login_at->format('Y-m-d') : 'Never',
            ];
        })->values();

        $totalActive = $teachers->filter(function ($teacher) {
            return $teacher->last_login_at && $teacher->last_login_at->diffInDays(now()) <= 30;
        })->count();

        $totalLessons = $data->sum('lessons');
        $totalQuizzes = $data->sum('quizzes');
        $totalAssignments = $data->sum('assignments');
        $mostActiveTeacher = $data->sortByDesc('lessons')->first();
        $mostActiveName = $mostActiveTeacher ? $mostActiveTeacher['teacher'] : 'N/A';

        return [
            'data' => $data->toArray(),
            'summary' => [
                'total_teachers'      => $teachers->count(),
                'active_teachers'     => $totalActive,
                'most_active_teacher' => $mostActiveName,
                'total_lessons'       => $totalLessons,
                'total_quizzes'       => $totalQuizzes,
                'total_assignments'   => $totalAssignments,
            ],
        ];
    }

    /**
     * Generate Student Participation Report.
     */
    private function generateStudentParticipationReport($schoolYear, $gradeLevel, $trimester, $teacherId = null)
    {
        $students = User::role('student')
            ->where('is_active', true)
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->where('grade_level', $gradeLevel);
            })
            ->get();

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        $participationData = collect($gradeLevels)->map(function ($grade) use ($students) {
            $gradeStudents = $students->where('grade_level', $grade);
            $total = $gradeStudents->count();

            $completedLessons = 0;
            $submittedAssignments = 0;
            $completedQuizzes = 0;

            $lessonQuery = Lesson::where('grade_level', $grade)->where('status', 'published')->where('school_year', $schoolYear);
            $assignmentQuery = Assignment::where('grade_level', $grade)->where('status', 'published')->where('school_year', $schoolYear);
            $quizQuery = Quiz::where('grade_level', $grade)->where('status', 'published')->where('school_year', $schoolYear);

            if ($trimester && $trimester !== 'All Terms') {
                $lessonQuery->where('trimester', $trimester);
                $assignmentQuery->where('trimester', $trimester);
                $quizQuery->where('trimester', $trimester);
            }
            if ($teacherId) {
                $lessonQuery->where('teacher_id', $teacherId);
                $assignmentQuery->where('teacher_id', $teacherId);
                $quizQuery->where('teacher_id', $teacherId);
            }

            $lessonIds = $lessonQuery->pluck('id');
            $assignmentIds = $assignmentQuery->pluck('id');
            $quizIds = $quizQuery->pluck('id');
            $studentIds = $gradeStudents->pluck('id');

            foreach ($gradeStudents as $student) {
                $completedLessons += $student->completedLessons()->whereIn('lesson_id', $lessonIds)->count();
            }
            $submittedAssignments = AssignmentSubmission::whereIn('student_id', $studentIds)
                ->whereIn('assignment_id', $assignmentIds)
                ->whereIn('status', ['submitted', 'late_submission', 'reviewed', 'graded'])
                ->count();
            $completedQuizzes = QuizAttempt::whereIn('student_id', $studentIds)
                ->whereIn('quiz_id', $quizIds)
                ->where('status', 'completed')
                ->count();

            $totalLessons = $lessonIds->count();
            $totalAssignments = $assignmentIds->count();
            $totalQuizzes = $quizIds->count();

            return [
                'grade'                 => $grade,
                'total_students'        => $total,
                'lesson_completion'     => ($total > 0 && $totalLessons > 0) ? round(($completedLessons / ($totalLessons * max($total, 1))) * 100) : 0,
                'quiz_participation'    => ($total > 0 && $totalQuizzes > 0) ? round(($completedQuizzes / ($totalQuizzes * max($total, 1))) * 100) : 0,
                'assignment_completion' => ($total > 0 && $totalAssignments > 0) ? round(($submittedAssignments / ($totalAssignments * max($total, 1))) * 100) : 0,
            ];
        })->values();

        $allParticipants = $students->filter(function ($student) use ($schoolYear, $trimester, $teacherId) {
            $assignmentIds = Assignment::where('status', 'published')
                ->where('school_year', $schoolYear)
                ->when($trimester && $trimester !== 'All Terms', fn ($q) => $q->where('trimester', $trimester))
                ->when($teacherId, fn ($q) => $q->where('teacher_id', $teacherId))
                ->where('grade_level', $student->grade_level)
                ->pluck('id');
            $quizIds = Quiz::where('status', 'published')
                ->where('school_year', $schoolYear)
                ->when($trimester && $trimester !== 'All Terms', fn ($q) => $q->where('trimester', $trimester))
                ->when($teacherId, fn ($q) => $q->where('teacher_id', $teacherId))
                ->where('grade_level', $student->grade_level)
                ->pluck('id');

            return AssignmentSubmission::where('student_id', $student->id)
                ->whereIn('assignment_id', $assignmentIds)
                ->whereIn('status', ['submitted', 'late_submission', 'reviewed', 'graded'])
                ->exists() || QuizAttempt::where('student_id', $student->id)
                ->whereIn('quiz_id', $quizIds)
                ->where('status', 'completed')
                ->exists();
        });

        $highest = $participationData->sortByDesc('assignment_completion')->first();
        $lowest  = $participationData->sortBy('assignment_completion')->first();

        return [
            'data' => $participationData->toArray(),
            'summary' => [
                'total_students'             => $students->count(),
                'participating_students'     => $allParticipants->count(),
                'average_participation_rate'  => $students->count() > 0 ? round(($allParticipants->count() / $students->count()) * 100) : 0,
                'highest_participation_group' => $highest ? $highest['grade'] : 'N/A',
                'lowest_participation_group'  => $lowest ? $lowest['grade'] : 'N/A',
            ],
        ];
    }

    /**
     * Generate School Summary Report.
     */
    private function generateSchoolSummaryReport($schoolYear, $gradeLevel = null, $trimester = null, $teacherId = null)
    {
        $totalTeachers = User::role('teacher')
            ->when($teacherId, fn ($query) => $query->whereKey($teacherId))
            ->when($gradeLevel && $gradeLevel !== 'All Grades', fn ($query) => $query->whereHas('gradeAssignments', fn ($q) => $q->where('grade_level', $gradeLevel)))
            ->count();
        $totalStudents = User::role('student')->where('is_active', true)
            ->when($gradeLevel && $gradeLevel !== 'All Grades', fn ($query) => $query->where('grade_level', $gradeLevel))
            ->count();
        $contentFilter = fn ($query) => $query->where('status', 'published')
            ->where('school_year', $schoolYear)
            ->when($gradeLevel && $gradeLevel !== 'All Grades', fn ($q) => $q->where('grade_level', $gradeLevel))
            ->when($teacherId, fn ($q) => $q->where('teacher_id', $teacherId))
            ->when($trimester && $trimester !== 'All Terms', fn ($q) => $q->where('trimester', $trimester));
        $totalLessons = $contentFilter(Lesson::query())->count();
        $totalAssignments = $contentFilter(Assignment::query())->count();
        $totalQuizzes = $contentFilter(Quiz::query())->count();
        $totalAnnouncements = Announcement::where('status', 'published')
            ->whereDate('publish_date', '<=', now()->toDateString())
            ->where(fn ($q) => $q->whereNull('expiration_date')->orWhereDate('expiration_date', '>=', now()->toDateString()))
            ->count();

        return [
            'data' => [],
            'summary' => [
                'total_teachers'     => $totalTeachers,
                'total_students'     => $totalStudents,
                'total_lessons'      => $totalLessons,
                'total_assignments'  => $totalAssignments,
                'total_quizzes'      => $totalQuizzes,
                'total_announcements' => $totalAnnouncements,
                'school_year'        => $schoolYear,
                'generated_at'       => now()->format('Y-m-d H:i'),
            ],
        ];
    }

    /**
     * Export report as PDF using DomPDF.
     */
    public function exportPdf($reportId)
    {
        Gate::authorize('report.view');

        $report = ReportExport::where('user_id', auth()->id())->findOrFail($reportId);

        $reportData = $report->data ?? session('report_data_' . $reportId);

        if (!$reportData) {
            return redirect()->back()->with('error', 'Report data not found. Please generate the report again.');
        }

        $data = $reportData['data'] ?? [];
        $summary = $reportData['summary'] ?? [];

        if ($data instanceof \Illuminate\Support\Collection) {
            $data = $data->toArray();
        }

        if (empty($data) && empty($summary)) {
            return redirect()->back()->with('error', 'No data available to export.');
        }

        $headers = !empty($data) ? array_keys(reset($data)) : [];

        $pdfData = [
            'report'       => $report,
            'data'         => $data,
            'summary'      => $summary,
            'headers'      => $headers,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        $pdf = Pdf::loadView('pdf.report', $pdfData);
        return $pdf->download($report->file_name . '.pdf');
    }

    /**
     * Display a specific report (detailed view).
     */
    public function show($reportId)
    {
        Gate::authorize('report.view');

        $report = ReportExport::where('user_id', auth()->id())->findOrFail($reportId);

        $reportData = $report->data ?? session('report_data_' . $reportId);

        if (!$reportData) {
            return redirect()->route('principal.reports.index')
                ->with('error', 'Report data not found. Please generate the report again.');
        }

        $data = $reportData['data'] ?? [];
        $summary = $reportData['summary'] ?? [];

        if ($data instanceof \Illuminate\Support\Collection) {
            $data = $data->toArray();
        }

        if (empty($data) && empty($summary)) {
            return redirect()->route('principal.reports.index')
                ->with('error', 'No data available for this report.');
        }

        $headers = !empty($data) ? array_keys(reset($data)) : [];

        return Inertia::render('Principal/ReportShow', [
            'report' => [
                'id'           => $report->id,
                'report_type'  => $report->report_type,
                'grade_level'  => $report->grade_level,
                'trimester'    => $report->trimester,
                'generated_at' => $report->generated_at->format('Y-m-d H:i'),
                'file_name'    => $report->file_name,
            ],
            'data'    => $data,
            'summary' => $summary,
            'headers' => $headers,
        ]);
    }
}
