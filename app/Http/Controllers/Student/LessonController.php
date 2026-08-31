<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class LessonController extends Controller
{
    /**
     * Display a listing of lessons for the student's grade.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $subjectFilter = $request->input('subject');

        $lessons = Lesson::where('grade_level', $gradeLevel)
            ->currentlyPublished()
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('lesson_title', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%")
                        ->orWhere('learning_competency', 'like', "%{$search}%");
                });
            })
            ->when($subjectFilter, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Lessons/Index', [
            'lessons' => $lessons->map(function ($lesson) {
                return [
                    'id' => $lesson->id,
                    'title' => $lesson->lesson_title,
                    'subject' => $lesson->subject,
                    'description' => $lesson->lesson_description,
                    'teacher' => $lesson->teacher->name ?? 'Unknown',
                    'publish_date' => $lesson->publish_date ? $lesson->publish_date->format('Y-m-d') : '',
                    'created_at' => $lesson->created_at->diffForHumans(),
                ];
            }),
            'subjects' => $subjects,
            'filters' => [
                'search' => $search,
                'subject' => $subjectFilter,
            ],
            'pagination' => $lessons->toArray(),
        ]);
    }

    /**
     * Display the specified lesson.
     */
    public function show(Lesson $lesson)
    {
        $user = auth()->user();

        // Ensure the student can only view lessons for their grade level
        Gate::authorize('view', $lesson);

        $lesson->load(['resources', 'teacher', 'relatedAssignment', 'relatedQuiz', 'relatedGame']);

        // Determine if lesson is completed (using the many‑to‑many relationship)
        $isCompleted = $user->completedLessons()->where('lesson_id', $lesson->id)->exists();

        // ✅ Log: student viewed lesson
        $recentViewExists = ActivityLog::query()
            ->where('user_id', $user->id)
            ->where('activity_type', 'view')
            ->where('related_module', 'Lesson Module')
            ->where('activity_description', 'Viewed lesson: "' . $lesson->lesson_title . '"')
            ->where('created_at', '>=', now()->subMinutes(15))
            ->exists();

        if (!$recentViewExists) {
            ActivityLog::create([
                'user_id'             => $user->id,
                'user_role'           => 'student',
                'activity_type'       => 'view',
                'activity_description'=> 'Viewed lesson: "' . $lesson->lesson_title . '"',
                'related_module'      => 'Lesson Module',
            ]);
        }

        return Inertia::render('Student/Lessons/Show', [
            'lesson' => [
                'id' => $lesson->id,
                'title' => $lesson->lesson_title,
                'subject' => $lesson->subject,
                'description' => $lesson->lesson_description,
                    'content' => $this->sanitizeLessonContent($lesson->lesson_content),
                'teacher' => $lesson->teacher->name ?? 'Unknown',
                'publish_date' => $lesson->publish_date ? $lesson->publish_date->format('Y-m-d') : '',
                'is_completed' => $isCompleted,
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
            'related_activities' => [
                'assignment' => $lesson->relatedAssignment?->isCurrentlyPublished() ? [
                    'id' => $lesson->relatedAssignment->id,
                    'title' => $lesson->relatedAssignment->assignment_title,
                ] : null,
                'quiz' => $lesson->relatedQuiz?->isCurrentlyPublished() ? [
                    'id' => $lesson->relatedQuiz->id,
                    'title' => $lesson->relatedQuiz->quiz_title,
                ] : null,
                'game' => $lesson->relatedGame?->isCurrentlyPublished() ? [
                    'id' => $lesson->relatedGame->id,
                    'title' => $lesson->relatedGame->game_title,
                ] : null,
            ],
        ]);
    }

    /**
     * Mark a lesson as completed.
     */
    public function complete(Lesson $lesson)
    {
        $user = auth()->user();

        Gate::authorize('view', $lesson);

        $alreadyCompleted = $user->completedLessons()->where('lesson_id', $lesson->id)->exists();

        if (!$alreadyCompleted) {
            $user->completedLessons()->syncWithoutDetaching([$lesson->id => [
            'completed_at' => now(),
            ]]);
        }

        // ✅ Log: student completed lesson
        if (!$alreadyCompleted) {
            ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'complete',
            'activity_description'=> 'Completed lesson: "' . $lesson->lesson_title . '"',
            'related_module'      => 'Lesson Module',
            ]);
        }

        return redirect()->back()->with('success', 'Lesson marked as completed!');
    }

    /**
     * Download a lesson resource or redirect if URL.
     */
    public function downloadResource($id)
    {
        $resource = LessonResource::findOrFail($id);
        $lesson   = $resource->lesson;

        $user = auth()->user();
        Gate::authorize('view', $lesson);

        // ✅ If resource is a URL, redirect
        if ($resource->resource_type === 'url') {
            return redirect()->away($resource->file_path);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $resource->file_name);
    }

    public function viewResource($id)
    {
        $resource = LessonResource::findOrFail($id);
        $lesson = $resource->lesson;

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

    private function sanitizeLessonContent(string $content): string
    {
        $content = strip_tags($content, '<p><br><strong><b><em><i><u><ul><ol><li><h1><h2><h3><blockquote>');

        return preg_replace('/<([a-z0-9]+)\s+[^>]*>/i', '<$1>', $content) ?? '';
    }

}
