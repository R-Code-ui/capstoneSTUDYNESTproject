<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\TeacherGradeAssignment;
use App\Models\User;
use App\Services\StudyNestNotificationService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AnnouncementNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_principal_all_grades_announcement_notifies_students_and_is_viewable(): void
    {
        $principal = $this->userWithRole('principal');
        $teacher = $this->userWithRole('teacher');
        $gradeFour = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $gradeSix = $this->userWithRole('student', ['grade_level' => 'Grade 6']);
        $inactiveStudent = $this->userWithRole('student', ['grade_level' => 'Grade 5', 'is_active' => false]);
        $announcement = $this->announcement($principal, 'principal', 'all_grades');

        app(StudyNestNotificationService::class)->announcementPublished($announcement);

        $this->assertCount(1, $gradeFour->notifications);
        $this->assertCount(1, $gradeSix->notifications);
        $this->assertCount(0, $teacher->notifications);
        $this->assertCount(0, $inactiveStudent->notifications);
        $this->assertTrue(Gate::forUser($gradeFour)->allows('view', $announcement));
        $this->assertTrue(Gate::forUser($gradeSix)->allows('view', $announcement));
    }

    public function test_principal_teachers_only_announcement_notifies_only_teachers(): void
    {
        $principal = $this->userWithRole('principal');
        $teacher = $this->userWithRole('teacher');
        $student = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $announcement = $this->announcement($principal, 'principal', 'teachers_only');

        app(StudyNestNotificationService::class)->announcementPublished($announcement);

        $this->assertCount(1, $teacher->notifications);
        $this->assertCount(0, $student->notifications);
        $this->assertTrue(Gate::forUser($teacher)->allows('view', $announcement));
    }

    public function test_teacher_announcement_notifies_only_students_in_assigned_grades(): void
    {
        $teacher = $this->userWithRole('teacher');
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 4']);
        TeacherGradeAssignment::create(['teacher_id' => $teacher->id, 'grade_level' => 'Grade 5']);
        $gradeFour = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $gradeFive = $this->userWithRole('student', ['grade_level' => 'Grade 5']);
        $gradeSix = $this->userWithRole('student', ['grade_level' => 'Grade 6']);
        $announcement = $this->announcement($teacher, 'teacher', 'all_assigned_students');

        app(StudyNestNotificationService::class)->announcementPublished($announcement);

        $this->assertCount(1, $gradeFour->notifications);
        $this->assertCount(1, $gradeFive->notifications);
        $this->assertCount(0, $gradeSix->notifications);
        $this->assertTrue(Gate::forUser($gradeFour)->allows('view', $announcement));
        $this->assertTrue(Gate::forUser($gradeFive)->allows('view', $announcement));
    }

    public function test_republishing_after_an_audience_change_replaces_old_notifications(): void
    {
        $principal = $this->userWithRole('principal');
        $gradeFour = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $gradeFive = $this->userWithRole('student', ['grade_level' => 'Grade 5']);
        $announcement = $this->announcement($principal, 'principal', 'grade_4');
        $notifications = app(StudyNestNotificationService::class);

        $notifications->announcementPublished($announcement);
        $announcement->update(['target_audience' => 'grade_5', 'title' => 'Updated title']);
        $notifications->announcementPublished($announcement->fresh());

        $this->assertCount(0, $gradeFour->fresh()->notifications);
        $this->assertCount(1, $gradeFive->fresh()->notifications);
        $this->assertSame('Updated title', data_get($gradeFive->notifications->first()->data, 'message'));
    }

    public function test_archived_announcement_sync_removes_existing_notifications(): void
    {
        $principal = $this->userWithRole('principal');
        $student = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $announcement = $this->announcement($principal, 'principal', 'all_grades');
        $notifications = app(StudyNestNotificationService::class);

        $notifications->announcementPublished($announcement);
        $this->assertCount(1, $student->notifications);

        $announcement->update(['status' => 'archived']);
        $notifications->announcementPublished($announcement->fresh());

        $this->assertCount(0, $student->fresh()->notifications);
    }

    public function test_unknown_audience_does_not_notify_every_user(): void
    {
        $principal = $this->userWithRole('principal');
        $student = $this->userWithRole('student', ['grade_level' => 'Grade 4']);
        $teacher = $this->userWithRole('teacher');
        $announcement = $this->announcement($principal, 'principal', 'legacy_unknown');

        app(StudyNestNotificationService::class)->announcementPublished($announcement);

        $this->assertCount(0, $student->notifications);
        $this->assertCount(0, $teacher->notifications);
    }

    private function userWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    private function announcement(User $author, string $authorRole, string $audience): Announcement
    {
        return Announcement::create([
            'user_id' => $author->id,
            'user_role' => $authorRole,
            'title' => 'System notification test',
            'category' => 'Reminder',
            'content' => 'Test content',
            'target_audience' => $audience,
            'priority' => 'normal',
            'is_pinned' => false,
            'status' => 'published',
            'publish_date' => now(),
            'expiration_date' => now()->addDay(),
            'view_count' => 0,
        ]);
    }
}
