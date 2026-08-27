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
            if ($announcement->user_id === $user->id) {
                return true;
            }

            $gradeAudiences = array_merge(
                $assignedGrades,
                array_map(fn ($grade) => strtolower(str_replace(' ', '_', $grade)), $assignedGrades)
            );

            return $announcement->user_role === 'principal'
                && $announcement->isCurrentlyVisible()
                && in_array($announcement->target_audience, array_merge(
                    ['all_users', 'teachers_only'],
                    $gradeAudiences
                ), true);
        }

        if ($user->hasRole('student')) {
            $gradeAudience = strtolower(str_replace(' ', '_', (string) $user->grade_level));

            if (!$announcement->isCurrentlyVisible()) {
                return false;
            }

            return $announcement->target_audience === $user->grade_level
                || $announcement->target_audience === $gradeAudience
                || $announcement->target_audience === 'all_users'
                || ($announcement->target_audience === 'all_assigned_students'
                    && $announcement->user?->gradeAssignments()->where('grade_level', $user->grade_level)->exists());
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
