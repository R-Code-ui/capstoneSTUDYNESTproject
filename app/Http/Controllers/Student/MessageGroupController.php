<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MessageGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MessageGroupController extends Controller
{
    public function show(MessageGroup $messageGroup)
    {
        Gate::authorize('view', $messageGroup);

        $messageGroup->load([
            'owner:id,name',
            'subject:id,name,grade_level',
            'members:id,name,grade_level',
            'messages' => fn ($query) => $query->with('sender:id,name')->oldest(),
        ]);

        return Inertia::render('Student/Messages/Groups/Show', [
            'group' => [
                'id' => $messageGroup->id,
                'name' => $messageGroup->name,
                'description' => $messageGroup->description,
                'is_archived' => $messageGroup->is_archived,
                'owner_id' => $messageGroup->teacher_id,
                'owner_name' => $messageGroup->owner->name,
                'subject' => $messageGroup->subject,
                'members' => $messageGroup->members->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'grade_level' => $member->grade_level,
                    'is_owner' => $member->id === $messageGroup->teacher_id,
                ])->values(),
                'messages' => $messageGroup->messages->map(fn ($message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'created_at' => $message->created_at->format('M d, Y g:i A'),
                ])->values(),
            ],
        ]);
    }

    public function send(Request $request, MessageGroup $messageGroup)
    {
        Gate::authorize('send', $messageGroup);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $messageGroup->messages()->create([
            'sender_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return redirect()->route('student.messages.groups.show', $messageGroup)
            ->with('message', 'Message sent.');
    }
}
