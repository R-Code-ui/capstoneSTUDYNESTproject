<?php

namespace Tests\Feature;

use App\Models\GroupMessage;
use App\Models\MessageGroup;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageGroupAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_teacher_can_create_a_group_with_authorized_students(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4');

        $response = $this->actingAs($teacher)->post(route('teacher.messages.groups.store'), [
            'name' => 'Science Project - Group A',
            'description' => 'Project discussion',
            'grade_levels' => ['Grade 4'],
            'member_ids' => [$student->id],
        ]);

        $response->assertRedirect();
        $group = MessageGroup::firstOrFail();

        $this->assertTrue($group->members()->whereKey($teacher->id)->exists());
        $this->assertTrue($group->members()->whereKey($student->id)->exists());
    }

    public function test_teacher_cannot_add_a_student_from_an_unassigned_grade(): void
    {
        [$teacher] = $this->teacherAndStudent('Grade 4');
        $student = User::factory()->create(['grade_level' => 'Grade 5']);
        $student->assignRole('student');

        $this->actingAs($teacher)
            ->post(route('teacher.messages.groups.store'), [
                'name' => 'Unauthorized Group',
                'grade_levels' => ['Grade 4'],
                'member_ids' => [$student->id],
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('message_groups', 0);
    }

    public function test_teacher_can_create_a_group_across_multiple_assigned_grades(): void
    {
        [$teacher, $gradeFourStudent] = $this->teacherAndStudent('Grade 4');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 5']);
        $gradeFiveStudent = User::factory()->create(['grade_level' => 'Grade 5']);
        $gradeFiveStudent->assignRole('student');

        $this->actingAs($teacher)
            ->post(route('teacher.messages.groups.store'), [
                'name' => 'Grades 4 and 5 Project',
                'grade_levels' => ['Grade 4', 'Grade 5'],
                'member_ids' => [$gradeFourStudent->id, $gradeFiveStudent->id],
            ])
            ->assertRedirect();

        $group = MessageGroup::firstOrFail();
        $this->assertNull($group->subject_id);
        $this->assertTrue($group->members()->whereKey($gradeFourStudent->id)->exists());
        $this->assertTrue($group->members()->whereKey($gradeFiveStudent->id)->exists());
    }

    public function test_new_multi_grade_group_has_no_subject(): void
    {
        [$teacher, $gradeFourStudent] = $this->teacherAndStudent('Grade 4');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 5']);
        $gradeFiveStudent = User::factory()->create(['grade_level' => 'Grade 5']);
        $gradeFiveStudent->assignRole('student');
        $this->actingAs($teacher)
            ->post(route('teacher.messages.groups.store'), [
                'name' => 'Cross-grade English',
                'grade_levels' => ['Grade 4', 'Grade 5'],
                'member_ids' => [$gradeFourStudent->id, $gradeFiveStudent->id],
            ])
            ->assertRedirect();

        $this->assertNull(MessageGroup::firstOrFail()->subject_id);
    }

    public function test_only_members_can_view_and_send_group_messages(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4');
        $outsider = User::factory()->create(['grade_level' => 'Grade 4']);
        $outsider->assignRole('student');
        $group = $this->makeGroup($teacher, $student);

        $this->actingAs($student)
            ->get(route('student.messages.groups.show', $group))
            ->assertOk();

        $this->actingAs($student)
            ->post(route('student.messages.groups.send', $group), ['body' => 'Hello group'])
            ->assertRedirect();

        $this->actingAs($outsider)
            ->get(route('student.messages.groups.show', $group))
            ->assertForbidden();

        $this->assertDatabaseHas('group_messages', [
            'message_group_id' => $group->id,
            'sender_id' => $student->id,
            'body' => 'Hello group',
        ]);
    }

    public function test_group_members_can_remove_only_their_own_messages_from_their_view(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4');
        $group = $this->makeGroup($teacher, $student);
        $teacherMessage = GroupMessage::create([
            'message_group_id' => $group->id,
            'sender_id' => $teacher->id,
            'body' => 'Teacher message',
        ]);
        $studentMessage = GroupMessage::create([
            'message_group_id' => $group->id,
            'sender_id' => $student->id,
            'body' => 'Student message',
        ]);

        $this->actingAs($student)
            ->delete(route('student.messages.groups.messages.destroy', [$group, $studentMessage]))
            ->assertRedirect();

        $this->assertDatabaseHas('group_messages', ['id' => $studentMessage->id]);
        $this->assertDatabaseHas('group_message_deletions', [
            'group_message_id' => $studentMessage->id,
            'user_id' => $student->id,
        ]);

        $this->actingAs($student)
            ->get(route('student.messages.groups.show', $group))
            ->assertDontSee('Student message');

        $this->actingAs($teacher)
            ->get(route('teacher.messages.groups.show', $group))
            ->assertSee('Student message');

        $this->actingAs($student)
            ->delete(route('student.messages.groups.messages.destroy', [$group, $teacherMessage]))
            ->assertForbidden();

        $this->assertDatabaseHas('group_messages', ['id' => $teacherMessage->id]);
    }

    public function test_teacher_removing_a_group_message_does_not_hide_it_for_students(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4');
        $group = $this->makeGroup($teacher, $student);
        $message = GroupMessage::create([
            'message_group_id' => $group->id,
            'sender_id' => $teacher->id,
            'body' => 'Teacher-only removal',
        ]);

        $this->actingAs($teacher)
            ->delete(route('teacher.messages.groups.messages.destroy', [$group, $message]))
            ->assertRedirect();

        $this->actingAs($teacher)
            ->get(route('teacher.messages.groups.show', $group))
            ->assertDontSee('Teacher-only removal');

        $this->actingAs($student)
            ->get(route('student.messages.groups.show', $group))
            ->assertSee('Teacher-only removal');
    }

    public function test_archived_group_rejects_new_messages_but_keeps_existing_messages(): void
    {
        [$teacher, $student] = $this->teacherAndStudent('Grade 4');
        $group = $this->makeGroup($teacher, $student);
        GroupMessage::create([
            'message_group_id' => $group->id,
            'sender_id' => $teacher->id,
            'body' => 'Existing message',
        ]);

        $this->actingAs($teacher)
            ->post(route('teacher.messages.groups.archive', $group))
            ->assertRedirect();

        $this->actingAs($student)
            ->post(route('student.messages.groups.send', $group), ['body' => 'Not allowed'])
            ->assertForbidden();

        $this->assertDatabaseHas('group_messages', ['body' => 'Existing message']);
    }

    private function teacherAndStudent(string $grade): array
    {
        $teacher = User::factory()->create(['grade_level' => $grade]);
        $teacher->assignRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => $grade]);

        $student = User::factory()->create(['grade_level' => $grade]);
        $student->assignRole('student');

        return [$teacher, $student];
    }

    private function makeGroup(User $teacher, User $student): MessageGroup
    {
        $group = MessageGroup::create([
            'teacher_id' => $teacher->id,
            'name' => 'Test Group',
        ]);
        $group->members()->sync([$teacher->id, $student->id]);

        return $group;
    }
}
