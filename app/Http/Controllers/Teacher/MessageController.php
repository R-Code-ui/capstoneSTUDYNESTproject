<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use App\Models\ActivityLog;

class MessageController extends Controller
{
    /**
     * Display inbox & sent messages in a unified view.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');
        $statusFilter = $request->input('status');

        // Inbox messages (received by teacher)
        $inboxMessages = Message::where('receiver_id', $user->id)
            ->with('sender:id,name')
            ->when($search, function ($query, $search) {
                $query->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%")
                      ->orWhereHas('sender', fn($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->when($statusFilter, fn($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($msg) => [
                'id' => $msg->id,
                'from' => $msg->sender->name,
                'subject' => $msg->subject,
                'category' => $msg->category,
                'status' => $msg->status,
                'created_at' => $msg->created_at->format('Y-m-d H:i'),
            ]);

        // Sent messages (sent by teacher)
        $sentMessages = Message::where('sender_id', $user->id)
            ->with('receiver:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($msg) => [
                'id' => $msg->id,
                'to' => $msg->receiver->name,
                'subject' => $msg->subject,
                'category' => $msg->category,
                'status' => $msg->status,
                'created_at' => $msg->created_at->format('Y-m-d H:i'),
            ]);

        $unreadCount = Message::where('receiver_id', $user->id)->where('status', 'unread')->count();

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];
        $statuses = ['unread', 'read', 'replied'];

        return Inertia::render('Teacher/Messages/Index', [
            'inboxMessages' => $inboxMessages,
            'sentMessages' => $sentMessages,
            'unread_count' => $unreadCount,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
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
            ->select('id', 'name', 'lrn')
            ->orderBy('name')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'lrn' => $s->lrn,
            ]);

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];

        return Inertia::render('Teacher/Messages/Compose', [
            'students' => $students,
            'categories' => $categories,
        ]);
    }

    /**
     * Send a new message.
     */
    public function store(Request $request)
    {
        Gate::authorize('message.send');

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'category' => 'required|in:lesson,assignment,quiz,educational_game,general_academic_concern',
            'message' => 'required|string',
        ]);

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();
        $receiver = User::role('student')->whereIn('grade_level', $assignedGrades)->findOrFail($validated['receiver_id']);

        $message = Message::create([
            'sender_id' => $teacher->id,
            'receiver_id' => $receiver->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'unread',
        ]);

        // ✅ Log message sent
        ActivityLog::create([
            'user_id'             => $teacher->id,
            'user_role'           => 'teacher',
            'activity_type'       => 'send',
            'activity_description'=> 'Sent message to ' . $receiver->name . ' ("' . $message->subject . '")',
            'related_module'      => 'Message Module',
        ]);

        return redirect()->route('teacher.messages.index')
            ->with('success', 'Message sent successfully!');
    }

    /**
     * View a specific message (can be inbox or sent).
     */
    public function show(Message $message)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403);
        }

        if ($message->receiver_id === $user->id && $message->status === 'unread') {
            $message->update(['status' => 'read']);
        }

        $message->load(['sender:id,name', 'receiver:id,name']);

        return Inertia::render('Teacher/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'from' => $message->sender->name,
                'from_id' => $message->sender_id,
                'to' => $message->receiver->name,
                'to_id' => $message->receiver_id,
                'subject' => $message->subject,
                'category' => $message->category,
                'message' => $message->message,
                'status' => $message->status,
                'created_at' => $message->created_at->format('Y-m-d H:i'),
                'is_sender' => $message->sender_id === $user->id,
            ],
        ]);
    }

    /**
     * Reply to a received message.
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
            'sender_id' => auth()->id(),
            'receiver_id' => $message->sender_id,
            'subject' => 'Re: ' . $message->subject,
            'category' => $message->category,
            'message' => $validated['reply'],
            'status' => 'unread',
        ]);

        $message->update(['status' => 'replied']);

        // ✅ Log reply
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'send',
            'activity_description'=> 'Replied to message from ' . $message->sender->name . ' ("' . $message->subject . '")',
            'related_module'      => 'Message Module',
        ]);

        return redirect()->route('teacher.messages.show', $reply->id)
            ->with('success', 'Reply sent successfully!');
    }

    /**
     * Delete a message (only if the user is sender or receiver).
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
