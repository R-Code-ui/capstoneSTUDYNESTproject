<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;

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
            ->currentlyPublished()
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('quiz_title', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
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
                    return $query->where(function ($query) use ($user) {
                        $query->whereDoesntHave('attempts', function ($q) use ($user) {
                            $q->where('student_id', $user->id);
                        })->orWhereHas('attempts', function ($q) use ($user) {
                            $q->where('student_id', $user->id)->where('status', 'started');
                        });
                    });
                }
                return $query;
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'];

        return Inertia::render('Student/Quizzes/Index', [
            'quizzes' => $quizzes->map(function ($quiz) use ($user) {
                // Count all attempts (including started, completed, etc.)
                $attemptsCount = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->count();

                // Get the first completed attempt for official score (if any)
                $firstCompleted = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->orderBy('attempt_number', 'asc')
                    ->first();

                // Overall status for the card
                $latestAttempt = QuizAttempt::where('quiz_id', $quiz->id)
                    ->where('student_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

                $status = 'not_started';
                if ($latestAttempt) {
                    $status = $latestAttempt->status === 'completed' ? 'completed' : 'started';
                }

                return [
                    'id'               => $quiz->id,
                    'title'            => $quiz->quiz_title,
                    'subject'          => $quiz->subject,
                    'type'             => $quiz->quiz_type,
                    'questions'        => $quiz->total_questions,
                    'time_limit'       => $quiz->time_limit,
                    'passing_score'    => $quiz->passing_score,
                    'attempts_allowed' => $quiz->attempts_allowed,
                    'status'           => $status,
                    'score'            => $firstCompleted ? $firstCompleted->score : null,
                    'attempts_used'    => $attemptsCount,                      // ✅ accurate count
                    'latest_attempt_id'=> ($firstCompleted) ? $firstCompleted->id : null,
                ];
            }),
            'subjects' => $subjects,
            'filters'  => [
                'search'  => $search,
                'subject' => $subjectFilter,
                'status'  => $statusFilter,
            ],
            'pagination' => $quizzes->toArray(),
        ]);
    }

    /**
     * Display the quiz information page.
     */
    public function show(Quiz $quiz)
    {
        $user = auth()->user();

        Gate::authorize('view', $quiz);

        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->orderBy('attempt_number', 'desc')
            ->first();

        // Total attempts made (including in-progress)
        $attemptsUsed = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->count();

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
                'id'               => $quiz->id,
                'title'            => $quiz->quiz_title,
                'subject'          => $quiz->subject,
                'type'             => $quiz->quiz_type,
                'questions'        => $quiz->total_questions,
                'time_limit'       => $quiz->time_limit,
                'passing_score'    => $quiz->passing_score,
                'attempts_allowed' => $quiz->attempts_allowed,
                'attempts_used'    => $attemptsUsed,         // ✅ accurate count
                'teacher'          => $quiz->teacher->name ?? 'Unknown',
                'instructions'     => 'Read each question carefully before selecting your answer.',
            ],
            'can_take' => $canTake,
            'current_attempt' => $attempt && $attempt->status === 'started' ? [
                'id'             => $attempt->id,
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

        Gate::authorize('view', $quiz);

        $completedAttempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        if ($completedAttempts >= $quiz->attempts_allowed) {
            return redirect()->back()->with('error', 'You have reached the maximum number of attempts.');
        }

        $existingAttempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->where('status', 'started')
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.quizzes.take', $existingAttempt->id);
        }

        $attemptNumber = (int) QuizAttempt::where('quiz_id', $quiz->id)
            ->where('student_id', $user->id)
            ->max('attempt_number') + 1;

        $questions = $quiz->activeQuestions()->orderBy('question_number')->get();
        if ($questions->isEmpty()) {
            return redirect()->back()->with('error', 'This quiz does not have any active questions.');
        }
        $questionSnapshot = QuizAttempt::snapshotFromQuestions($questions);

        $attempt = QuizAttempt::create([
            'quiz_id'        => $quiz->id,
            'student_id'     => $user->id,
            'attempt_number' => $attemptNumber,
            'score'          => 0,
            'total_questions'=> count($questionSnapshot),
            'answers'        => [],
            'question_snapshot' => $questionSnapshot,
            'status'         => 'started',
        ]);

        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'attempt',
            'activity_description'=> 'Started quiz "' . $quiz->quiz_title . '" (Attempt ' . $attemptNumber . ')',
            'related_module'      => 'Quiz Module',
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

        if ($attempt->status !== 'started') {
            return redirect()->route('student.quizzes.results', $attempt->id);
        }

        $quiz = $attempt->quiz;
        $questions = $attempt->questionData();
        if (empty($attempt->question_snapshot)) {
            $attempt->update(['question_snapshot' => $questions->all()]);
        }
        $answers = is_array($attempt->answers) ? $attempt->answers : (json_decode($attempt->answers, true) ?? []);

        return Inertia::render('Student/Quizzes/Take', [
            'attempt' => [
                'id'             => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'time_limit'     => $quiz->time_limit,
            ],
            'quiz' => [
                'id'              => $quiz->id,
                'title'           => $quiz->quiz_title,
                'total_questions' => $questions->count(),
            ],
            'questions' => $questions->map(function ($question) use ($answers) {
                return [
                    'id'      => $question['id'],
                    'number'  => $question['question_number'],
                    'text'    => $question['question_text'],
                    'type'    => $question['question_type'],
                    'choices' => $question['question_type'] === 'multiple_choice' ? [
                        'A' => $question['choice_a'],
                        'B' => $question['choice_b'],
                        'C' => $question['choice_c'],
                        'D' => $question['choice_d'],
                    ] : null,
                    'user_answer' => $answers[$question['id']] ?? null,
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

        if ($attempt->status !== 'started') {
            return redirect()->route('student.quizzes.results', $attempt->id);
        }

        if ($attempt->status === 'completed') {
            return redirect()->route('student.quizzes.results', $attempt->id);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $answers = $validated['answers'];
        $quiz = $attempt->quiz;
        $questions = $attempt->questionData();

        $answers = collect($validated['answers'])
            ->filter(fn ($answer, $questionId) => $questions->contains('id', (int) $questionId))
            ->all();

        $score = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $question) {
            $userAnswer = $answers[$question['id']] ?? null;
            if (QuizAttempt::answerIsCorrect($question, $userAnswer)) {
                $score++;
            }
        }

        $attempt->update([
            'answers'         => $answers,
            'score'           => $score,
            'total_questions' => $totalQuestions,
            'completed_at'    => now(),
            'status'          => 'completed',
        ]);

        app(StudyNestNotificationService::class)->quizCompleted($attempt);

        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'attempt',
            'activity_description'=> 'Completed quiz "' . $quiz->quiz_title . '" with score ' . $score . '/' . $totalQuestions,
            'related_module'      => 'Quiz Module',
        ]);

        return redirect()->route('student.quizzes.results', $attempt->id)
            ->with('success', 'Quiz submitted successfully!');
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

        if ($attempt->status !== 'completed') {
            return redirect()->route('student.quizzes.take', $attempt->id);
        }

        $quiz = $attempt->quiz;
        $questions = $attempt->questionData();
        $answers = is_array($attempt->answers) ? $attempt->answers : (json_decode($attempt->answers, true) ?? []);

        $score = $attempt->score;
        $total = $attempt->total_questions;
        $percentage = $total > 0 ? round(($score / $total) * 100) : 0;

        $passingScore = $quiz->passing_score ?? 75;
        $passed = $percentage >= $passingScore;

        $questionResults = $questions->map(function ($question) use ($answers) {
            $userAnswer = $answers[$question['id']] ?? null;
            $isCorrect = QuizAttempt::answerIsCorrect($question, $userAnswer);

            return [
                'number'         => $question['question_number'],
                'text'           => $question['question_text'],
                'user_answer'    => $userAnswer,
                'correct_answer' => $question['correct_answer'],
                'is_correct'     => $isCorrect,
            ];
        });

        return Inertia::render('Student/Quizzes/Results', [
            'attempt' => [
                'id'             => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'score'          => $score,
                'total'          => $total,
                'percentage'     => $percentage,
                'passed'         => $passed,
                'completed_at'   => $attempt->completed_at->format('M d, Y H:i'),
            ],
            'quiz' => [
                'id'            => $quiz->id,
                'title'         => $quiz->quiz_title,
                'passing_score' => $passingScore,
            ],
            'questions' => $questionResults,
        ]);
    }
}
