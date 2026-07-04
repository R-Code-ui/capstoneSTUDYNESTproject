<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

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

    // ✅ THIS IS IMPORTANT – tells Laravel to cast submission_methods to array automatically
    protected $casts = [
        'allow_late_submission' => 'boolean',
        'submission_methods' => 'array', // ← This automatically decodes JSON to array
        'due_date' => 'date',
        'publish_date' => 'date',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'related_lesson_id');
    }

    public function resources()
    {
        return $this->hasMany(AssignmentResource::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
