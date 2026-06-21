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
use App\Models\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $gradeLevels = ['All Grades', 'Grade 4', 'Grade 5', 'Grade 6'];
        $teachers = User::role('teacher')->select('id', 'name', 'teacher_id')->get();
        $trimesters = ['All Trimesters', '1st Trimester', '2nd Trimester', '3rd Trimester'];

        // Reports history
        $reportHistory = ReportExport::where('user_id', auth()->id())
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
                    'file_path' => $report->file_path,
                ];
            });

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
            'report_history' => $reportHistory,
            'filters' => [
                'school_year' => $schoolYear,
                'grade_level' => $gradeLevel,
                'teacher_id' => $teacherId,
                'trimester' => $trimester,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Generate a report.
     */
    public function generate(Request $request)
    {
        Gate::authorize('report.view');

        $validated = $request->validate([
            'report_type' => 'required|in:teacher_activity,student_participation,assignment_completion,quiz_performance,school_summary',
            'school_year' => 'nullable|string',
            'grade_level' => 'nullable|string',
            'teacher_id' => 'nullable|exists:users,id',
            'trimester' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after:date_from',
            'export_format' => 'nullable|in:print,excel,csv',
        ]);

        $reportType = $validated['report_type'];
        $gradeLevel = $validated['grade_level'] ?? null;
        $teacherId = $validated['teacher_id'] ?? null;
        $trimester = $validated['trimester'] ?? null;
        $schoolYear = $validated['school_year'] ?? 'SY 2026-2027';

        // Generate report data based on type
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
            case 'assignment_completion':
                $reportTitle = 'Assignment Completion Report';
                $reportData = $this->generateAssignmentCompletionReport($schoolYear, $gradeLevel, $trimester);
                break;
            case 'quiz_performance':
                $reportTitle = 'Quiz Performance Report';
                $reportData = $this->generateQuizPerformanceReport($schoolYear, $gradeLevel, $trimester);
                break;
            case 'school_summary':
                $reportTitle = 'School Activity Summary Report';
                $reportData = $this->generateSchoolSummaryReport($schoolYear);
                break;
            default:
                return redirect()->back()->with('error', 'Invalid report type.');
        }

        // Save report export record
        $reportExport = ReportExport::create([
            'user_id' => auth()->id(),
            'report_type' => $reportTitle,
            'grade_level' => $gradeLevel,
            'subject' => null,
            'trimester' => $trimester,
            'generated_at' => now(),
            'file_path' => null,
            'file_name' => $reportTitle . '_' . now()->format('Y-m-d') . '.json',
        ]);

        return Inertia::render('Principal/ReportResults', [
            'report_title' => $reportTitle,
            'report_data' => $reportData,
            'report_id' => $reportExport->id,
            'export_format' => $validated['export_format'] ?? 'print',
            'filters' => $validated,
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
                'teacher' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'lessons' => $lessons,
                'assignments' => $assignments,
                'quizzes' => $quizzes,
                'announcements' => $announcements,
                'last_activity' => $teacher->last_login_at ? $teacher->last_login_at->format('Y-m-d') : 'Never',
            ];
        });

        $totalActive = $teachers->filter(function ($teacher) {
            return $teacher->last_login_at && $teacher->last_login_at->diffInDays(now()) <= 30;
        })->count();

        return [
            'data' => $data,
            'summary' => [
                'total_teachers' => $teachers->count(),
                'active_teachers' => $totalActive,
                'most_active_teacher' => $data->sortByDesc('lessons')->first()['teacher'] ?? 'N/A',
                'total_lessons' => $data->sum('lessons'),
                'total_quizzes' => $data->sum('quizzes'),
                'total_assignments' => $data->sum('assignments'),
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
                'grade' => $grade,
                'total_students' => $total,
                'lesson_completion' => ($total > 0 && $totalLessons > 0) ? round(($completedLessons / ($totalLessons * $total)) * 100) : 0,
                'quiz_participation' => ($total > 0 && $totalQuizzes > 0) ? round(($completedQuizzes / ($totalQuizzes * $total)) * 100) : 0,
                'assignment_completion' => ($total > 0 && $totalAssignments > 0) ? round(($submittedAssignments / ($totalAssignments * $total)) * 100) : 0,
            ];
        });

        $allParticipants = $students->filter(function ($student) {
            return $student->assignmentSubmissions()->where('status', 'submitted')->count() > 0 ||
                $student->quizAttempts()->where('status', 'completed')->count() > 0;
        });

        $highest = $participationData->sortByDesc('assignment_completion')->first();

        return [
            'data' => $participationData,
            'summary' => [
                'total_students' => $students->count(),
                'participating_students' => $allParticipants->count(),
                'average_participation_rate' => $students->count() > 0 ? round(($allParticipants->count() / $students->count()) * 100) : 0,
                'highest_participation_group' => $highest ? $highest['grade'] : 'N/A',
                'lowest_participation_group' => $participationData->sortBy('assignment_completion')->first()['grade'] ?? 'N/A',
            ],
        ];
    }

    /**
     * Generate Assignment Completion Report.
     */
    private function generateAssignmentCompletionReport($schoolYear, $gradeLevel, $trimester)
    {
        $assignments = Assignment::query()
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->where('grade_level', $gradeLevel);
            })
            ->when($trimester && $trimester !== 'All Trimesters', function ($query) use ($trimester) {
                return $query->where('trimester', $trimester);
            })
            ->get();

        $students = User::role('student')
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->where('grade_level', $gradeLevel);
            })
            ->get();

        $data = $assignments->map(function ($assignment) use ($students) {
            $totalStudents = $students->where('grade_level', $assignment->grade_level)->count();
            $submitted = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('status', 'submitted')
                ->count();

            return [
                'assignment' => $assignment->assignment_title,
                'grade' => $assignment->grade_level,
                'total_students' => $totalStudents,
                'completed' => $submitted,
                'incomplete' => $totalStudents - $submitted,
                'completion_rate' => $totalStudents > 0 ? round(($submitted / $totalStudents) * 100) : 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_assignments' => $assignments->count(),
                'average_completion_rate' => $data->avg('completion_rate') ?? 0,
                'total_missing_submissions' => $data->sum('incomplete'),
                'total_completed' => $data->sum('completed'),
            ],
        ];
    }

    /**
     * Generate Quiz Performance Report.
     */
    private function generateQuizPerformanceReport($schoolYear, $gradeLevel, $trimester)
    {
        $quizzes = Quiz::query()
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->where('grade_level', $gradeLevel);
            })
            ->when($trimester && $trimester !== 'All Trimesters', function ($query) use ($trimester) {
                return $query->where('trimester', $trimester);
            })
            ->get();

        $data = $quizzes->map(function ($quiz) {
            $attempts = QuizAttempt::where('quiz_id', $quiz->id)->where('status', 'completed')->get();

            return [
                'quiz' => $quiz->quiz_title,
                'grade' => $quiz->grade_level,
                'total_attempts' => $attempts->count(),
                'average_score' => $attempts->count() > 0 ? round($attempts->avg('score')) : 0,
                'highest_score' => $attempts->count() > 0 ? $attempts->max('score') : 0,
                'lowest_score' => $attempts->count() > 0 ? $attempts->min('score') : 0,
                'passing_rate' => $attempts->count() > 0 ? round(($attempts->filter(function ($attempt) {
                    return $attempt->score >= 75;
                })->count() / $attempts->count()) * 100) : 0,
            ];
        });

        return [
            'data' => $data,
            'summary' => [
                'total_quizzes' => $quizzes->count(),
                'average_school_score' => $data->avg('average_score') ?? 0,
                'highest_performing_quiz' => $data->sortByDesc('average_score')->first()['quiz'] ?? 'N/A',
                'lowest_performing_quiz' => $data->sortBy('average_score')->first()['quiz'] ?? 'N/A',
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
            'summary' => [
                'total_teachers' => $totalTeachers,
                'total_students' => $totalStudents,
                'total_lessons' => $totalLessons,
                'total_assignments' => $totalAssignments,
                'total_quizzes' => $totalQuizzes,
                'total_announcements' => $totalAnnouncements,
                'school_year' => $schoolYear,
                'generated_at' => now()->format('Y-m-d H:i'),
            ],
        ];
    }
}
