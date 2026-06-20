<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
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
        'assignment_title',
        'assignment_type',
        'instructions',
        'total_points',
        'estimated_time',
        'allow_late_submission',
        'due_date',
        'due_time',
        'submission_methods',
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
            'submission_methods' => 'array',
            'allow_late_submission' => 'boolean',
            'due_date' => 'date',
            'publish_date' => 'date',
        ];
    }

    /**
     * Get the teacher who created this assignment.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the lesson this assignment is related to.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'related_lesson_id');
    }

    /**
     * Get the resources for this assignment.
     */
    public function resources()
    {
        return $this->hasMany(AssignmentResource::class);
    }

    /**
     * Get the submissions for this assignment.
     */
    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
