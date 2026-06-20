<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'user_role',
        'title',
        'category',
        'content',
        'target_audience',
        'priority',
        'is_pinned',
        'status',
        'publish_date',
        'expiration_date',
        'view_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'publish_date' => 'date',
            'expiration_date' => 'date',
        ];
    }

    /**
     * Get the user who created this announcement.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the views for this announcement.
     */
    public function views()
    {
        return $this->hasMany(AnnouncementView::class);
    }
}
