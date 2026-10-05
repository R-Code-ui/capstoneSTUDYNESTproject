<?php

namespace Tests\Feature;

use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Notifications\StudyNestNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class StudentAccountCreatedNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_new_student_receives_an_account_created_notification(): void
    {
        Notification::fake();

        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);

        $schoolYear = config('school.school_years')[0];

        $this->actingAs($teacher)
            ->post(route('teacher.students.store'), [
                'first_name' => 'Rai',
                'last_name' => 'Student',
                'middle_name' => '',
                'lrn' => 'RAI-001',
                'grade_level' => 'Grade 4',
                'gender' => 'male',
                'school_year' => $schoolYear,
            ])
            ->assertRedirect();

        $student = User::where('lrn', 'RAI-001')->firstOrFail();

        Notification::assertSentTo(
            $student,
            StudyNestNotification::class,
            fn (StudyNestNotification $notification) => $notification->event === 'student_account_created'
                && $notification->title === 'Account Created'
                && $notification->message === 'Your student account has been created by your teacher.'
        );
        Notification::assertCount(1);
    }
}
