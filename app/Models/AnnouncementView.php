<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementView extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'announcement_id',
        'student_id',
        'is_read',
        'viewed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'viewed_at' => 'datetime',
        ];
    }

    /**
     * Get the announcement this view belongs to.
     */
    public function announcement()
    {
        return $this->belongsTo(Announcement::class);
    }

    /**
     * Get the student who viewed this announcement.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
