<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Services\StudyNestNotificationService;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        app(StudyNestNotificationService::class)->pruneStaleFor($request->user());
        $notifications = $request->user()->notifications()->latest()->paginate(15);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications->through(fn ($notification) => $this->format($notification)),
            'pagination' => $notifications->toArray(),
        ]);
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        app(StudyNestNotificationService::class)->pruneStaleFor($request->user());
        $item = $request->user()->notifications()->whereKey($notification)->first();
        if (!$item) {
            return redirect()->route('notifications.index');
        }
        $item->markAsRead();

        $url = data_get($item->data, 'url');
        return $url ? redirect()->to($url) : redirect()->route('notifications.index');
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return redirect()->back();
    }

    private function format($notification): array
    {
        return [
            'id' => $notification->id,
            'title' => data_get($notification->data, 'title', 'Notification'),
            'message' => data_get($notification->data, 'message', ''),
            'priority' => data_get($notification->data, 'priority', 'normal'),
            'icon' => data_get($notification->data, 'icon', 'bell'),
            'url' => data_get($notification->data, 'url'),
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->diffForHumans(),
        ];
    }
}
