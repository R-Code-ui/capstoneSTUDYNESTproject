<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssignmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $assignment = $this->route('assignment');
        return auth()->user()->hasPermissionTo('assignment.edit') && auth()->id() === $assignment->teacher_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ===== Academic Information =====
            'grade_level' => 'required|string|in:Grade 4,Grade 5,Grade 6',
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:SY 2026-2027,SY 2027-2028',
            'trimester' => 'required|string|in:1st Trimester,2nd Trimester,3rd Trimester',
            'week_number' => 'required|string|in:' . implode(',', array_map(fn($i) => 'Week ' . $i, range(1, 12))),
            'related_lesson_id' => 'nullable|exists:lessons,id',

            // ===== Assignment Details =====
            'assignment_title' => 'required|string|max:255',
            'assignment_type' => 'required|string|in:homework,worksheet,performance_task,project,reflection_activity,practice_exercise,reading_assignment',
            'instructions' => 'required|string',
            'total_points' => 'required|integer|min:1|max:100',
            'estimated_time' => 'nullable|integer|min:1|max:999',
            'allow_late_submission' => 'boolean',
            'due_date' => 'required|date|after_or_equal:today',
            'due_time' => 'required',

            // ===== Submission Settings =====
            'submission_methods' => 'required|array|min:1|max:3',
            'submission_methods.*' => 'in:digital,photo,paper',

            // ===== Publication Settings =====
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',

            // ===== Resources =====
            'resources' => 'nullable|array|max:5',
            'resources.*' => 'file|mimes:pdf,docx,jpg,jpeg,png|max:2048', // 2MB
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Academic Information
            'grade_level.required' => 'Please select a grade level.',
            'grade_level.in' => 'Invalid grade level selected.',
            'subject.required' => 'Please select a subject.',
            'subject.in' => 'Invalid subject selected.',
            'school_year.required' => 'Please select a school year.',
            'trimester.required' => 'Please select a trimester.',
            'week_number.required' => 'Please select a week number.',
            'related_lesson_id.exists' => 'The selected lesson does not exist.',

            // Assignment Details
            'assignment_title.required' => 'Assignment title is required.',
            'assignment_title.max' => 'Assignment title cannot exceed 255 characters.',
            'assignment_type.required' => 'Please select an assignment type.',
            'assignment_type.in' => 'Invalid assignment type selected.',
            'instructions.required' => 'Instructions are required.',
            'total_points.required' => 'Total points are required.',
            'total_points.min' => 'Total points must be at least 1.',
            'total_points.max' => 'Total points cannot exceed 100.',
            'estimated_time.min' => 'Estimated time must be at least 1 minute.',
            'estimated_time.max' => 'Estimated time cannot exceed 999 minutes.',
            'due_date.required' => 'Due date is required.',
            'due_date.after_or_equal' => 'Due date must be today or in the future.',
            'due_time.required' => 'Due time is required.',

            // Submission Settings
            'submission_methods.required' => 'Please select at least one submission method.',
            'submission_methods.min' => 'Please select at least one submission method.',
            'submission_methods.max' => 'You can select a maximum of 3 submission methods.',
            'submission_methods.*.in' => 'Invalid submission method selected.',

            // Publication Settings
            'status.required' => 'Please select a status.',
            'status.in' => 'Invalid status selected.',
            'publish_date.required' => 'Publish date is required.',
            'publish_date.date' => 'Please enter a valid date.',

            // Resources
            'resources.max' => 'You can only upload a maximum of 5 resources.',
            'resources.*.mimes' => 'Only PDF, DOCX, JPG, JPEG, and PNG files are allowed.',
            'resources.*.max' => 'Each file must not exceed 2MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure grade_level is valid for the teacher's assigned grades
        $assignedGrades = auth()->user()->gradeAssignments()->pluck('grade_level')->toArray();

        if ($this->has('grade_level') && !in_array($this->grade_level, $assignedGrades)) {
            $this->merge([
                'grade_level' => null,
            ]);
        }

        // Check that the assignment belongs to the teacher
        $assignment = $this->route('assignment');
        if ($assignment && $assignment->teacher_id !== auth()->id()) {
            abort(403, 'You do not have permission to edit this assignment.');
        }
    }
}
