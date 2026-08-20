<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\StudyNestNotificationService;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles') : null,
                'notifications' => fn () => $request->user() ? (function () use ($request) {
                    $user = $request->user();
                    app(StudyNestNotificationService::class)->pruneStaleFor($user);
                    return [
                    'unread_count' => $user->unreadNotifications()->count(),
                    'items' => $user->notifications()->latest()->limit(5)->get()->map(fn ($notification) => [
                        'id' => $notification->id,
                        'title' => data_get($notification->data, 'title', 'Notification'),
                        'message' => data_get($notification->data, 'message', ''),
                        'priority' => data_get($notification->data, 'priority', 'normal'),
                        'icon' => data_get($notification->data, 'icon', 'bell'),
                        'url' => data_get($notification->data, 'url'),
                        'read_at' => $notification->read_at?->toISOString(),
                        'created_at' => $notification->created_at?->diffForHumans(),
                    ]),
                ];
                })() : ['unread_count' => 0, 'items' => []],
            ],
        ];
    }
}
