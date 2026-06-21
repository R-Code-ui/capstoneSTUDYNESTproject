<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(Request $request)
    {
        Gate::authorize('announcement.view');

        $user = auth()->user();

        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');

        $announcements = Announcement::where('user_id', $user->id)
            ->where('user_role', 'teacher')
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            })
            ->when($categoryFilter, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('target_audience', $grade);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $categories = ['General Announcement', 'Reminder', 'Quiz Schedule', 'Assignment Notice', 'Classroom Activity', 'Project Notice', 'Suspension Announcement'];
        $statuses = ['draft', 'published', 'archived'];
        $priorities = ['normal', 'important', 'urgent'];

        return Inertia::render('Teacher/Announcements/Index', [
            'announcements' => $announcements->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'category' => $announcement->category,
                    'target_audience' => $announcement->target_audience,
                    'priority' => $announcement->priority,
                    'is_pinned' => $announcement->is_pinned,
                    'status' => $announcement->status,
                    'publish_date' => $announcement->publish_date,
                    'expiration_date' => $announcement->expiration_date,
                    'view_count' => $announcement->view_count,
                    'created_at' => $announcement->created_at->diffForHumans(),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'categories' => $categories,
            'statuses' => $statuses,
            'priorities' => $priorities,
            'filters' => [
                'search' => $search,
                'category' => $categoryFilter,
                'status' => $statusFilter,
                'grade_level' => $gradeFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new announcement.
     */
    public function create()
    {
        Gate::authorize('announcement.create');

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $categories = ['General Announcement', 'Reminder', 'Quiz Schedule', 'Assignment Notice', 'Classroom Activity', 'Project Notice', 'Suspension Announcement'];
        $priorities = ['normal', 'important', 'urgent'];
        $statuses = ['draft', 'published'];

        return Inertia::render('Teacher/Announcements/Create', [
            'assigned_grades' => $assignedGrades,
            'categories' => $categories,
            'priorities' => $priorities,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        Gate::authorize('announcement.create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'content' => 'required|string',
            'target_audience' => 'required|string|in:all_assigned_students,Grade 4,Grade 5,Grade 6',
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        Announcement::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'title' => $validated['title'],
            'category' => $validated['category'],
            'content' => $validated['content'],
            'target_audience' => $validated['target_audience'],
            'priority' => $validated['priority'],
            'is_pinned' => $validated['is_pinned'] ?? false,
            'status' => $validated['status'],
            'publish_date' => $validated['publish_date'],
            'expiration_date' => $validated['expiration_date'] ?? null,
            'view_count' => 0,
        ]);

        return redirect()->route('teacher.announcements.index')
            ->with('success', 'Announcement created successfully!');
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement)
    {
        Gate::authorize('announcement.view', $announcement);

        return Inertia::render('Teacher/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'category' => $announcement->category,
                'content' => $announcement->content,
                'target_audience' => $announcement->target_audience,
                'priority' => $announcement->priority,
                'is_pinned' => $announcement->is_pinned,
                'status' => $announcement->status,
                'publish_date' => $announcement->publish_date,
                'expiration_date' => $announcement->expiration_date,
                'view_count' => $announcement->view_count,
                'created_at' => $announcement->created_at->format('Y-m-d H:i'),
                'posted_by' => $announcement->user->name,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified announcement.
     */
    public function edit(Announcement $announcement)
    {
        Gate::authorize('announcement.edit', $announcement);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $categories = ['General Announcement', 'Reminder', 'Quiz Schedule', 'Assignment Notice', 'Classroom Activity', 'Project Notice', 'Suspension Announcement'];
        $priorities = ['normal', 'important', 'urgent'];
        $statuses = ['draft', 'published', 'archived'];

        return Inertia::render('Teacher/Announcements/Edit', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'category' => $announcement->category,
                'content' => $announcement->content,
                'target_audience' => $announcement->target_audience,
                'priority' => $announcement->priority,
                'is_pinned' => $announcement->is_pinned,
                'status' => $announcement->status,
                'publish_date' => $announcement->publish_date,
                'expiration_date' => $announcement->expiration_date,
            ],
            'assigned_grades' => $assignedGrades,
            'categories' => $categories,
            'priorities' => $priorities,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement)
    {
        Gate::authorize('announcement.edit', $announcement);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'content' => 'required|string',
            'target_audience' => 'required|string|in:all_assigned_students,Grade 4,Grade 5,Grade 6',
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        $announcement->update($validated);

        return redirect()->route('teacher.announcements.index')
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
        Gate::authorize('announcement.delete', $announcement);

        $announcement->delete();

        return redirect()->route('teacher.announcements.index')
            ->with('success', 'Announcement deleted successfully!');
    }

    /**
     * Publish an announcement.
     */
    public function publish(Announcement $announcement)
    {
        Gate::authorize('announcement.edit', $announcement);

        $announcement->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Announcement published successfully!');
    }

    /**
     * Archive an announcement.
     */
    public function archive(Announcement $announcement)
    {
        Gate::authorize('announcement.edit', $announcement);

        $announcement->update(['status' => 'archived']);

        return redirect()->back()->with('success', 'Announcement archived successfully!');
    }
}
