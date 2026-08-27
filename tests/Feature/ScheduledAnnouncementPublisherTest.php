<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Services\ScheduledAnnouncementPublisher;
use App\Services\StudyNestNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;
use Tests\TestCase;

class ScheduledAnnouncementPublisherTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_it_publishes_only_due_scheduled_announcements(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-30 09:00:00', 'Asia/Manila'));
        $principal = User::factory()->create();

        $due = $this->announcement($principal, now()->subMinute());
        $future = $this->announcement($principal, now()->addHour());

        $this->mock(StudyNestNotificationService::class, function (MockInterface $mock) use ($due) {
            $mock->shouldReceive('announcementPublished')
                ->once()
                ->withArgs(fn (Announcement $announcement) => $announcement->is($due));
        });

        $count = app(ScheduledAnnouncementPublisher::class)->publishDue();

        $this->assertSame(1, $count);
        $this->assertSame('published', $due->fresh()->status);
        $this->assertSame('scheduled', $future->fresh()->status);
    }

    public function test_visibility_uses_the_exact_publish_and_expiration_times(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-30 09:00:00', 'Asia/Manila'));
        $principal = User::factory()->create();

        $visible = $this->announcement($principal, now()->subMinute(), 'published');
        $future = $this->announcement($principal, now()->addMinute(), 'published');
        $expired = $this->announcement($principal, now()->subHour(), 'published', now()->subMinute());

        $ids = Announcement::currentlyVisible()->pluck('id');

        $this->assertTrue($ids->contains($visible->id));
        $this->assertFalse($ids->contains($future->id));
        $this->assertFalse($ids->contains($expired->id));
    }

    private function announcement(
        User $principal,
        Carbon $publishDate,
        string $status = 'scheduled',
        ?Carbon $expirationDate = null,
    ): Announcement {
        return Announcement::create([
            'user_id' => $principal->id,
            'user_role' => 'principal',
            'title' => 'Scheduled announcement',
            'category' => 'Reminder',
            'content' => 'Test content',
            'target_audience' => 'all_users',
            'priority' => 'normal',
            'is_pinned' => false,
            'status' => $status,
            'publish_date' => $publishDate,
            'expiration_date' => $expirationDate,
            'view_count' => 0,
        ]);
    }
}
