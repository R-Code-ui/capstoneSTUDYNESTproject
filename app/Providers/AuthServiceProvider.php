<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Lesson;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Announcement;
use App\Models\Game;
use App\Policies\UserPolicy;
use App\Policies\LessonPolicy;
use App\Policies\AssignmentPolicy;
use App\Policies\QuizPolicy;
use App\Policies\AnnouncementPolicy;
use App\Policies\GamePolicy;
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
        User::class => UserPolicy::class,           // ✅ ADD THIS
        Lesson::class => LessonPolicy::class,
        Assignment::class => AssignmentPolicy::class,
        Quiz::class => QuizPolicy::class,
        Announcement::class => AnnouncementPolicy::class,
        Game::class => GamePolicy::class,
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

        // Additional Gates if needed
        Gate::define('view-report', function ($user) {
            return $user->hasRole('principal') || $user->hasRole('teacher');
        });
    }
}
