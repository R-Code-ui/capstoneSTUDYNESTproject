<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'teacher_id',
        'grade_level',
        'subject',
        'school_year',
        'trimester',
        'week_number',
        'related_lesson_id',
        'quiz_title',
        'quiz_type',
        'total_questions',
        'time_limit',
        'passing_score',
        'attempts_allowed',
        'shuffle_questions',
        'status',
        'visibility',
        'publish_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'shuffle_questions' => 'boolean',
            'publish_date' => 'date',
        ];
    }

    /**
     * Get the teacher who created this quiz.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the lesson this quiz is related to.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'related_lesson_id');
    }

    /**
     * Get the questions for this quiz.
     */
    public function questions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    /**
     * Get the attempts for this quiz.
     */
    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
