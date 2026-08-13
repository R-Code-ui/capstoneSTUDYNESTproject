<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentResource;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $subjectFilter = $request->input('subject');

        $assignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->when($search, function ($query, $search) {
                return $query->where('assignment_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($subjectFilter, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $assignmentsData = $assignments->map(function ($assignment) use ($user) {
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $user->id)
                ->first();

            return [
                'id'              => $assignment->id,
                'title'           => $assignment->assignment_title,
                'subject'         => $assignment->subject,
                'assignment_type' => $assignment->assignment_type,
                'due_date'        => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : null,
                'status'          => $submission ? $submission->status : 'not_submitted',
                'score'           => $submission ? $submission->score : null,
                'is_graded'       => $submission && $submission->status === 'graded',
                'total_points'    => $assignment->total_points,
            ];
        });

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignmentsData,
            'subjects'    => $subjects,
            'filters'     => [
                'search'  => $search,
                'subject' => $subjectFilter,
            ],
            'pagination' => $assignments->toArray(),
        ]);
    }

    public function show(Assignment $assignment)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        if ($assignment->grade_level !== $gradeLevel) {
            abort(403);
        }

        $assignment->load('resources');

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        $submissionMethods = $assignment->submission_methods;
        if (is_string($submissionMethods)) {
            $submissionMethods = json_decode($submissionMethods, true);
        }

        $resources = $assignment->resources->map(function ($resource) {
            return [
                'id'   => $resource->id,
                'type' => $resource->resource_type,
                'name' => $resource->file_name,
                'path' => $resource->file_path,
                'size' => $resource->file_size,
                'mime' => $resource->mime_type,
            ];
        });

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id'                  => $assignment->id,
                'title'               => $assignment->assignment_title,
                'subject'             => $assignment->subject,
                'assignment_type'     => $assignment->assignment_type,
                'instructions'        => $assignment->instructions,
                'total_points'        => $assignment->total_points,
                'due_date'            => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : null,
                'due_time'            => $assignment->due_time,
                'submission_methods'  => $submissionMethods,
                'allow_late_submission' => $assignment->allow_late_submission,
            ],
            'resources'  => $resources,
            'submission' => $submission ? [
                'id'                => $submission->id,
                'status'            => $submission->status,
                'score'             => $submission->score,
                'feedback'          => $submission->feedback,
                'submitted_at'      => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i') : null,
                'graded_at'         => $submission->graded_at ? $submission->graded_at->format('Y-m-d H:i') : null,
                'file_name'         => $submission->file_name,
                'file_path'         => $submission->file_path,
                'submission_method' => $submission->submission_method,
            ] : null,
        ]);
    }

    /**
     * Submit an assignment – now stores all files in a single JSON column.
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        if ($assignment->grade_level !== $gradeLevel) {
            abort(403);
        }

        $validated = $request->validate([
            'submission_method' => 'required|in:digital,paper',
            'files'             => 'nullable|array|max:4',
            'files.*'           => 'file|max:102400|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png,mp4',
        ]);

        // Check existing submission
        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existing && !in_array($existing->status, ['returned_for_revision', 'not_submitted'])) {
            return redirect()->back()->with('error', 'You have already submitted this assignment.');
        }

        // Check late submission
        $isLate = false;
        if ($assignment->due_date && now()->gt($assignment->due_date)) {
            if (!$assignment->allow_late_submission) {
                return redirect()->back()->with('error', 'Late submissions are not allowed.');
            }
            $isLate = true;
        }

        // Delete old submission and its files
        if ($existing) {
            if ($existing->file_path && Storage::disk('public')->exists($existing->file_path)) {
                Storage::disk('public')->delete($existing->file_path);
            }
            if ($existing->files) {
                foreach ($existing->files as $oldFile) {
                    if (Storage::disk('public')->exists($oldFile['path'])) {
                        Storage::disk('public')->delete($oldFile['path']);
                    }
                }
            }
            $existing->delete();
        }

        // Build files array for JSON column
        $filesArray = [];
        if ($validated['submission_method'] === 'digital' && $request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('assignment-submissions/' . $assignment->id . '/' . $user->id, 'public');
                $filesArray[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType(),
                ];
            }
        } elseif ($validated['submission_method'] === 'digital') {
            return redirect()->back()->with('error', 'Please select at least one file.');
        }

        // Create single submission record
        $submission = AssignmentSubmission::create([
            'assignment_id'    => $assignment->id,
            'student_id'       => $user->id,
            'submission_method'=> $validated['submission_method'],
            'file_path'        => null,      // no longer used for new submissions
            'file_name'        => null,
            'files'            => $filesArray,
            'status'           => $isLate ? 'late_submission' : 'submitted',
            'submitted_at'     => now(),
        ]);

        app(StudyNestNotificationService::class)->assignmentSubmitted($submission);

        ActivityLog::create([
            'user_id'              => $user->id,
            'user_role'            => 'student',
            'activity_type'        => 'submit',
            'activity_description'=> 'Submitted assignment "' . $assignment->assignment_title . '"',
            'related_module'       => 'Assignment Module',
        ]);

        return redirect()->back()->with('success', 'Assignment submitted successfully!');
    }

    public function downloadResource($id)
    {
        $resource = AssignmentResource::findOrFail($id);
        $assignment = $resource->assignment;
        $user = auth()->user();

        if ($assignment->grade_level !== $user->grade_level) {
            abort(403);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);
        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $resource->file_name);
    }

    public function viewResource($id)
    {
        $resource = AssignmentResource::findOrFail($id);
        $assignment = $resource->assignment;
        $user = auth()->user();

        if ($assignment->grade_level !== $user->grade_level) abort(403);

        $filePath = storage_path('app/public/' . $resource->file_path);
        if (!file_exists($filePath)) abort(404, 'File not found.');

        return response()->file($filePath, [
            'Content-Type' => $resource->mime_type ?: mime_content_type($filePath),
        ]);
    }
}
