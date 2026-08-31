<?php

namespace Tests\Feature;

use App\Models\TeacherGradeAssignment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetForceChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_principal_reset_does_not_force_teacher_to_change_password(): void
    {
        $principal = User::factory()->create();
        $principal->assignRole('principal');

        $teacher = User::factory()->create([
            'must_change_password' => true,
        ]);
        $teacher->assignRole('teacher');

        $this->actingAs($principal)
            ->put(route('principal.users.reset-password', $teacher), [
                'new_password' => 'Updated123',
            ])
            ->assertRedirect();

        $teacher->refresh();

        $this->assertFalse($teacher->must_change_password);
        $this->assertTrue(Hash::check('Updated123', $teacher->password));
    }

    public function test_teacher_reset_does_not_force_student_to_change_password(): void
    {
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');

        TeacherGradeAssignment::create([
            'teacher_id' => $teacher->id,
            'grade_level' => 'Grade 4',
        ]);

        $student = User::factory()->create([
            'grade_level' => 'Grade 4',
            'must_change_password' => true,
        ]);
        $student->assignRole('student');

        $this->actingAs($teacher)
            ->put(route('teacher.students.reset-password', $student), [
                'new_password' => 'Updated123',
            ])
            ->assertRedirect();

        $student->refresh();

        $this->assertFalse($student->must_change_password);
        $this->assertTrue(Hash::check('Updated123', $student->password));
    }
}
