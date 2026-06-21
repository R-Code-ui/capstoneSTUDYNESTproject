<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
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
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $subjectFilter = $request->input('subject');
        $statusFilter = $request->input('status');

        $quizzes = Quiz::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->when($search, function ($query, $search) {
                return $query->where('quiz_title', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($subjectFilter, function ($query, $subject) {
                return $query->where('subject', $subject);
            })
            ->when($statusFilter, function ($query, $status) use ($user) {
                if ($status === 'completed') {
                    return $query->whereHas('attempts', function ($q) use ($user) {
                        $q->where('student_id', $user->id)->where('status', 'completed');
                    });
                } elseif ($status === 'pending') {
                    return $query->whereDoesntHave('attempts', function ($q) use ($user) {
                        $q->where('student_id', $user->id);
                    })->orWhereHas('attempts', function ($q) use ($user) {
                        $q->where('student_id', $user->id)->where('status', 'started');
                    });
                }
                return $query;
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Quizzes/Index', [
            'quizzes' => $quizzes->map(function ($quiz) use ($user) {
                $attempt = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->first();

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->quiz_title,
                    'subject' => $quiz->subject,
                    'type' => $quiz->quiz_type,
                    'questions' => $quiz->total_questions,
                    'time_limit' => $quiz->time_limit,
                    'passing_score' => $quiz->passing_score,
                    'attempts_allowed' => $quiz->attempts_allowed,
                    'status' => $attempt ? $attempt->status : 'not_started',
                    'score' => $attempt && $attempt->status === 'completed' ? $attempt->score : null,
                    'attempt_number' => $attempt ? $attempt->attempt_number : 0,
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
     * Display the quiz information page.
     */
    public function show(Quiz $quiz)
    {
        $user = auth()->user();

        if ($quiz->grade_level !== $user->grade_level) {
            abort(403);
        }

        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->orderBy('attempt_number', 'desc')
            ->first();

        $canTake = true;
        if ($attempt) {
            if ($attempt->status === 'completed') {
                $attemptsCount = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->count();
                if ($attemptsCount >= $quiz->attempts_allowed) {
                    $canTake = false;
                }
            } elseif ($attempt->status === 'started') {
                // Allow continuing
            }
        }

        return Inertia::render('Student/Quizzes/Show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->quiz_title,
                'subject' => $quiz->subject,
                'type' => $quiz->quiz_type,
                'questions' => $quiz->total_questions,
                'time_limit' => $quiz->time_limit,
                'passing_score' => $quiz->passing_score,
                'attempts_allowed' => $quiz->attempts_allowed,
                'teacher' => $quiz->teacher->name ?? 'Unknown',
                'instructions' => 'Read each question carefully before selecting your answer.',
            ],
            'can_take' => $canTake,
            'current_attempt' => $attempt && $attempt->status === 'started' ? [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
            ] : null,
        ]);
    }

    /**
     * Start a quiz.
     */
    public function start(Quiz $quiz)
    {
        $user = auth()->user();

        if ($quiz->grade_level !== $user->grade_level) {
            abort(403);
        }

        // Check if user has reached max attempts
        $completedAttempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        if ($completedAttempts >= $quiz->attempts_allowed) {
            return redirect()->back()->with('error', 'You have reached the maximum number of attempts.');
        }

        // Check for existing started attempt
        $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->where('status', 'started')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.quizzes.take', $existingAttempt->id);
        }

        $attemptNumber = $completedAttempts + 1;

        $attempt = QuizAttempt::create([
            'quiz_id' => $quiz->id,
            'student_id' => $user->id,
            'attempt_number' => $attemptNumber,
            'score' => 0,
            'total_questions' => $quiz->total_questions,
            'answers' => json_encode([]),
            'status' => 'started',
        ]);

        return redirect()->route('student.quizzes.take', $attempt->id);
    }

    /**
     * Take the quiz.
     */
    public function take(QuizAttempt $attempt)
    {
        $user = auth()->user();

        if ($attempt->student_id !== $user->id) {
            abort(403);
        }

        $quiz = $attempt->quiz;
        $questions = $quiz->questions()->orderBy('question_number')->get();

        $answers = json_decode($attempt->answers, true) ?? [];

        return Inertia::render('Student/Quizzes/Take', [
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'time_limit' => $quiz->time_limit,
            ],
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->quiz_title,
                'total_questions' => $quiz->total_questions,
            ],
            'questions' => $questions->map(function ($question) use ($answers) {
                return [
                    'id' => $question->id,
                    'number' => $question->question_number,
                    'text' => $question->question_text,
                    'type' => $question->question_type,
                    'choices' => $question->question_type === 'multiple_choice' ? [
                        'A' => $question->choice_a,
                        'B' => $question->choice_b,
                        'C' => $question->choice_c,
                        'D' => $question->choice_d,
                    ] : null,
                    'user_answer' => $answers[$question->id] ?? null,
                ];
            }),
        ]);
    }

    /**
     * Submit the quiz.
     */
    public function submit(Request $request, QuizAttempt $attempt)
    {
        $user = auth()->user();

        if ($attempt->student_id !== $user->id) {
            abort(403);
        }

        if ($attempt->status === 'completed') {
            return redirect()->route('student.quizzes.results', $attempt->id);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $answers = $validated['answers'];
        $quiz = $attempt->quiz;
        $questions = $quiz->questions()->get();

        $score = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $question) {
            $userAnswer = $answers[$question->id] ?? null;
            $isCorrect = false;

            if ($userAnswer !== null && $userAnswer !== '') {
                if ($question->question_type === 'true_false') {
                    $isCorrect = strtolower($userAnswer) === strtolower($question->correct_answer);
                } elseif ($question->question_type === 'identification') {
                    $correct = strtolower(trim($question->correct_answer));
                    $user = strtolower(trim($userAnswer));
                    $isCorrect = $user === $correct;

                    // Check alternative answers
                    if (!$isCorrect && $question->alternative_answers) {
                        $alternatives = json_decode($question->alternative_answers, true);
                        if (is_array($alternatives)) {
                            $isCorrect = in_array($user, array_map('strtolower', array_map('trim', $alternatives)));
                        }
                    }
                } else {
                    $isCorrect = $userAnswer === $question->correct_answer;
                }
            }

            if ($isCorrect) {
                $score++;
            }
        }

        $attempt->update([
            'answers' => json_encode($answers),
            'score' => $score,
            'total_questions' => $totalQuestions,
            'completed_at' => now(),
            'status' => 'completed',
        ]);

        return redirect()->route('student.quizzes.results', $attempt->id);
    }

    /**
     * Display quiz results.
     */
    public function results(QuizAttempt $attempt)
    {
        $user = auth()->user();

        if ($attempt->student_id !== $user->id) {
            abort(403);
        }

        $quiz = $attempt->quiz;
        $questions = $quiz->questions()->orderBy('question_number')->get();
        $answers = json_decode($attempt->answers, true) ?? [];

        $score = $attempt->score;
        $total = $attempt->total_questions;
        $percentage = $total > 0 ? round(($score / $total) * 100) : 0;

        $passingScore = $quiz->passing_score ?? 75;
        $passed = $percentage >= $passingScore;

        $questionResults = $questions->map(function ($question) use ($answers) {
            $userAnswer = $answers[$question->id] ?? null;
            $isCorrect = false;

            if ($userAnswer !== null && $userAnswer !== '') {
                if ($question->question_type === 'true_false') {
                    $isCorrect = strtolower($userAnswer) === strtolower($question->correct_answer);
                } elseif ($question->question_type === 'identification') {
                    $correct = strtolower(trim($question->correct_answer));
                    $user = strtolower(trim($userAnswer));
                    $isCorrect = $user === $correct;

                    if (!$isCorrect && $question->alternative_answers) {
                        $alternatives = json_decode($question->alternative_answers, true);
                        if (is_array($alternatives)) {
                            $isCorrect = in_array($user, array_map('strtolower', array_map('trim', $alternatives)));
                        }
                    }
                } else {
                    $isCorrect = $userAnswer === $question->correct_answer;
                }
            }

            return [
                'number' => $question->question_number,
                'text' => $question->question_text,
                'user_answer' => $userAnswer,
                'correct_answer' => $question->correct_answer,
                'is_correct' => $isCorrect,
            ];
        });

        return Inertia::render('Student/Quizzes/Results', [
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'score' => $score,
                'total' => $total,
                'percentage' => $percentage,
                'passed' => $passed,
                'completed_at' => $attempt->completed_at->format('M d, Y H:i'),
            ],
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->quiz_title,
                'passing_score' => $passingScore,
            ],
            'questions' => $questionResults,
        ]);
    }
}
