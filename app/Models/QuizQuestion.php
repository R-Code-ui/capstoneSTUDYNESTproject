<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'quiz_id',
        'question_number',
        'question_text',
        'question_type',
        'choice_a',
        'choice_b',
        'choice_c',
        'choice_d',
        'correct_answer',
        'alternative_answers',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'alternative_answers' => 'array',
        ];
    }

    /**
     * Get the quiz that owns this question.
     */
    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}
