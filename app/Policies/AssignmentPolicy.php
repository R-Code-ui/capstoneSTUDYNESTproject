<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    /**
     * Determine if the user can view any assignments.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('assignment.view');
    }

    /**
     * Determine if the user can view a specific assignment.
     */
    public function view(User $user, Assignment $assignment): bool
    {
        if ($user->hasRole('principal')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($assignment->grade_level, $assignedGrades);
        }

        if ($user->hasRole('student')) {
            return $user->grade_level === $assignment->grade_level;
        }

        return false;
    }

    /**
     * Determine if the user can create an assignment.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('assignment.create');
    }

    /**
     * Determine if the user can update an assignment.
     */
    public function update(User $user, Assignment $assignment): bool
    {
        if ($user->hasRole('principal')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return $user->id === $assignment->teacher_id && in_array($assignment->grade_level, $assignedGrades);
        }

        return false;
    }

    /**
     * Determine if the user can delete an assignment.
     */
    public function delete(User $user, Assignment $assignment): bool
    {
        if ($user->hasRole('principal')) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->id === $assignment->teacher_id;
        }

        return false;
    }
}
