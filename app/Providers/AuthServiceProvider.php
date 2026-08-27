<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Announcement;
use App\Models\Game;
use App\Models\ActivityLog; // ✅ ADD THIS
use App\Models\Message;
use App\Models\MessageGroup;
use App\Policies\UserPolicy;
use App\Policies\LessonPolicy;
use App\Policies\AssignmentPolicy;
use App\Policies\QuizPolicy;
use App\Policies\AnnouncementPolicy;
use App\Policies\GamePolicy;
use App\Policies\ActivityLogPolicy; // ✅ ADD THIS
use App\Policies\MessagePolicy;
use App\Policies\MessageGroupPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Lesson::class => LessonPolicy::class,
        Assignment::class => AssignmentPolicy::class,
        Quiz::class => QuizPolicy::class,
        Announcement::class => AnnouncementPolicy::class,
        Game::class => GamePolicy::class,
        ActivityLog::class => ActivityLogPolicy::class, // ✅ ADD THIS
        Message::class => MessagePolicy::class,
        MessageGroup::class => MessageGroupPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define Gates for permissions
        Gate::before(function ($user, $ability) {
            if ($user->hasRole('principal')) {
                return true;
            }
        });
    }
}
