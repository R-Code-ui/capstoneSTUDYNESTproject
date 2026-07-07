<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of the student's inbox messages.
     */
    public function index(Request $request)
    {
        Gate::authorize('message.view');

        $user = auth()->user();
        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');

        $messages = Message::where('receiver_id', $user->id)
            ->with('sender:id,name')
            ->when($search, function ($query, $search) {
                $query->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%")
                      ->orWhereHas('sender', fn($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->when($categoryFilter, fn($q, $c) => $q->where('category', $c))
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
                'created_at' => $msg->created_at->format('M d, Y H:i'),
            ]);

        $unreadCount = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];
        $statuses = ['unread', 'read', 'replied'];

        return Inertia::render('Student/Messages/Index', [
            'messages' => $messages,
            'unread_count' => $unreadCount,
            'categories' => $categories,
            'statuses' => $statuses,
            'filters' => [
                'search' => $search,
                'category' => $categoryFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Show the form for composing a new message (Ask Teacher).
     */
    public function create()
    {
        Gate::authorize('message.send');

        $student = auth()->user();
        $studentGrade = $student->grade_level;

        // Get teachers assigned to this student's grade level
        $teachers = User::role('teacher')
            ->whereHas('gradeAssignments', function ($query) use ($studentGrade) {
                $query->where('grade_level', $studentGrade);
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'name' => $t->name,
            ]);

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];

        return Inertia::render('Student/Messages/Compose', [
            'teachers' => $teachers,
            'categories' => $categories,
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
            'subject' => 'required|string|max:255',
            'category' => 'required|in:lesson,assignment,quiz,educational_game,general_academic_concern',
            'message' => 'required|string',
        ]);

        // Ensure receiver is a teacher assigned to this student's grade
        $teacher = User::role('teacher')
            ->where('id', $validated['receiver_id'])
            ->whereHas('gradeAssignments', function ($query) use ($studentGrade) {
                $query->where('grade_level', $studentGrade);
            })
            ->firstOrFail();

        Message::create([
            'sender_id' => $student->id,
            'receiver_id' => $teacher->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'unread',
        ]);

        return redirect()->route('student.messages.index')
            ->with('success', 'Your question has been sent to the teacher!');
    }

    /**
     * Display the specified message.
     */
    public function show(Message $message)
    {
        Gate::authorize('message.view');

        $user = auth()->user();

        // Student can only view messages where they are the receiver
        if ($message->receiver_id !== $user->id) {
            abort(403);
        }

        // Mark as read if unread
        if ($message->status === 'unread') {
            $message->update(['status' => 'read']);
        }

        $message->load('sender:id,name');

        return Inertia::render('Student/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'from' => $message->sender->name,
                'from_id' => $message->sender_id,
                'subject' => $message->subject,
                'category' => $message->category,
                'message' => $message->message,
                'status' => $message->status,
                'created_at' => $message->created_at->format('M d, Y H:i'),
                'is_sender' => $message->sender_id === $user->id,
            ],
        ]);
    }

    /**
     * Reply to a message.
     */
    public function reply(Request $request, Message $message)
    {
        Gate::authorize('message.send');

        $user = auth()->user();

        // Student can only reply to messages they received
        if ($message->receiver_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        // Create reply (student -> teacher)
        $reply = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $message->sender_id,
            'subject' => 'Re: ' . $message->subject,
            'category' => $message->category,
            'message' => $validated['reply'],
            'status' => 'unread',
        ]);

        // Mark original message as replied
        $message->update(['status' => 'replied']);

        return redirect()->route('student.messages.show', $reply->id)
            ->with('success', 'Your reply has been sent!');
    }
}
