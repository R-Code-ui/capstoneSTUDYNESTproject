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
     * Display the inbox.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');

        $messages = Message::where('receiver_id', $user->id)
            ->with('sender')
            ->when($search, function ($query, $search) {
                return $query->where('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhereHas('sender', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($categoryFilter, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];
        $statuses = ['unread', 'read', 'replied'];

        $unreadCount = Message::where('receiver_id', $user->id)
            ->where('status', 'unread')
            ->count();

        return Inertia::render('Student/Messages/Index', [
            'messages' => $messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'from' => $message->sender->name,
                    'subject' => $message->subject,
                    'category' => $message->category,
                    'message' => substr($message->message, 0, 80) . (strlen($message->message) > 80 ? '...' : ''),
                    'status' => $message->status,
                    'created_at' => $message->created_at->diffForHumans(),
                ];
            }),
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
     * Show the form for composing a new message.
     */
    public function create()
    {
        $user = auth()->user();

        // Get teachers assigned to this student's grade level
        $teachers = User::role('teacher')
            ->whereHas('gradeAssignments', function ($query) use ($user) {
                $query->where('grade_level', $user->grade_level);
            })
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                ];
            });

        $categories = ['lesson', 'assignment', 'quiz', 'educational_game', 'general_academic_concern'];

        return Inertia::render('Student/Messages/Compose', [
            'teachers' => $teachers,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'category' => 'required|in:lesson,assignment,quiz,educational_game,general_academic_concern',
            'message' => 'required|string',
        ]);

        Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'unread',
        ]);

        return redirect()->route('student.messages.index')
            ->with('success', 'Message sent successfully!');
    }

    /**
     * Display a specific message.
     */
    public function show(Message $message)
    {
        $user = auth()->user();

        // Ensure the user is the receiver or sender
        if ($message->receiver_id !== $user->id && $message->sender_id !== $user->id) {
            abort(403);
        }

        // Mark as read if user is the receiver
        if ($message->receiver_id === $user->id && $message->status === 'unread') {
            $message->update(['status' => 'read']);
        }

        $message->load(['sender', 'receiver']);

        return Inertia::render('Student/Messages/Show', [
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
                'created_at' => $message->created_at->format('M d, Y h:i A'),
                'is_sender' => $message->sender_id === $user->id,
            ],
        ]);
    }

    /**
     * Reply to a message.
     */
    public function reply(Request $request, Message $message)
    {
        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        // Check if user is the receiver (student replies to teacher)
        if ($message->receiver_id !== auth()->id()) {
            abort(403);
        }

        $reply = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $message->sender_id,
            'subject' => 'Re: ' . $message->subject,
            'category' => $message->category,
            'message' => $validated['reply'],
            'status' => 'unread',
        ]);

        // Mark original message as replied
        $message->update(['status' => 'replied']);

        return redirect()->route('student.messages.show', $reply->id)
            ->with('success', 'Reply sent successfully!');
    }
}
