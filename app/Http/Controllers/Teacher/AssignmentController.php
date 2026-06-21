<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentResource;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
            ->get();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published', 'archived'];
        $assignmentTypes = ['homework', 'worksheet', 'performance_task', 'project', 'reflection_activity', 'practice_exercise', 'reading_assignment'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];

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
                    'due_date' => $assignment->due_date,
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
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));
        $submissionMethods = ['digital', 'photo', 'paper'];

        // Get related lessons
        $lessons = Lesson::where('teacher_id', $user->id)->get()->map(function ($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->lesson_title,
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
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'assignment_title' => 'required|string|max:255',
            'assignment_type' => 'required|string',
            'instructions' => 'required|string',
            'total_points' => 'required|integer|min:1',
            'estimated_time' => 'nullable|integer',
            'allow_late_submission' => 'boolean',
            'due_date' => 'required|date',
            'due_time' => 'required',
            'submission_methods' => 'required|array',
            'submission_methods.*' => 'in:digital,photo,paper',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
        ]);

        $assignment = Assignment::create([
            'teacher_id' => auth()->id(),
            'submission_methods' => json_encode($validated['submission_methods']),
            ...$validated,
        ]);

        // Handle file uploads if any
        if ($request->hasFile('resources')) {
            foreach ($request->file('resources') as $resource) {
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
                'due_date' => $assignment->due_date,
                'due_time' => $assignment->due_time,
                'submission_methods' => json_decode($assignment->submission_methods, true),
                'status' => $assignment->status,
                'publish_date' => $assignment->publish_date,
                'created_at' => $assignment->created_at->format('Y-m-d H:i'),
                'resources' => $assignment->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
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
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));
        $submissionMethods = ['digital', 'photo', 'paper'];

        $lessons = Lesson::where('teacher_id', $user->id)->get()->map(function ($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->lesson_title,
            ];
        });

        $assignment->load('resources');

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
                'due_date' => $assignment->due_date,
                'due_time' => $assignment->due_time,
                'submission_methods' => json_decode($assignment->submission_methods, true),
                'status' => $assignment->status,
                'publish_date' => $assignment->publish_date,
                'resources' => $assignment->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
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
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'assignment_title' => 'required|string|max:255',
            'assignment_type' => 'required|string',
            'instructions' => 'required|string',
            'total_points' => 'required|integer|min:1',
            'estimated_time' => 'nullable|integer',
            'allow_late_submission' => 'boolean',
            'due_date' => 'required|date',
            'due_time' => 'required',
            'submission_methods' => 'required|array',
            'submission_methods.*' => 'in:digital,photo,paper',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
        ]);

        $assignment->update([
            'submission_methods' => json_encode($validated['submission_methods']),
            ...$validated,
        ]);

        return redirect()->route('teacher.assignments.index')
            ->with('success', 'Assignment updated successfully!');
    }

    /**
     * Remove the specified assignment.
     */
    public function destroy(Assignment $assignment)
    {
        Gate::authorize('delete', $assignment);

        // Delete associated resources
        foreach ($assignment->resources as $resource) {
            Storage::disk('public')->delete($resource->file_path);
            $resource->delete();
        }

        $assignment->delete();

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

        return redirect()->back()->with('success', 'Assignment published successfully!');
    }

    /**
     * Determine resource type based on file.
     */
    private function determineResourceType($file)
    {
        $mimeType = $file->getMimeType();
        if (str_contains($mimeType, 'pdf')) {
            return 'pdf_module';
        } elseif (str_contains($mimeType, 'image')) {
            return 'image';
        }
        return 'worksheet';
    }
}
