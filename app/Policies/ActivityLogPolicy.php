<?php

namespace App\Policies;

use App\Models\User;

class ActivityLogPolicy
{
    /**
     * Determine if the user can view activity logs.
     * Only the principal can view activity logs.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('principal') && $user->hasPermissionTo('log.view');
    }

    /**
     * Determine if the user can view a specific activity log.
     * Only the principal can view activity logs.
     */
    public function view(User $user): bool
    {
        return $user->hasRole('principal') && $user->hasPermissionTo('log.view');
    }

    /**
     * Determine if the user can create activity logs.
     * System only - no user can manually create logs.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine if the user can update activity logs.
     * System only - no user can manually update logs.
     */
    public function update(User $user): bool
    {
        return false;
    }

    /**
     * Determine if the user can delete activity logs.
     * System only - no user can manually delete logs.
     */
    public function delete(User $user): bool
    {
        return false;
    }
}
