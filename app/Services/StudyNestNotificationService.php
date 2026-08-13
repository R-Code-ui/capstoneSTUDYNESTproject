<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Message;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Lesson;
use App\Models\Game;
use App\Models\GameResult;
use App\Notifications\StudyNestNotification;
use Illuminate\Support\Collection;

class StudyNestNotificationService
{
    public function announcementPublished(Announcement $announcement): void
    {
        foreach ($this->announcementRecipients($announcement) as $recipient) {
            $url = $recipient->isStudent()
                ? route('student.announcements.show', $announcement->id)
                : ($recipient->isTeacher() ? route('teacher.announcements.show', $announcement->id) : route('principal.announcements.index'));

            $recipient->notify(new StudyNestNotification(
                'announcement_published',
                'New Announcement',
                $announcement->title,
                $announcement->priority,
                $url,
                'megaphone'
            ));
        }
    }

    public function assignmentPublished(Assignment $assignment): void
    {
        $students = User::role('student')
            ->where('grade_level', $assignment->grade_level)
            ->where('is_active', true)
            ->get();

        $this->send($students, new StudyNestNotification(
            'assignment_published',
            'New Assignment Posted',
            $assignment->subject . ': ' . $assignment->assignment_title,
            'normal',
            route('student.assignments.show', $assignment->id),
            'assignment'
        ));
    }

    public function assignmentSubmitted(AssignmentSubmission $submission): void
    {
        $submission->loadMissing(['assignment', 'student']);
        $assignment = $submission->assignment;

        if (!$assignment?->teacher) {
            return;
        }

        $this->send(collect([$assignment->teacher]), new StudyNestNotification(
            'assignment_submitted',
            'Assignment Submitted',
            $submission->student->name . ' submitted "' . $assignment->assignment_title . '".',
            $submission->status === 'late_submission' ? 'important' : 'normal',
            route('teacher.assignments.grade', $assignment->id),
            'assignment'
        ));
    }

    public function assignmentGraded(AssignmentSubmission $submission): void
    {
        $submission->loadMissing(['assignment', 'student']);

        $this->send(collect([$submission->student]), new StudyNestNotification(
            'assignment_graded',
            $submission->status === 'returned_for_revision' ? 'Assignment Returned' : 'Assignment Graded',
            $submission->status === 'returned_for_revision'
                ? 'Your teacher returned "' . $submission->assignment->assignment_title . '" for revision.'
                : 'Your assignment "' . $submission->assignment->assignment_title . '" has been graded.',
            $submission->status === 'returned_for_revision' ? 'important' : 'normal',
            route('student.assignments.show', $submission->assignment_id),
            'assignment'
        ));
    }

    public function messageReceived(Message $message): void
    {
        $message->loadMissing(['sender', 'receiver']);
        $receiver = $message->receiver;

        if (!$receiver) {
            return;
        }

        $url = $receiver->isStudent()
            ? route('student.messages.show', $message->id)
            : route('teacher.messages.show', $message->id);

        $this->send(collect([$receiver]), new StudyNestNotification(
            'message_received',
            'New Message',
            $message->sender->name . ' sent you a message.',
            'normal',
            $url,
            'message'
        ));
    }

    public function quizPublished(Quiz $quiz): void
    {
        $students = User::role('student')->where('grade_level', $quiz->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'quiz_published', 'New Quiz Available', $quiz->subject . ': ' . $quiz->quiz_title,
            'normal', route('student.quizzes.show', $quiz->id), 'quiz'
        ));
    }

    public function quizCompleted(QuizAttempt $attempt): void
    {
        $attempt->loadMissing(['quiz', 'student']);
        if (!$attempt->quiz?->teacher) return;
        $this->send(collect([$attempt->quiz->teacher]), new StudyNestNotification(
            'quiz_completed', 'Quiz Completed', $attempt->student->name . ' completed "' . $attempt->quiz->quiz_title . '".',
            'normal', route('teacher.quizzes.results', $attempt->quiz_id), 'quiz'
        ));
    }

    public function lessonPublished(Lesson $lesson): void
    {
        $students = User::role('student')->where('grade_level', $lesson->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'lesson_published', 'New Lesson Published', $lesson->lesson_title,
            'normal', route('student.lessons.show', $lesson->id), 'lesson'
        ));
    }

    public function gamePublished(Game $game): void
    {
        $students = User::role('student')->where('grade_level', $game->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'game_published', 'New Educational Game', $game->game_title,
            'normal', route('student.games.show', $game->id), 'game'
        ));
    }

    public function gameCompleted(GameResult $result): void
    {
        $result->loadMissing(['game', 'student']);
        if (!$result->game?->teacher) return;
        $this->send(collect([$result->game->teacher]), new StudyNestNotification(
            'game_completed', 'Game Completed', $result->student->name . ' completed "' . $result->game->game_title . '".',
            'normal', route('teacher.games.results', $result->game_id), 'game'
        ));
    }

    public function reportGenerated(User $creator, string $reportTitle, ?int $reportId = null): void
    {
        $recipients = $creator->isTeacher()
            ? User::role('principal')->where('is_active', true)->get()
            : collect([$creator]);
        $this->send($recipients, new StudyNestNotification(
            'report_generated', 'Report Generated', $creator->name . ' generated "' . $reportTitle . '".',
            'normal', $creator->isTeacher() ? route('principal.reports.index') : route('principal.reports.index'), 'report'
        ));
    }

    public function userCreated(User $createdUser, User $actor): void
    {
        $recipients = User::role('principal')->where('is_active', true)->where('id', '!=', $actor->id)->get();
        $recipients->push($createdUser);
        $this->send($recipients, new StudyNestNotification(
            'user_created', 'Account Created', 'A new teacher account for ' . $createdUser->name . ' was created.',
            'normal', $createdUser->isTeacher() ? route('teacher.dashboard') : route('dashboard'), 'user'
        ));
    }

    public function userStatusChanged(User $subject, string $action, User $actor): void
    {
        $this->send(User::role('principal')->where('is_active', true)->where('id', '!=', $actor->id)->get(), new StudyNestNotification(
            'user_' . $action, 'User Account ' . ucfirst($action), $subject->name . ' was ' . $action . '.',
            $action === 'archived' ? 'important' : 'normal', route('principal.users.index'), 'user'
        ));
    }

    private function announcementRecipients(Announcement $announcement): Collection
    {
        $query = User::query()->where('id', '!=', $announcement->user_id)->where('is_active', true);
        $audience = strtolower((string) $announcement->target_audience);

        if ($audience === 'teachers_only') {
            return $query->role('teacher')->get();
        }

        if (preg_match('/grade[ _-]?(4|5|6)/i', $audience, $matches)) {
            return $query->role('student')->where('grade_level', 'Grade ' . $matches[1])->get();
        }

        if ($audience === 'all_assigned_students' && $announcement->user) {
            return $query->role('student')
                ->whereIn('grade_level', $announcement->user->gradeAssignments()->pluck('grade_level'))
                ->get();
        }

        return $query->get();
    }

    private function send(Collection $recipients, StudyNestNotification $notification): void
    {
        $recipients->filter()->each(fn (User $user) => $user->notify($notification));
    }
}
