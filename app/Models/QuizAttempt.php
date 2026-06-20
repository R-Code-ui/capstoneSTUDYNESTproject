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
}
