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
        if ($user->hasRole('principal')) {
            return true;
        }

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
        if ($user->hasRole('principal')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

            if ($model->hasRole('student')) {
                return in_array($model->grade_level, $assignedGrades);
            }

            if ($model->hasRole('teacher')) {
                return true;
            }
        }

        if ($user->id === $model->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can create a user.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('principal') && $user->hasPermissionTo('user.manage');
    }

    /**
     * Determine if the user can update a user.
     */
    public function update(User $user, User $model): bool
    {
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teacher can update students in their assigned grades (handled in controller)
        if ($user->hasRole('teacher') && $model->hasRole('student')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($model->grade_level, $assignedGrades) && $user->hasPermissionTo('student.manage');
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
        // Principal can delete any user
        if ($user->hasRole('principal')) {
            return $user->hasPermissionTo('user.manage');
        }

        // Teacher can archive/delete students in their assigned grades
        if ($user->hasRole('teacher') && $model->hasRole('student')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($model->grade_level, $assignedGrades) && $user->hasPermissionTo('student.manage');
        }

        return false;
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
        // Principal with student.manage permission
        if ($user->hasRole('principal')) {
            return $user->hasPermissionTo('student.manage');
        }

        // Teacher with student.manage permission
        if ($user->hasRole('teacher')) {
            return $user->hasPermissionTo('student.manage');
        }

        return false;
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

        // Teacher can reset student passwords in their assigned grades
        if ($user->hasRole('teacher') && $model->hasRole('student')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($model->grade_level, $assignedGrades) && $user->hasPermissionTo('student.manage');
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
        // Principal can archive any user
        if ($user->hasRole('principal')) {
            return $user->hasPermissionTo('user.manage');
        }

        // Teacher can archive students in their assigned grades
        if ($user->hasRole('teacher') && $model->hasRole('student')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($model->grade_level, $assignedGrades) && $user->hasPermissionTo('student.manage');
        }

        return false;
    }

    /**
     * Determine if the user can restore a user.
     */
    public function restore(User $user, User $model): bool
    {
        return $this->archive($user, $model);
    }
}
