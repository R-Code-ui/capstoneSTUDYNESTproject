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
            && $this->isParticipant($user, $message)
            && $this->canAccessCounterparty($user, $message);
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
            && $message->sender_id === $user->id
            && $this->canAccessCounterparty($user, $message);
    }

    private function isParticipant(User $user, Message $message): bool
    {
        return $user->id === $message->sender_id || $user->id === $message->receiver_id;
    }

    private function canAccessCounterparty(User $user, Message $message): bool
    {
        $counterpartyId = $message->sender_id === $user->id
            ? $message->receiver_id
            : $message->sender_id;

        $counterparty = User::find($counterpartyId);

        if (!$counterparty) {
            return false;
        }

        if ($user->isTeacher()) {
            return $counterparty->isStudent()
                && $user->gradeAssignments()
                    ->where('grade_level', $counterparty->grade_level)
                    ->exists();
        }

        if ($user->isStudent()) {
            return $counterparty->isTeacher()
                && $counterparty->gradeAssignments()
                    ->where('grade_level', $user->grade_level)
                    ->exists();
        }

        return false;
    }
}
