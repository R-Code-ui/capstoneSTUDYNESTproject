<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        // Principal can view all users
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teachers can view students in their assigned grades
        if ($user->hasRole('teacher')) {
            return $user->hasPermissionTo('user.manage');
        }

        return false;
    }

    /**
     * Determine if the user can view a specific user.
     */
    public function view(User $user, User $model): bool
    {
        // Principal can view any user
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teachers can view students in their assigned grades
        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

            // If viewing a student, check if they're in the teacher's assigned grades
            if ($model->hasRole('student')) {
                return in_array($model->grade_level, $assignedGrades);
            }

            // Teachers can view other teachers (for monitoring)
            if ($model->hasRole('teacher')) {
                return true;
            }
        }

        // Users can view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create a user (teacher/student).
     */
    public function create(User $user): bool
    {
        // Only principal can create users
        return $user->hasRole('principal') && $user->hasPermissionTo('user.manage');
    }

    /**
     * Determine if the user can update a user.
     */
    public function update(User $user, User $model): bool
    {
        // Principal can update any user
        if ($user->hasRole('principal')) {
            return true;
        }

        // Users can update their own profile
        if ($user->id === $model->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can delete/archive a user.
     */
    public function delete(User $user, User $model): bool
    {
        // Only principal can delete/archive users
        return $user->hasRole('principal') && $user->hasPermissionTo('user.manage');
    }

    /**
     * Determine if the user can manage teacher accounts.
     */
    public function manageTeachers(User $user): bool
    {
        return $user->hasRole('principal') && $user->hasPermissionTo('teacher.manage');
    }

    /**
     * Determine if the user can manage student accounts.
     */
    public function manageStudents(User $user): bool
    {
        return $user->hasRole('principal') && $user->hasPermissionTo('student.manage');
    }

    /**
     * Determine if the user can reset a user's password.
     */
    public function resetPassword(User $user, User $model): bool
    {
        // Principal can reset any user's password
        if ($user->hasRole('principal')) {
            return true;
        }

        // Users can reset their own password (via profile)
        if ($user->id === $model->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can archive/restore a user.
     */
    public function archive(User $user, User $model): bool
    {
        // Only principal can archive users
        return $user->hasRole('principal') && $user->hasPermissionTo('user.manage');
    }

    /**
     * Determine if the user can restore a user.
     */
    public function restore(User $user, User $model): bool
    {
        // Only principal can restore users
        return $user->hasRole('principal') && $user->hasPermissionTo('user.manage');
    }
}
