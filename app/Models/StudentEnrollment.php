<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_year',
        'grade_level',
        'status',
        'enrolled_at',
    ];

    protected function casts(): array
    {
        return ['enrolled_at' => 'datetime'];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
