<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class QuizController extends Controller
{
    /**
     * Display a listing of quizzes.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Quiz::class);

        $user = auth()->user();

        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $typeFilter = $request->input('quiz_type');

        $quizzes = Quiz::where('teacher_id', $user->id)
            ->when($search, function ($query, $search) {
                return $query->where('quiz_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($typeFilter, function ($query, $type) {
                return $query->where('quiz_type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published', 'archived'];
        $quizTypes = ['multiple_choice', 'identification', 'true_false'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];

        return Inertia::render('Teacher/Quizzes/Index', [
            'quizzes' => $quizzes->map(function ($quiz) {
                $attemptsCount = $quiz->attempts()->count();
                $completedAttempts = $quiz->attempts()->where('status', 'completed')->count();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'subject' => $quiz->subject,
                    'grade_level' => $quiz->grade_level,
                    'type' => $quiz->quiz_type,
                    'questions' => $quiz->total_questions,
                    'status' => $quiz->status,
                    'attempts' => $completedAttempts . '/' . $attemptsCount,
                    'created_at' => $quiz->created_at->format('Y-m-d'),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'quiz_types' => $quizTypes,
            'trimesters' => $trimesters,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'grade_level' => $gradeFilter,
                'quiz_type' => $typeFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new quiz.
     */
    public function create()
    {
        Gate::authorize('create', Quiz::class);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $quizTypes = ['multiple_choice', 'identification', 'true_false'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));

        $lessons = Lesson::where('teacher_id', $user->id)->get()->map(function ($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->lesson_title,
            ];
        });

        return Inertia::render('Teacher/Quizzes/Create', [
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'quiz_types' => $quizTypes,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
            'related_lessons' => $lessons,
        ]);
    }

    /**
     * Store a newly created quiz.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Quiz::class);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'quiz_title' => 'required|string|max:255',
            'quiz_type' => 'required|in:multiple_choice,identification,true_false',
            'total_questions' => 'required|integer|min:1',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'attempts_allowed' => 'integer|min:1',
            'shuffle_questions' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,identification,true_false',
            'questions.*.choice_a' => 'nullable|string',
            'questions.*.choice_b' => 'nullable|string',
            'questions.*.choice_c' => 'nullable|string',
            'questions.*.choice_d' => 'nullable|string',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.alternative_answers' => 'nullable|array',
        ]);

        $quiz = Quiz::create([
            'teacher_id' => auth()->id(),
            'total_questions' => count($validated['questions']),
            'attempts_allowed' => $validated['attempts_allowed'] ?? 1,
            'shuffle_questions' => $validated['shuffle_questions'] ?? false,
            ...$validated,
        ]);

        // Create questions
        foreach ($validated['questions'] as $index => $questionData) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question_number' => $index + 1,
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'choice_a' => $questionData['choice_a'] ?? null,
                'choice_b' => $questionData['choice_b'] ?? null,
                'choice_c' => $questionData['choice_c'] ?? null,
                'choice_d' => $questionData['choice_d'] ?? null,
                'correct_answer' => $questionData['correct_answer'],
                'alternative_answers' => isset($questionData['alternative_answers']) ? json_encode($questionData['alternative_answers']) : null,
            ]);
        }

        return redirect()->route('teacher.quizzes.index')
            ->with('success', 'Quiz created successfully!');
    }

    /**
     * Display the specified quiz.
     */
    public function show(Quiz $quiz)
    {
        Gate::authorize('view', $quiz);

        $quiz->load('questions');

        return Inertia::render('Teacher/Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'grade_level' => $quiz->grade_level,
                'subject' => $quiz->subject,
                'school_year' => $quiz->school_year,
                'trimester' => $quiz->trimester,
                'week_number' => $quiz->week_number,
                'quiz_title' => $quiz->quiz_title,
                'quiz_type' => $quiz->quiz_type,
                'total_questions' => $quiz->total_questions,
                'time_limit' => $quiz->time_limit,
                'passing_score' => $quiz->passing_score,
                'attempts_allowed' => $quiz->attempts_allowed,
                'shuffle_questions' => $quiz->shuffle_questions,
                'status' => $quiz->status,
                'publish_date' => $quiz->publish_date,
                'created_at' => $quiz->created_at->format('Y-m-d H:i'),
                'questions' => $quiz->questions->map(function ($question) {
                    return [
                        'id' => $question->id,
                        'question_number' => $question->question_number,
                        'question_text' => $question->question_text,
                        'question_type' => $question->question_type,
                        'choice_a' => $question->choice_a,
                        'choice_b' => $question->choice_b,
                        'choice_c' => $question->choice_c,
                        'choice_d' => $question->choice_d,
                        'correct_answer' => $question->correct_answer,
                        'alternative_answers' => json_decode($question->alternative_answers, true),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified quiz.
     */
    public function edit(Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];
        $quizTypes = ['multiple_choice', 'identification', 'true_false'];
        $trimesters = ['1st Trimester', '2nd Trimester', '3rd Trimester'];
        $schoolYears = ['SY 2026-2027', 'SY 2027-2028'];
        $statuses = ['draft', 'published', 'archived'];
        $weeks = array_map(function ($i) {
            return 'Week ' . $i;
        }, range(1, 12));

        $lessons = Lesson::where('teacher_id', $user->id)->get()->map(function ($lesson) {
            return [
                'id' => $lesson->id,
                'title' => $lesson->lesson_title,
            ];
        });

        $quiz->load('questions');

        return Inertia::render('Teacher/Quizzes/Edit', [
            'quiz' => [
                'id' => $quiz->id,
                'grade_level' => $quiz->grade_level,
                'subject' => $quiz->subject,
                'school_year' => $quiz->school_year,
                'trimester' => $quiz->trimester,
                'week_number' => $quiz->week_number,
                'related_lesson_id' => $quiz->related_lesson_id,
                'quiz_title' => $quiz->quiz_title,
                'quiz_type' => $quiz->quiz_type,
                'total_questions' => $quiz->total_questions,
                'time_limit' => $quiz->time_limit,
                'passing_score' => $quiz->passing_score,
                'attempts_allowed' => $quiz->attempts_allowed,
                'shuffle_questions' => $quiz->shuffle_questions,
                'status' => $quiz->status,
                'publish_date' => $quiz->publish_date,
                'questions' => $quiz->questions->map(function ($question) {
                    return [
                        'id' => $question->id,
                        'question_number' => $question->question_number,
                        'question_text' => $question->question_text,
                        'question_type' => $question->question_type,
                        'choice_a' => $question->choice_a,
                        'choice_b' => $question->choice_b,
                        'choice_c' => $question->choice_c,
                        'choice_d' => $question->choice_d,
                        'correct_answer' => $question->correct_answer,
                        'alternative_answers' => json_decode($question->alternative_answers, true),
                    ];
                }),
            ],
            'assigned_grades' => $assignedGrades,
            'subjects' => $subjects,
            'quiz_types' => $quizTypes,
            'trimesters' => $trimesters,
            'school_years' => $schoolYears,
            'statuses' => $statuses,
            'weeks' => $weeks,
            'related_lessons' => $lessons,
        ]);
    }

    /**
     * Update the specified quiz.
     */
    public function update(Request $request, Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'subject' => 'required|string',
            'school_year' => 'required|string',
            'trimester' => 'required|string',
            'week_number' => 'required|string',
            'related_lesson_id' => 'nullable|exists:lessons,id',
            'quiz_title' => 'required|string|max:255',
            'quiz_type' => 'required|in:multiple_choice,identification,true_false',
            'total_questions' => 'required|integer|min:1',
            'time_limit' => 'nullable|integer|min:1',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'attempts_allowed' => 'integer|min:1',
            'shuffle_questions' => 'boolean',
            'status' => 'required|in:draft,published,archived',
            'publish_date' => 'required|date',
            'questions' => 'required|array|min:1',
            'questions.*.id' => 'nullable|exists:quiz_questions,id',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:multiple_choice,identification,true_false',
            'questions.*.choice_a' => 'nullable|string',
            'questions.*.choice_b' => 'nullable|string',
            'questions.*.choice_c' => 'nullable|string',
            'questions.*.choice_d' => 'nullable|string',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.alternative_answers' => 'nullable|array',
        ]);

        $quiz->update([
            'total_questions' => count($validated['questions']),
            'attempts_allowed' => $validated['attempts_allowed'] ?? 1,
            'shuffle_questions' => $validated['shuffle_questions'] ?? false,
            ...$validated,
        ]);

        // Delete existing questions
        $quiz->questions()->delete();

        // Create new questions
        foreach ($validated['questions'] as $index => $questionData) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question_number' => $index + 1,
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'choice_a' => $questionData['choice_a'] ?? null,
                'choice_b' => $questionData['choice_b'] ?? null,
                'choice_c' => $questionData['choice_c'] ?? null,
                'choice_d' => $questionData['choice_d'] ?? null,
                'correct_answer' => $questionData['correct_answer'],
                'alternative_answers' => isset($questionData['alternative_answers']) ? json_encode($questionData['alternative_answers']) : null,
            ]);
        }

        return redirect()->route('teacher.quizzes.index')
            ->with('success', 'Quiz updated successfully!');
    }

    /**
     * Remove the specified quiz.
     */
    public function destroy(Quiz $quiz)
    {
        Gate::authorize('delete', $quiz);

        $quiz->questions()->delete();
        $quiz->attempts()->delete();
        $quiz->delete();

        return redirect()->route('teacher.quizzes.index')
            ->with('success', 'Quiz deleted successfully!');
    }

    /**
     * Publish a quiz.
     */
    public function publish(Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $quiz->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Quiz published successfully!');
    }
}
