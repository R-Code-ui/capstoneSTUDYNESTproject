<?php

namespace Tests\Feature;

use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Notifications\StudyNestNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class StudentPasswordResetNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_password_reset_notifies_only_the_affected_student(): void
    {
        Notification::fake();

        $teacher = User::factory()->create(['name' => 'Grace Teacher']);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        $student = User::factory()->create(['grade_level' => 'Grade 4']);
        $student->assignRole('student');

        $this->actingAs($teacher)
            ->put(route('teacher.students.reset-password', $student), [
                'new_password' => 'Updated123',
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $student,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'password_changed'
                && $notification->title === 'Password Changed'
                && str_contains($notification->message, 'your teacher')
        );
        Notification::assertCount(1);
    }
}
