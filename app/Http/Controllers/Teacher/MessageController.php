<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\ActivityLog;

class MessageController extends Controller
{
    /**
     * Display all conversations (grouped by student) for the logged-in teacher.
     * Replaces the old Inbox/Sent dual-table view.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');

        // Pull every message involving this teacher (either direction)
        $messages = Message::where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->with(['sender:id,name,lrn,grade_level', 'receiver:id,name,lrn,grade_level'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group into one "conversation" per student (the other participant)
        $conversations = $messages
            ->groupBy(function ($msg) use ($user) {
                return $msg->sender_id === $user->id ? $msg->receiver_id : $msg->sender_id;
            })
            ->map(function ($thread, $studentId) use ($user) {
                $latest = $thread->first(); // already sorted desc, so first = latest
                $otherUser = $latest->sender_id === $user->id ? $latest->receiver : $latest->sender;

                $unreadCount = $thread
                    ->where('receiver_id', $user->id)
                    ->where('status', 'unread')
                    ->count();

                return [
                    'student_id'        => $studentId,
                    'name'               => $otherUser->name ?? 'Unknown Student',
                    'lrn'                => $otherUser->lrn ?? '',
                    'grade_level'        => $otherUser->grade_level ?? '',
                    'last_message'       => Str::limit($latest->message, 70),
                    'last_message_time'  => $latest->created_at->diffForHumans(),
                    'last_message_at'    => $latest->created_at,
                    'last_message_id'    => $latest->id,
                    'category'           => $latest->category,
                    'unread_count'       => $unreadCount,
                    'is_last_from_me'    => $latest->sender_id === $user->id,
                ];
            })
            ->when($search, function ($collection) use ($search) {
                return $collection->filter(function ($conv) use ($search) {
                    return stripos($conv['name'], $search) !== false
                        || stripos($conv['lrn'], $search) !== false;
                });
            })
            ->sortByDesc('last_message_at')
            ->values();

        $totalUnread = $conversations->sum('unread_count');

        return Inertia::render('Teacher/Messages/Index', [
            'conversations' => $conversations,
            'unread_count'  => $totalUnread,
            'filters'       => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show compose form.
     */
    public function create()
    {
        Gate::authorize('message.send');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();
        $students = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->select('id', 'name', 'lrn', 'grade_level')
            ->orderBy('name')
            ->get()
            ->map(fn($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'lrn'         => $s->lrn,
                'grade_level' => $s->grade_level,
            ]);

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];

        return Inertia::render('Teacher/Messages/Compose', [
            'students'   => $students,
            'categories' => $categories,
        ]);
    }

    /**
     * Send a new message. Also used by the conversation view to send
     * follow-up messages within an existing thread (no separate "reply"
     * route needed for that case).
     */
    public function store(Request $request)
    {
        Gate::authorize('message.send');

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject'     => 'nullable|string|max:255',
            'category'    => 'required|in:lesson,assignment,quiz,educational_game,general_academic_concern',
            'message'     => 'required|string',
        ]);

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();
        $receiver = User::role('student')->whereIn('grade_level', $assignedGrades)->findOrFail($validated['receiver_id']);

        $message = Message::create([
            'sender_id'   => $teacher->id,
            'receiver_id' => $receiver->id,
            'subject'     => $validated['subject'] ?: ucfirst(str_replace('_', ' ', $validated['category'])),
            'category'    => $validated['category'],
            'message'     => $validated['message'],
            'status'      => 'unread',
        ]);

        ActivityLog::create([
            'user_id'              => $teacher->id,
            'user_role'            => 'teacher',
            'activity_type'        => 'send',
            'activity_description' => 'Sent message to ' . $receiver->name . ' ("' . $message->subject . '")',
            'related_module'       => 'Message Module',
        ]);

        return redirect()->route('teacher.messages.show', $message->id)
            ->with('success', 'Message sent successfully!');
    }

    /**
     * View the full conversation thread with a student.
     * The route still binds a single Message ($message) so no route
     * change was needed — we just use it to identify which student
     * this conversation is with, then load the whole thread.
     */
    public function show(Message $message)
    {
        Gate::authorize('message.view');

        $user = auth()->user();

        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403);
        }

        $studentId = $message->sender_id === $user->id ? $message->receiver_id : $message->sender_id;
        $student = User::select('id', 'name', 'lrn', 'grade_level')->findOrFail($studentId);

        $thread = Message::where(function ($q) use ($user, $studentId) {
                $q->where('sender_id', $user->id)->where('receiver_id', $studentId);
            })
            ->orWhere(function ($q) use ($user, $studentId) {
                $q->where('sender_id', $studentId)->where('receiver_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark everything the teacher received in this thread as read
        Message::where('sender_id', $studentId)
            ->where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->update(['status' => 'read']);

        return Inertia::render('Teacher/Messages/Show', [
            'student' => [
                'id'          => $student->id,
                'name'        => $student->name,
                'lrn'         => $student->lrn,
                'grade_level' => $student->grade_level,
            ],
            'messages' => $thread->map(fn($msg) => [
                'id'         => $msg->id,
                'message'    => $msg->message,
                'category'   => $msg->category,
                'status'     => $msg->status,
                'is_mine'    => $msg->sender_id === $user->id,
                'created_at' => $msg->created_at->format('M d, Y g:i A'),
            ]),
        ]);
    }

    /**
     * Reply to a received message.
     * Left untouched — kept for backward compatibility / other callers.
     * The new conversation view sends follow-ups through store() instead.
     */
    public function reply(Request $request, Message $message)
    {
        Gate::authorize('message.send');

        if ($message->receiver_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        $reply = Message::create([
            'sender_id'   => auth()->id(),
            'receiver_id' => $message->sender_id,
            'subject'     => 'Re: ' . $message->subject,
            'category'    => $message->category,
            'message'     => $validated['reply'],
            'status'      => 'unread',
        ]);

        $message->update(['status' => 'replied']);

        ActivityLog::create([
            'user_id'              => auth()->id(),
            'user_role'            => 'teacher',
            'activity_type'        => 'send',
            'activity_description' => 'Replied to message from ' . $message->sender->name . ' ("' . $message->subject . '")',
            'related_module'       => 'Message Module',
        ]);

        return redirect()->route('teacher.messages.show', $reply->id)
            ->with('success', 'Reply sent successfully!');
    }

    /**
     * Delete a message (only if the user is sender or receiver).
     * Untouched.
     */
    public function destroy(Message $message)
    {
        Gate::authorize('message.delete');

        $user = auth()->user();
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            abort(403);
        }

        $message->delete();

        return redirect()->route('teacher.messages.index')
            ->with('success', 'Message deleted successfully.');
    }
}
