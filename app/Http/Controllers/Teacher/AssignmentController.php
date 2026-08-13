<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentResource;
use App\Models\Lesson;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;

class AssignmentController extends Controller
{
    /**
     * Display a listing of assignments.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Assignment::class);

        $user = auth()->user();

        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $typeFilter = $request->input('assignment_type');

        $assignments = Assignment::where('teacher_id', $user->id)
            ->when($search, function ($query, $search) {
                return $query->where('assignment_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($typeFilter, function ($query, $type) {
                return $query->where('assignment_type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        $statuses = ['draft', 'published', 'archived'];
        $assignmentTypes = ['homework', 'worksheet', 'performance_task', 'project', 'reflection_activity', 'practice_exercise', 'reading_assignment'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];

        return Inertia::render('Teacher/Assignments/Index', [
            'assignments' => $assignments->map(function ($assignment) {
                $submissionsCount = $assignment->submissions()->count();
                $submittedCount = $assignment->submissions()->where('status', 'submitted')->count();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'subject' => $assignment->subject,
                    'grade_level' => $assignment->grade_level,
                    'type' => $assignment->assignment_type,
                    'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : '—',
                    'total_points' => $assignment->total_points,
                    'status' => $assignment->status,
                    'submissions' => $submittedCount . '/' . $submissionsCount,
                    'created_at' => $assignment->created_at->format('Y-m-d'),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'assignment_types' => $assignmentTypes,
            'trimesters' => $trimesters,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'grade_level' => $gradeFilter,
                'assignment_type' => $typeFilter,
            ],
            'pagination' => $assignments->toArray(),
        ]);
    }

    /**
     * Show the form for creating a new assignment.
     */
    public function create()
    {
        Gate::authorize('create', Assignment::class);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $assignmentTypes = ['homework', 'worksheet', 'performance_task', 'project', 'reflection_activity', 'practice_exercise', 'reading_assignment'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));
        $submissionMethods = ['digital', 'paper'];

