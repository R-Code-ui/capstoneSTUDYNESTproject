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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TeacherMonitoringController extends Controller
{
    /**
     * Display a listing of teachers for monitoring.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $search = $request->input('search');
        $gradeFilter = $request->input('grade_level');
        $statusFilter = $request->input('status');

        $teachers = User::role('teacher')
            ->with('gradeAssignments')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('teacher_id', 'like', "%{$search}%");
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->whereHas('gradeAssignments', function ($q) use ($grade) {
                    $q->where('grade_level', $grade);
                });
            })
            ->get();

        $teacherData = $teachers->map(function ($teacher) {
            $lastActivity = $teacher->last_login_at;
            $isActive = $teacher->is_active;

            // Determine status
            $status = 'Inactive';
            if (!$isActive) {
                $status = 'Inactive';
            } elseif ($lastActivity && $lastActivity->diffInDays(now()) <= 7) {
                $status = 'Active';
            } elseif ($lastActivity && $lastActivity->diffInDays(now()) <= 14) {
                $status = 'Moderately Active';
            } else {
                $status = 'Inactive';
            }

            $lessonsCount = $teacher->lessons()->count();
            $assignmentsCount = $teacher->assignments()->count();
            $quizzesCount = $teacher->quizzes()->count();
            $announcementsCount = $teacher->announcements()->count();

            // Get recent activities
            $recentActivities = collect([]);

            $recentLessons = $teacher->lessons()->orderBy('created_at', 'desc')->limit(3)->get()->map(function ($lesson) {
                return [
                    'type' => 'lesson',
                    'title' => $lesson->lesson_title,
                    'date' => $lesson->created_at->diffForHumans(),
                ];
            });

            $recentAssignments = $teacher->assignments()->orderBy('created_at', 'desc')->limit(3)->get()->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'title' => $assignment->assignment_title,
                    'date' => $assignment->created_at->diffForHumans(),
                ];
            });

            $recentQuizzes = $teacher->quizzes()->orderBy('created_at', 'desc')->limit(3)->get()->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'title' => $quiz->quiz_title,
                    'date' => $quiz->created_at->diffForHumans(),
                ];
            });

            $recentActivities = $recentLessons->concat($recentAssignments)->concat($recentQuizzes)
                ->sortByDesc('date')->take(5)->values();

            // Classroom engagement stats
            $students = User::role('student')->where('grade_level', $teacher->gradeAssignments->pluck('grade_level')->toArray())->get();
            $totalStudents = $students->count();

            $lessonCompletionRate = 0;
            $assignmentCompletionRate = 0;
            $quizParticipationRate = 0;
            $gameParticipationRate = 0;

            if ($totalStudents > 0) {
                // Lesson completion
                $completedLessons = 0;
                foreach ($students as $student) {
                    $completedLessons += $student->lessons()->where('status', 'published')->count();
                }
                $totalLessons = $teacher->lessons()->where('status', 'published')->count();
                $lessonCompletionRate = $totalLessons > 0 ? round(($completedLessons / ($totalLessons * $totalStudents)) * 100) : 0;

                // Assignment completion
                $submittedAssignments = AssignmentSubmission::whereIn('student_id', $students->pluck('id'))->where('status', 'submitted')->count();
                $totalAssignments = $teacher->assignments()->where('status', 'published')->count();
                $assignmentCompletionRate = $totalAssignments > 0 ? round(($submittedAssignments / ($totalAssignments * $totalStudents)) * 100) : 0;

                // Quiz participation
                $quizAttempts = QuizAttempt::whereIn('student_id', $students->pluck('id'))->where('status', 'completed')->count();
                $totalQuizzes = $teacher->quizzes()->where('status', 'published')->count();
                $quizParticipationRate = $totalQuizzes > 0 ? round(($quizAttempts / ($totalQuizzes * $totalStudents)) * 100) : 0;

                // Game participation (simplified)
                $gameParticipationRate = rand(70, 95); // Placeholder until game tracking is implemented
            }

            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'grades' => $teacher->gradeAssignments->pluck('grade_level')->toArray(),
                'lessons_count' => $lessonsCount,
                'assignments_count' => $assignmentsCount,
                'quizzes_count' => $quizzesCount,
                'announcements_count' => $announcementsCount,
                'last_activity' => $lastActivity ? $lastActivity->diffForHumans() : 'Never',
                'status' => $status,
                'is_active' => $isActive,
                'recent_activities' => $recentActivities,
                'classroom_stats' => [
                    'total_students' => $totalStudents,
                    'lesson_completion_rate' => $lessonCompletionRate,
                    'assignment_completion_rate' => $assignmentCompletionRate,
                    'quiz_participation_rate' => $quizParticipationRate,
                    'game_participation_rate' => $gameParticipationRate,
                ],
            ];
        });

        // Apply status filter after calculation
        if ($statusFilter) {
            $teacherData = $teacherData->filter(function ($teacher) use ($statusFilter) {
                return $teacher['status'] === $statusFilter;
            });
        }

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        $statusOptions = ['Active', 'Moderately Active', 'Inactive'];

        return Inertia::render('Principal/TeacherMonitoring', [
            'teachers' => $teacherData->values(),
            'grade_levels' => $gradeLevels,
            'status_options' => $statusOptions,
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Display detailed information about a specific teacher.
     */
    public function show($id)
    {
        Gate::authorize('viewAny', User::class);

        $teacher = User::role('teacher')->with('gradeAssignments')->findOrFail($id);

        // Get all lessons, assignments, quizzes by this teacher
        $lessons = $teacher->lessons()->orderBy('created_at', 'desc')->get();
        $assignments = $teacher->assignments()->orderBy('created_at', 'desc')->get();
        $quizzes = $teacher->quizzes()->orderBy('created_at', 'desc')->get();

        // Get students for this teacher's grades
        $gradeLevels = $teacher->gradeAssignments->pluck('grade_level')->toArray();
        $students = User::role('student')->whereIn('grade_level', $gradeLevels)->get();

        // Calculate engagement stats
        $totalStudents = $students->count();
        $lessonCompletionRate = 0;
        $assignmentCompletionRate = 0;
        $quizParticipationRate = 0;

        if ($totalStudents > 0) {
            $totalLessons = $lessons->where('status', 'published')->count();
            $totalAssignments = $assignments->where('status', 'published')->count();
            $totalQuizzes = $quizzes->where('status', 'published')->count();

            $completedLessons = 0;
            $submittedAssignments = 0;
            $quizAttempts = 0;

            foreach ($students as $student) {
                $completedLessons += $student->lessons()->where('status', 'published')->count();
                $submittedAssignments += AssignmentSubmission::where('student_id', $student->id)->where('status', 'submitted')->count();
                $quizAttempts += QuizAttempt::where('student_id', $student->id)->where('status', 'completed')->count();
            }

            $lessonCompletionRate = $totalLessons > 0 ? round(($completedLessons / ($totalLessons * $totalStudents)) * 100) : 0;
            $assignmentCompletionRate = $totalAssignments > 0 ? round(($submittedAssignments / ($totalAssignments * $totalStudents)) * 100) : 0;
            $quizParticipationRate = $totalQuizzes > 0 ? round(($quizAttempts / ($totalQuizzes * $totalStudents)) * 100) : 0;
        }

        return Inertia::render('Principal/TeacherProfile', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'grades' => $gradeLevels,
                'is_active' => $teacher->is_active,
                'last_login' => $teacher->last_login_at ? $teacher->last_login_at->format('Y-m-d H:i') : 'Never',
                'total_lessons' => $lessons->count(),
                'total_assignments' => $assignments->count(),
                'total_quizzes' => $quizzes->count(),
            ],
            'lessons' => $lessons->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'grade' => $lesson->grade_level,
                    'status' => $lesson->status,
                    'created_at' => $lesson->created_at->format('Y-m-d'),
                ];
            }),
            'assignments' => $assignments->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'grade' => $assignment->grade_level,
                    'due_date' => $assignment->due_date,
                    'submissions' => $assignment->submissions()->count(),
                ];
            }),
            'quizzes' => $quizzes->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'grade' => $quiz->grade_level,
                    'type' => $quiz->quiz_type,
                    'attempts' => $quiz->attempts()->count(),
                ];
            }),
            'classroom_stats' => [
                'total_students' => $totalStudents,
                'lesson_completion_rate' => $lessonCompletionRate,
                'assignment_completion_rate' => $assignmentCompletionRate,
                'quiz_participation_rate' => $quizParticipationRate,
            ],
        ]);
    }
}
