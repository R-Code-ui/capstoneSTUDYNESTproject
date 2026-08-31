<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;
use App\Services\PublicationManager;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Lesson::class);

        $user = auth()->user();
        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $trimesterFilter = $request->input('trimester');

        $lessons = Lesson::where('teacher_id', $user->id)
            ->withCount(['students as completed_students_count' => function ($query) {
                $query->role('student')->where('is_active', true);
            }])
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('lesson_title', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('learning_competency', 'like', "%{$search}%");
                });
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
            ->paginate(10)
            ->withQueryString();

        $studentCounts = User::role('student')
            ->where('is_active', true)
            ->whereIn('grade_level', $lessons->pluck('grade_level')->unique())
            ->selectRaw('grade_level, COUNT(*) as total')
            ->groupBy('grade_level')
            ->pluck('total', 'grade_level');

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $statuses = ['draft', 'scheduled', 'published', 'archived'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];
        $schoolYears = config('school.school_years');

        return Inertia::render('Teacher/Lessons/Index', [
            'lessons' => $lessons->map(function ($lesson) use ($studentCounts) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'subject' => $lesson->subject,
                    'grade_level' => $lesson->grade_level,
                    'trimester' => $lesson->trimester,
                    'status' => $lesson->status,
                    'publish_date' => $lesson->publish_date?->format('Y-m-d\TH:i') ?? '',
                    'created_at' => $lesson->created_at->format('Y-m-d'),
                    'completed_students' => (int) $lesson->completed_students_count,
                    'total_students' => (int) ($studentCounts[$lesson->grade_level] ?? 0),
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
            'pagination' => $lessons->toArray(),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Lesson::class);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];
        $schoolYears = config('school.school_years');
        $statuses = ['draft', 'scheduled', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));

        $assignments = Assignment::where('teacher_id', $user->id)->get()->map(function ($assignment) {
            return ['id' => $assignment->id, 'title' => $assignment->assignment_title];
        });
        $quizzes = Quiz::where('teacher_id', $user->id)->get()->map(function ($quiz) {
            return ['id' => $quiz->id, 'title' => $quiz->quiz_title];
        });
        $games = Game::where('teacher_id', $user->id)->get()->map(function ($game) {
            return ['id' => $game->id, 'title' => $game->game_title];
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

    public function store(Request $request)
    {
        Gate::authorize('create', Lesson::class);

        $assignedGrades = auth()->user()->gradeAssignments()->pluck('grade_level')->all();

        $validated = $request->validate([
            'grade_level' => ['required', Rule::in($assignedGrades)],
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:' . implode(',', config('school.school_years')),
            'trimester' => 'required|string|in:1st Term,2nd Term,3rd Term',
            'week_number' => 'required|string|in:Week 1,Week 2,Week 3,Week 4,Week 5,Week 6,Week 7,Week 8,Week 9,Week 10,Week 11,Week 12',
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
            'status' => 'required|in:draft,scheduled,published,archived',
            'publish_date' => 'nullable|required_if:status,scheduled|date',
            'resource_urls' => 'nullable|array|max:10',
            'resource_urls.*' => 'nullable|url|max:2048',
            'resources' => 'nullable|array|max:8',
            'resources.*' => 'file|max:51200|mimes:pdf,jpg,jpeg,png,doc,docx,ppt,pptx,mp4',
        ]);

        $this->validateLessonRelationships($validated);

        app(PublicationManager::class)->normalize($validated);

        $resourceUrls = array_values(array_filter($validated['resource_urls'] ?? []));
        unset($validated['resources'], $validated['resource_urls']);

        $validated['lesson_content'] = $this->sanitizeLessonContent($validated['lesson_content']);
        $lesson = Lesson::create([
            'teacher_id' => auth()->id(),
            ...$validated,
        ]);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'activity_type' => 'create',
            'activity_description' => 'Created lesson "' . $lesson->lesson_title . '"',
            'related_module' => 'Lesson Module',
        ]);

        if ($request->hasFile('resources')) {
            $files = $request->file('resources');

            if (count($files) > 8) {
                return redirect()->back()
                    ->withErrors(['resources' => 'You can only upload a maximum of 8 files.'])
                    ->withInput();
            }

            foreach ($files as $resource) {
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

        $this->syncExternalResources($lesson, $resourceUrls);

        if ($lesson->isCurrentlyPublished()) {
            app(StudyNestNotificationService::class)->lessonPublished($lesson);
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Lesson created successfully!');
    }

    public function show(Lesson $lesson)
    {
        Gate::authorize('view', $lesson);
        $lesson->load(['resources', 'students' => function ($query) use ($lesson) {
            $query->role('student')
                ->where('grade_level', $lesson->grade_level)
                ->orderBy('name');
        }]);

        $completedByStudent = $lesson->students->keyBy('id');
        $students = User::role('student')
            ->where('is_active', true)
            ->where('grade_level', $lesson->grade_level)
            ->orderBy('name')
            ->get();

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
                    'lesson_content' => $this->sanitizeLessonContent($lesson->lesson_content),
                'key_takeaways' => $lesson->key_takeaways,
                'status' => $lesson->status,
                'publish_date' => $lesson->publish_date?->format('M d, Y g:i A') ?? 'Not published',
                'created_at' => $lesson->created_at->format('Y-m-d H:i'),
                'resources' => $lesson->resources->map(function ($resource) {
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
            'completion_records' => $lesson->students->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'grade_level' => $student->grade_level,
                'completed_at' => $student->pivot->completed_at
                    ? \Illuminate\Support\Carbon::parse($student->pivot->completed_at)->format('Y-m-d H:i')
                    : null,
            ])->values(),
            'student_completion' => $students->map(function ($student) use ($completedByStudent) {
                $completed = $completedByStudent->get($student->id);

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'grade_level' => $student->grade_level,
                    'status' => $completed ? 'completed' : 'not_completed',
                    'completed_at' => $completed && $completed->pivot->completed_at
                        ? \Illuminate\Support\Carbon::parse($completed->pivot->completed_at)->format('Y-m-d H:i')
                        : null,
                ];
            })->values(),
        ]);
    }

    public function edit(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);
        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $trimesters = ['1st Term', '2nd Term', '3rd Term'];
        $schoolYears = config('school.school_years');
        $statuses = ['draft', 'scheduled', 'published', 'archived'];
        $weeks = array_map(function ($i) { return 'Week ' . $i; }, range(1, 12));

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
                'publish_date' => $lesson->publish_date?->format('Y-m-d\TH:i') ?? '',
                'resources' => $lesson->resources->map(function ($resource) {
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
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
        ]);
    }

    public function update(Request $request, Lesson $lesson)
    {
        Gate::authorize('update', $lesson);

        $validated = $request->validate([
            'grade_level' => ['required', Rule::in(auth()->user()->gradeAssignments()->pluck('grade_level')->all())],
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:' . implode(',', config('school.school_years')),
            'trimester' => 'required|string|in:1st Term,2nd Term,3rd Term',
            'week_number' => 'required|string|in:Week 1,Week 2,Week 3,Week 4,Week 5,Week 6,Week 7,Week 8,Week 9,Week 10,Week 11,Week 12',
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
            'status' => 'required|in:draft,scheduled,published,archived',
            'publish_date' => 'nullable|required_if:status,scheduled|date',
            'deleted_resource_ids' => 'nullable|string',
            'resource_urls' => 'nullable|array|max:10',
            'resource_urls.*' => 'nullable|url|max:2048',
            'resource_urls_present' => 'nullable|boolean',
            'resources' => 'nullable|array|max:8',
            'resources.*' => 'file|max:51200|mimes:pdf,jpg,jpeg,png,doc,docx,ppt,pptx,mp4',
        ]);

        $this->validateLessonRelationships($validated);

        $wasPublished = $lesson->isCurrentlyPublished();
        app(PublicationManager::class)->normalize($validated, $lesson);

        $resourceUrls = array_values(array_filter($validated['resource_urls'] ?? []));
        $resourceUrlsPresent = $request->boolean('resource_urls_present');
        $deletedResourceIds = $validated['deleted_resource_ids'] ?? null;
        unset($validated['resources'], $validated['resource_urls'], $validated['resource_urls_present'], $validated['deleted_resource_ids']);

        $validated['lesson_content'] = $this->sanitizeLessonContent($validated['lesson_content']);
        $lesson->update($validated);

        if (!$wasPublished && $lesson->isCurrentlyPublished()) {
            app(StudyNestNotificationService::class)->lessonPublished($lesson);
        }

        if (!empty($deletedResourceIds)) {
            $deletedIds = explode(',', $deletedResourceIds);
            $deletedIds = array_filter($deletedIds);

            if (!empty($deletedIds)) {
                $resourcesToDelete = LessonResource::whereIn('id', $deletedIds)
                    ->where('lesson_id', $lesson->id)
                    ->get();

                foreach ($resourcesToDelete as $resource) {
                    if ($resource->resource_type !== 'url' && Storage::disk('public')->exists($resource->file_path)) {
                        Storage::disk('public')->delete($resource->file_path);
                    }
                    $resource->delete();
                }
            }
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'activity_type' => 'update',
            'activity_description' => 'Updated lesson "' . $lesson->lesson_title . '"',
            'related_module' => 'Lesson Module',
        ]);

        if ($request->hasFile('resources')) {
            $files = $request->file('resources');
            $currentResourceCount = $lesson->resources()
                ->where('resource_type', '!=', 'url')
                ->count();
            $maxNewFiles = 8 - $currentResourceCount;

            if (count($files) > $maxNewFiles) {
                return redirect()->back()
                    ->withErrors(['resources' => 'You can only upload a maximum of ' . $maxNewFiles . ' more files.'])
                    ->withInput();
            }

            foreach ($files as $resource) {
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

        if ($resourceUrlsPresent) {
            $this->syncExternalResources($lesson, $resourceUrls);
        }

        return redirect()->route('teacher.lessons.index')
            ->with('success', 'Lesson updated successfully!');
    }

    public function destroy(Lesson $lesson)
    {
        Gate::authorize('delete', $lesson);
        app(StudyNestNotificationService::class)->forgetFor('lesson', $lesson->id);

        foreach ($lesson->resources as $resource) {
            if ($resource->resource_type !== 'url' && Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }
            $resource->delete();
        }
        $lesson->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'activity_type' => 'delete',
            'activity_description' => 'Deleted lesson "' . $lesson->lesson_title . '"',
            'related_module' => 'Lesson Module',
        ]);

        return redirect()->route('teacher.lessons.index')->with('success', 'Lesson deleted successfully!');
    }

    public function publish(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);
        $lesson->update(['status' => 'published', 'publish_date' => now()]);

        app(StudyNestNotificationService::class)->lessonPublished($lesson);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'activity_type' => 'publish',
            'activity_description' => 'Published lesson "' . $lesson->lesson_title . '"',
            'related_module' => 'Lesson Module',
        ]);

        return redirect()->route('teacher.lessons.index')->with('success', 'Lesson published successfully!');
    }

    public function archive(Lesson $lesson)
    {
        Gate::authorize('update', $lesson);
        $lesson->update(['status' => 'archived']);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'user_role' => 'teacher',
            'activity_type' => 'archive',
            'activity_description' => 'Archived lesson "' . $lesson->lesson_title . '"',
            'related_module' => 'Lesson Module',
        ]);

        return redirect()->route('teacher.lessons.index')->with('success', 'Lesson archived successfully!');
    }

    public function downloadResource($resourceId)
    {
        $resource = LessonResource::findOrFail($resourceId);
        $lesson   = $resource->lesson;
        if (!$lesson) abort(404, 'Resource not associated with any lesson.');

        Gate::authorize('view', $lesson);

        if ($resource->resource_type === 'url') {
            return redirect()->away($resource->file_path);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);
        if (!file_exists($filePath)) abort(404, 'File not found.');

        return response()->download($filePath, $resource->file_name);
    }

    public function viewResource($resourceId)
    {
        $resource = LessonResource::findOrFail($resourceId);
        $lesson = $resource->lesson;
        if (!$lesson) abort(404, 'Resource not associated with any lesson.');

        Gate::authorize('view', $lesson);

        if ($resource->resource_type === 'url') {
            return redirect()->away($resource->file_path);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);
        if (!file_exists($filePath)) abort(404, 'File not found.');

        if (preg_match('/\.(doc|docx|ppt|pptx)$/i', $resource->file_name ?? '')) {
            return response()->download($filePath, $resource->file_name);
        }

        return response()->file($filePath, [
            'Content-Type' => $resource->mime_type ?: mime_content_type($filePath),
        ]);
    }

    private function determineResourceType(\Illuminate\Http\UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();
        if (str_starts_with($mimeType, 'video/')) return 'video';
        if (str_contains($mimeType, 'pdf')) return 'pdf_module';
        if (str_contains($mimeType, 'image')) return 'image';
        if (str_contains($mimeType, 'word') || str_contains($mimeType, 'document')) return 'worksheet';
        return 'worksheet';
    }

    private function syncExternalResources(Lesson $lesson, array $urls): void
    {
        $lesson->resources()->where('resource_type', 'url')->delete();

        foreach ($urls as $url) {
            $host = parse_url($url, PHP_URL_HOST) ?: 'External resource';
            LessonResource::create([
                'lesson_id' => $lesson->id,
                'resource_type' => 'url',
                'file_name' => ucfirst(preg_replace('/^www\./i', '', $host)),
                'file_path' => $url,
                'file_size' => 0,
                'mime_type' => 'url',
            ]);
        }
    }

    private function validateLessonRelationships(array $validated): void
    {
        foreach ([
            'related_assignment_id' => Assignment::class,
            'related_quiz_id' => Quiz::class,
            'related_game_id' => Game::class,
        ] as $field => $model) {
            if (empty($validated[$field])) {
                continue;
            }

            $valid = $model::whereKey($validated[$field])
                ->where('teacher_id', auth()->id())
                ->where('grade_level', $validated['grade_level'])
                ->exists();

            if (!$valid) {
                throw ValidationException::withMessages([
                    $field => 'The selected activity must belong to you and match the lesson grade level.',
                ]);
            }
        }
    }

    private function sanitizeLessonContent(string $content): string
    {
        $content = strip_tags($content, '<p><br><strong><b><em><i><u><ul><ol><li><h1><h2><h3><blockquote>');

        return preg_replace('/<([a-z0-9]+)\s+[^>]*>/i', '<$1>', $content) ?? '';
    }
}
