<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;

class GamePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('game.view');
    }

    public function view(User $user, Game $game): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return in_array($game->grade_level, $assignedGrades);
        }

        if ($user->hasRole('student')) {
            return $user->grade_level === $game->grade_level;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('game.create');
    }

    public function update(User $user, Game $game): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
            return $user->id === $game->teacher_id && in_array($game->grade_level, $assignedGrades);
        }

        return false;
    }

    public function delete(User $user, Game $game): bool
    {
        if ($user->hasRole('principal')) return true;

        if ($user->hasRole('teacher')) {
            return $user->id === $game->teacher_id;
        }

        return false;
    }
}
