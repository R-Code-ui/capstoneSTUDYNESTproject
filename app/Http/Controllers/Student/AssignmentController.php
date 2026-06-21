<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentResource;
use App\Models\AssignmentSubmission;
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
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $subjectFilter = $request->input('subject');
        $statusFilter = $request->input('status');

        $assignments = Assignment::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->when($search, function ($query, $search) {
                return $query->where('assignment_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($subjectFilter, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->when($statusFilter, function ($query, $status) {
                if ($status === 'submitted') {
                    return $query->whereHas('submissions', function ($q) {
                        $q->where('student_id', auth()->id())
                            ->whereIn('status', ['submitted', 'reviewed', 'graded']);
                    });
                } elseif ($status === 'pending') {
                    return $query->whereDoesntHave('submissions', function ($q) {
                        $q->where('student_id', auth()->id());
                    })->orWhereHas('submissions', function ($q) {
                        $q->where('student_id', auth()->id())
                            ->where('status', 'not_submitted');
                    });
                }
                return $query;
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Assignments/Index', [
            'assignments' => $assignments->map(function ($assignment) use ($user) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('student_id', $user->id)
                    ->first();

                return [
                    'id' => $assignment->id,
                    'title' => $assignment->assignment_title,
                    'subject' => $assignment->subject,
                    'type' => $assignment->assignment_type,
                    'due_date' => $assignment->due_date->format('M d, Y'),
                    'total_points' => $assignment->total_points,
                    'status' => $submission ? $submission->status : 'not_submitted',
                    'score' => $submission ? $submission->score : null,
                ];
            }),
            'subjects' => $subjects,
            'filters' => [
                'search' => $search,
                'subject' => $subjectFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Display the specified assignment.
     */
    public function show(Assignment $assignment)
    {
        $user = auth()->user();

        if ($assignment->grade_level !== $user->grade_level) {
            abort(403);
        }

        $assignment->load('resources');

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->assignment_title,
                'subject' => $assignment->subject,
                'type' => $assignment->assignment_type,
                'instructions' => $assignment->instructions,
                'total_points' => $assignment->total_points,
                'due_date' => $assignment->due_date->format('M d, Y'),
                'due_time' => $assignment->due_time,
                'submission_methods' => json_decode($assignment->submission_methods, true),
                'allow_late_submission' => $assignment->allow_late_submission,
                'resources' => $assignment->resources->map(function ($resource) {
                    return [
                        'id' => $resource->id,
                        'type' => $resource->resource_type,
                        'name' => $resource->file_name,
                        'path' => $resource->file_path,
                    ];
                }),
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'status' => $submission->status,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('M d, Y H:i') : null,
                'file_name' => $submission->file_name,
                'file_path' => $submission->file_path,
            ] : null,
        ]);
    }

    /**
     * Submit an assignment via digital upload.
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $user = auth()->user();

        if ($assignment->grade_level !== $user->grade_level) {
            abort(403);
        }

        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'submission_method' => 'required|in:digital,photo',
        ]);

        // Check if already submitted
        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existingSubmission && $existingSubmission->status !== 'not_submitted') {
            return redirect()->back()->with('error', 'You have already submitted this assignment.');
        }

        // Upload file
        $file = $request->file('file');
        $path = $file->store('submissions/' . $assignment->id . '/' . $user->id, 'public');

        $status = 'submitted';
        if ($assignment->due_date < now() && !$assignment->allow_late_submission) {
            $status = 'late_submission';
        }

        if ($existingSubmission) {
            // Update existing submission
            $existingSubmission->update([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'submission_method' => $validated['submission_method'],
                'submitted_at' => now(),
                'status' => $status,
            ]);
        } else {
            // Create new submission
            AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $user->id,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'submission_method' => $validated['submission_method'],
                'submitted_at' => now(),
                'status' => $status,
            ]);
        }

        return redirect()->route('student.assignments.index')
            ->with('success', 'Assignment submitted successfully!');
    }

    /**
     * Mark paper-based submission.
     */
    public function markPaper(Assignment $assignment)
    {
        $user = auth()->user();

        if ($assignment->grade_level !== $user->grade_level) {
            abort(403);
        }

        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existingSubmission && $existingSubmission->status !== 'not_submitted') {
            return redirect()->back()->with('error', 'You have already submitted this assignment.');
        }

        $status = 'submitted';
        if ($assignment->due_date < now() && !$assignment->allow_late_submission) {
            $status = 'late_submission';
        }

        if ($existingSubmission) {
            $existingSubmission->update([
                'submission_method' => 'paper',
                'submitted_at' => now(),
                'status' => $status,
            ]);
        } else {
            AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $user->id,
                'submission_method' => 'paper',
                'submitted_at' => now(),
                'status' => $status,
            ]);
        }

        return redirect()->route('student.assignments.index')
            ->with('success', 'Paper submission recorded!');
    }
}
