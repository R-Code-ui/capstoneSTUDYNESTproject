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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('teacher_id', 'like', "%{$search}%");
                });
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->whereHas('gradeAssignments', function ($q) use ($grade) {
                    $q->where('grade_level', $grade);
                });
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('is_active', $status === 'Active');
            })
            ->paginate(10);

        $teacherData = $teachers->map(function ($teacher) {
            $isActive = $teacher->is_active;

            // ✅ Simple, accurate status: Active = account enabled, Inactive = archived
            $status = $isActive ? 'Active' : 'Inactive';

            $lessonsCount = $teacher->lessons()->count();
            $assignmentsCount = $teacher->assignments()->count();
            $quizzesCount = $teacher->quizzes()->count();
            $announcementsCount = $teacher->announcements()->count();

            $recentLessons = $teacher->lessons()->orderBy('created_at', 'desc')->limit(10)->get()->map(function ($lesson) {
                return [
                    'type' => 'lesson',
                    'title' => $lesson->lesson_title,
                    'date' => $lesson->created_at->diffForHumans(),
                    'sort_timestamp' => $lesson->created_at->timestamp,
                ];
            });

            $recentAssignments = $teacher->assignments()->orderBy('created_at', 'desc')->limit(10)->get()->map(function ($assignment) {
                return [
                    'type' => 'assignment',
                    'title' => $assignment->assignment_title,
                    'date' => $assignment->created_at->diffForHumans(),
                    'sort_timestamp' => $assignment->created_at->timestamp,
                ];
            });

            $recentQuizzes = $teacher->quizzes()->orderBy('created_at', 'desc')->limit(10)->get()->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'title' => $quiz->quiz_title,
                    'date' => $quiz->created_at->diffForHumans(),
                    'sort_timestamp' => $quiz->created_at->timestamp,
                ];
            });

            $recentActivities = $recentLessons->concat($recentAssignments)->concat($recentQuizzes)
                ->sortByDesc('sort_timestamp')->take(5)->map(function ($activity) {
                    unset($activity['sort_timestamp']);
                    return $activity;
                })->values();

            $students = User::role('student')
                ->where('is_active', true)
                ->whereIn('grade_level', $teacher->gradeAssignments->pluck('grade_level')->toArray())
                ->get();
            $classroomStats = $this->calculateClassroomStats($teacher, $students);

                // Game participation is not yet implemented in your system – keep as random placeholder or remove

            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'grades' => $teacher->gradeAssignments->pluck('grade_level')->toArray(),
                'lessons_count' => $lessonsCount,
                'assignments_count' => $assignmentsCount,
                'quizzes_count' => $quizzesCount,
                'announcements_count' => $announcementsCount,
                'last_activity' => $teacher->last_login_at ? $teacher->last_login_at->diffForHumans() : 'Never',
                'status' => $status,
                'is_active' => $isActive,
                'recent_activities' => $recentActivities,
                'classroom_stats' => $classroomStats,
            ];
        });

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];
        // Simplified status options matching the new logic
        $statusOptions = ['Active', 'Inactive'];

        return Inertia::render('Principal/TeacherMonitoring', [
            'teachers' => $teacherData->values(),
            'grade_levels' => $gradeLevels,
            'status_options' => $statusOptions,
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeFilter,
                'status' => $statusFilter,
            ],
            'pagination' => $teachers->toArray(),
        ]);
    }

    /**
     * Display detailed information about a specific teacher.
     */
    public function show($id)
    {
        Gate::authorize('viewAny', User::class);

        $teacher = User::role('teacher')->with('gradeAssignments')->findOrFail($id);

        $isActive = $teacher->is_active;
        $status = $isActive ? 'Active' : 'Inactive';

        $perPage = 10;
        $lessons = $teacher->lessons()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'lessons_page')
            ->withQueryString();
        $assignments = $teacher->assignments()
            ->withCount('submissions')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'assignments_page')
            ->withQueryString();
        $quizzes = $teacher->quizzes()
            ->withCount('attempts')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'quizzes_page')
            ->withQueryString();

        $gradeLevels = $teacher->gradeAssignments->pluck('grade_level')->toArray();
        $students = User::role('student')
            ->where('is_active', true)
            ->whereIn('grade_level', $gradeLevels)
            ->get();
        $classroomStats = $this->calculateClassroomStats($teacher, $students);

        return Inertia::render('Principal/TeacherProfile', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'teacher_id' => $teacher->teacher_id,
                'grades' => $gradeLevels,
                'status' => $status,
                'is_active' => $isActive,
                'last_login' => $teacher->last_login_at ? $teacher->last_login_at->format('Y-m-d H:i') : 'Never',
                'total_lessons' => $lessons->total(),
                'total_assignments' => $assignments->total(),
                'total_quizzes' => $quizzes->total(),
            ],
            'lessons' => $lessons->getCollection()->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'grade' => $lesson->grade_level,
                    'status' => $lesson->status,
                    'created_at' => $lesson->publish_date
                        ? $lesson->publish_date->format('Y-m-d')
                        : $lesson->created_at->format('Y-m-d'),
                ];
            }),
            'lessons_pagination' => $lessons->toArray(),
            'assignments' => $assignments->getCollection()->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'grade' => $assignment->grade_level,
                    'due_date' => $assignment->due_date,
                    'deadline_status' => $assignment->deadlineStatus(),
                    'submissions' => $assignment->submissions_count,
                ];
            }),
            'assignments_pagination' => $assignments->toArray(),
            'quizzes' => $quizzes->getCollection()->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'grade' => $quiz->grade_level,
                    'type' => $quiz->quiz_type,
                    'attempts' => $quiz->attempts_count,
                ];
            }),
            'quizzes_pagination' => $quizzes->toArray(),
            'classroom_stats' => $classroomStats,
        ]);
    }

    /**
     * Calculate statistics using only the teacher's published content and
     * students who belong to the content's grade level.
     */
    private function calculateClassroomStats(User $teacher, $students): array
    {
        $studentIds = $students->pluck('id');
        $studentCount = $students->count();
        $studentCountsByGrade = $students->groupBy('grade_level')->map->count();

        $publishedLessons = $teacher->lessons()
            ->where('status', 'published')
            ->get(['id', 'grade_level']);
        $lessonIds = $publishedLessons->pluck('id');
        $possibleLessonCompletions = $publishedLessons
            ->groupBy('grade_level')
            ->map(fn ($lessons, $grade) => $lessons->count() * ($studentCountsByGrade[$grade] ?? 0))
            ->sum();

        $completedLessonCompletions = 0;
        if ($possibleLessonCompletions > 0) {
            $completedLessonCompletions = DB::table('lesson_user')
                ->join('lessons', 'lessons.id', '=', 'lesson_user.lesson_id')
                ->join('users', 'users.id', '=', 'lesson_user.user_id')
                ->whereIn('lesson_user.lesson_id', $lessonIds)
                ->whereIn('lesson_user.user_id', $studentIds)
                ->where('lessons.status', 'published')
                ->whereNotNull('lesson_user.completed_at')
                ->whereColumn('users.grade_level', 'lessons.grade_level')
                ->count();
        }

        $publishedAssignments = $teacher->assignments()
            ->where('status', 'published')
            ->get(['id', 'grade_level']);
        $assignmentIds = $publishedAssignments->pluck('id');
        $possibleAssignmentSubmissions = $publishedAssignments
            ->groupBy('grade_level')
            ->map(fn ($assignments, $grade) => $assignments->count() * ($studentCountsByGrade[$grade] ?? 0))
            ->sum();

        $submittedAssignmentCount = 0;
        if ($possibleAssignmentSubmissions > 0) {
            $submittedAssignmentCount = DB::table('assignment_submissions')
                ->join('assignments', 'assignments.id', '=', 'assignment_submissions.assignment_id')
                ->join('users', 'users.id', '=', 'assignment_submissions.student_id')
                ->whereIn('assignment_submissions.assignment_id', $assignmentIds)
                ->whereIn('assignment_submissions.student_id', $studentIds)
                ->whereIn('assignment_submissions.status', ['submitted', 'late_submission', 'reviewed', 'graded'])
                ->whereColumn('users.grade_level', 'assignments.grade_level')
                ->count();
        }

        $publishedQuizzes = $teacher->quizzes()
            ->where('status', 'published')
            ->get(['id', 'grade_level']);
        $quizIds = $publishedQuizzes->pluck('id');
        $possibleQuizAttempts = $publishedQuizzes
            ->groupBy('grade_level')
            ->map(fn ($quizzes, $grade) => $quizzes->count() * ($studentCountsByGrade[$grade] ?? 0))
            ->sum();

        $completedQuizAttempts = 0;
        if ($possibleQuizAttempts > 0) {
            $completedQuizAttempts = DB::table('quiz_attempts')
                ->join('quizzes', 'quizzes.id', '=', 'quiz_attempts.quiz_id')
                ->join('users', 'users.id', '=', 'quiz_attempts.student_id')
                ->whereIn('quiz_attempts.quiz_id', $quizIds)
                ->whereIn('quiz_attempts.student_id', $studentIds)
                ->where('quiz_attempts.status', 'completed')
                ->whereColumn('users.grade_level', 'quizzes.grade_level')
                ->count();
        }

        $publishedGameIds = $teacher->games()
            ->where('status', 'published')
            ->pluck('id');
        $gameParticipants = 0;
        if ($studentCount > 0 && $publishedGameIds->isNotEmpty()) {
            $gameParticipants = GameResult::whereIn('game_id', $publishedGameIds)
                ->whereIn('student_id', $studentIds)
                ->where('status', 'completed')
                ->select('student_id')
                ->distinct()
                ->count();
        }

        return [
            'total_students' => $studentCount,
            'lesson_completion_rate' => $possibleLessonCompletions > 0
                ? min(100, round(($completedLessonCompletions / $possibleLessonCompletions) * 100))
                : 0,
            'assignment_completion_rate' => $possibleAssignmentSubmissions > 0
                ? min(100, round(($submittedAssignmentCount / $possibleAssignmentSubmissions) * 100))
                : 0,
            'quiz_participation_rate' => $possibleQuizAttempts > 0
                ? min(100, round(($completedQuizAttempts / $possibleQuizAttempts) * 100))
                : 0,
            'game_participation_rate' => $studentCount > 0
                ? min(100, round(($gameParticipants / $studentCount) * 100))
                : 0,
        ];
    }
}