        $lessons = Lesson::where('teacher_id', $user->id)
            ->select('id', 'lesson_title as title', 'bow_code', 'learning_competency', 'learning_objective')
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'bow_code' => $lesson->bow_code,
                    'learning_competency' => $lesson->learning_competency,
                    'learning_objective' => $lesson->learning_objective,
                ];
            });

        return Inertia::render('Teacher/Assignments/Create', [
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'assignment_types' => $assignmentTypes,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
            'submission_methods' => $submissionMethods,
            'related_lessons' => $lessons,
        ]);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Assignment::class);

        $validated = $request->validate([
            'grade_level' => 'required|string|in:Grade 4,Grade 5,Grade 6',
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:SY 2026-2027,SY 2027-2028',
            'trimester' => 'required|string|in:1st Term,2nd Term,3rd Term',
            'week_number' => 'required|string|in:Week 1,Week 2,Week 3,Week 4,Week 5,Week 6,Week 7,Week 8,Week 9,Week 10,Week 11,Week 12',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'assignment_title' => 'required|string|max:255',
            'assignment_type' => 'required|string|in:homework,worksheet,performance_task,project,reflection_activity,practice_exercise,reading_assignment',
            'instructions' => 'required|string',
            'total_points' => 'required|integer|min:1',
            'estimated_time' => 'nullable|integer',
            'allow_late_submission' => 'boolean',
            'due_date' => 'required|date',
            'due_time' => 'required',
            'resource_url' => 'nullable|url|max:2048',
            'submission_methods' => 'required|array',
            'submission_methods.*' => 'in:digital,paper',
            'resources' => 'nullable|array|max:4',
            'resources.*' => 'file|max:102400|mimes:pdf,jpg,jpeg,png,doc,docx,ppt,pptx,mp4',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
        ]);

        unset($validated['resources']);

        if (Carbon::parse($validated['due_date'] . ' ' . $validated['due_time'])->lte(now())) {
            return redirect()->back()
                ->withErrors(['due_date' => 'The due date and time must be in the future.'])
                ->withInput();
        }

        $resourceUrl = $validated['resource_url'] ?? null;
        $validated['submission_methods'] = json_encode($validated['submission_methods']);
        unset($validated['resource_url'], $validated['deleted_resource_ids']);

        $assignment = Assignment::create([
            'teacher_id' => auth()->id(),
            ...$validated,
        ]);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'create',
            'activity_description'=> 'Created assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        if ($assignment->status === 'published') {
            app(StudyNestNotificationService::class)->assignmentPublished($assignment);
        }

        if ($request->hasFile('resources')) {
            $files = $request->file('resources');

            if (count($files) > 4) {
                return redirect()->back()
                    ->withErrors(['resources' => 'You can only upload a maximum of 4 files.'])
                    ->withInput();
            }

            foreach ($files as $resource) {
                $path = $resource->store('assignment-resources/' . $assignment->id, 'public');

                AssignmentResource::create([
                    'assignment_id' => $assignment->id,
                    'resource_type' => $this->determineResourceType($resource),
                    'file_name' => $resource->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $resource->getSize(),
                    'mime_type' => $resource->getMimeType(),
                ]);
            }
        }

        if (!empty($resourceUrl)) {
            AssignmentResource::create([
                'assignment_id' => $assignment->id,
                'resource_type' => 'url',
                'file_name' => 'External Link',
                'file_path' => $resourceUrl,
                'file_size' => 0,
                'mime_type' => 'url',
            ]);
        }

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment created successfully!');
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment)
    {
        Gate::authorize('view', $assignment);

        $assignment->load('resources');

        $submissionMethods = $assignment->submission_methods;
        if (is_string($submissionMethods)) {
            $submissionMethods = json_decode($submissionMethods, true);
        }

        return Inertia::render('Teacher/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'grade_level' => $assignment->grade_level,
                'subject' => $assignment->subject,
                'assignment_title' => $assignment->assignment_title,
                'assignment_type' => $assignment->assignment_type,
                'instructions' => $assignment->instructions,
                'total_points' => $assignment->total_points,
                'estimated_time' => $assignment->estimated_time,
                'allow_late_submission' => $assignment->allow_late_submission,
                'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : '—',
                'due_time' => $assignment->due_time,
                'submission_methods' => $submissionMethods,
                'status' => $assignment->status,
                'publish_date' => $assignment->publish_date ? $assignment->publish_date->format('Y-m-d') : '—',
                'created_at' => $assignment->created_at->format('Y-m-d H:i'),
                'resources' => $assignment->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
                        'size' => $resource->file_size,
                        'mime' => $resource->mime_type,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified assignment.
     */
    public function edit(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $assignmentTypes = ['homework', 'worksheet', 'performance_task', 'project', 'reflection_activity', 'practice_exercise', 'reading_assignment'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));
        $submissionMethods = ['digital', 'paper'];

        $lessons = Lesson::where('teacher_id', $user->id)
            ->select('id', 'lesson_title as title', 'bow_code', 'learning_competency', 'learning_objective')
            ->get()
            ->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'bow_code' => $lesson->bow_code,
                    'learning_competency' => $lesson->learning_competency,
                    'learning_objective' => $lesson->learning_objective,
                ];
            });

        $assignment->load('resources');

        $submissionMethodsValue = $assignment->submission_methods;
        if (is_string($submissionMethodsValue)) {
            $submissionMethodsValue = json_decode($submissionMethodsValue, true);
        }

        return Inertia::render('Teacher/Assignments/Edit', [
            'assignment' => [
                'id' => $assignment->id,
                'grade_level' => $assignment->grade_level,
                'subject' => $assignment->subject,
                'school_year' => $assignment->school_year,
                'trimester' => $assignment->trimester,
                'week_number' => $assignment->week_number,
                'related_lesson_id' => $assignment->related_lesson_id,
                'assignment_title' => $assignment->assignment_title,
                'assignment_type' => $assignment->assignment_type,
                'instructions' => $assignment->instructions,
                'total_points' => $assignment->total_points,
                'estimated_time' => $assignment->estimated_time,
                'allow_late_submission' => $assignment->allow_late_submission,
                'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : '—',
                'due_time' => $assignment->due_time,
                'submission_methods' => $submissionMethodsValue,
                'status' => $assignment->status,
                'publish_date' => $assignment->publish_date ? $assignment->publish_date->format('Y-m-d') : '—',
                'resources' => $assignment->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
                        'size' => $resource->file_size,
                        'mime' => $resource->mime_type,
                    ];
                }),
            ],
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'assignment_types' => $assignmentTypes,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
            'submission_methods' => $submissionMethods,
            'related_lessons' => $lessons,
        ]);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $validated = $request->validate([
            'grade_level' => 'required|string|in:Grade 4,Grade 5,Grade 6',
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:SY 2026-2027,SY 2027-2028',
            'trimester' => 'required|string|in:1st Term,2nd Term,3rd Term',
            'week_number' => 'required|string|in:Week 1,Week 2,Week 3,Week 4,Week 5,Week 6,Week 7,Week 8,Week 9,Week 10,Week 11,Week 12',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'assignment_title' => 'required|string|max:255',
            'assignment_type' => 'required|string|in:homework,worksheet,performance_task,project,reflection_activity,practice_exercise,reading_assignment',
            'instructions' => 'required|string',
            'total_points' => 'required|integer|min:1',
            'estimated_time' => 'nullable|integer',
            'allow_late_submission' => 'boolean',
            'due_date' => 'required|date',
            'due_time' => 'required',
            'resource_url' => 'nullable|url|max:2048',
            'submission_methods' => 'required|array',
            'submission_methods.*' => 'in:digital,paper',
            'resources' => 'nullable|array|max:4',
            'resources.*' => 'file|max:102400|mimes:pdf,jpg,jpeg,png,doc,docx,ppt,pptx,mp4',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'deleted_resource_ids' => 'nullable|string',
        ]);

        unset($validated['resources']);

        if (Carbon::parse($validated['due_date'] . ' ' . $validated['due_time'])->lte(now())) {
            return redirect()->back()
                ->withErrors(['due_date' => 'The due date and time must be in the future.'])
                ->withInput();
        }

        $resourceUrl = $validated['resource_url'] ?? null;
        $deletedResourceIds = $validated['deleted_resource_ids'] ?? null;
        $validated['submission_methods'] = json_encode($validated['submission_methods']);
        unset($validated['resource_url'], $validated['deleted_resource_ids']);

        $assignment->update($validated);

        if (!empty($deletedResourceIds)) {
            $deletedIds = explode(',', $deletedResourceIds);
            $deletedIds = array_filter($deletedIds);

            if (!empty($deletedIds)) {
                $resourcesToDelete = AssignmentResource::whereIn('id', $deletedIds)
                    ->where('assignment_id', $assignment->id)
                    ->get();

                foreach ($resourcesToDelete as $resource) {
                    if (Storage::disk('public')->exists($resource->file_path)) {
                        Storage::disk('public')->delete($resource->file_path);
                    }
                    $resource->delete();
                }
            }
        }

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'update',
            'activity_description'=> 'Updated assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        if ($request->hasFile('resources')) {
            $files = $request->file('resources');

            $currentResourceCount = $assignment->resources()
                ->where('resource_type', '!=', 'url')
                ->count();
            $maxNewFiles = 4 - $currentResourceCount;

            if (count($files) > $maxNewFiles) {
                return redirect()->back()
                    ->withErrors(['resources' => 'You can only upload a maximum of ' . $maxNewFiles . ' more files.'])
                    ->withInput();
            }

            foreach ($files as $resource) {
                $path = $resource->store('assignment-resources/' . $assignment->id, 'public');

                AssignmentResource::create([
                    'assignment_id' => $assignment->id,
                    'resource_type' => $this->determineResourceType($resource),
                    'file_name' => $resource->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $resource->getSize(),
                    'mime_type' => $resource->getMimeType(),
                ]);
            }
        }

        if ($request->has('resource_url')) {
            $assignment->resources()->where('resource_type', 'url')->delete();

            if (!empty($resourceUrl)) {
                AssignmentResource::create([
                    'assignment_id' => $assignment->id,
                    'resource_type' => 'url',
                    'file_name' => 'External Link',
                    'file_path' => $resourceUrl,
                    'file_size' => 0,
                    'mime_type' => 'url',
                ]);
            }
        }

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment updated successfully!');
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(Assignment $assignment)
    {
        Gate::authorize('delete', $assignment);

        foreach ($assignment->resources as $resource) {
            if (Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }
            $resource->delete();
        }

        $assignment->delete();

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'delete',
            'activity_description'=> 'Deleted assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment deleted successfully!');
    }

    /**
     * Publish an assignment.
     */
    public function publish(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $assignment->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        app(StudyNestNotificationService::class)->assignmentPublished($assignment);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'publish',
            'activity_description'=> 'Published assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment published successfully!');
    }

    /**
     * Archive an assignment.
     */
    public function archive(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $assignment->update(['status' => 'archived']);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'archive',
            'activity_description'=> 'Archived assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment archived successfully!');
    }

    /**
     * Download an assignment resource.
     */
    public function downloadResource($resourceId)
    {
        $resource = AssignmentResource::findOrFail($resourceId);

        $assignment = $resource->assignment;
        if (!$assignment) {
            abort(404, 'Resource not associated with any assignment.');
        }

        Gate::authorize('view', $assignment);

        $filePath = storage_path('app/public/' . $resource->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $resource->file_name);
    }

    public function viewResource($resourceId)
    {
        $resource = AssignmentResource::findOrFail($resourceId);
        $assignment = $resource->assignment;
        if (!$assignment) abort(404, 'Resource not associated with any assignment.');

        Gate::authorize('view', $assignment);

        $filePath = storage_path('app/public/' . $resource->file_path);
        if (!file_exists($filePath)) abort(404, 'File not found.');

        return response()->file($filePath, [
            'Content-Type' => $resource->mime_type ?: mime_content_type($filePath),
        ]);
    }

    /**
     * Determine resource type based on file.
     * Maps PDF -> 'pdf_module', images -> 'image', everything else (including PPTX, DOCX, etc.) -> 'worksheet'.
     */
    private function determineResourceType(\Illuminate\Http\UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        if (str_contains($mimeType, 'pdf')) {
            return 'pdf_module';
        } elseif (str_contains($mimeType, 'image')) {
            return 'image';
        }

        // All other types (Word documents, PowerPoint presentations, etc.) are stored as 'worksheet'
        return 'worksheet';
    }
}
