<?php

namespace Tests\Feature;

use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Notifications\StudyNestNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TeacherAccountManagementNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_receives_notification_when_teacher_id_changes(): void
    {
        Notification::fake();
        [$principal, $teacher] = $this->principalAndTeacher();

        $this->actingAs($principal)
            ->put(route('principal.users.update.teacher', $teacher), [
                'first_name' => 'Grace',
                'middle_name' => '',
                'last_name' => 'Teacher',
                'teacher_id' => 'TCH-NEW-001',
                'grade_levels' => ['Grade 4'],
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        Notification::assertSentTo(
            $teacher,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'teacher_login_id_changed'
                && $notification->title === 'Teacher ID Changed'
                && str_contains($notification->message, 'TCH-NEW-001')
        );
        Notification::assertCount(1);
    }

    public function test_restored_teacher_receives_one_account_restored_notification(): void
    {
        Notification::fake();
        [$principal, $teacher] = $this->principalAndTeacher(false);

        $this->actingAs($principal)
            ->post(route('principal.users.restore', $teacher))
            ->assertRedirect();

        Notification::assertSentTo(
            $teacher,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'teacher_account_restored'
                && $notification->title === 'Account Restored'
        );
        Notification::assertCount(1);
    }

    private function principalAndTeacher(bool $teacherIsActive = true): array
    {
        $principal = User::factory()->create(['name' => 'Principal User', 'is_active' => true]);
        $principal->assignRole('principal');

        $teacher = User::factory()->create([
            'name' => 'Grace Teacher',
            'teacher_id' => 'TCH-001',
            'is_active' => $teacherIsActive,
        ]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        return [$principal, $teacher];
    }
}
