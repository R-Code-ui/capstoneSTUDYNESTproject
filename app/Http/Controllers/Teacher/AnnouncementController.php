<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     * ✅ INCLUDES PRINCIPAL ANNOUNCEMENTS + TEACHER'S OWN ANNOUNCEMENTS
     */
    public function index(Request $request)
    {
        Gate::authorize('announcement.view');

        $user = auth()->user();

        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $gradeAudiences = array_merge(
            $assignedGrades,
            array_map(fn ($grade) => strtolower(str_replace(' ', '_', $grade)), $assignedGrades)
        );
        $today = now()->toDateString();
        $authorFilter = $request->input('author'); // ✅ ADDED

        // ✅ FIX: Get teacher's own announcements + principal's school-wide announcements
        $announcements = Announcement::where(function ($query) use ($user, $gradeAudiences, $today) {
                $query->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->where('user_role', 'teacher');
                })->orWhere(function ($query) use ($gradeAudiences, $today) {
                    $query->where('user_role', 'principal')
                        ->whereIn('target_audience', array_merge(['all_users', 'all_grades', 'teachers_only'], $gradeAudiences))
                        ->where('status', 'published')
                        ->whereDate('publish_date', '<=', $today)
                        ->where(function ($query) use ($today) {
                            $query->whereNull('expiration_date')
                                ->orWhereDate('expiration_date', '>=', $today);
                        });
                });
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->when($categoryFilter, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where(function ($query) use ($grade) {
                    $query->where('target_audience', $grade)
                        ->orWhere('target_audience', strtolower(str_replace(' ', '_', $grade)))
                        ->orWhereIn('target_audience', ['all_users', 'all_grades']);
                });
            })
            ->when($authorFilter, function ($query, $author) use ($user) {
                if ($author === 'me') {
                    return $query->where('user_id', $user->id)
                        ->where('user_role', 'teacher');
                } elseif ($author === 'principal') {
                    return $query->where('user_role', 'principal');
                }
                return $query;
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10); // ✅ PAGINATION ADDED

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
                    'publish_date' => $announcement->publish_date ? $announcement->publish_date->format('Y-m-d') : '',
                    'expiration_date' => $announcement->expiration_date ? $announcement->expiration_date->format('Y-m-d') : '',
                    'view_count' => $announcement->view_count,
                    'created_at' => $announcement->created_at->diffForHumans(),
                    'posted_by' => $announcement->user_role === 'principal' ? 'Principal' : 'Teacher', // ✅ ADDED
                    'posted_by_name' => $announcement->user->name ?? 'Unknown',
                    'is_principal' => $announcement->user_role === 'principal', // ✅ ADDED
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
                'author' => $authorFilter, // ✅ ADDED
            ],
            'pagination' => $announcements->toArray(), // ✅ PAGINATION DATA
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
            'target_audience' => ['required', 'string', Rule::in($this->targetAudiences(auth()->user()))],
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        if ($validated['status'] === 'published' && $validated['publish_date'] > now()->toDateString()) {
            return back()->withErrors(['publish_date' => 'A published announcement cannot have a future publish date.'])->withInput();
        }

        $announcement = Announcement::create([
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

        // Log announcement creation
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'create',
            'activity_description'=> 'Created announcement "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

        if ($this->isCurrentlyVisible($announcement)) {
            app(StudyNestNotificationService::class)->announcementPublished($announcement);
        }

        return redirect()->route('teacher.announcements.index')
            ->with('success', 'Announcement created successfully!');
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement)
    {
        Gate::authorize('announcement.view', $announcement);

        $announcement->load('user');

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
                'publish_date' => $announcement->publish_date ? $announcement->publish_date->format('Y-m-d') : '',
                'expiration_date' => $announcement->expiration_date ? $announcement->expiration_date->format('Y-m-d') : '',
                'view_count' => $announcement->view_count,
                'created_at' => $announcement->created_at->format('Y-m-d H:i'),
                'posted_by' => $announcement->user_role === 'principal' ? 'Principal' : 'Teacher',
                'posted_by_name' => $announcement->user->name,
                'is_principal' => $announcement->user_role === 'principal',
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
                'publish_date' => $announcement->publish_date ? $announcement->publish_date->format('Y-m-d') : '',
                'expiration_date' => $announcement->expiration_date ? $announcement->expiration_date->format('Y-m-d') : '',
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
            'target_audience' => ['required', 'string', Rule::in($this->targetAudiences(auth()->user()))],
            'priority' => 'required|in:normal,important,urgent',
            'is_pinned' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'expiration_date' => 'nullable|date|after:publish_date',
        ]);

        if ($validated['status'] === 'published' && $validated['publish_date'] > now()->toDateString()) {
            return back()->withErrors(['publish_date' => 'A published announcement cannot have a future publish date.'])->withInput();
        }

        $wasPublished = $announcement->status === 'published';
        $announcement->update($validated);

        if ($wasPublished && $announcement->wasChanged(['status', 'target_audience', 'publish_date', 'expiration_date', 'title', 'content', 'priority'])) {
            app(StudyNestNotificationService::class)->forgetFor('announcement', $announcement->id);
        }

        if ($this->isCurrentlyVisible($announcement)
            && (!$wasPublished || $announcement->wasChanged(['status', 'target_audience', 'publish_date', 'expiration_date', 'title', 'content', 'priority']))) {
            app(StudyNestNotificationService::class)->announcementPublished($announcement);
        }

        // Log announcement update
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'update',
            'activity_description'=> 'Updated announcement "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

        return redirect()->route('teacher.announcements.index')
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement)
    {
        Gate::authorize('announcement.delete', $announcement);
        app(StudyNestNotificationService::class)->forgetFor('announcement', $announcement->id);

        // Log announcement deletion
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'delete',
            'activity_description'=> 'Deleted announcement "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

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

        $wasPublished = $announcement->status === 'published';

        $announcement->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        if (!$wasPublished) {
            app(StudyNestNotificationService::class)->announcementPublished($announcement);
        }

        // Log publish
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'publish',
            'activity_description'=> 'Published announcement "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
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

        // Log archive
        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'archive',
            'activity_description'=> 'Archived announcement "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

        return redirect()->back()->with('success', 'Announcement archived successfully!');
    }

    private function targetAudiences($user): array
    {
        $grades = $user->gradeAssignments()->pluck('grade_level')->all();
        $normalizedGrades = array_map(fn ($grade) => strtolower(str_replace(' ', '_', $grade)), $grades);

        return array_values(array_unique(array_merge(['all_assigned_students'], $grades, $normalizedGrades)));
    }

    private function isCurrentlyVisible(Announcement $announcement): bool
    {
        $today = now()->toDateString();

        return $announcement->status === 'published'
            && $announcement->publish_date
            && $announcement->publish_date->toDateString() <= $today
            && (!$announcement->expiration_date || $announcement->expiration_date->toDateString() >= $today);
    }
}
