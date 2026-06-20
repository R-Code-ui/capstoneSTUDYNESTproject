<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('announcement.view');
    }

    public function view(User $user, Announcement $announcement): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($announcement->target_audience, $assignedGrades) || $announcement->target_audience === 'all_users';
        }

        if ($user->hasRole('student')) {
            return $announcement->target_audience === $user->grade_level || $announcement->target_audience === 'all_users';
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('announcement.create');
    }

    public function update(User $user, Announcement $announcement): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            return $user->id === $announcement->user_id;
        }

        return false;
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            return $user->id === $announcement->user_id;
        }

        return false;
    }
}
