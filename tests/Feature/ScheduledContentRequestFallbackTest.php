<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\User;
use App\Services\StudyNestNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;
use Tests\TestCase;

class ScheduledContentRequestFallbackTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_a_page_refresh_publishes_due_content_before_rendering(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-30 14:10:00', 'Asia/Manila'));
        $teacher = User::factory()->create();

        $due = $this->lesson($teacher, now()->subMinute());
        $future = $this->lesson($teacher, now()->addMinute());

        $this->mock(StudyNestNotificationService::class, function (MockInterface $mock) use ($due) {
            $mock->shouldReceive('lessonPublished')
                ->once()
                ->withArgs(fn (Lesson $lesson) => $lesson->is($due));
        });

        $this->get('/')->assertOk();

        $this->assertSame('published', $due->fresh()->status);
        $this->assertSame('scheduled', $future->fresh()->status);
    }

    public function test_a_second_refresh_does_not_publish_or_notify_twice(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-30 14:10:00', 'Asia/Manila'));
        $teacher = User::factory()->create();
        $due = $this->lesson($teacher, now()->subMinute());

        $this->mock(StudyNestNotificationService::class, function (MockInterface $mock) use ($due) {
            $mock->shouldReceive('lessonPublished')
                ->once()
                ->withArgs(fn (Lesson $lesson) => $lesson->is($due));
        });

        $this->get('/')->assertOk();
        $this->get('/')->assertOk();

        $this->assertSame('published', $due->fresh()->status);
    }

    private function lesson(User $teacher, Carbon $publishDate): Lesson
    {
        return Lesson::create([
            'teacher_id' => $teacher->id,
            'grade_level' => 'Grade 6',
            'subject' => 'English',
            'school_year' => 'SY 2026-2027',
            'trimester' => '1st Term',
            'week_number' => 'Week 1',
            'learning_competency' => 'Test competency',
            'learning_objective' => 'Test objective',
            'lesson_title' => 'Scheduled lesson',
            'lesson_description' => 'Test description',
            'lesson_content' => 'Test content',
            'status' => 'scheduled',
            'publish_date' => $publishDate,
        ]);
    }
}
