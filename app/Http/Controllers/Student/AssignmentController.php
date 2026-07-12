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

class AssignmentController extends Controller
{
    /**
     * Display a listing of assignments for the student.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $subjectFilter = $request->input('subject');

        // Get assignments for student's grade level
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
            ->paginate(10); // ✅ PAGINATION ADDED

        // Get submission status for each assignment
        $assignmentsData = $assignments->map(function ($assignment) use ($user) {
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $user->id)
                ->first();

            return [
                'id' => $assignment->id,
                'title' => $assignment->assignment_title,
                'subject' => $assignment->subject,
                'assignment_type' => $assignment->assignment_type,
                'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : null,
                'status' => $submission ? $submission->status : 'not_submitted',
                'score' => $submission ? $submission->score : null,
                'is_graded' => $submission && $submission->status === 'graded',
            ];
        });

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignmentsData,
            'subjects' => $subjects,
            'filters' => [
                'search' => $search,
                'subject' => $subjectFilter,
            ],
            'pagination' => $assignments->toArray(), // ✅ PAGINATION DATA
        ]);
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        // Ensure student can only view their grade level
        if ($assignment->grade_level !== $gradeLevel) {
            abort(403);
        }

        // Load resources
        $assignment->load('resources');

        // Get submission if exists
        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        // Get allowed submission methods
        $submissionMethods = $assignment->submission_methods;
        if (is_string($submissionMethods)) {
            $submissionMethods = json_decode($submissionMethods, true);
        }

        // Prepare resources for display
        $resources = $assignment->resources->map(function ($resource) {
            return [
                'id' => $resource->id,
                'type' => $resource->resource_type,
                'name' => $resource->file_name,
                'path' => $resource->file_path,
            ];
        });

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->assignment_title,
                'subject' => $assignment->subject,
                'assignment_type' => $assignment->assignment_type,
                'instructions' => $assignment->instructions,
                'total_points' => $assignment->total_points,
                'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : null,
                'due_time' => $assignment->due_time,
                'submission_methods' => $submissionMethods,
                'allow_late_submission' => $assignment->allow_late_submission,
            ],
            'resources' => $resources,
            'submission' => $submission ? [
                'id' => $submission->id,
                'status' => $submission->status,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i') : null,
                'graded_at' => $submission->graded_at ? $submission->graded_at->format('Y-m-d H:i') : null,
                'file_name' => $submission->file_name,
                'file_path' => $submission->file_path,
                'submission_method' => $submission->submission_method,
            ] : null,
        ]);
    }

    /**
     * Submit an assignment.
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        // Ensure student can only submit to their grade level
        if ($assignment->grade_level !== $gradeLevel) {
            abort(403);
        }

        $validated = $request->validate([
            'submission_method' => 'required|in:digital,photo,paper',
            'file' => 'nullable|file|max:2048|mimes:pdf,docx,jpg,jpeg,png', // 2MB limit
        ]);

        // Check if already submitted
        $existing = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existing && $existing->status !== 'returned_for_revision') {
            return redirect()->back()->with('error', 'You have already submitted this assignment.');
        }

        // Check late submission
        $isLate = false;
        if ($assignment->due_date && now()->gt($assignment->due_date)) {
            if (!$assignment->allow_late_submission) {
                return redirect()->back()->with('error', 'Late submissions are not allowed for this assignment.');
            }
            $isLate = true;
        }

        $submissionData = [
            'assignment_id' => $assignment->id,
            'student_id' => $user->id,
            'submission_method' => $validated['submission_method'],
            'status' => $isLate ? 'late_submission' : 'submitted',
            'submitted_at' => now(),
        ];

        // Handle file upload for digital or photo upload
        if (in_array($validated['submission_method'], ['digital', 'photo']) && $request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('assignment-submissions/' . $assignment->id . '/' . $user->id, 'public');
            $submissionData['file_path'] = $path;
            $submissionData['file_name'] = $file->getClientOriginalName();
        }

        // For paper-based, we just record the submission without file
        if ($validated['submission_method'] === 'paper') {
            // Paper-based submissions are marked as submitted, teacher will grade later
        }

        // Update or create submission
        if ($existing) {
            $existing->update($submissionData);
            $submission = $existing;
        } else {
            $submission = AssignmentSubmission::create($submissionData);
        }

        // ✅ Log assignment submission
        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'submit',
            'activity_description'=> 'Submitted assignment "' . $assignment->assignment_title . '"',
            'related_module'      => 'Assignment Module',
        ]);

        return redirect()->back()->with('success', 'Assignment submitted successfully!');
    }

    /**
     * Download an assignment resource.
     */
    public function downloadResource($id)
    {
        $resource = AssignmentResource::findOrFail($id);
        $assignment = $resource->assignment;
        $user = auth()->user();

        // Ensure student can only download resources for their grade level
        if ($assignment->grade_level !== $user->grade_level) {
            abort(403);
        }

        $filePath = storage_path('app/public/' . $resource->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $resource->file_name);
    }
}
