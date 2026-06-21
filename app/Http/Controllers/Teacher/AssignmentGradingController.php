<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AssignmentGradingController extends Controller
{
    /**
     * Display all submissions for an assignment.
     */
    public function index(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->with('student')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all students assigned to this grade level
        $students = User::role('student')
            ->where('grade_level', $assignment->grade_level)
            ->get();

        // Merge to show all students (including those who haven't submitted)
        $allStudents = $students->map(function ($student) use ($submissions) {
            $submission = $submissions->firstWhere('student_id', $student->id);

            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'lrn' => $student->lrn,
                'submission_id' => $submission ? $submission->id : null,
                'status' => $submission ? $submission->status : 'not_submitted',
                'score' => $submission ? $submission->score : null,
                'feedback' => $submission ? $submission->feedback : null,
                'submission_method' => $submission ? $submission->submission_method : null,
                'file_name' => $submission ? $submission->file_name : null,
                'file_path' => $submission ? $submission->file_path : null,
                'submitted_at' => $submission ? $submission->submitted_at : null,
                'graded_at' => $submission ? $submission->graded_at : null,
            ];
        });

        return Inertia::render('Teacher/Assignments/Grading', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->assignment_title,
                'grade_level' => $assignment->grade_level,
                'subject' => $assignment->subject,
                'total_points' => $assignment->total_points,
                'due_date' => $assignment->due_date,
                'submission_methods' => json_decode($assignment->submission_methods, true),
            ],
            'submissions' => $allStudents,
            'statistics' => [
                'total_students' => $allStudents->count(),
                'submitted' => $allStudents->filter(function ($s) {
                    return $s['status'] === 'submitted' || $s['status'] === 'graded' || $s['status'] === 'reviewed';
                })->count(),
                'pending' => $allStudents->filter(function ($s) {
                    return $s['status'] === 'not_submitted';
                })->count(),
                'graded' => $allStudents->filter(function ($s) {
                    return $s['status'] === 'graded';
                })->count(),
                'average_score' => $allStudents->filter(function ($s) {
                    return $s['score'] !== null;
                })->avg('score'),
            ],
        ]);
    }

    /**
     * Grade a specific submission.
     */
    public function grade(Request $request, Assignment $assignment, AssignmentSubmission $submission)
    {
        Gate::authorize('update', $assignment);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string',
            'status' => 'required|in:graded,reviewed,returned_for_revision',
        ]);

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => $validated['status'],
            'graded_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Submission graded successfully!');
    }

    /**
     * Mark paper-based submission as completed.
     */
    public function markPaper(Request $request, Assignment $assignment, $studentId)
    {
        Gate::authorize('update', $assignment);

        $validated = $request->validate([
            'score' => 'nullable|integer|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string',
        ]);

        $submission = AssignmentSubmission::firstOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id' => $studentId,
            ],
            [
                'submission_method' => 'paper',
                'submitted_at' => now(),
                'status' => 'submitted',
            ]
        );

        if ($validated['score'] !== null) {
            $submission->update([
                'score' => $validated['score'],
                'feedback' => $validated['feedback'] ?? null,
                'status' => 'graded',
                'graded_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Paper submission marked successfully!');
    }

    /**
     * View submission file.
     */
    public function viewFile($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        Gate::authorize('update', $submission->assignment);

        if (!$submission->file_path) {
            abort(404, 'No file uploaded for this submission.');
        }

        return response()->file(storage_path('app/public/' . $submission->file_path));
    }

    /**
     * Download submission file.
     */
    public function downloadFile($submissionId)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        Gate::authorize('update', $submission->assignment);

        if (!$submission->file_path) {
            abort(404, 'No file uploaded for this submission.');
        }

        return response()->download(
            storage_path('app/public/' . $submission->file_path),
            $submission->file_name
        );
    }
}
