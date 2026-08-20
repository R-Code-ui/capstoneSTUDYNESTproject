<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class StudyNestNotification extends Notification
{
    public function __construct(
        public string $event,
        public string $title,
        public string $message,
        public string $priority = 'normal',
        public ?string $url = null,
        public ?string $icon = null,
        public ?string $entityType = null,
        public ?int $entityId = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'title' => $this->title,
            'message' => $this->message,
            'priority' => $this->priority,
            'url' => $this->url,
            'icon' => $this->icon,
            'entity_type' => $this->entityType,
            'entity_id' => $this->entityId,
        ];
    }
}
