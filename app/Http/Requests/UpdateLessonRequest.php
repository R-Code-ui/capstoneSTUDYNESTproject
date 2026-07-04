<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLessonRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $lesson = $this->route('lesson');
        return auth()->user()->hasPermissionTo('lesson.edit') && auth()->id() === $lesson->teacher_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // ===== Curriculum Information =====
            'grade_level' => 'required|string|in:Grade 4,Grade 5,Grade 6',
            'subject' => 'required|string|in:English,Filipino,Mathematics,Science,Araling Panlipunan,MAPEH,GMRC,EPP/TLE',
            'school_year' => 'required|string|in:SY 2026-2027,SY 2027-2028',
            'trimester' => 'required|string|in:1st Trimester,2nd Trimester,3rd Trimester',
            'week_number' => 'required|string|in:' . implode(',', array_map(fn($i) => 'Week ' . $i, range(1, 12))),

            // ===== BOW Reference =====
            'learning_competency' => 'required|string|max:1000',
            'learning_objective' => 'required|string|max:1000',
            'bow_code' => 'nullable|string|max:50',

            // ===== Lesson Information =====
            'lesson_title' => 'required|string|max:255',
            'lesson_description' => 'required|string|max:1000',
            'lesson_content' => 'required|string',
            'key_takeaways' => 'nullable|string|max:1000',

            // ===== Related Activities =====
            'related_assignment_id' => 'nullable|exists:assignments,id',
            'related_quiz_id' => 'nullable|exists:quizzes,id',
            'related_game_id' => 'nullable|exists:games,id',

            // ===== Publication Settings =====
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',

            // ===== Resources =====
            'resources' => 'nullable|array|max:5',
            'resources.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
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
            'grade_level.required' => 'Please select a grade level.',
            'grade_level.in' => 'Invalid grade level selected.',
            'subject.required' => 'Please select a subject.',
            'subject.in' => 'Invalid subject selected.',
            'school_year.required' => 'Please select a school year.',
            'trimester.required' => 'Please select a trimester.',
            'week_number.required' => 'Please select a week number.',
            'learning_competency.required' => 'Learning competency is required.',
            'learning_objective.required' => 'Learning objective is required.',
            'lesson_title.required' => 'Lesson title is required.',
            'lesson_title.max' => 'Lesson title cannot exceed 255 characters.',
            'lesson_description.required' => 'Lesson description is required.',
            'lesson_content.required' => 'Lesson content is required.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Invalid status selected.',
            'publish_date.required' => 'Publish date is required.',
            'publish_date.date' => 'Please enter a valid date.',
            'resources.max' => 'You can only upload a maximum of 5 resources.',
            'resources.*.mimes' => 'Only PDF, JPG, JPEG, and PNG files are allowed.',
            'resources.*.max' => 'Each file must not exceed 10MB.',
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

        // Check that the lesson belongs to the teacher
        $lesson = $this->route('lesson');
        if ($lesson && $lesson->teacher_id !== auth()->id()) {
            abort(403, 'You do not have permission to edit this lesson.');
        }
    }
}
