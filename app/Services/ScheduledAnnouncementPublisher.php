<?php

namespace App\Services;

use App\Models\Announcement;
use Illuminate\Support\Facades\DB;

class ScheduledAnnouncementPublisher
{
    public function publishDue(): int
    {
        $publishedCount = 0;

        Announcement::query()
            ->where('status', 'scheduled')
            ->whereNotNull('publish_date')
            ->where('publish_date', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function ($announcements) use (&$publishedCount) {
                foreach ($announcements as $announcement) {
                    $published = DB::transaction(function () use ($announcement) {
                        $locked = Announcement::query()->lockForUpdate()->find($announcement->id);

                        if (!$locked || $locked->status !== 'scheduled' || $locked->publish_date?->isFuture()) {
                            return null;
                        }

                        if ($locked->expiration_date && !$locked->expiration_date->isFuture()) {
                            $locked->update(['status' => 'archived']);

                            return null;
                        }

                        $locked->update(['status' => 'published']);
                        app(StudyNestNotificationService::class)->announcementPublished($locked);

                        return $locked->fresh();
                    });

                    if ($published) {
                        $publishedCount++;
                    }
                }
            });

        return $publishedCount;
    }
}
