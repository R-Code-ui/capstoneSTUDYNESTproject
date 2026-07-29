<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'subject',
        'category',
        'message',
        'status',
        'teacher_deleted_at',
        'student_deleted_at',
    ];

    protected $casts = [
        'teacher_deleted_at' => 'datetime',
        'student_deleted_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Scope messages visible to teacher (not deleted by teacher).
     */
    public function scopeVisibleToTeacher($query)
    {
        return $query->whereNull('teacher_deleted_at');
    }

    /**
     * Scope messages visible to student (not deleted by student).
     */
    public function scopeVisibleToStudent($query)
    {
        return $query->whereNull('student_deleted_at');
    }
}
