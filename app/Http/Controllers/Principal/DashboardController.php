<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Announcement;
use App\Models\TeacherGradeAssignment;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the principal dashboard.
     */
    public function index()
    {
        Gate::authorize('viewAny', User::class);

        // School Overview Statistics
        $totalTeachers = User::role('teacher')->count();
        $totalStudents = User::role('student')->count();
        $totalLessons = Lesson::count();
        $totalAssignments = Assignment::count();
        $totalQuizzes = Quiz::count();
        $totalAnnouncements = Announcement::count();

        // Teacher Activity Summary
        $teachers = User::role('teacher')->with('gradeAssignments')->get();
        $teacherActivity = $teachers->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'grades' => $teacher->gradeAssignments->pluck('grade_level')->toArray(),
                'lessons_count' => $teacher->lessons()->count(),
                'assignments_count' => $teacher->assignments()->count(),
                'quizzes_count' => $teacher->quizzes()->count(),
                'last_activity' => $teacher->last_login_at ? $teacher->last_login_at->diffForHumans() : 'Never',
                'is_active' => $teacher->is_active,
            ];
        });

        // Student Participation Overview
        $students = User::role('student')->get();
        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        $studentParticipation = collect($gradeLevels)->map(function ($grade) use ($students) {
            $gradeStudents = $students->where('grade_level', $grade);
            $total = $gradeStudents->count();
            $active = $gradeStudents->filter(function ($student) {
                return $student->assignmentSubmissions()->where('status', 'submitted')->count() > 0 ||
                       $student->quizAttempts()->where('status', 'completed')->count() > 0;
            })->count();

            return [
                'grade_level' => $grade,
                'total_students' => $total,
                'active_students' => $active,
                'participation_rate' => $total > 0 ? round(($active / $total) * 100) : 0,
            ];
        });

        // Most Active Teacher
        $mostActive = $teacherActivity->sortByDesc(function ($teacher) {
            return $teacher['lessons_count'] + $teacher['assignments_count'] + $teacher['quizzes_count'];
        })->first();

        // Teachers Without Activity (no activity in last 7 days)
        $inactiveTeachers = $teacherActivity->filter(function ($teacher) {
            return $teacher['last_activity'] === 'Never' || str_contains($teacher['last_activity'], 'week') || str_contains($teacher['last_activity'], 'month');
        })->count();

        // Recent Teacher Activities (Latest 10)
        $recentActivities = collect([]);
        $allLessons = Lesson::with('teacher')->orderBy('created_at', 'desc')->limit(5)->get();
        $allAssignments = Assignment::with('teacher')->orderBy('created_at', 'desc')->limit(5)->get();
        $allQuizzes = Quiz::with('teacher')->orderBy('created_at', 'desc')->limit(5)->get();

        $recentActivities = $allLessons->map(function ($lesson) {
            return [
                'type' => 'lesson',
                'teacher' => $lesson->teacher->name ?? 'Unknown',
                'action' => 'published lesson: ' . $lesson->lesson_title,
                'date' => $lesson->created_at->diffForHumans(),
            ];
        })->concat($allAssignments->map(function ($assignment) {
            return [
                'type' => 'assignment',
                'teacher' => $assignment->teacher->name ?? 'Unknown',
                'action' => 'created assignment: ' . $assignment->assignment_title,
                'date' => $assignment->created_at->diffForHumans(),
            ];
        }))->concat($allQuizzes->map(function ($quiz) {
            return [
                'type' => 'quiz',
                'teacher' => $quiz->teacher->name ?? 'Unknown',
                'action' => 'created quiz: ' . $quiz->quiz_title,
                'date' => $quiz->created_at->diffForHumans(),
            ];
        }))->sortByDesc('date')->take(10)->values();

        // Recent Announcements (Latest 5)
        $recentAnnouncements = Announcement::with('user')
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'posted_by' => $announcement->user->name ?? 'Unknown',
                    'date' => $announcement->created_at->diffForHumans(),
                ];
            });

        // Academic Summary
        $totalStudentsCount = $totalStudents > 0 ? $totalStudents : 1;
        $totalLessonsCount = $totalLessons > 0 ? $totalLessons : 1;

        $averageQuizScore = 0;
        $assignmentCompletionRate = 0;
        $lessonCompletionRate = 0;

        // Calculate averages from existing data
        $allQuizAttempts = \App\Models\QuizAttempt::all();
        if ($allQuizAttempts->count() > 0) {
            $averageQuizScore = round($allQuizAttempts->avg('score') ?? 0);
        }

        $allSubmissions = \App\Models\AssignmentSubmission::all();
        $totalAssignmentsCount = $totalAssignments > 0 ? $totalAssignments : 1;
        if ($allSubmissions->count() > 0) {
            $assignmentCompletionRate = round(($allSubmissions->where('status', 'submitted')->count() / ($allSubmissions->count() + 1)) * 100);
        }

        $lessonCompletionRate = $totalLessonsCount > 0 ? round(($totalStudentsCount / ($totalLessonsCount + 1)) * 100) : 0;

        return Inertia::render('Principal/Dashboard', [
            'stats' => [
                'total_teachers' => $totalTeachers,
                'total_students' => $totalStudents,
                'total_lessons' => $totalLessons,
                'total_assignments' => $totalAssignments,
                'total_quizzes' => $totalQuizzes,
                'total_announcements' => $totalAnnouncements,
            ],
            'teacher_activity' => $teacherActivity,
            'student_participation' => $studentParticipation,
            'most_active_teacher' => $mostActive,
            'inactive_teachers_count' => $inactiveTeachers,
            'recent_activities' => $recentActivities,
            'recent_announcements' => $recentAnnouncements,
            'academic_summary' => [
                'average_quiz_score' => $averageQuizScore,
                'assignment_completion_rate' => $assignmentCompletionRate,
                'lesson_completion_rate' => $lessonCompletionRate,
            ],
        ]);
    }
}
