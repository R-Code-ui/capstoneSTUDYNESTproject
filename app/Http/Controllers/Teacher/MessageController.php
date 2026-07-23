<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\ActivityLog;

class MessageController extends Controller
{
    /**
     * Display all conversations (grouped by student) with pagination.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');
        $teacherId = $user->id;

        // Subquery: get the latest message ID for each conversation pair
        $latestIds = DB::table('messages')
            ->selectRaw('LEAST(sender_id, receiver_id) AS person1, GREATEST(sender_id, receiver_id) AS person2, MAX(id) AS latest_id')
            ->where(function ($q) use ($teacherId) {
                $q->where('sender_id', $teacherId)
                  ->orWhere('receiver_id', $teacherId);
            })
            ->groupBy('person1', 'person2');

        // Join to get full latest message rows
        $conversationsQuery = Message::joinSub($latestIds, 'lm', function ($join) {
                $join->on('messages.id', '=', 'lm.latest_id');
            })
            ->with(['sender:id,name,lrn,grade_level', 'receiver:id,name,lrn,grade_level'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('sender', fn($sq) => $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%"))
                      ->orWhereHas('receiver', fn($sq) => $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%"));
                });
            })
            ->orderBy('messages.created_at', 'desc');

        $paginator = $conversationsQuery->paginate(10);

        // Map the paginator's items into conversation cards
        $conversations = $paginator->through(function ($msg) use ($user) {
            $otherUser = $msg->sender_id === $user->id ? $msg->receiver : $msg->sender;
            $studentId = $otherUser->id;

            $unreadCount = Message::where(function ($q) use ($user, $studentId) {
                    $q->where('sender_id', $studentId)
                      ->where('receiver_id', $user->id);
                })->where('status', 'unread')->count();

            return [
                'student_id'        => $studentId,
                'name'               => $otherUser->name ?? 'Unknown Student',
                'lrn'                => $otherUser->lrn ?? '',
                'grade_level'        => $otherUser->grade_level ?? '',
                'last_message'       => Str::limit($msg->message, 70),
                'last_message_time'  => $msg->created_at->diffForHumans(),
                'last_message_at'    => $msg->created_at,
                'last_message_id'    => $msg->id,
                'category'           => $msg->category,
                'unread_count'       => $unreadCount,
                'is_last_from_me'    => $msg->sender_id === $user->id,
            ];
        });

        $totalUnread = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();

        return Inertia::render('Teacher/Messages/Index', [
            // ✅ Send the plain array, not the paginator object
            'conversations' => $conversations->items(),
            'unread_count'  => $totalUnread,
            'filters'       => ['search' => $search],
            'pagination'    => $paginator->toArray(),
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
     * Send a new message.
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
     * Delete a single message.
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

    /**
     * Delete an entire conversation thread with a student.
     */
    public function destroyConversation(Request $request, $studentId)
    {
        Gate::authorize('message.delete');

        $teacher = auth()->user();

        Message::where(function ($q) use ($teacher, $studentId) {
            $q->where('sender_id', $teacher->id)
              ->where('receiver_id', $studentId);
        })->orWhere(function ($q) use ($teacher, $studentId) {
            $q->where('sender_id', $studentId)
              ->where('receiver_id', $teacher->id);
        })->delete();

        return redirect()->route('teacher.messages.index')
            ->with('success', 'Conversation deleted successfully.');
    }
}
