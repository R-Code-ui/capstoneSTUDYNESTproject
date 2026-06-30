<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Assignment; // ✅ ADDED
use App\Models\Quiz; // ✅ ADDED
use App\Models\Game; // ✅ ADDED
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    /**
     * Display a listing of lessons.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Lesson::class);

        $user = auth()->user();

        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $trimesterFilter = $request->input('trimester');

        $lessons = Lesson::where('teacher_id', $user->id)
            ->when($search, function ($query, $search) {
                return $query->where('lesson_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('learning_competency', 'like', "%{$search}%");
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($trimesterFilter, function ($query, $trimester) {
                return $query->where('trimester', $trimester);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $statuses = ['draft', 'published', 'archived'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];

        return Inertia::render('Teacher/Lessons/Index', [
            'lessons' => $lessons->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'subject' => $lesson->subject,
                    'grade_level' => $lesson->grade_level,
                    'trimester' => $lesson->trimester,
                    'status' => $lesson->status,
                    'publish_date' => $lesson->publish_date,
                    'created_at' => $lesson->created_at->format('Y-m-d'),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'statuses' => $statuses,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'grade_level' => $gradeFilter,
                'trimester' => $trimesterFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new lesson.
     */
    public function create()
    {
        Gate::authorize('create', Lesson::class);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));

        // Get related activities
        $assignments = Assignment::where('teacher_id', $user->id)->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'title' => $assignment->assignment_title,
            ];
        });

        $quizzes = Quiz::where('teacher_id', $user->id)->get()->map(function ($quiz) {
            return [
                'id' => $quiz->id,
                'title' => $quiz->quiz_title,
            ];
        });

        $games = Game::where('teacher_id', $user->id)->get()->map(function ($game) {
            return [
                'id' => $game->id,
                'title' => $game->game_title,
            ];
        });

        return Inertia::render('Teacher/Lessons/Create', [
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
            'related_assignments' => $assignments,
            'related_quizzes' => $quizzes,
            'related_games' => $games,
        ]);
    }

    /**
     * Store a newly created lesson.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Lesson::class);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'learning_competency' => 'required|string',
            'learning_objective' => 'required|string',
            'bow_code' => 'nullable|string',
            'lesson_title' => 'required|string|max:255',
            'lesson_description' => 'required|string',
            'lesson_content' => 'required|string',
            'key_takeaways' => 'nullable|string',
            'related_assignment_id' => 'nullable|exists:assignments,id',
            'related_quiz_id' => 'nullable|exists:quizzes,id',
            'related_game_id' => 'nullable|exists:games,id',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
        ]);

        $lesson = Lesson::create([
            'teacher_id' => auth()->id(),
            ...$validated,
        ]);

        // Handle file uploads if any
        if ($request->hasFile('resources')) {
            $files = $request->file('resources');

            // Limit to 5 files
            $files = array_slice($files, 0, 5);

            foreach ($files as $resource) {
                // Validate each file (max 10MB)
                if ($resource->getSize() > 10 * 1024 * 1024) {
                    continue; // Skip files larger than 10MB
                }

                $path = $resource->store('lesson-resources/' . $lesson->id, 'public');

                LessonResource::create([
                    'lesson_id' => $lesson->id,
                    'resource_type' => $this->determineResourceType($resource),
                    'file_name' => $resource->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $resource->getSize(),
                    'mime_type' => $resource->getMimeType(),
                ]);
            }
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Lesson created successfully!');
    }

    /**
     * Display the specified lesson.
     */
    public function show(Lesson $lesson)
    {
        Gate::authorize('view', $lesson);

        $lesson->load('resources');

        return Inertia::render('Teacher/Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'grade_level' => $lesson->grade_level,
                'subject' => $lesson->subject,
                'school_year' => $lesson->school_year,
                'trimester' => $lesson->trimester,
                'week_number' => $lesson->week_number,
                'learning_competency' => $lesson->learning_competency,
                'learning_objective' => $lesson->learning_objective,
                'bow_code' => $lesson->bow_code,
                'lesson_title' => $lesson->lesson_title,
                'lesson_description' => $lesson->lesson_description,
                'lesson_content' => $lesson->lesson_content,
                'key_takeaways' => $lesson->key_takeaways,
                'status' => $lesson->status,
                'publish_date' => $lesson->publish_date,
                'created_at' => $lesson->created_at->format('Y-m-d H:i'),
                'resources' => $lesson->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
                        'size' => $resource->file_size,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified lesson.
     */
    public function edit(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));

        $lesson->load('resources');

        return Inertia::render('Teacher/Lessons/Edit', [
            'lesson' => [
                'id' => $lesson->id,
                'grade_level' => $lesson->grade_level,
                'subject' => $lesson->subject,
                'school_year' => $lesson->school_year,
                'trimester' => $lesson->trimester,
                'week_number' => $lesson->week_number,
                'learning_competency' => $lesson->learning_competency,
                'learning_objective' => $lesson->learning_objective,
                'bow_code' => $lesson->bow_code,
                'lesson_title' => $lesson->lesson_title,
                'lesson_description' => $lesson->lesson_description,
                'lesson_content' => $lesson->lesson_content,
                'key_takeaways' => $lesson->key_takeaways,
                'related_assignment_id' => $lesson->related_assignment_id,
                'related_quiz_id' => $lesson->related_quiz_id,
                'related_game_id' => $lesson->related_game_id,
                'status' => $lesson->status,
                'publish_date' => $lesson->publish_date,
                'resources' => $lesson->resources->map(function ($resource) {
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
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
        ]);
    }

    /**
     * Update the specified lesson.
     */
    public function update(Request $request, Lesson $lesson)
    {
        Gate::authorize('update', $lesson);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'learning_competency' => 'required|string',
            'learning_objective' => 'required|string',
            'bow_code' => 'nullable|string',
            'lesson_title' => 'required|string|max:255',
            'lesson_description' => 'required|string',
            'lesson_content' => 'required|string',
            'key_takeaways' => 'nullable|string',
            'related_assignment_id' => 'nullable|exists:assignments,id',
            'related_quiz_id' => 'nullable|exists:quizzes,id',
            'related_game_id' => 'nullable|exists:games,id',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
        ]);

        $lesson->update($validated);

        // Handle new file uploads
        if ($request->hasFile('resources')) {
            $files = $request->file('resources');
            $files = array_slice($files, 0, 5);

            // Check total resources limit (max 5 per lesson)
            $currentResourceCount = $lesson->resources()->count();
            $maxNewFiles = 5 - $currentResourceCount;

            if ($maxNewFiles > 0) {
                $files = array_slice($files, 0, $maxNewFiles);

                foreach ($files as $resource) {
                    if ($resource->getSize() > 10 * 1024 * 1024) {
                        continue;
                    }

                    $path = $resource->store('lesson-resources/' . $lesson->id, 'public');

                    LessonResource::create([
                        'lesson_id' => $lesson->id,
                        'resource_type' => $this->determineResourceType($resource),
                        'file_name' => $resource->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $resource->getSize(),
                        'mime_type' => $resource->getMimeType(),
                    ]);
                }
            }
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Lesson updated successfully!');
    }

    /**
     * Remove the specified lesson.
     */
    public function destroy(Lesson $lesson)
    {
        Gate::authorize('delete', $lesson);

        // Delete associated resources
        foreach ($lesson->resources as $resource) {
            Storage::disk('public')->delete($resource->file_path);
            $resource->delete();
        }

        $lesson->delete();

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Lesson deleted successfully!');
    }

    /**
     * Publish a lesson.
     */
    public function publish(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);

        $lesson->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Lesson published successfully!');
    }

    /**
     * Archive a lesson.
     */
    public function archive(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);

        $lesson->update(['status' => 'archived']);

        return redirect()->back()->with('success', 'Lesson archived successfully!');
    }

    /**
     * Download a lesson resource.
     */
    public function downloadResource($resourceId)
    {
        $resource = LessonResource::findOrFail($resourceId);
        $lesson = $resource->lesson;

        Gate::authorize('view', $lesson);

        $filePath = storage_path('app/public/' . $resource->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $resource->file_name);
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
