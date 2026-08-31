<?php

namespace App\Models;

use App\Models\Concerns\HasScheduledPublication;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory, HasScheduledPublication;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'teacher_id',
        'grade_level',
        'game_title',
        'game_type',
        'game_data',
        'max_attempts',
        'due_date',
        'status',
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
            'game_data' => 'array',
            'due_date' => 'date',
            'publish_date' => 'datetime',
        ];
    }

    /**
     * Get the teacher who created this game.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the results for this game.
     */
    public function results()
    {
        return $this->hasMany(GameResult::class);
    }

    public function deadlineStatus(): ?string
    {
        if (!$this->due_date) {
            return null;
        }

        return $this->due_date->copy()->endOfDay()->isPast() ? 'expired' : 'open';
    }

    public function isExpired(): bool
    {
        return $this->deadlineStatus() === 'expired';
    }
}
