<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('quiz.view');
    }

    public function view(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($quiz->grade_level, $assignedGrades);
        }

        if ($user->hasRole('student')) {
            return $user->grade_level === $quiz->grade_level;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('quiz.create');
    }

    public function update(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return $user->id === $quiz->teacher_id && in_array($quiz->grade_level, $assignedGrades);
        }

        return false;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            return $user->id === $quiz->teacher_id;
        }

        return false;
    }
}
