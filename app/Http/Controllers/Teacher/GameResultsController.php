<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameResult;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class GameResultsController extends Controller
{
    /**
     * Display game results and participation.
     */
    public function index(Game $game)
    {
        Gate::authorize('view', $game);

        // Get all students for this grade level
        $students = User::role('student')
            ->where('grade_level', $game->grade_level)
            ->where('is_active', true)
            ->get();

        // Get all results for this game
        $results = GameResult::where('game_id', $game->id)
            ->with('student')
            ->orderByDesc('attempt_number')
            ->orderByDesc('completed_at')
            ->orderByDesc('created_at')
            ->get();

        $resultsByStudent = $results->groupBy('student_id');

        // Merge to show all students (including those who haven't played)
        $allStudents = $students->map(function ($student) use ($resultsByStudent) {
            $studentResults = $resultsByStudent->get($student->id, collect());
            $result = $studentResults->where('status', 'completed')->first()
                ?? $studentResults->where('status', 'started')->first()
                ?? $studentResults->where('status', 'assigned')->first();

            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'lrn' => $student->lrn,
                'result_id' => $result ? $result->id : null,
                'score' => $result ? $result->score : null,
                'attempt_number' => $result ? $result->attempt_number : null,
                'status' => $result ? $result->status : 'assigned',
                'started_at' => $result && $result->started_at ? $result->started_at->format('Y-m-d H:i') : null,
                // ✅ FIX: Format completed_at date for display
                'completed_at' => $result && $result->completed_at ? $result->completed_at->format('Y-m-d H:i') : null,
            ];
        });

        // Calculate statistics
        $officialResults = $students->mapWithKeys(function ($student) use ($resultsByStudent) {
            $studentResults = $resultsByStudent->get($student->id, collect());
            return [$student->id => $studentResults->where('status', 'completed')->first()
                ?? $studentResults->where('status', 'started')->first()
                ?? $studentResults->where('status', 'assigned')->first()];
        })->filter();
        $completedResults = $officialResults->where('status', 'completed');
        $startedResults = $officialResults->where('status', 'started');
        $assignedResults = $officialResults->where('status', 'assigned');

        $statistics = [
            'total_students' => $students->count(),
            'assigned' => $assignedResults->count(),
            'started' => $startedResults->count(),
            'completed' => $completedResults->count(),
            'participation_rate' => $students->count() > 0 ? round(($completedResults->count() / $students->count()) * 100) : 0,
            'average_score' => $completedResults->count() > 0 ? round($completedResults->avg('score')) : 0,
            'highest_score' => $completedResults->count() > 0 ? $completedResults->max('score') : 0,
            'lowest_score' => $completedResults->count() > 0 ? $completedResults->min('score') : 0,
        ];

        return Inertia::render('Teacher/Games/Results', [
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'game_type' => $game->game_type,
                'grade_level' => $game->grade_level,
            ],
            'results' => $allStudents,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Export game results to CSV.
     */
    public function export(Game $game)
    {
        Gate::authorize('view', $game);

        $students = User::role('student')
            ->where('grade_level', $game->grade_level)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        $results = GameResult::where('game_id', $game->id)
            ->with('student')
            ->orderByDesc('attempt_number')
            ->orderByDesc('completed_at')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('student_id');

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="game_results_' . $game->id . '.csv"',
        ];

        $callback = function () use ($results, $students) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Score', 'Attempt', 'Status', 'Started At', 'Completed At']);

            foreach ($students as $student) {
                $studentResults = $results->get($student->id, collect());
                $result = $studentResults->where('status', 'completed')->first()
                    ?? $studentResults->where('status', 'started')->first()
                    ?? $studentResults->where('status', 'assigned')->first();

                fputcsv($file, [
                    $student->name,
                    $student->lrn,
                    $result?->score ?? 'N/A',
                    $result?->attempt_number ?? '',
                    $result?->status ?? 'assigned',
                    $result?->started_at?->format('Y-m-d H:i') ?? '',
                    $result?->completed_at?->format('Y-m-d H:i') ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
