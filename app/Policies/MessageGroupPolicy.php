<?php

namespace App\Policies;

use App\Models\MessageGroup;
use App\Models\User;

class MessageGroupPolicy
{
    public function view(User $user, MessageGroup $group): bool
    {
        return $user->hasPermissionTo('message.group.view')
            && $group->members()->whereKey($user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isTeacher() && $user->hasPermissionTo('message.group.create');
    }

    public function manage(User $user, MessageGroup $group): bool
    {
        return $user->isTeacher()
            && $user->hasPermissionTo('message.group.manage')
            && $group->teacher_id === $user->id;
    }

    public function send(User $user, MessageGroup $group): bool
    {
        return $user->hasPermissionTo('message.group.send')
            && $group->members()->whereKey($user->id)->exists()
            && !$group->is_archived;
    }
}
