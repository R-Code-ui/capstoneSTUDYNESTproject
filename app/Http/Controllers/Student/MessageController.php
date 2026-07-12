<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display all conversations (grouped by teacher) for the logged-in student.
     * Same pattern as the Teacher panel's Message module.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');

        $messages = Message::where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->with(['sender:id,name,lrn,grade_level', 'receiver:id,name,lrn,grade_level'])
            ->orderBy('created_at', 'desc')
            ->get();

        $conversations = $messages
            ->groupBy(function ($msg) use ($user) {
                return $msg->sender_id === $user->id ? $msg->receiver_id : $msg->sender_id;
            })
            ->map(function ($thread, $teacherId) use ($user) {
                $latest = $thread->first(); // already sorted desc, so first = latest
                $otherUser = $latest->sender_id === $user->id ? $latest->receiver : $latest->sender;

                $unreadCount = $thread
                    ->where('receiver_id', $user->id)
                    ->where('status', 'unread')
                    ->count();

                return [
                    'teacher_id'         => $teacherId,
                    'name'               => $otherUser->name ?? 'Unknown Teacher',
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
                    return stripos($conv['name'], $search) !== false;
                });
            })
            ->sortByDesc('last_message_at')
            ->values();

        $totalUnread = $conversations->sum('unread_count');

        return Inertia::render('Student/Messages/Index', [
            'conversations' => $conversations,
            'unread_count'  => $totalUnread,
            'filters'       => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for composing a new message ("Ask Teacher").
     */
    public function create()
    {
        Gate::authorize('message.send');

        $student = auth()->user();
        $studentGrade = $student->grade_level;

        $teachers = User::role('teacher')
            ->whereHas('gradeAssignments', function ($query) use ($studentGrade) {
                $query->where('grade_level', $studentGrade);
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'   => $t->id,
                'name' => $t->name,
            ]);

        return Inertia::render('Student/Messages/Compose', [
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        Gate::authorize('message.send');

        $student = auth()->user();
        $studentGrade = $student->grade_level;

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject'     => 'nullable|string|max:255',
            'category'    => 'required|in:lesson,assignment,quiz,educational_game,general_academic_concern',
            'message'     => 'required|string',
        ]);

        // Ensure receiver is a teacher assigned to this student's grade
        $teacher = User::role('teacher')
            ->where('id', $validated['receiver_id'])
            ->whereHas('gradeAssignments', function ($query) use ($studentGrade) {
                $query->where('grade_level', $studentGrade);
            })
            ->firstOrFail();

        $message = Message::create([
            'sender_id'   => $student->id,
            'receiver_id' => $teacher->id,
            'subject'     => $validated['subject'] ?: ucfirst(str_replace('_', ' ', $validated['category'])),
            'category'    => $validated['category'],
            'message'     => $validated['message'],
            'status'      => 'unread',
        ]);

        return redirect()->route('student.messages.show', $message->id)
            ->with('success', 'Your question has been sent to the teacher!');
    }

    /**
     * View the full conversation thread with a teacher.
     * The route still binds a single Message ($message) — we only use it
     * to identify which teacher this conversation is with, then load the
     * whole thread, same pattern as the Teacher panel.
     */
    public function show(Message $message)
    {
        Gate::authorize('message.view');

        $user = auth()->user();

        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403);
        }

        $teacherId = $message->sender_id === $user->id ? $message->receiver_id : $message->sender_id;
        $teacher = User::select('id', 'name')->findOrFail($teacherId);

        $thread = Message::where(function ($q) use ($user, $teacherId) {
                $q->where('sender_id', $user->id)->where('receiver_id', $teacherId);
            })
            ->orWhere(function ($q) use ($user, $teacherId) {
                $q->where('sender_id', $teacherId)->where('receiver_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark everything the student received in this thread as read
        Message::where('sender_id', $teacherId)
            ->where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->update(['status' => 'read']);

        return Inertia::render('Student/Messages/Show', [
            'teacher' => [
                'id'   => $teacher->id,
                'name' => $teacher->name,
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
     * Reply to a message.
     * Left untouched — kept for backward compatibility / other callers.
     * The conversation view sends follow-ups through store() instead.
     */
    public function reply(Request $request, Message $message)
    {
        Gate::authorize('message.send');

        $user = auth()->user();

        if ($message->receiver_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        $reply = Message::create([
            'sender_id'   => $user->id,
            'receiver_id' => $message->sender_id,
            'subject'     => 'Re: ' . $message->subject,
            'category'    => $message->category,
            'message'     => $validated['reply'],
            'status'      => 'unread',
        ]);

        $message->update(['status' => 'replied']);

        return redirect()->route('student.messages.show', $reply->id)
            ->with('success', 'Your reply has been sent!');
    }

    /**
     * Delete a message (only if the student is sender or receiver).
     * Mirrors the Teacher panel's destroy() method exactly.
     */
    public function destroy(Message $message)
    {
        Gate::authorize('message.delete');

        $user = auth()->user();
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            abort(403);
        }

        $message->delete();

        return redirect()->route('student.messages.index')
            ->with('success', 'Message deleted successfully.');
    }
}
