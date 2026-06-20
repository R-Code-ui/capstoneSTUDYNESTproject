<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
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
        'learning_competency',
        'learning_objective',
        'bow_code',
        'lesson_title',
        'lesson_description',
        'lesson_content',
        'key_takeaways',
        'related_assignment_id',
        'related_quiz_id',
        'related_game_id',
        'status',
        'publish_date',
    ];

    /**
     * Get the teacher who created this lesson.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the resources for this lesson.
     */
    public function resources()
    {
        return $this->hasMany(LessonResource::class);
    }

    /**
     * Get the related assignment.
     */
    public function relatedAssignment()
    {
        return $this->belongsTo(Assignment::class, 'related_assignment_id');
    }

    /**
     * Get the related quiz.
     */
    public function relatedQuiz()
    {
        return $this->belongsTo(Quiz::class, 'related_quiz_id');
    }

    /**
     * Get the related game.
     */
    public function relatedGame()
    {
        return $this->belongsTo(Game::class, 'related_game_id');
    }

    /**
     * Get the assignments associated with this lesson.
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'related_lesson_id');
    }

    /**
     * Get the quizzes associated with this lesson.
     */
    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'related_lesson_id');
    }
}
