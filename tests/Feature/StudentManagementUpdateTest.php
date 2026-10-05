<?php

namespace Tests\Feature;

use App\Models\StudentEnrollment;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentManagementUpdateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_can_change_a_students_grade_within_the_same_school_year(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();

        $this->actingAs($teacher)
            ->put(route('teacher.students.update', $student), $this->studentPayload('Grade 6', 'SY 2026-2027'))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('Grade 6', $student->refresh()->grade_level);
        $this->assertDatabaseCount('student_enrollments', 1);
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_year' => 'SY 2026-2027',
            'grade_level' => 'Grade 6',
            'status' => 'active',
        ]);
    }

    public function test_changing_school_year_completes_the_previous_enrollment(): void
    {
        [$teacher, $student] = $this->teacherAndStudent();

        $this->actingAs($teacher)
            ->put(route('teacher.students.update', $student), $this->studentPayload('Grade 6', 'SY 2027-2028'))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_year' => 'SY 2026-2027',
            'grade_level' => 'Grade 5',
            'status' => 'completed',
        ]);
        $this->assertDatabaseHas('student_enrollments', [
            'student_id' => $student->id,
            'school_year' => 'SY 2027-2028',
            'grade_level' => 'Grade 6',
            'status' => 'active',
        ]);
    }

    private function teacherAndStudent(): array
    {
        $teacher = User::factory()->create(['is_active' => true]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 5']);
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 6']);

        $student = User::factory()->create([
            'name' => 'Ramon S. Gradd',
            'lrn' => 'RAMON-001',
            'grade_level' => 'Grade 5',
            'gender' => 'male',
            'is_active' => true,
        ]);
        $student->assignRole('student');
        StudentEnrollment::create([
            'student_id' => $student->id,
            'school_year' => 'SY 2026-2027',
            'grade_level' => 'Grade 5',
            'status' => 'active',
        ]);

        return [$teacher, $student];
    }

    private function studentPayload(string $gradeLevel, string $schoolYear): array
    {
        return [
            'first_name' => 'Ramon',
            'middle_name' => 'S.',
            'last_name' => 'Gradd',
            'lrn' => 'RAMON-001',
            'grade_level' => $gradeLevel,
            'gender' => 'male',
            'school_year' => $schoolYear,
            'is_active' => true,
        ];
    }
}
