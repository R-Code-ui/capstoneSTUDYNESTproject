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
            ->get();

        // Get all results for this game
        $results = GameResult::where('game_id', $game->id)
            ->with('student')
            ->get();

        // Merge to show all students (including those who haven't played)
        $allStudents = $students->map(function ($student) use ($results) {
            $result = $results->firstWhere('student_id', $student->id);

            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'lrn' => $student->lrn,
                'result_id' => $result ? $result->id : null,
                'score' => $result ? $result->score : null,
                'attempt_number' => $result ? $result->attempt_number : null,
                'status' => $result ? $result->status : 'assigned',
                'started_at' => $result ? $result->started_at : null,
                'completed_at' => $result ? $result->completed_at : null,
            ];
        });

        // Calculate statistics
        $completedResults = $results->where('status', 'completed');
        $startedResults = $results->where('status', 'started');
        $assignedResults = $results->where('status', 'assigned');

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

        $results = GameResult::where('game_id', $game->id)
            ->with('student')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="game_results_' . $game->id . '.csv"',
        ];

        $callback = function () use ($results, $game) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Student', 'LRN', 'Score', 'Attempt', 'Status', 'Started At', 'Completed At']);

            foreach ($results as $result) {
                fputcsv($file, [
                    $result->student->name,
                    $result->student->lrn,
                    $result->score ?? 'N/A',
                    $result->attempt_number,
                    $result->status,
                    $result->started_at ? $result->started_at->format('Y-m-d H:i') : '',
                    $result->completed_at ? $result->completed_at->format('Y-m-d H:i') : '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
