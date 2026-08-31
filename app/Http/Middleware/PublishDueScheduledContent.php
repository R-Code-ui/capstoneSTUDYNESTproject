<?php

namespace App\Http\Middleware;

use App\Services\ScheduledContentPublisher;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PublishDueScheduledContent
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') || $request->isMethod('HEAD')) {
            try {
                app(ScheduledContentPublisher::class)->publishDue();
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $next($request);
    }
}
