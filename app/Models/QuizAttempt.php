<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'quiz_id',
        'student_id',
        'attempt_number',
        'score',
        'total_questions',
        'answers',
        'question_snapshot',
        'completed_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'question_snapshot' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Get the quiz this attempt belongs to.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    /**
     * Get the student who made this attempt.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public static function snapshotFromQuestions(iterable $questions): array
    {
        return collect($questions)->map(function ($question) {
            $alternatives = $question->alternative_answers ?? [];
            if (is_string($alternatives)) {
                $alternatives = json_decode($alternatives, true) ?: [];
            }

            return [
                'id' => (int) $question->id,
                'question_number' => (int) $question->question_number,
                'question_text' => $question->question_text,
                'question_type' => $question->question_type,
                'choice_a' => $question->choice_a,
                'choice_b' => $question->choice_b,
                'choice_c' => $question->choice_c,
                'choice_d' => $question->choice_d,
                'correct_answer' => $question->correct_answer,
                'alternative_answers' => is_array($alternatives) ? $alternatives : [],
            ];
        })->values()->all();
    }

    public function questionData()
    {
        $snapshot = $this->question_snapshot;
        if (is_string($snapshot)) {
            $snapshot = json_decode($snapshot, true) ?: [];
        }

        if (!empty($snapshot)) {
            return collect($snapshot)->values();
        }

        $answers = $this->answers;
        if (is_string($answers)) {
            $answers = json_decode($answers, true) ?: [];
        }
        $answeredIds = array_map('intval', array_keys($answers ?: []));
        $allQuestions = $this->quiz->questions()->orderBy('question_number')->get();
        $targetCount = max((int) $this->total_questions, count($answeredIds));
        $selected = $allQuestions->whereIn('id', $answeredIds);

        foreach ($allQuestions as $question) {
            if ($selected->count() >= $targetCount) break;
            if (!$selected->contains('id', $question->id)) {
                $selected->push($question);
            }
        }

        return collect(self::snapshotFromQuestions(
            $selected->sortBy('question_number')->take($targetCount)
        ));
    }

    public static function answerIsCorrect(array $question, mixed $answer): bool
    {
        if ($answer === null || $answer === '') return false;

        if (($question['question_type'] ?? null) === 'true_false') {
            return strtolower((string) $answer) === strtolower((string) $question['correct_answer']);
        }

        if (($question['question_type'] ?? null) === 'identification') {
            $normalizedAnswer = strtolower(trim((string) $answer));
            if ($normalizedAnswer === strtolower(trim((string) $question['correct_answer']))) return true;

            $alternatives = $question['alternative_answers'] ?? [];
            if (is_string($alternatives)) {
                $alternatives = json_decode($alternatives, true) ?: [];
            }

            return in_array($normalizedAnswer, array_map(
                fn ($value) => strtolower(trim((string) $value)),
                is_array($alternatives) ? $alternatives : []
            ), true);
        }

        return (string) $answer === (string) ($question['correct_answer'] ?? '');
    }
}
