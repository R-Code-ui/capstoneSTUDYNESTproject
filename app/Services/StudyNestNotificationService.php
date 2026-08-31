<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Message;
use App\Models\GroupMessage;
use App\Models\MessageGroup;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Lesson;
use App\Models\Game;
use App\Models\GameResult;
use App\Notifications\StudyNestNotification;
use Illuminate\Support\Collection;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Gate;

class StudyNestNotificationService
{
    public function announcementPublished(Announcement $announcement): void
    {
        // Keep one current notification per announcement. This also removes
        // notifications from users who are no longer part of an edited audience.
        $this->forgetFor('announcement', $announcement->id);

        if (!$announcement->isCurrentlyVisible()) {
            return;
        }

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
                'megaphone',
                'announcement',
                $announcement->id
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
            'assignment',
            'assignment',
            $assignment->id
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
            'assignment',
            'assignment',
            $assignment->id
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
            'assignment',
            'assignment',
            $submission->assignment_id
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
            'message',
            'message',
            $message->id
        ));
    }

    public function groupMessageReceived(GroupMessage $message): void
    {
        $message->loadMissing(['group.members', 'sender']);
        $group = $message->group;

        if (!$group) {
            return;
        }

        foreach ($group->members->where('id', '!=', $message->sender_id) as $recipient) {
            $url = $recipient->isStudent()
                ? route('student.messages.groups.show', $group->id)
                : route('teacher.messages.groups.show', $group->id);

            $recipient->notify(new StudyNestNotification(
                'group_message_received',
                'New Group Message',
                $message->sender->name . ' sent a message in "' . $group->name . '".',
                'normal',
                $url,
                'message',
                'group_message',
                $message->id
            ));
        }
    }

    public function quizPublished(Quiz $quiz): void
    {
        $students = User::role('student')->where('grade_level', $quiz->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'quiz_published', 'New Quiz Available', $quiz->subject . ': ' . $quiz->quiz_title,
            'normal', route('student.quizzes.show', $quiz->id), 'quiz', 'quiz', $quiz->id
        ));
    }

    public function quizCompleted(QuizAttempt $attempt): void
    {
        $attempt->loadMissing(['quiz', 'student']);
        if (!$attempt->quiz?->teacher) return;
        $this->send(collect([$attempt->quiz->teacher]), new StudyNestNotification(
            'quiz_completed', 'Quiz Completed', $attempt->student->name . ' completed "' . $attempt->quiz->quiz_title . '".',
            'normal', route('teacher.quizzes.results', $attempt->quiz_id), 'quiz', 'quiz', $attempt->quiz_id
        ));
    }

    public function lessonPublished(Lesson $lesson): void
    {
        $students = User::role('student')->where('grade_level', $lesson->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'lesson_published', 'New Lesson Published', $lesson->lesson_title,
            'normal', route('student.lessons.show', $lesson->id), 'lesson', 'lesson', $lesson->id
        ));
    }

    public function gamePublished(Game $game): void
    {
        $students = User::role('student')->where('grade_level', $game->grade_level)->where('is_active', true)->get();
        $this->send($students, new StudyNestNotification(
            'game_published', 'New Educational Game', $game->game_title,
            'normal', route('student.games.show', $game->id), 'game', 'game', $game->id
        ));
    }

    public function gameCompleted(GameResult $result): void
    {
        $result->loadMissing(['game', 'student']);
        if (!$result->game?->teacher) return;
        $this->send(collect([$result->game->teacher]), new StudyNestNotification(
            'game_completed', 'Game Completed', $result->student->name . ' completed "' . $result->game->game_title . '".',
            'normal', route('teacher.games.results', $result->game_id), 'game', 'game', $result->game_id
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

        if ($audience === 'all_grades') {
            return $query->role('student')->get();
        }

        if (preg_match('/grade[ _-]?(4|5|6)/i', $audience, $matches)) {
            return $query->role('student')->where('grade_level', 'Grade ' . $matches[1])->get();
        }

        if ($audience === 'all_assigned_students' && $announcement->user) {
            return $query->role('student')
                ->whereIn('grade_level', $announcement->user->gradeAssignments()->pluck('grade_level'))
                ->get();
        }

        if ($audience === 'all_users') {
            return $query->get();
        }

        // Unknown/legacy audience values must never notify every user.
        return collect();
    }

    private function send(Collection $recipients, StudyNestNotification $notification): void
    {
        $recipients->filter()->each(fn (User $user) => $user->notify($notification));
    }

    public function forgetFor(string $entityType, int $entityId): void
    {
        DatabaseNotification::query()->get()->each(function (DatabaseNotification $notification) use ($entityType, $entityId) {
            if ($this->notificationMatches($notification, $entityType, $entityId)) {
                $notification->delete();
            }
        });
    }

    public function pruneStaleFor(User $user): void
    {
        $user->notifications()->get()->each(function (DatabaseNotification $notification) use ($user) {
            if ($this->notificationIsStale($user, $notification)) {
                $notification->delete();
            }
        });
    }

    private function notificationMatches(DatabaseNotification $notification, string $entityType, int $entityId): bool
    {
        $data = $notification->data ?? [];
        if (($data['entity_type'] ?? null) === $entityType && (int) ($data['entity_id'] ?? 0) === $entityId) {
            return true;
        }

        return $this->legacyUrlMatches($data['url'] ?? null, $entityType, $entityId);
    }

    private function notificationIsStale(User $user, DatabaseNotification $notification): bool
    {
        $data = $notification->data ?? [];
        $entityType = $data['entity_type'] ?? null;
        $entityId = (int) ($data['entity_id'] ?? 0);
        if ($entityType && $entityId) {
            if (!$this->notificationTargetIsAvailable($user, $entityType, $entityId)) {
                return true;
            }
        }

        foreach (['assignment', 'lesson', 'quiz', 'game', 'announcement', 'message', 'group_message', 'message_group'] as $type) {
            if (preg_match($this->legacyPattern($type), (string) ($data['url'] ?? ''), $matches)) {
                $id = (int) $matches[1];
                if (!$this->notificationTargetIsAvailable($user, $type, $id)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function legacyUrlMatches(?string $url, string $entityType, int $entityId): bool
    {
        return $url !== null && preg_match($this->legacyPattern($entityType), $url, $matches)
            && (int) $matches[1] === $entityId;
    }

    private function legacyPattern(string $entityType): string
    {
        if ($entityType === 'message') {
            return '#/(?:student|teacher)/messages/(\\d+)(?:/|$)#';
        }

        if ($entityType === 'message_group') {
            return '#/(?:student|teacher)/messages/groups/(\\d+)(?:/|$)#';
        }

        $segments = [
            'assignment' => 'assignments',
            'lesson' => 'lessons',
            'quiz' => 'quizzes',
            'game' => 'games',
            'announcement' => 'announcements',
        ];

        return '#/(?:student|teacher)/' . ($segments[$entityType] ?? preg_quote($entityType, '#')) . '/(\\d+)(?:/|$)#';
    }

    private function notificationTargetIsAvailable(User $user, string $entityType, int $entityId): bool
    {
        $models = [
            'assignment' => Assignment::class,
            'lesson' => Lesson::class,
            'quiz' => Quiz::class,
            'game' => Game::class,
            'announcement' => Announcement::class,
            'message' => Message::class,
            'group_message' => GroupMessage::class,
            'message_group' => MessageGroup::class,
        ];

        if (!isset($models[$entityType])) {
            return false;
        }

        $entity = $models[$entityType]::query()->find($entityId);
        if (!$entity) {
            return false;
        }

        if ($entity instanceof Message) {
            if (!Gate::forUser($user)->allows('view', $entity)) {
                return false;
            }

            if (!$entity->sender?->is_active || !$entity->receiver?->is_active) {
                return false;
            }

            return $user->isTeacher()
                ? $entity->teacher_deleted_at === null
                : ($user->isStudent() && $entity->student_deleted_at === null);
        }

        if ($entity instanceof GroupMessage) {
            $group = $entity->group;

            return $group
                && Gate::forUser($user)->allows('view', $group)
                && !$entity->deletedByUsers()->whereKey($user->id)->exists();
        }

        if ($entity instanceof MessageGroup) {
            return Gate::forUser($user)->allows('view', $entity);
        }

        if (!Gate::forUser($user)->allows('view', $entity)) {
            return false;
        }

        // Announcements are only actionable while published and within their
        // expiration period, including for an old principal notification.
        if ($entity instanceof Announcement && !$entity->isCurrentlyVisible()) {
            return false;
        }

        // A closed assignment is no longer actionable for students unless late
        // submission is enabled. Teacher grading notifications stay available.
        if ($entity instanceof Assignment && $user->isStudent() && $entity->deadlineStatus() === 'expired') {
            return false;
        }

        // An expired game cannot be opened to play by a student. Teacher result
        // notifications remain available for monitoring.
        if ($entity instanceof Game && $user->isStudent() && $entity->isExpired()) {
            return false;
        }

        return true;
    }
}
