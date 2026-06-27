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
        Gate::authorize('viewAny', ActivityLog::class);

        $activityType = $request->input('activity_type');
        $gradeLevel = $request->input('grade_level');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = $request->input('search');

        $logs = ActivityLog::with('user')
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
                }
                return $query;
            })
            ->when($gradeLevel && $gradeLevel !== 'All Grades', function ($query) use ($gradeLevel) {
                return $query->whereHas('user', function ($q) use ($gradeLevel) {
                    $q->where('grade_level', $gradeLevel);
                });
            })
            ->when($dateFrom, function ($query) use ($dateFrom) {
                return $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query) use ($dateTo) {
                return $query->whereDate('created_at', '<=', $dateTo);
            })
            ->when($search, function ($query) use ($search) {
                return $query->where('activity_description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        // Activity Summary
        $today = now()->startOfDay();
        $todayLogs = ActivityLog::whereDate('created_at', $today)->get();

        $summary = [
            'teacher_logins' => $todayLogs->where('user_role', 'teacher')->where('activity_type', 'login')->count(),
            'lesson_uploads' => $todayLogs->where('related_module', 'Lesson Module')->where('activity_type', 'create')->count(),
            'assignments_created' => $todayLogs->where('related_module', 'Assignment Module')->where('activity_type', 'create')->count(),
            'quiz_attempts' => $todayLogs->where('related_module', 'Quiz Module')->where('activity_type', 'attempt')->count(),
            'student_submissions' => $todayLogs->where('related_module', 'Assignment Module')->where('activity_type', 'submit')->count(),
        ];

        $activityTypes = [
            'All Activities',
            'Teacher Activities',
            'Student Activities',
            'Lesson Activities',
            'Assignment Activities',
            'Quiz Activities',
            'Login Activities',
        ];

        $gradeLevels = ['All Grades', 'Grade 4', 'Grade 5', 'Grade 6'];

        return Inertia::render('Principal/ActivityLogs', [
            'logs' => $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'date_time' => $log->created_at->format('M d, Y h:i A'),
                    'user' => $log->user->name ?? 'Unknown',
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
        ]);
    }
}
