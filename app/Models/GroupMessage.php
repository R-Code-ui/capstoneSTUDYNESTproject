<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class GroupMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_group_id',
        'sender_id',
        'body',
    ];

    public function group()
    {
        return $this->belongsTo(MessageGroup::class, 'message_group_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function deletedByUsers()
    {
        return $this->belongsToMany(User::class, 'group_message_deletions')
            ->withTimestamps();
    }

    public function scopeNotDeletedBy(Builder $query, int $userId): Builder
    {
        return $query->whereDoesntHave('deletedByUsers', fn (Builder $deletedByUsers) => $deletedByUsers->whereKey($userId));
    }
}
