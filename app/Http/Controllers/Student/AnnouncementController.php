<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementView;
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
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $categoryFilter = $request->input('category');

        $announcements = Announcement::where('status', 'published')
            ->where(function ($query) use ($gradeLevel) {
                $query->where('target_audience', 'all_users')
                    ->orWhere('target_audience', 'all_grades')
                    ->orWhere('target_audience', $gradeLevel);
            })
            ->when($search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            })
            ->when($categoryFilter, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Get read status for each announcement
        $readAnnouncementIds = AnnouncementView::where('student_id', $user->id)
            ->where('is_read', true)
            ->pluck('announcement_id')
            ->toArray();

        $categories = ['Reminder', 'Quiz Schedule', 'Assignment Notice', 'Classroom Activity', 'Project Notice', 'Suspension Announcement', 'School Announcement'];

        return Inertia::render('Student/Announcements/Index', [
            'announcements' => $announcements->map(function ($announcement) use ($readAnnouncementIds) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'category' => $announcement->category,
                    'content' => substr($announcement->content, 0, 150) . (strlen($announcement->content) > 150 ? '...' : ''),
                    'posted_by' => $announcement->user->name ?? 'Unknown',
                    'role' => $announcement->user_role,
                    'priority' => $announcement->priority,
                    'is_pinned' => $announcement->is_pinned,
                    'publish_date' => $announcement->publish_date,
                    'created_at' => $announcement->created_at->diffForHumans(),
                    'is_read' => in_array($announcement->id, $readAnnouncementIds),
                ];
            }),
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $categoryFilter,
            ],
        ]);
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement)
    {
        $user = auth()->user();

        // Check if student can view this announcement
        $canView = false;
        if ($announcement->status === 'published') {
            if ($announcement->target_audience === 'all_users' ||
                $announcement->target_audience === 'all_grades' ||
                $announcement->target_audience === $user->grade_level) {
                $canView = true;
            }
        }

        if (!$canView) {
            abort(403);
        }

        // Mark as read
        AnnouncementView::updateOrCreate(
            [
                'announcement_id' => $announcement->id,
                'student_id' => $user->id,
            ],
            [
                'is_read' => true,
                'viewed_at' => now(),
            ]
        );

        // Increment view count
        $announcement->increment('view_count');

        return Inertia::render('Student/Announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'category' => $announcement->category,
                'content' => $announcement->content,
                'posted_by' => $announcement->user->name ?? 'Unknown',
                'role' => $announcement->user_role,
                'priority' => $announcement->priority,
                'is_pinned' => $announcement->is_pinned,
                'publish_date' => $announcement->publish_date,
                'expiration_date' => $announcement->expiration_date,
                'created_at' => $announcement->created_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Mark an announcement as read.
     */
    public function markRead(Announcement $announcement)
    {
        $user = auth()->user();

        AnnouncementView::updateOrCreate(
            [
                'announcement_id' => $announcement->id,
                'student_id' => $user->id,
            ],
            [
                'is_read' => true,
                'viewed_at' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Announcement marked as read.');
    }
}
