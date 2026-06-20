<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LessonResource extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lesson_id',
        'resource_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    /**
     * Get the lesson that owns this resource.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
