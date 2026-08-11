<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class StudentActivityLogController extends Controller
{
    private function assignedGrades(): array
    {
        return auth()->user()->gradeAssignments()->pluck('grade_level')->all();
    }

    private function studentLogsQuery()
    {
        $grades = $this->assignedGrades();

        return ActivityLog::with('user:id,name,lrn,grade_level')
            ->where('user_role', 'student')
            ->whereHas('user', function ($query) use ($grades) {
                $query->whereIn('grade_level', $grades)->whereHas('roles', fn ($role) => $role->where('name', 'student'));
            });
    }

    public function index(Request $request)
    {
        Gate::authorize('student.activity.view');

        $activityType = $request->input('activity_type');
        $gradeLevel = $request->input('grade_level');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = $request->input('search');
        $assignedGrades = $this->assignedGrades();

        $logs = $this->studentLogsQuery()
            ->when($activityType && $activityType !== 'All Activities', function ($query) use ($activityType) {
                $module = match ($activityType) {
                    'Lesson Activities' => 'Lesson Module',
                    'Assignment Activities' => 'Assignment Module',
                    'Quiz Activities' => 'Quiz Module',
                    'Game Activities' => 'Game Module',
                    'Announcement Activities' => 'Announcement Module',
                    default => null,
                };

                if ($module) {
                    $query->where('related_module', $module);
                }
            })
            ->when($gradeLevel && in_array($gradeLevel, $assignedGrades, true), function ($query) use ($gradeLevel) {
                $query->whereHas('user', fn ($student) => $student->where('grade_level', $gradeLevel));
            })
            ->when($dateFrom, fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('activity_description', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($student) => $student->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        $todayLogs = $this->studentLogsQuery()->whereDate('created_at', today())->get();
        $summary = [
            'lesson_activities' => $todayLogs->where('related_module', 'Lesson Module')->count(),
            'assignment_activities' => $todayLogs->where('related_module', 'Assignment Module')->count(),
            'quiz_activities' => $todayLogs->where('related_module', 'Quiz Module')->count(),
            'game_activities' => $todayLogs->where('related_module', 'Game Module')->count(),
            'other_student_activities' => $todayLogs->whereNotIn('related_module', ['Lesson Module', 'Assignment Module', 'Quiz Module', 'Game Module'])->count(),
        ];

        return Inertia::render('Teacher/StudentActivityLogs/Index', [
            'logs' => $logs->map(fn ($log) => [
                'id' => $log->id,
                'date_time' => $log->created_at?->format('M d, Y h:i A'),
                'student' => $log->user?->name ?? 'Unknown student',
                'grade_level' => $log->user?->grade_level ?? 'N/A',
                'activity' => $log->activity_description,
                'module' => $log->related_module,
                'activity_type' => $log->activity_type,
                'student_id' => $log->user_id,
            ]),
            'summary' => $summary,
            'activity_types' => [
                'All Activities',
                'Lesson Activities',
                'Assignment Activities',
                'Quiz Activities',
                'Game Activities',
                'Announcement Activities',
            ],
            'grade_levels' => $assignedGrades,
            'filters' => [
                'activity_type' => $activityType,
                'grade_level' => $gradeLevel,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
            'pagination' => $logs->toArray(),
        ]);
    }
}
