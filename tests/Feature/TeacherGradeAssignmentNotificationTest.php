<?php

namespace Tests\Feature;

use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Notifications\StudyNestNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class TeacherGradeAssignmentNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_is_notified_when_a_principal_changes_assigned_grades(): void
    {
        Notification::fake();

        $principal = User::factory()->create(['name' => 'Principal User']);
        $principal->assignRole('principal');

        $teacher = User::factory()->create([
            'name' => 'Grace Teacher',
            'teacher_id' => 'TCH-GRACE',
        ]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        $this->actingAs($principal)
            ->put(route('principal.users.update.teacher', $teacher), [
                'first_name' => 'Grace',
                'last_name' => 'Teacher',
                'middle_name' => '',
                'teacher_id' => $teacher->teacher_id,
                'grade_levels' => ['Grade 4', 'Grade 5'],
            ])
            ->assertRedirect();

        Notification::assertSentTo(
            $teacher,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'teacher_grade_assignments_changed'
                && $notification->title === 'Assigned Grades Updated'
                && str_contains($notification->message, 'Grade 4, Grade 5')
        );
    }

    public function test_teacher_is_not_notified_when_assigned_grades_do_not_change(): void
    {
        Notification::fake();

        $principal = User::factory()->create();
        $principal->assignRole('principal');

        $teacher = User::factory()->create(['teacher_id' => 'TCH-GRACE']);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        $this->actingAs($principal)
            ->put(route('principal.users.update.teacher', $teacher), [
                'first_name' => 'Grace',
                'last_name' => 'Teacher',
                'middle_name' => '',
                'teacher_id' => $teacher->teacher_id,
                'grade_levels' => ['Grade 4'],
            ])
            ->assertRedirect();

        Notification::assertNothingSent();
    }
}
