<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait HasScheduledPublication
{
    public function scopeCurrentlyPublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('publish_date')
            ->where('publish_date', '<=', now());
    }

    public function isCurrentlyPublished(): bool
    {
        return $this->status === 'published'
            && $this->publish_date?->lessThanOrEqualTo(now());
    }
}
