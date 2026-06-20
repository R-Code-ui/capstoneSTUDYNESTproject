<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    /**
     * Determine if the user can view any lessons.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('lesson.view');
    }

    /**
     * Determine if the user can view a specific lesson.
     */
    public function view(User $user, Lesson $lesson): bool
    {
        // Principal can view any lesson
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teacher can only view lessons for their assigned grade levels
        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($lesson->grade_level, $assignedGrades);
        }

        // Student can only view lessons for their grade level
        if ($user->hasRole('student')) {
            return $user->grade_level === $lesson->grade_level;
        }

        return false;
    }

    /**
     * Determine if the user can create a lesson.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('lesson.create');
    }

    /**
     * Determine if the user can update a lesson.
     */
    public function update(User $user, Lesson $lesson): bool
    {
        // Principal can update any lesson
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teacher can only update lessons they created AND for their assigned grades
        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return $user->id === $lesson->teacher_id && in_array($lesson->grade_level, $assignedGrades);
        }

        return false;
    }

    /**
     * Determine if the user can delete a lesson.
     */
    public function delete(User $user, Lesson $lesson): bool
    {
        // Principal can delete any lesson
        if ($user->hasRole('principal')) {
            return true;
        }

        // Teacher can only delete lessons they created
        if ($user->hasRole('teacher')) {
            return $user->id === $lesson->teacher_id;
        }

        return false;
    }
}
