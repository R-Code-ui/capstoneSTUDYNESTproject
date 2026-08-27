<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
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
            'publish_date' => 'datetime',
            'expiration_date' => 'datetime',
        ];
    }

    /**
     * Limit a query to announcements that are visible right now.
     */
    public function scopeCurrentlyVisible(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('publish_date')
            ->where('publish_date', '<=', now())
            ->where(function (Builder $query) {
                $query->whereNull('expiration_date')
                    ->orWhere('expiration_date', '>', now());
            });
    }

    public function isCurrentlyVisible(): bool
    {
        return $this->status === 'published'
            && $this->publish_date?->lessThanOrEqualTo(now())
            && (!$this->expiration_date || $this->expiration_date->isFuture());
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
