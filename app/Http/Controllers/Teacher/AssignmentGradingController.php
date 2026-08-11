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
    public function index(Assignment $assignment)
    {
        Gate::authorize('update', $assignment);

        $submissions = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->with('student')
            ->orderBy('created_at', 'desc')
            ->get();

        $students = User::role('student')
            ->where('grade_level', $assignment->grade_level)
            ->get();

        $submissionMethods = $assignment->submission_methods;
        if (is_string($submissionMethods)) {
            $submissionMethods = json_decode($submissionMethods, true);
        }

        $allStudents = $students->map(function ($student) use ($submissions) {
            $submission = $submissions->firstWhere('student_id', $student->id);

            return [
                'student_id'       => $student->id,
                'student_name'     => $student->name,
                'lrn'              => $student->lrn,
                'submission_id'    => $submission ? $submission->id : null,
                'status'           => $submission ? $submission->status : 'not_submitted',
                'score'            => $submission ? $submission->score : null,
                'feedback'         => $submission ? $submission->feedback : null,
                'submission_method'=> $submission ? $submission->submission_method : null,
                'files'            => $submission ? $submission->files : [],
                'submitted_at'     => $submission && $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i') : null,
                'graded_at'        => $submission && $submission->graded_at ? $submission->graded_at->format('Y-m-d H:i') : null,
            ];
        });

        return Inertia::render('Teacher/Assignments/Grading', [
            'assignment' => [
                'id'                 => $assignment->id,
                'title'              => $assignment->assignment_title,
                'grade_level'        => $assignment->grade_level,
                'subject'            => $assignment->subject,
                'total_points'       => $assignment->total_points,
                'due_date'           => $assignment->due_date,
                'submission_methods' => $submissionMethods,
            ],
            'submissions' => $allStudents,
            'statistics' => [
                'total_students' => $allStudents->count(),
                'submitted'      => $allStudents->filter(fn($s) => in_array($s['status'], ['submitted','graded','reviewed']))->count(),
                'pending'        => $allStudents->filter(fn($s) => $s['status'] === 'not_submitted')->count(),
                'graded'         => $allStudents->filter(fn($s) => $s['status'] === 'graded')->count(),
                'average_score'  => $allStudents->filter(fn($s) => $s['score'] !== null)->avg('score'),
            ],
        ]);
    }

    public function grade(Request $request, Assignment $assignment, AssignmentSubmission $submission)
    {
        Gate::authorize('update', $assignment);

        $validated = $request->validate([
            'score'    => 'required|integer|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string',
            'status'   => 'required|in:graded,reviewed,returned_for_revision',
        ]);

        $submission->update([
            'score'      => $validated['score'],
            'feedback'   => $validated['feedback'] ?? null,
            'status'     => $validated['status'],
            'graded_at'  => now(),
        ]);

        return redirect()->back()->with('success', 'Submission graded successfully!');
    }

    public function markPaper(Request $request, Assignment $assignment, $studentId)
    {
        Gate::authorize('update', $assignment);

        $validated = $request->validate([
            'score'    => 'nullable|integer|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string',
        ]);

        $submission = AssignmentSubmission::firstOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id'    => $studentId,
            ],
            [
                'submission_method' => 'paper',
                'submitted_at'      => now(),
                'status'            => 'submitted',
            ]
        );

        if ($validated['score'] !== null) {
            $submission->update([
                'score'      => $validated['score'],
                'feedback'   => $validated['feedback'] ?? null,
                'status'     => 'graded',
                'graded_at'  => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Paper submission marked successfully!');
    }

    /**
     * Display all files for a specific submission.
     */
    public function showFiles(AssignmentSubmission $submission)
    {
        Gate::authorize('update', $submission->assignment);

        $submission->load('student', 'assignment');

        return Inertia::render('Teacher/Assignments/SubmissionFiles', [
            'submission' => [
                'id'           => $submission->id,
                'files'        => $submission->files,
                'file_path'    => $submission->file_path,   // legacy
                'file_name'    => $submission->file_name,   // legacy
                'submitted_at' => $submission->submitted_at?->format('Y-m-d H:i'),
            ],
            'assignment' => [
                'id'      => $submission->assignment->id,
                'title'   => $submission->assignment->assignment_title,
                'subject' => $submission->assignment->subject,
            ],
            'student' => [
                'name' => $submission->student->name,
                'lrn'  => $submission->student->lrn,
            ],
        ]);
    }

    /**
     * View a specific file from the submission's files array.
     */
    public function viewFile($submissionId, $index = 0)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        Gate::authorize('update', $submission->assignment);

        $file = $this->getFileFromSubmission($submission, $index);
        $filePath = storage_path('app/public/' . $file['path']);
        if (!file_exists($filePath)) abort(404, 'File not found.');

        return response()->file($filePath, [
            'Content-Type' => $file['mime'] ?? mime_content_type($filePath),
        ]);
    }

    /**
     * Download a specific file from the submission's files array.
     */
    public function downloadFile($submissionId, $index = 0)
    {
        $submission = AssignmentSubmission::findOrFail($submissionId);
        Gate::authorize('update', $submission->assignment);

        $file = $this->getFileFromSubmission($submission, $index);
        return response()->download(
            storage_path('app/public/' . $file['path']),
            $file['name']
        );
    }

    /**
     * Helper to retrieve a file from either the new `files` JSON array
     * or the legacy `file_path`/`file_name` columns.
     */
    private function getFileFromSubmission($submission, $index)
    {
        if (!empty($submission->files)) {
            if (!isset($submission->files[$index])) {
                abort(404, 'File not found.');
            }
            return $submission->files[$index];
        }

        if ($submission->file_path) {
            return [
                'name' => $submission->file_name ?? 'download',
                'path' => $submission->file_path,
            ];
        }

        abort(404, 'No file uploaded for this submission.');
    }
}
