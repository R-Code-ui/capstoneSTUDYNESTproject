<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class QuizResultsController extends Controller
{
    /**
     * Display quiz results and statistics.
     */
    public function index(Quiz $quiz)
    {
        Gate::authorize('quiz.view');

        // Get all attempts for this quiz, ordered by earliest first (to identify the first attempt)
        $allAttempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->with('student')
            ->orderBy('attempt_number', 'asc')   // or created_at
            ->get();

        // Group by student
        $grouped = $allAttempts->groupBy('student_id');

        // Get all students assigned to this grade level
        $students = User::role('student')
            ->where('grade_level', $quiz->grade_level)
            ->get();

        $officialScores = [];   // for statistics
        $allStudents = $students->map(function ($student) use ($grouped, &$officialScores) {
            $studentAttempts = $grouped->get($student->id, collect());
            $firstAttempt = $studentAttempts->first(); // earliest attempt
            $completedCount = $studentAttempts->where('status', 'completed')->count();
            $practiceAttempts = $firstAttempt ? max(0, $completedCount - 1) : 0;

            $score = $firstAttempt?->score;
            $totalQuestions = $firstAttempt?->total_questions;
            $status = $firstAttempt?->status ?? 'not_started';
            $attemptId = $firstAttempt?->id;

            // only use official (first attempt) scores for statistics
            if ($firstAttempt && $firstAttempt->status === 'completed') {
                $officialScores[] = $score;
            }

            return [
                'student_id'      => $student->id,
                'student_name'    => $student->name,
                'lrn'             => $student->lrn,
                'attempt_id'      => $attemptId,
                'score'           => $score,                   // official (first attempt) score
                'total_questions' => $totalQuestions,
                'status'          => $status,
                'practice_attempts'=> $practiceAttempts,
                'completed_at'    => $firstAttempt && $firstAttempt->completed_at
                                       ? $firstAttempt->completed_at->format('Y-m-d H:i')
                                       : null,
            ];
        });

        // Recalculate statistics based on official scores only
        $totalStudents = $students->count();
        $officialScoresCollection = collect($officialScores);
        $totalOfficial = $officialScoresCollection->count();

        $passingScore = $quiz->passing_score ?? 75;
        $passedCount = $officialScoresCollection->filter(function ($score) use ($quiz, $passingScore) {
            $percentage = ($score / $quiz->total_questions) * 100;
            return $percentage >= $passingScore;
        })->count();

        $statistics = [
            'total_students'      => $totalStudents,
            'average_score'       => $totalOfficial > 0 ? round($officialScoresCollection->avg()) : 0,
            'highest_score'       => $totalOfficial > 0 ? $officialScoresCollection->max() : 0,
            'lowest_score'        => $totalOfficial > 0 ? $officialScoresCollection->min() : 0,
            'passing_rate'        => $totalOfficial > 0 ? round(($passedCount / $totalOfficial) * 100) : 0,
            'completion_rate'     => $totalStudents > 0 ? round(($totalOfficial / $totalStudents) * 100) : 0,
            'max_possible_score'  => $quiz->total_questions,
            'passed_count'        => $passedCount,
        ];

        // Score distribution (based on official scores)
        $distribution = $this->getScoreDistribution($officialScores, $quiz->total_questions);

        return Inertia::render('Teacher/Quizzes/Results', [
            'quiz' => [
                'id'              => $quiz->id,
                'title'           => $quiz->quiz_title,
                'subject'         => $quiz->subject,
                'grade_level'     => $quiz->grade_level,
                'total_questions' => $quiz->total_questions,
                'passing_score'   => $passingScore,
            ],
            'attempts'     => $allStudents,
            'statistics'   => $statistics,
            'distribution' => $distribution,
        ]);
    }

    /**
     * Display detailed results for a specific student attempt.
     */
    public function show(Quiz $quiz, QuizAttempt $attempt)
    {
        Gate::authorize('quiz.view');

        // Ensure the attempt belongs to this quiz
        if ($attempt->quiz_id !== $quiz->id) {
            abort(404);
        }

        $attempt->load('student');

        $answers = json_decode($attempt->answers, true) ?? [];

        // Get all questions for this quiz
        $questions = $quiz->questions()->orderBy('question_number')->get();

        // Map answers to questions
        $questionResults = $questions->map(function ($question) use ($answers) {
            $userAnswer = $answers[$question->id] ?? null;

            $isCorrect = false;
            if ($userAnswer !== null) {
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

            return [
                'question_number' => $question->question_number,
                'question_text'   => $question->question_text,
                'question_type'   => $question->question_type,
                'choices'         => $question->question_type === 'multiple_choice' ? [
                    'A' => $question->choice_a,
                    'B' => $question->choice_b,
                    'C' => $question->choice_c,
                    'D' => $question->choice_d,
                ] : null,
                'user_answer'     => $userAnswer,
                'correct_answer'  => $question->correct_answer,
                'is_correct'      => $isCorrect,
            ];
        });

        return Inertia::render('Teacher/Quizzes/AttemptDetails', [
            'attempt' => [
                'id'             => $attempt->id,
                'student_name'   => $attempt->student->name,
                'student_lrn'    => $attempt->student->lrn,
                'score'          => $attempt->score,
                'total_questions'=> $attempt->total_questions,
                'attempt_number' => $attempt->attempt_number,
                'status'         => $attempt->status,
                'completed_at'   => $attempt->completed_at ? $attempt->completed_at->format('Y-m-d H:i') : null,
                'quiz_id'        => $quiz->id,
            ],
            'questions'   => $questionResults,
            'quiz_title'  => $quiz->quiz_title,
        ]);
    }

    /**
     * Export quiz results to CSV.
     */
    public function export(Quiz $quiz)
    {
        Gate::authorize('quiz.view');

        $attempts = QuizAttempt::where('quiz_id', $quiz->id)
            ->with('student')
            ->where('status', 'completed')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="quiz_results_' . $quiz->id . '.csv"',
        ];

        $callback = function () use ($attempts, $quiz) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Score', 'Total Questions', 'Percentage', 'Status', 'Completed At']);

            foreach ($attempts as $attempt) {
                fputcsv($file, [
                    $attempt->student->name,
                    $attempt->student->lrn,
                    $attempt->score,
                    $attempt->total_questions,
                    round(($attempt->score / $attempt->total_questions) * 100) . '%',
                    $attempt->status,
                    $attempt->completed_at ? $attempt->completed_at->format('Y-m-d H:i') : '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Calculate passing rate.
     */
    private function calculatePassingRate($attempts, $passingScore)
    {
        if ($attempts->count() === 0) {
            return 0;
        }

        $passed = $attempts->filter(function ($attempt) use ($passingScore) {
            $percentage = ($attempt->score / $attempt->total_questions) * 100;
            return $percentage >= $passingScore;
        });

        return round(($passed->count() / $attempts->count()) * 100);
    }

    /**
     * Get score distribution for chart.
     */
    private function getScoreDistribution($scores, $maxScore)
    {
        if (empty($scores)) {
            return [];
        }

        $ranges = [
            '0-20%'   => 0,
            '21-40%'  => 0,
            '41-60%'  => 0,
            '61-80%'  => 0,
            '81-100%' => 0,
        ];

        foreach ($scores as $score) {
            $percentage = ($score / $maxScore) * 100;
            if ($percentage <= 20) {
                $ranges['0-20%']++;
            } elseif ($percentage <= 40) {
                $ranges['21-40%']++;
            } elseif ($percentage <= 60) {
                $ranges['41-60%']++;
            } elseif ($percentage <= 80) {
                $ranges['61-80%']++;
            } else {
                $ranges['81-100%']++;
            }
        }

        return $ranges;
    }
}
