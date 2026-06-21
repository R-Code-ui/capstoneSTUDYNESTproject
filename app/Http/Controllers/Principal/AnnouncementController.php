<?php

namespace App\Http\Controllers\Principal;

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

        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');

        $announcements = Announcement::with('user')
            ->where('user_role', 'principal')
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
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = ['Reminder', 'Event Announcement', 'Class Suspension', 'Emergency Notice', 'Academic Notice', 'School Activity'];
        $statuses = ['draft', 'published', 'archived'];
        $audienceOptions = ['all_users', 'all_grades', 'grade_4', 'grade_5', 'grade_6', 'teachers_only'];

        return Inertia::render('Principal/Announcements', [
            'announcements' => $announcements->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'category' => $announcement->category,
                    'audience' => $announcement->target_audience,
                    'status' => $announcement->status,
                    'priority' => $announcement->priority,
                    'is_pinned' => $announcement->is_pinned,
                    'publish_date' => $announcement->publish_date,
                    'expiration_date' => $announcement->expiration_date,
                    'view_count' => $announcement->view_count,
                    'created_at' => $announcement->created_at->diffForHumans(),
                    'posted_by' => $announcement->user->name ?? 'Unknown',
                ];
            }),
            'categories' => $categories,
            'statuses' => $statuses,
            'audience_options' => $audienceOptions,
            'filters' => [
                'search' => $search,
                'category' => $categoryFilter,
                'status' => $statusFilter,
            ],
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
            'target_audience' => 'required|in:all_users,all_grades,grade_4,grade_5,grade_6,teachers_only',
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        Announcement::create([
            'user_id' => auth()->id(),
            'user_role' => 'principal',
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

        return redirect()->back()->with('success', 'Announcement created successfully!');
    }

    /**
     * Update an existing announcement.
     */
    public function update(Request $request, $id)
    {
        Gate::authorize('announcement.edit');

        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'content' => 'required|string',
            'target_audience' => 'required|in:all_users,all_grades,grade_4,grade_5,grade_6,teachers_only',
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        $announcement->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'content' => $validated['content'],
            'target_audience' => $validated['target_audience'],
            'priority' => $validated['priority'],
            'is_pinned' => $validated['is_pinned'] ?? $announcement->is_pinned,
            'status' => $validated['status'],
            'publish_date' => $validated['publish_date'],
            'expiration_date' => $validated['expiration_date'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Announcement updated successfully!');
    }

    /**
     * Delete an announcement.
     */
    public function destroy($id)
    {
        Gate::authorize('announcement.delete');

        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully!');
    }

    /**
     * Archive an announcement.
     */
    public function archive($id)
    {
        Gate::authorize('announcement.edit');

        $announcement = Announcement::findOrFail($id);
        $announcement->update(['status' => 'archived']);

        return redirect()->back()->with('success', 'Announcement archived successfully!');
    }

    /**
     * Publish an announcement.
     */
    public function publish($id)
    {
        Gate::authorize('announcement.edit');

        $announcement = Announcement::findOrFail($id);
        $announcement->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Announcement published successfully!');
    }
}
