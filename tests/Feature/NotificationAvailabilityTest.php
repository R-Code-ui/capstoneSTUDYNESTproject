<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Game;
use App\Models\Message;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Services\StudyNestNotificationService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_expired_assignment_notification_is_removed_when_late_submission_is_disabled(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();
        $assignment = $this->assignment($teacher, false, now()->subMinute()->toDateString());
        $notifications = app(StudyNestNotificationService::class);

        $notifications->assignmentPublished($assignment);
        $this->assertCount(1, $student->notifications);

        $notifications->pruneStaleFor($student);

        $this->assertCount(0, $student->fresh()->notifications);
    }

    public function test_expired_assignment_notification_remains_when_late_submission_is_enabled(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();
        $assignment = $this->assignment($teacher, true, now()->subMinute()->toDateString());
        $notifications = app(StudyNestNotificationService::class);

        $notifications->assignmentPublished($assignment);
        $notifications->pruneStaleFor($student);

        $this->assertCount(1, $student->fresh()->notifications);
    }

    public function test_expired_game_notification_is_removed_for_a_student(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();
        $game = Game::create([
            'teacher_id' => $teacher->id,
            'grade_level' => 'Grade 4',
            'game_title' => 'Past due game',
            'game_type' => 'numeracy',
            'game_data' => [],
            'max_attempts' => 1,
            'due_date' => now()->subDay()->toDateString(),
            'status' => 'published',
            'publish_date' => now(),
        ]);
        $notifications = app(StudyNestNotificationService::class);

        $notifications->gamePublished($game);
        $notifications->pruneStaleFor($student);

        $this->assertCount(0, $student->fresh()->notifications);
    }

    public function test_message_notification_is_removed_when_the_recipient_hides_the_message(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();
        $message = Message::create([
            'sender_id' => $teacher->id,
            'receiver_id' => $student->id,
            'subject' => 'Reminder',
            'category' => 'general',
            'message' => 'Please review the lesson.',
            'status' => 'unread',
        ]);
        $notifications = app(StudyNestNotificationService::class);

        $notifications->messageReceived($message);
        $this->assertCount(1, $student->notifications);

        $message->update(['student_deleted_at' => now()]);
        $notifications->pruneStaleFor($student);

        $this->assertCount(0, $student->fresh()->notifications);
    }

    private function teacherAndStudent(): array
    {
        $teacher = User::factory()->create(['is_active' => true]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        $student = User::factory()->create(['grade_level' => 'Grade 4', 'is_active' => true]);
        $student->assignRole('student');

        return [$teacher, $student];
    }

    private function assignment(User $teacher, bool $allowLateSubmission, string $dueDate): Assignment
    {
        return Assignment::create([
            'teacher_id' => $teacher->id,
            'grade_level' => 'Grade 4',
            'subject' => 'Mathematics',
            'school_year' => '2026-2027',
            'trimester' => '1st Term',
            'week_number' => 'Week 1',
            'assignment_title' => 'Deadline test',
            'assignment_type' => 'homework',
            'instructions' => 'Complete the activity.',
            'total_points' => 10,
            'allow_late_submission' => $allowLateSubmission,
            'due_date' => $dueDate,
            'due_time' => now()->subMinute()->format('H:i:s'),
            'submission_methods' => ['digital'],
            'status' => 'published',
            'visibility' => 'assigned_class_only',
            'publish_date' => now(),
        ]);
    }
}
