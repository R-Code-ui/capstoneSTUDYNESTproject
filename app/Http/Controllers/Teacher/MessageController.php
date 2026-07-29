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

        $latestIds = DB::table('messages')
            ->selectRaw('LEAST(sender_id, receiver_id) AS person1, GREATEST(sender_id, receiver_id) AS person2, MAX(id) AS latest_id')
            ->where(function ($q) use ($teacherId) {
                $q->where('sender_id', $teacherId)
                  ->orWhere('receiver_id', $teacherId);
            })
            ->whereNull('teacher_deleted_at')
            ->groupBy('person1', 'person2');

        $conversationsQuery = Message::joinSub($latestIds, 'lm', function ($join) {
                $join->on('messages.id', '=', 'lm.latest_id');
            })
            ->whereNull('messages.teacher_deleted_at')
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

        $conversations = $paginator->through(function ($msg) use ($user) {
            $otherUser = $msg->sender_id === $user->id ? $msg->receiver : $msg->sender;
            $studentId = $otherUser->id;

            $unreadCount = Message::where(function ($q) use ($user, $studentId) {
                    $q->where('sender_id', $studentId)
                      ->where('receiver_id', $user->id);
                })
                ->whereNull('teacher_deleted_at')
                ->where('status', 'unread')
                ->count();

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
            ->whereNull('teacher_deleted_at')
            ->where('status', 'unread')
            ->count();

        return Inertia::render('Teacher/Messages/Index', [
            'conversations' => $conversations->items(),
            'unread_count'  => $totalUnread,
            'filters'       => ['search' => $search],
            'pagination'    => $paginator->toArray(),
        ]);
    }

    /**
     * Show compose form with students grouped by assigned grade.
     */
    public function create()
    {
        Gate::authorize('message.send');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        // Fetch all students for assigned grades
        $students = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->orderBy('name')
            ->get(['id', 'name', 'grade_level']);

        // Group students by grade level
        $studentsByGrade = [];
        foreach ($students as $student) {
            $grade = $student->grade_level;
            if (!isset($studentsByGrade[$grade])) {
                $studentsByGrade[$grade] = [];
            }
            $studentsByGrade[$grade][] = [
                'id'          => $student->id,
                'name'        => $student->name,
                'grade_level' => $student->grade_level,
            ];
        }

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];

        return Inertia::render('Teacher/Messages/Compose', [
            'assigned_grades'   => $assignedGrades,
            'students_by_grade' => $studentsByGrade,
            'categories'        => $categories,
        ]);
    }

    /**
     * Fetch students by specific grade (API endpoint) – kept for possible other use but no longer needed for compose.
     */
    public function getStudentsByGrade(Request $request)
    {
        Gate::authorize('message.send');

        $gradeLevel = $request->input('grade_level');
        $teacher = auth()->user();

        $students = User::role('student')
            ->where('grade_level', $gradeLevel)
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'grade_level', 'student_id']);

        return response()->json([
            'students' => $students->map(function ($student) {
                return [
                    'id'          => $student->id,
                    'name'        => $student->name,
                    'grade_level' => $student->grade_level,
                ];
            }),
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
                $q->where(function ($sub) use ($user, $studentId) {
                    $sub->where('sender_id', $user->id)->where('receiver_id', $studentId);
                })->orWhere(function ($sub) use ($user, $studentId) {
                    $sub->where('sender_id', $studentId)->where('receiver_id', $user->id);
                });
            })
            ->whereNull('teacher_deleted_at')
            ->orderBy('created_at', 'asc')
            ->get();

        Message::where('sender_id', $studentId)
            ->where('receiver_id', $user->id)
            ->whereNull('teacher_deleted_at')
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
     * Delete a single message (soft delete for teacher).
     */
    public function destroy(Message $message)
    {
        Gate::authorize('message.delete');

        $user = auth()->user();
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            abort(403);
        }

        $message->update(['teacher_deleted_at' => now()]);

        return redirect()->back()->with('success', 'Message deleted.');
    }

    /**
     * Delete an entire conversation thread with a student (soft delete for teacher).
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
        })->update(['teacher_deleted_at' => now()]);

        return redirect()->route('teacher.messages.index')
            ->with('success', 'Conversation deleted successfully.');
    }
}
