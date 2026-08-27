<?php

namespace App\Services;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class PublicationManager
{
    /**
     * Normalize status and publish_date after request validation.
     * Published records keep their original publication timestamp.
     */
    public function normalize(array &$validated, ?Model $existing = null): void
    {
        if ($existing?->status === 'published') {
            $validated['status'] = 'published';
            $validated['publish_date'] = $existing->publish_date;

            return;
        }

        if ($existing?->status === 'archived') {
            $validated['status'] = 'archived';
            $validated['publish_date'] = $existing->publish_date;

            return;
        }

        $validated['publish_date'] = match ($validated['status']) {
            'published' => now(),
            'scheduled' => Carbon::parse($validated['publish_date']),
            default => null,
        };

        if ($validated['status'] === 'scheduled' && !$validated['publish_date']->isFuture()) {
            throw ValidationException::withMessages([
                'publish_date' => 'The scheduled publish time must be in the future.',
            ]);
        }
    }

    public function ensureDeadlineAfterPublication(
        CarbonInterface $deadline,
        ?CarbonInterface $publishDate,
        string $field
    ): void
    {
        if ($publishDate && !$deadline->greaterThan($publishDate)) {
            throw ValidationException::withMessages([
                $field => 'The deadline must be after the publish time.',
            ]);
        }
    }
}
