<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display all conversations (grouped by teacher) with pagination.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');
        $studentId = $user->id;

        // Subquery: latest message per conversation pair (filtered by visibility)
        $latestIds = DB::table('messages')
            ->selectRaw('LEAST(sender_id, receiver_id) AS person1, GREATEST(sender_id, receiver_id) AS person2, MAX(id) AS latest_id')
            ->where(function ($q) use ($studentId) {
                $q->where('sender_id', $studentId)
                  ->orWhere('receiver_id', $studentId);
            })
            ->whereNull('student_deleted_at')
            ->groupBy('person1', 'person2');

        $conversationsQuery = Message::joinSub($latestIds, 'lm', function ($join) {
                $join->on('messages.id', '=', 'lm.latest_id');
            })
            ->whereNull('messages.student_deleted_at')
            ->with(['sender:id,name,lrn,grade_level', 'receiver:id,name,lrn,grade_level'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('sender', fn($sq) => $sq->where('name', 'like', "%{$search}%"))
                      ->orWhereHas('receiver', fn($sq) => $sq->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('messages.created_at', 'desc');

        $paginator = $conversationsQuery->paginate(10);

        $conversations = $paginator->through(function ($msg) use ($user) {
            $otherUser = $msg->sender_id === $user->id ? $msg->receiver : $msg->sender;
            $teacherId = $otherUser->id;

            $unreadCount = Message::where(function ($q) use ($user, $teacherId) {
                    $q->where('sender_id', $teacherId)
                      ->where('receiver_id', $user->id);
                })
                ->whereNull('student_deleted_at')
                ->where('status', 'unread')
                ->count();

            return [
                'teacher_id'         => $teacherId,
                'name'               => $otherUser->name ?? 'Unknown Teacher',
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
            ->whereNull('student_deleted_at')
            ->where('status', 'unread')
            ->count();

        return Inertia::render('Student/Messages/Index', [
            'conversations' => $conversations->items(),
            'unread_count'  => $totalUnread,
            'filters'       => ['search' => $search],
            'pagination'    => $paginator->toArray(),
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

        // ✅ Log: student sent a message
        ActivityLog::create([
            'user_id'             => $student->id,
            'user_role'           => 'student',
            'activity_type'       => 'send',
            'activity_description'=> 'Sent a message to teacher: "' . $teacher->name . '"',
            'related_module'      => 'Message Module',
        ]);

        return redirect()->route('student.messages.show', $message->id)
            ->with('success', 'Your question has been sent to the teacher!');
    }

    /**
     * View the full conversation thread with a teacher.
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

        // ✅ Fixed: wrap both OR conditions in a single closure, then apply soft-delete null check
        $thread = Message::where(function ($q) use ($user, $teacherId) {
                $q->where(function ($sub) use ($user, $teacherId) {
                    $sub->where('sender_id', $user->id)->where('receiver_id', $teacherId);
                })->orWhere(function ($sub) use ($user, $teacherId) {
                    $sub->where('sender_id', $teacherId)->where('receiver_id', $user->id);
                });
            })
            ->whereNull('student_deleted_at')
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark everything the student received in this thread as read
        Message::where('sender_id', $teacherId)
            ->where('receiver_id', $user->id)
            ->whereNull('student_deleted_at')
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
     * Reply to a message (kept for backward compatibility).
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

        // ✅ Log: student replied to a message
        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'send',
            'activity_description'=> 'Replied to message from teacher',
            'related_module'      => 'Message Module',
        ]);

        return redirect()->route('student.messages.show', $reply->id)
            ->with('success', 'Your reply has been sent!');
    }

    /**
     * Delete a single message (soft delete for student).
     */
    public function destroy(Message $message)
    {
        Gate::authorize('message.delete');

        $user = auth()->user();
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            abort(403);
        }

        // Soft delete – set student timestamp
        $message->update(['student_deleted_at' => now()]);

        // Stay on the same conversation page
        return redirect()->back()->with('success', 'Message deleted.');
    }

    /**
     * Delete an entire conversation thread with a teacher (soft delete for student).
     */
    public function destroyConversation(Request $request, $teacherId)
    {
        Gate::authorize('message.delete');

        $student = auth()->user();

        Message::where(function ($q) use ($student, $teacherId) {
            $q->where('sender_id', $student->id)
              ->where('receiver_id', $teacherId);
        })->orWhere(function ($q) use ($student, $teacherId) {
            $q->where('sender_id', $teacherId)
              ->where('receiver_id', $student->id);
        })->update(['student_deleted_at' => now()]);

        return redirect()->route('student.messages.index')
            ->with('success', 'Conversation deleted successfully.');
    }
}
