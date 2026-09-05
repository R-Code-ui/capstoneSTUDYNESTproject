<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Lesson;
use App\Models\Message;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->values()->all();
        $students = User::role('student')->whereIn('grade_level', $assignedGrades)->get();
        $studentIds = $students->pluck('id');

        $lessons = Lesson::where('teacher_id', $teacher->id)->currentlyPublished()->get(['id', 'grade_level']);
        $assignments = Assignment::where('teacher_id', $teacher->id)->currentlyPublished()->get(['id', 'grade_level', 'assignment_title', 'due_date', 'due_time', 'allow_late_submission']);
        $quizzes = Quiz::where('teacher_id', $teacher->id)->currentlyPublished()->get(['id', 'grade_level']);
        $games = Game::where('teacher_id', $teacher->id)->currentlyPublished()->get(['id', 'grade_level']);

        $completedLessons = 0;
        $completedAssignments = 0;
        $quizPercentages = collect();
        $gameParticipantIds = collect();
        $attention = collect();
        $completedStatuses = ['submitted', 'late_submission', 'reviewed', 'graded'];

        foreach ($students as $student) {
            $studentLessons = $lessons->where('grade_level', $student->grade_level);
            $studentAssignments = $assignments->where('grade_level', $student->grade_level);
            $studentQuizzes = $quizzes->where('grade_level', $student->grade_level);
            $studentGames = $games->where('grade_level', $student->grade_level);

            $lessonCount = $student->completedLessons()->whereIn('lesson_id', $studentLessons->pluck('id'))->count();
            $completedLessons += $lessonCount;

            $studentSubmissions = AssignmentSubmission::where('student_id', $student->id)
                ->whereIn('assignment_id', $studentAssignments->pluck('id'))
                ->whereIn('status', $completedStatuses)->count();
            $completedAssignments += $studentSubmissions;

            $attempts = QuizAttempt::where('student_id', $student->id)
                ->whereIn('quiz_id', $studentQuizzes->pluck('id'))
                ->where('status', 'completed')->orderBy('attempt_number')->orderBy('created_at')->get()
                ->groupBy('quiz_id')->map(fn ($rows) => $rows->first());
            $quizPercentages = $quizPercentages->merge($attempts->map(fn ($attempt) => $attempt->total_questions > 0
                ? ($attempt->score / $attempt->total_questions) * 100 : 0));

            $gameIds = GameResult::where('student_id', $student->id)
                ->whereIn('game_id', $studentGames->pluck('id'))->where('status', 'completed')
                ->distinct('game_id')->pluck('game_id');
            if ($gameIds->isNotEmpty()) {
                $gameParticipantIds->push($student->id);
            }

            $concerns = [];
            $missingAssignment = $studentAssignments->contains(fn ($assignment) => !AssignmentSubmission::where('assignment_id', $assignment->id)->where('student_id', $student->id)->whereIn('status', $completedStatuses)->exists());
            if ($missingAssignment) {
                $concerns[] = 'Missing assignments';
            }
            if ($attempts->isNotEmpty() && $attempts->map(fn ($attempt) => $attempt->total_questions > 0 ? ($attempt->score / $attempt->total_questions) * 100 : 0)->avg() < 70) {
                $concerns[] = 'Low quiz scores';
            }
            if ($studentLessons->count() > 0 && $lessonCount < ($studentLessons->count() * 0.6)) {
                $concerns[] = 'Incomplete lessons';
            }
            if ($concerns) {
                $attention->push(['id' => $student->id, 'name' => $student->name, 'concern' => implode(', ', $concerns)]);
            }
        }

        $totalStudents = $students->count();
        $lessonDenominator = $lessons->count() ? $students->sum(fn ($student) => $lessons->where('grade_level', $student->grade_level)->count()) : 0;
        $assignmentDenominator = $assignments->count() ? $students->sum(fn ($student) => $assignments->where('grade_level', $student->grade_level)->count()) : 0;
        $gameParticipants = $gameParticipantIds->unique()->count();

        $upcomingDeadlines = $assignments->filter(fn ($assignment) => $assignment->deadlineStatus() === 'open')
            ->sortBy(fn ($assignment) => $assignment->dueAt())->take(5)->values()->map(function ($assignment) {
                return ['id' => $assignment->id, 'title' => $assignment->assignment_title, 'type' => 'assignment', 'due_date' => $assignment->due_date->format('M d'), 'days_left' => max(0, now()->startOfDay()->diffInDays($assignment->due_date->startOfDay(), false))];
            });

        // Show only learning activity from students in this teacher's assigned grades.
        // Login, teacher, and unassigned-grade records are deliberately excluded.
        $recentActivity = ActivityLog::with('user:id,name,grade_level')
            ->where('user_role', 'student')
            ->whereIn('user_id', $studentIds)
            ->whereIn('related_module', [
                'Lesson Module',
                'Assignment Module',
                'Quiz Module',
                'Game Module',
            ])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(function ($log) {
            $module = strtolower((string) $log->related_module);
            $type = collect(['lesson', 'assignment', 'quiz', 'game', 'message'])->first(fn ($value) => str_contains($module, $value)) ?? 'other';
            return [
                'type' => $type,
                'student' => $log->user?->name ?? 'Unknown student',
                'grade_level' => $log->user?->grade_level ?? 'N/A',
                'title' => $log->activity_description,
                'date' => $log->created_at?->diffForHumans() ?? 'Unknown date',
            ];
        });

        $recentMessages = Message::where(fn ($query) => $query->where('sender_id', $teacher->id)->orWhere('receiver_id', $teacher->id))
            ->with(['sender', 'receiver'])->latest()->limit(5)->get()->map(function ($message) use ($teacher) {
                return ['id' => $message->id, 'from' => $message->sender_id === $teacher->id ? 'You' : ($message->sender?->name ?? 'Unknown user'), 'subject' => $message->subject, 'message' => Str::limit($message->message, 50), 'date' => $message->created_at?->diffForHumans() ?? 'Unknown date', 'unread' => $message->receiver_id === $teacher->id && $message->status === 'unread'];
            });

        $audiences = array_merge(['all_users', 'teachers_only', 'all_assigned_students'], $assignedGrades, array_map(fn ($grade) => strtolower(str_replace(' ', '_', $grade)), $assignedGrades));
        $recentAnnouncements = Announcement::currentlyVisible()->whereIn('target_audience', array_unique($audiences))->with('user')->latest()->limit(3)->get()->map(fn ($announcement) => ['id' => $announcement->id, 'title' => $announcement->title, 'content' => Str::limit($announcement->content, 100), 'posted_by' => $announcement->user?->name ?? 'Unknown', 'date' => $announcement->created_at?->diffForHumans() ?? 'Unknown date']);

        return Inertia::render('Teacher/Dashboard', [
            'assigned_grades' => $assignedGrades,
            'stats' => ['total_students' => $totalStudents, 'total_lessons' => $lessons->count(), 'total_assignments' => $assignments->count(), 'total_quizzes' => $quizzes->count(), 'total_games' => $games->count()],
            'participation' => [
                'lesson_completion_rate' => $lessonDenominator ? round($completedLessons / $lessonDenominator * 100) : 0,
                'assignment_completion_rate' => $assignmentDenominator ? round($completedAssignments / $assignmentDenominator * 100) : 0,
                'average_quiz_score' => $quizPercentages->isNotEmpty() ? round($quizPercentages->avg()) : 0,
                'game_participation_rate' => $totalStudents ? round($gameParticipants / $totalStudents * 100) : 0,
            ],
            'students_requiring_attention' => $attention->take(5)->values(),
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activity' => $recentActivity,
            'messages' => ['unread_count' => Message::where('receiver_id', $teacher->id)->where('status', 'unread')->count(), 'latest' => $recentMessages->first() ? ['from' => $recentMessages->first()['from'], 'message' => $recentMessages->first()['message'], 'date' => $recentMessages->first()['date']] : null, 'recent' => $recentMessages],
            'recent_announcements' => $recentAnnouncements,
        ]);
    }
}
