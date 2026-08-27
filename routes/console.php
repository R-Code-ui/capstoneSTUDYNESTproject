<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('announcements:publish-scheduled', function () {
    $count = app(\App\Services\ScheduledAnnouncementPublisher::class)->publishDue();
    $this->info("Published {$count} scheduled announcement(s).");
})->purpose('Publish announcements whose scheduled time has arrived');

Artisan::command('content:publish-scheduled', function () {
    $count = app(\App\Services\ScheduledContentPublisher::class)->publishDue();
    $this->info("Published {$count} scheduled content item(s).");
})->purpose('Publish announcements and teacher content whose scheduled time has arrived');

Schedule::command('content:publish-scheduled')->everyMinute()->withoutOverlapping();
