<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_cannot_view_a_message_from_an_unassigned_grade(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4', 'Grade 5');
        $message = $this->makeMessage($student, $teacher);

        $this->actingAs($teacher)
            ->get(route('teacher.messages.show', $message))
            ->assertForbidden();
    }

    public function test_student_cannot_view_a_message_from_a_teacher_not_assigned_to_the_students_grade(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 5', 'Grade 4');
        $message = $this->makeMessage($student, $teacher);

        $this->actingAs($student)
            ->get(route('student.messages.show', $message))
            ->assertForbidden();
    }

    public function test_user_cannot_remove_the_other_participants_message(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4', 'Grade 4');
        $message = $this->makeMessage($student, $teacher);

        $this->actingAs($teacher)
            ->delete(route('teacher.messages.destroy', $message))
            ->assertForbidden();

        $this->assertNull($message->fresh()->teacher_deleted_at);
    }

    public function test_sender_can_remove_their_message_without_deleting_it_for_the_other_participant(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4', 'Grade 4');
        $message = $this->makeMessage($teacher, $student);

        $this->actingAs($teacher)
            ->delete(route('teacher.messages.destroy', $message))
            ->assertRedirect();

        $message->refresh();

        $this->assertNotNull($message->teacher_deleted_at);
        $this->assertNull($message->student_deleted_at);
    }

    private function teacherAndStudent(string $teacherGrade, string $studentGrade): array
    {
        $teacher = User::factory()->create([
            'grade_level' => $teacherGrade,
        ]);
        $teacher->assignRole('teacher');

        TeacherGradeAssignment::create([
            'teacher_id' => $teacher->id,
            'grade_level' => $teacherGrade,
        ]);

        $student = User::factory()->create([
            'grade_level' => $studentGrade,
        ]);
        $student->assignRole('student');

        return [$teacher, $student];
    }

    private function makeMessage(User $sender, User $receiver): Message
    {
        return Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'subject' => 'Test message',
            'category' => 'lesson',
            'message' => 'Test content',
            'status' => 'unread',
        ]);
    }
}
