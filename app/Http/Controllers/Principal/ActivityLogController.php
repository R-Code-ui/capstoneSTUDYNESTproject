<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request)
    {
        Gate::authorize('log.view');

        $request->validate([
            'activity_type' => 'nullable|string|in:All Activities,Teacher Activities,Student Activities,Lesson Activities,Assignment Activities,Quiz Activities,Game Activities,Announcement Activities,Message Activities,Login Activities',
            'grade_level' => 'nullable|string|in:All Grades,Grade 4,Grade 5,Grade 6',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'search' => 'nullable|string|max:255',
        ]);

        $activityType = $request->input('activity_type');
        $gradeLevel = $request->input('grade_level');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = $request->input('search');

        $logs = ActivityLog::with('user')
            ->whereIn('user_role', ['teacher', 'student'])
            ->where('user_id', '!=', auth()->id())
            ->when($activityType && $activityType !== 'All Activities', function ($query) use ($activityType) {
                if ($activityType === 'Teacher Activities') {
                    return $query->where('user_role', 'teacher');
                } elseif ($activityType === 'Student Activities') {
                    return $query->where('user_role', 'student');
                } elseif ($activityType === 'Login Activities') {
                    return $query->where('activity_type', 'login');
                } elseif ($activityType === 'Lesson Activities') {
                    return $query->where('related_module', 'Lesson Module');
                } elseif ($activityType === 'Assignment Activities') {
                    return $query->where('related_module', 'Assignment Module');
                } elseif ($activityType === 'Quiz Activities') {
                    return $query->where('related_module', 'Quiz Module');
                } elseif ($activityType === 'Game Activities') {
                    return $query->where('related_module', 'Game Module');
                } elseif ($activityType === 'Announcement Activities') {
                    return $query->where('related_module', 'Announcement Module');
                } elseif ($activityType === 'Message Activities') {
                    return $query->where('related_module', 'Message Module');
                }
                return $query;
            })
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->whereHas('user', function ($q) use ($gradeLevel) {
                    $q->where(function ($q) use ($gradeLevel) {
                        $q->where('grade_level', $gradeLevel)
                            ->orWhereHas('gradeAssignments', function ($grades) use ($gradeLevel) {
                                $grades->where('grade_level', $gradeLevel);
                            });
                    });
                });
            })
            ->when($dateFrom, function ($query) use ($dateFrom) {
                return $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query) use ($dateTo) {
                return $query->whereDate('created_at', '<=', $dateTo);
            })
            ->when($search, function ($query) use ($search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('activity_description', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Activity Summary
        $todayLogs = ActivityLog::whereIn('user_role', ['teacher', 'student'])
            ->where('user_id', '!=', auth()->id())
            ->whereDate('created_at', today())
            ->get();

        $summary = [
            'user_logins' => $todayLogs->where('activity_type', 'login')->count(),
            'teacher_activities' => $todayLogs->where('user_role', 'teacher')->count(),
            'student_activities' => $todayLogs->where('user_role', 'student')->count(),
            'lesson_activities' => $todayLogs->where('related_module', 'Lesson Module')->count(),
            'assignment_activities' => $todayLogs->where('related_module', 'Assignment Module')->count(),
            'quiz_activities' => $todayLogs->where('related_module', 'Quiz Module')->count(),
            'game_activities' => $todayLogs->where('related_module', 'Game Module')->count(),
            'other_user_activities' => $todayLogs->whereNotIn('related_module', ['Lesson Module', 'Assignment Module', 'Quiz Module', 'Game Module'])->count(),
        ];

        $activityTypes = [
            'All Activities',
            'Teacher Activities',
            'Student Activities',
            'Lesson Activities',
            'Assignment Activities',
            'Quiz Activities',
            'Game Activities',
            'Announcement Activities',
            'Message Activities',
            'Login Activities',
        ];

        $gradeLevels = ['All Grades', 'Grade 4', 'Grade 5', 'Grade 6'];

        return Inertia::render('Principal/ActivityLogs', [
            'logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'date_time' => $log->created_at->format('M d, Y h:i A'),
                    'user' => $log->user?->name ?? 'Unknown',
                    'role' => ucfirst($log->user_role),
                    'activity' => $log->activity_description,
                    'module' => $log->related_module,
                    'user_id' => $log->user_id,
                ];
            }),
            'summary' => $summary,
            'activity_types' => $activityTypes,
            'grade_levels' => $gradeLevels,
            'filters' => [
                'activity_type' => $activityType,
                'grade_level' => $gradeLevel,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
            'pagination' => $logs->toArray(), // ✅ PAGINATION DATA
        ]);
    }
}
