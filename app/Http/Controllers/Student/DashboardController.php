<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\Lesson;
use App\Models\Message;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $grade = $user->grade_level;
        $today = now()->toDateString();
        $published = fn ($query) => $query->where('status', 'published')->whereDate('publish_date', '<=', $today);

        $recentAnnouncements = Announcement::with('user')->where('status', 'published')->whereDate('publish_date', '<=', $today)
            ->where(fn ($q) => $q->whereNull('expiration_date')->orWhereDate('expiration_date', '>=', $today))
            ->where(fn ($q) => $q->whereIn('target_audience', ['all_users', 'all_grades', $grade, strtolower(str_replace(' ', '_', $grade))])
                ->orWhere(fn ($inner) => $inner->where('target_audience', 'all_assigned_students')->whereHas('user.gradeAssignments', fn ($grades) => $grades->where('grade_level', $grade))))
            ->latest()->limit(3)->get()->map(fn ($announcement) => [
                'id' => $announcement->id, 'title' => $announcement->title, 'content' => Str::limit(strip_tags($announcement->content), 100),
                'posted_by' => $announcement->user?->name ?? 'Unknown', 'date' => $announcement->created_at?->diffForHumans() ?? 'Unknown date',
            ]);

        $lessons = $published(Lesson::query())->where('grade_level', $grade)->get();
        $assignments = $published(Assignment::query())->where('grade_level', $grade)->get();
        $quizzes = $published(Quiz::query())->where('grade_level', $grade)->get();
        $games = $published(Game::query())->where('grade_level', $grade)->get();

        $recentLessons = $lessons->sortByDesc('created_at')->take(3)->values()->map(fn ($lesson) => [
            'id' => $lesson->id, 'title' => $lesson->lesson_title, 'subject' => $lesson->subject, 'grade_level' => $lesson->grade_level, 'date' => $lesson->created_at->format('M d, Y'),
        ]);
        $upcomingAssignments = $assignments->filter(fn ($assignment) => $assignment->due_date?->startOfDay()->greaterThanOrEqualTo(now()->startOfDay()))->sortBy('due_date')->take(3)->values()->map(function ($assignment) use ($user) {
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)->where('student_id', $user->id)->first();
            return ['id' => $assignment->id, 'title' => $assignment->assignment_title, 'subject' => $assignment->subject, 'due_date' => $assignment->due_date->format('M d, Y'), 'status' => $submission?->status ?? 'not_submitted'];
        });

        $availableQuizzes = $quizzes->sortByDesc('created_at')->take(3)->values()->map(function ($quiz) use ($user) {
            $attempts = QuizAttempt::where('quiz_id', $quiz->id)->where('student_id', $user->id)->orderByDesc('attempt_number')->get();
            $completed = $attempts->where('status', 'completed')->sortBy(['attempt_number', 'created_at'])->first();
            $started = $attempts->first();
            return ['id' => $quiz->id, 'title' => $quiz->quiz_title, 'subject' => $quiz->subject, 'questions' => $quiz->total_questions,
                'status' => $completed ? 'completed' : ($started?->status === 'started' ? 'started' : 'pending'),
                'score' => $completed && $completed->total_questions > 0 ? round($completed->score / $completed->total_questions * 100) : null];
        });

        $assignedGames = $games->sortByDesc('created_at')->take(3)->values()->map(function ($game) use ($user) {
            $result = GameResult::where('game_id', $game->id)->where('student_id', $user->id)->orderByDesc('attempt_number')->first();
            return ['id' => $game->id, 'title' => $game->game_title, 'game_type' => $game->game_type, 'status' => $result?->status ?? 'assigned', 'score' => $result?->status === 'completed' ? $result->score : null];
        });

        $lessonIds = $lessons->pluck('id'); $assignmentIds = $assignments->pluck('id'); $quizIds = $quizzes->pluck('id'); $gameIds = $games->pluck('id');
        $completedLessons = $user->completedLessons()->whereIn('lesson_id', $lessonIds)->count();
        $submittedAssignments = AssignmentSubmission::where('student_id', $user->id)->whereIn('assignment_id', $assignmentIds)->whereIn('status', ['submitted', 'late_submission', 'graded', 'reviewed'])->count();
        $firstCompletedAttempts = QuizAttempt::where('student_id', $user->id)->whereIn('quiz_id', $quizIds)->where('status', 'completed')->orderBy('attempt_number')->orderBy('created_at')->get()->groupBy('quiz_id')->map(fn ($rows) => $rows->first())->values();
        $completedGames = GameResult::where('student_id', $user->id)->whereIn('game_id', $gameIds)->where('status', 'completed')->distinct('game_id')->count('game_id');
        $quizPercentages = $firstCompletedAttempts->map(fn ($attempt) => $attempt->total_questions > 0 ? $attempt->score / $attempt->total_questions * 100 : 0);

        return Inertia::render('Student/Dashboard', [
            'grade_level' => $grade,
            'recent_announcements' => $recentAnnouncements,
            'recent_lessons' => $recentLessons,
            'upcoming_assignments' => $upcomingAssignments,
            'available_quizzes' => $availableQuizzes,
            'assigned_games' => $assignedGames,
            'progress_summary' => [
                'lessons' => ['completed' => $completedLessons, 'total' => $lessons->count()],
                'assignments' => ['submitted' => $submittedAssignments, 'total' => $assignments->count()],
                'quizzes' => ['completed' => $firstCompletedAttempts->count(), 'total' => $quizzes->count(), 'average' => $quizPercentages->isNotEmpty() ? round($quizPercentages->avg()) : 0],
                'games' => ['completed' => $completedGames, 'total' => $games->count()],
            ],
            'unread_messages' => Message::where('receiver_id', $user->id)->whereNull('student_deleted_at')->where('status', 'unread')->count(),
        ]);
    }
}
