<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameResult extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'game_id',
        'student_id',
        'score',
        'attempt_number',
        'status',
        'started_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Get the game this result belongs to.
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Get the student who played this game.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
