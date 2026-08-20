<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementView;
use App\Models\ActivityLog;
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
        $today = now()->toDateString();
        $gradeAudience = strtolower(str_replace(' ', '_', (string) $gradeLevel));

        $announcements = Announcement::with('user')
            ->where('status', 'published')
            ->whereDate('publish_date', '<=', $today)
            ->where(function ($query) use ($today) {
                $query->whereNull('expiration_date')
                    ->orWhereDate('expiration_date', '>=', $today);
            })
            ->where(function ($query) use ($gradeLevel, $gradeAudience) {
                $query->where('target_audience', 'all_users')
                    ->orWhere('target_audience', 'all_grades')
                    ->orWhere('target_audience', $gradeLevel)
                ->orWhere('target_audience', $gradeAudience)
                ->orWhere(function ($query) use ($gradeLevel) {
                    $query->where('target_audience', 'all_assigned_students')
                        ->whereHas('user.gradeAssignments', function ($query) use ($gradeLevel) {
                            $query->where('grade_level', $gradeLevel);
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
            ->orderBy('created_at', 'desc')
            ->paginate(10);

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
            'pagination' => $announcements->toArray(),
        ]);
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement)
    {
        $user = auth()->user();
        $today = now()->toDateString();
        $gradeAudience = strtolower(str_replace(' ', '_', (string) $user->grade_level));

        // Check if student can view this announcement
        $canView = false;
        if (
            $announcement->status === 'published' &&
            $announcement->publish_date &&
            $announcement->publish_date->toDateString() <= $today &&
            (!$announcement->expiration_date || $announcement->expiration_date->toDateString() >= $today)
        ) {
            if (in_array($announcement->target_audience, [
                'all_users',
                'all_grades',
                $user->grade_level,
                $gradeAudience,
            ], true)) {
                $canView = true;
            } elseif ($announcement->target_audience === 'all_assigned_students'
                && $announcement->user?->gradeAssignments()->where('grade_level', $user->grade_level)->exists()) {
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

        // ✅ Log: student viewed announcement
        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'view',
            'activity_description'=> 'Viewed announcement: "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

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
                'expiration_date' => $announcement->expiration_date ? $announcement->expiration_date->format('M d, Y') : null,
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

        Gate::authorize('view', $announcement);

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

        // ✅ Log: student marked announcement as read
        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'read',
            'activity_description'=> 'Marked announcement as read: "' . $announcement->title . '"',
            'related_module'      => 'Announcement Module',
        ]);

        return redirect()->back()->with('success', 'Announcement marked as read.');
    }
}
