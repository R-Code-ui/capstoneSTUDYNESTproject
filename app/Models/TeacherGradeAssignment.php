<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherGradeAssignment extends Model
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
    ];

    /**
     * Get the teacher associated with this grade assignment.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
