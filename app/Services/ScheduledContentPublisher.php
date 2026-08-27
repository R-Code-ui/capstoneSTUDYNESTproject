<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Game;
use App\Models\Lesson;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ScheduledContentPublisher
{
    public function publishDue(): int
    {
        $count = app(ScheduledAnnouncementPublisher::class)->publishDue();
        $notifications = app(StudyNestNotificationService::class);

        $count += $this->publishDueFor(Lesson::class, fn (Lesson $lesson) => $notifications->lessonPublished($lesson));
        $count += $this->publishDueFor(Assignment::class, fn (Assignment $assignment) => $notifications->assignmentPublished($assignment));
        $count += $this->publishDueFor(Quiz::class, fn (Quiz $quiz) => $notifications->quizPublished($quiz));
        $count += $this->publishDueFor(Game::class, fn (Game $game) => $notifications->gamePublished($game));

        return $count;
    }

    private function publishDueFor(string $modelClass, callable $notify): int
    {
        $count = 0;

        $modelClass::query()
            ->where('status', 'scheduled')
            ->whereNotNull('publish_date')
            ->where('publish_date', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($records) use ($modelClass, $notify, &$count) {
                foreach ($records as $record) {
                    $published = DB::transaction(function () use ($modelClass, $record, $notify) {
                        /** @var Model|null $locked */
                        $locked = $modelClass::query()->lockForUpdate()->find($record->id);

                        if (!$locked || $locked->status !== 'scheduled' || $locked->publish_date?->isFuture()) {
                            return false;
                        }

                        $locked->update(['status' => 'published']);
                        $notify($locked);

                        return true;
                    });

                    if ($published) {
                        $count++;
                    }
                }
            });

        return $count;
    }
}
