<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Game;
use App\Models\Message;
use App\Models\Announcement;
use App\Models\AssignmentSubmission;
use App\Models\QuizAttempt;
use App\Models\ActivityLog;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get assigned grades
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        // Get students for assigned grades
        $students = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->get();

        $totalStudents = $students->count();
        $studentIds = $students->pluck('id');

        // ===== Section 1: Classroom Overview =====
        $totalLessons = Lesson::where('teacher_id', $user->id)->count();
        $totalAssignments = Assignment::where('teacher_id', $user->id)->count();
        $totalQuizzes = Quiz::where('teacher_id', $user->id)->count();
        $totalGames = Game::where('teacher_id', $user->id)->count();

        // ===== Section 2: Student Participation Summary =====
        $lessonCompletionRate = 0;
        $assignmentCompletionRate = 0;
        $averageQuizScore = 0;
        $gameParticipationRate = 0;

        if ($totalStudents > 0) {
            // Lesson completion
            $publishedLessons = Lesson::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->count();
            if ($publishedLessons > 0) {
                $completedLessons = 0;
                foreach ($students as $student) {
                    $completedLessons += $student->completedLessons()
                        ->whereIn('lesson_id', Lesson::where('teacher_id', $user->id)->pluck('id'))
                        ->count();
                }
                $lessonCompletionRate = round(($completedLessons / ($publishedLessons * $totalStudents)) * 100);
            }

            // Assignment completion
            $publishedAssignments = Assignment::where('teacher_id', $user->id)
                ->where('status', 'published')
                ->count();
            if ($publishedAssignments > 0) {
                $submittedAssignments = AssignmentSubmission::whereIn('student_id', $studentIds)
                    ->whereIn('assignment_id', Assignment::where('teacher_id', $user->id)->pluck('id'))
                    ->whereIn('status', ['submitted', 'late_submission', 'graded'])
                    ->count();
                $assignmentCompletionRate = round(($submittedAssignments / ($publishedAssignments * $totalStudents)) * 100);
            }

            // Quiz average (only for teacher's own quizzes)
            $teacherQuizIds = Quiz::where('teacher_id', $user->id)->pluck('id');
            $quizAttempts = QuizAttempt::whereIn('student_id', $studentIds)
                ->whereIn('quiz_id', $teacherQuizIds)
                ->where('status', 'completed')
                ->get();
            if ($quizAttempts->count() > 0) {
                $averageQuizScore = round($quizAttempts->avg('score'));
            }

            // Game participation rate (based on actual game results)
            $teacherGameIds = Game::where('teacher_id', $user->id)->pluck('id');
            $distinctPlayers = GameResult::whereIn('game_id', $teacherGameIds)
                ->whereIn('student_id', $studentIds)
                ->distinct('student_id')
                ->count('student_id');
            $gameParticipationRate = round(($distinctPlayers / $totalStudents) * 100);
        }

        // ===== Section 3: Students Requiring Attention =====
        $studentsRequiringAttention = collect();
        $teacherPublishedAssignments = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->get();
        $teacherPublishedLessonIds = Lesson::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->pluck('id');

        foreach ($students as $student) {
            $concerns = [];

            // Check for missing assignments (only teacher's own assignments)
            foreach ($teacherPublishedAssignments as $assignment) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $student->id)
                    ->first();
                if (!$submission || $submission->status === 'not_submitted') {
                    $concerns[] = 'Missing assignments';
                    break;
                }
            }

            // Check for low quiz scores (only teacher's own quizzes)
            $quizAttempts = QuizAttempt::where('student_id', $student->id)
                ->whereIn('quiz_id', $teacherQuizIds)
                ->where('status', 'completed')
                ->get();
            if ($quizAttempts->count() > 0) {
                $avgScore = $quizAttempts->avg('score');
                if ($avgScore < 70) {
                    $concerns[] = 'Low quiz scores';
                }
            }

            // Check for incomplete lessons (using completedLessons pivot)
            $completedLessons = $student->completedLessons()
                ->whereIn('lesson_id', $teacherPublishedLessonIds)
                ->count();
            if (count($teacherPublishedLessonIds) > 0 && $completedLessons < count($teacherPublishedLessonIds) * 0.6) {
                $concerns[] = 'Incomplete lessons';
            }

            if (count($concerns) > 0) {
                $studentsRequiringAttention->push([
                    'id' => $student->id,
                    'name' => $student->name,
                    'concern' => implode(', ', $concerns),
                ]);
            }
        }
        $studentsRequiringAttention = $studentsRequiringAttention->take(5);

        // ===== Section 4: Upcoming Deadlines (only assignments) =====
        $upcomingDeadlines = Assignment::where('teacher_id', $user->id)
            ->where('status', 'published')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'type' => 'assignment',
                    'due_date' => $assignment->due_date->format('M d'),
                    'days_left' => $assignment->due_date->diffInDays(now()),
                ];
            });

        // ===== Section 5: Recent Activity (from ActivityLog) =====
        $recentActivity = ActivityLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                $typeMap = [
                    'lesson'     => 'lesson',
                    'assignment' => 'assignment',
                    'quiz'       => 'quiz',
                    'game'       => 'game',
                    'message'    => 'message',
                ];
                $type = 'other';
                foreach ($typeMap as $keyword => $mappedType) {
                    if (stripos($log->related_module, $keyword) !== false) {
                        $type = $mappedType;
                        break;
                    }
                }
                return [
                    'type'  => $type,
                    'title' => $log->activity_description,
                    'date'  => $log->created_at->diffForHumans(),
                ];
            });

        // ===== Section 6: Recent Messages =====
        $unreadMessages = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();   // ✅ removed visibleToTeacher

        $recentMessages = Message::where(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
        })
            ->with('sender', 'receiver')   // ✅ removed visibleToTeacher
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($msg) use ($user) {
                return [
                    'id'      => $msg->id,
                    'from'    => $msg->sender_id === $user->id ? 'You' : $msg->sender->name,
                    'subject' => $msg->subject,
                    'message' => Str::limit($msg->message, 50),
                    'date'    => $msg->created_at->diffForHumans(),
                    'unread'  => $msg->receiver_id === $user->id && $msg->status === 'unread',
                ];
            });

        // ===== Section 7: Recent Announcements =====
        $recentAnnouncements = Announcement::where('status', 'published')
            ->where(function ($query) use ($assignedGrades) {
                $query->whereIn('target_audience', $assignedGrades)
                      ->orWhere('target_audience', 'all_users');
            })
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id'        => $announcement->id,
                    'title'     => $announcement->title,
                    'content'   => Str::limit($announcement->content, 100),
                    'posted_by' => $announcement->user->name ?? 'Unknown',
                    'date'      => $announcement->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Teacher/Dashboard', [
            'assigned_grades'                => $assignedGrades,
            'stats'                          => [
                'total_students'    => $totalStudents,
                'total_lessons'     => $totalLessons,
                'total_assignments' => $totalAssignments,
                'total_quizzes'     => $totalQuizzes,
                'total_games'       => $totalGames,
            ],
            'participation'                  => [
                'lesson_completion_rate'     => $lessonCompletionRate,
                'assignment_completion_rate' => $assignmentCompletionRate,
                'average_quiz_score'         => $averageQuizScore,
                'game_participation_rate'    => $gameParticipationRate,
            ],
            'students_requiring_attention'   => $studentsRequiringAttention,
            'upcoming_deadlines'             => $upcomingDeadlines,
            'recent_activity'                => $recentActivity,
            'messages'                       => [
                'unread_count' => $unreadMessages,
                'latest'       => $recentMessages->first() ? [
                    'from'    => $recentMessages->first()['from'],
                    'message' => $recentMessages->first()['message'],
                    'date'    => $recentMessages->first()['date'],
                ] : null,
                'recent'       => $recentMessages,
            ],
            'recent_announcements'           => $recentAnnouncements,
        ]);
    }
}
