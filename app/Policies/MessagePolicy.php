<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    /**
     * Determine if the user can view any messages.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('message.view');
    }

    /**
     * Determine if the user can view the message.
     */
    public function view(User $user, Message $message): bool
    {
        return $user->hasPermissionTo('message.view')
            && ($user->id === $message->sender_id || $user->id === $message->receiver_id);
    }

    /**
     * Determine if the user can create a message.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('message.send');
    }

    /**
     * Determine if the user can delete the message.
     */
    public function delete(User $user, Message $message): bool
    {
        return $user->hasPermissionTo('message.delete')
            && ($user->id === $message->sender_id || $user->id === $message->receiver_id);
    }
}
