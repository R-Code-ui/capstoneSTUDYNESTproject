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
                'member_ids' => [$student->id],
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('message_groups', 0);
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
