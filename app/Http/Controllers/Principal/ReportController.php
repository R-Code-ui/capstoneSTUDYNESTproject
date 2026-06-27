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
        $teachers = User::role('teacher')->select('id', 'name', 'teacher_id')->get();
        $trimesters = ['All Trimesters', '1st Trimester', '2nd Trimester', '3rd Trimester'];

        // Pull any report result that was flashed from the generate method
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
            'school_year' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'teacher_id'   => 'nullable|exists:users,id',
            'trimester'    => 'nullable|string',
            // Date fields removed entirely
        ]);

        $reportType  = $validated['report_type'];
        $gradeLevel = $validated['grade_level'] ?? null;
        $teacherId  = $validated['teacher_id'] ?? null;
        $trimester  = $validated['trimester'] ?? null;
        $schoolYear = $validated['school_year'] ?? 'SY 2026-2027';

        // Generate the appropriate report data
        $reportData = [];
        $reportTitle = '';

        switch ($reportType) {
            case 'teacher_activity':
                $reportTitle = 'Teacher Activity Report';
                $reportData = $this->generateTeacherActivityReport($schoolYear, $gradeLevel, $trimester);
                break;
            case 'student_participation':
                $reportTitle = 'Student Participation Report';
                $reportData = $this->generateStudentParticipationReport($schoolYear, $gradeLevel, $trimester);
                break;
            case 'school_summary':
                $reportTitle = 'School Activity Summary Report';
                $reportData = $this->generateSchoolSummaryReport($schoolYear);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid report type.');
        }

        // Save the export record
        $reportExport = ReportExport::create([
            'user_id' => auth()->id(),
            'report_type' => $reportTitle,
            'grade_level' => $gradeLevel,
            'subject' => null,
            'trimester' => $trimester,
            'generated_at' => now(),
            'file_path' => null,
            'file_name' => $reportTitle . '_' . now()->format('Y-m-d'),
        ]);

        // Store the full report data for later PDF export
        session(['report_data_' . $reportExport->id => $reportData]);

        // Redirect to index with the result flashed in the session
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
    private function generateTeacherActivityReport($schoolYear, $gradeLevel, $trimester)
    {
        $teachers = User::role('teacher')
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->whereHas('gradeAssignments', function ($q) use ($gradeLevel) {
                    $q->where('grade_level', $gradeLevel);
                });
            })
            ->get();

        $data = $teachers->map(function ($teacher) {
            $lessons = $teacher->lessons()->count();
            $assignments = $teacher->assignments()->count();
            $quizzes = $teacher->quizzes()->count();
            $announcements = $teacher->announcements()->count();

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
    private function generateStudentParticipationReport($schoolYear, $gradeLevel, $trimester)
    {
        $students = User::role('student')
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

            foreach ($gradeStudents as $student) {
                $completedLessons += $student->lessons()->where('status', 'published')->count();
                $submittedAssignments += AssignmentSubmission::where('student_id', $student->id)->where('status', 'submitted')->count();
                $completedQuizzes += QuizAttempt::where('student_id', $student->id)->where('status', 'completed')->count();
            }

            $totalLessons = Lesson::where('grade_level', $grade)->where('status', 'published')->count();
            $totalAssignments = Assignment::where('grade_level', $grade)->where('status', 'published')->count();
            $totalQuizzes = Quiz::where('grade_level', $grade)->where('status', 'published')->count();

            return [
                'grade'                 => $grade,
                'total_students'        => $total,
                'lesson_completion'     => ($total > 0 && $totalLessons > 0) ? round(($completedLessons / ($totalLessons * max($total, 1))) * 100) : 0,
                'quiz_participation'    => ($total > 0 && $totalQuizzes > 0) ? round(($completedQuizzes / ($totalQuizzes * max($total, 1))) * 100) : 0,
                'assignment_completion' => ($total > 0 && $totalAssignments > 0) ? round(($submittedAssignments / ($totalAssignments * max($total, 1))) * 100) : 0,
            ];
        })->values();

        $allParticipants = $students->filter(function ($student) {
            return $student->assignmentSubmissions()->where('status', 'submitted')->count() > 0 ||
                $student->quizAttempts()->where('status', 'completed')->count() > 0;
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
    private function generateSchoolSummaryReport($schoolYear)
    {
        $totalTeachers = User::role('teacher')->count();
        $totalStudents = User::role('student')->count();
        $totalLessons = Lesson::count();
        $totalAssignments = Assignment::count();
        $totalQuizzes = Quiz::count();
        $totalAnnouncements = Announcement::count();

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

        $report = ReportExport::findOrFail($reportId);

        $reportData = session('report_data_' . $reportId);

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

        $report = ReportExport::findOrFail($reportId);

        $reportData = session('report_data_' . $reportId);

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
