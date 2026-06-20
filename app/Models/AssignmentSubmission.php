<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assignment_id',
        'student_id',
        'submission_method',
        'file_path',
        'file_name',
        'submitted_at',
        'status',
        'score',
        'feedback',
        'graded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
        ];
    }

    /**
     * Get the assignment this submission belongs to.
     */
    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    /**
     * Get the student who submitted this.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
