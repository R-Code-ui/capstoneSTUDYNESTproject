<?php

namespace Tests\Feature;

use App\Models\StudentEnrollment;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Notifications\StudyNestNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class StudentManagementNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_student_receives_notifications_for_grade_school_year_and_login_id_changes(): void
    {
        Notification::fake();
        [$teacher, $student] = $this->teacherAndStudent();

        $this->actingAs($teacher)
            ->put(route('teacher.students.update', $student), [
                'first_name' => 'Rai',
                'middle_name' => '',
                'last_name' => 'Student',
                'lrn' => 'RAI-002',
                'grade_level' => 'Grade 5',
                'gender' => 'male',
                'school_year' => 'SY 2027-2028',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        foreach ([
            'student_grade_level_changed',
            'student_school_year_changed',
            'student_login_id_changed',
        ] as $event) {
            Notification::assertSentTo(
                $student,
                StudyNestNotification::class,
                fn (StudyNestNotification $notification) => $notification->event === $event
            );
        }

        Notification::assertCount(3);
    }

    public function test_unrelated_student_edits_do_not_send_management_notifications(): void
    {
        Notification::fake();
        [$teacher, $student] = $this->teacherAndStudent();

        $this->actingAs($teacher)
            ->put(route('teacher.students.update', $student), [
                'first_name' => 'Rai Updated',
                'middle_name' => '',
                'last_name' => 'Student',
                'lrn' => 'RAI-001',
                'grade_level' => 'Grade 4',
                'gender' => 'female',
                'school_year' => 'SY 2026-2027',
                'is_active' => true,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        Notification::assertNothingSent();
    }

    public function test_restored_student_receives_one_account_restored_notification(): void
    {
        Notification::fake();
        [$teacher, $student] = $this->teacherAndStudent(false);

        $this->actingAs($teacher)
            ->post(route('teacher.students.restore', $student))
            ->assertRedirect();

        Notification::assertSentTo(
            $student,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'student_account_restored'
                && $notification->title === 'Account Restored'
        );
        Notification::assertCount(1);
    }

    private function teacherAndStudent(bool $studentIsActive = true): array
    {
        $teacher = User::factory()->create(['is_active' => true]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 5']);

        $student = User::factory()->create([
            'name' => 'Rai Student',
            'lrn' => 'RAI-001',
            'grade_level' => 'Grade 4',
            'gender' => 'male',
            'is_active' => $studentIsActive,
        ]);
        $student->assignRole('student');
        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_year' => 'SY 2026-2027',
            'grade_level' => 'Grade 4',
            'status' => 'active',
        ]);

        return [$teacher, $student];
    }
}
