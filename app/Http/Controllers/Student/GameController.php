<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use App\Models\ActivityLog;

class GameController extends Controller
{
    /**
     * Display a listing of games assigned to the student.
     */
    public function index(Request $request)
    {
        $student = auth()->user();
        $search = $request->input('search');
        $gameType = $request->input('game_type');
        $statusFilter = $request->input('status'); // 'assigned', 'started', 'completed'

        $gamesQuery = Game::where('grade_level', $student->grade_level)
            ->where('status', 'published')
            ->with('results')
            ->when($search, function ($query, $search) {
                return $query->where('game_title', 'like', "%{$search}%");
            })
            ->when($gameType, function ($query, $gameType) {
                return $query->where('game_type', $gameType);
            });

        // Status filter
        if ($statusFilter) {
            if ($statusFilter === 'assigned') {
                $gamesQuery->whereDoesntHave('results', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                });
            } elseif ($statusFilter === 'started') {
                $gamesQuery->whereHas('results', function ($q) use ($student) {
                    $q->where('student_id', $student->id)
                      ->where('status', '!=', 'completed');
                });
            } elseif ($statusFilter === 'completed') {
                $gamesQuery->whereHas('results', function ($q) use ($student) {
                    $q->where('student_id', $student->id)
                      ->where('status', 'completed');
                });
            }
        }

        $games = $gamesQuery->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Student/Games/Index', [
            'games' => $games->map(function ($game) use ($student) {
                $results = $game->results()->where('student_id', $student->id)->get();
                $completedCount = $results->where('status', 'completed')->count();
                $highestScore = $results->where('status', 'completed')->max('score') ?? 0;
                $attemptsRemaining = max(0, $game->max_attempts - $results->count());

                $hasStarted = $results->where('status', '!=', 'completed')->first();
                if ($hasStarted) {
                    $status = 'started';
                } elseif ($completedCount > 0) {
                    $status = 'completed';
                } else {
                    $status = 'assigned';
                }

                $latestCompleted = $results->where('status', 'completed')->sortByDesc('completed_at')->first();

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'grade_level' => $game->grade_level,
                    'game_type' => $game->game_type,
                    'max_attempts' => $game->max_attempts,
                    'due_date' => $game->due_date ? $game->due_date->format('Y-m-d') : null,
                    'teacher' => $game->teacher->name,
                    'status' => $status,
                    'score' => $latestCompleted ? $latestCompleted->score : null,
                    'attempts_remaining' => $attemptsRemaining,
                    'latest_completed_attempt_id' => $latestCompleted ? $latestCompleted->id : null,
                ];
            }),
            'filters' => [
                'search' => $search,
                'game_type' => $gameType,
                'status' => $statusFilter,
            ],
            'pagination' => $games->toArray(),
        ]);
    }

    /**
     * Show the game details and instructions.
     */
    public function show(Game $game, Request $request)
    {
        Gate::authorize('view', $game);

        $student = auth()->user();
        $results = $game->results()
            ->where('student_id', $student->id)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $completedResults = $results->where('status', 'completed');
        $currentResult = $results->where('status', '!=', 'completed')->first();

        $canPlay = $results->count() < $game->max_attempts;
        $attemptsRemaining = max(0, $game->max_attempts - $results->count());

        $gameData = $game->game_data;
        if (is_string($gameData)) {
            $gameData = json_decode($gameData, true);
        }

        $latestCompleted = $completedResults->sortByDesc('completed_at')->first();

        return Inertia::render('Student/Games/Show', [
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'grade_level' => $game->grade_level,
                'game_type' => $game->game_type,
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date ? $game->due_date->format('Y-m-d') : null,
                'teacher' => $game->teacher->name,
                'instructions' => $gameData['instructions'] ?? 'Play and do your best!',
                'difficulty' => $gameData['difficulty'] ?? 'standard',
            ],
            'can_play' => $canPlay,
            'attempts_remaining' => $attemptsRemaining,
            'current_result' => $currentResult ? [
                'id' => $currentResult->id,
                'attempt_number' => $currentResult->attempt_number,
                'status' => $currentResult->status,
            ] : null,
            'latest_completed_attempt_id' => $latestCompleted ? $latestCompleted->id : null,
        ]);
    }

    /**
     * Start a new game or resume an in-progress one.
     */
    public function play(Game $game, Request $request)
    {
        Gate::authorize('view', $game);

        $student = auth()->user();
        $results = $game->results()->where('student_id', $student->id)->get();

        if ($results->count() >= $game->max_attempts) {
            return back()->with('error', 'You have reached the maximum number of attempts.');
        }

        $result = $results->where('status', '!=', 'completed')->first();

        if (!$result) {
            $result = GameResult::create([
                'game_id' => $game->id,
                'student_id' => $student->id,
                'attempt_number' => $results->count() + 1,
                'status' => 'started',
                'started_at' => now(),
            ]);
        }

        ActivityLog::create([
            'user_id'             => $student->id,
            'user_role'           => 'student',
            'activity_type'       => 'start_game',
            'activity_description'=> 'Started game: ' . $game->game_title . ' (Attempt #' . $result->attempt_number . ')',
            'related_module'      => 'Game Module',
        ]);

        return redirect()->route('student.games.play.show', $result->id);
    }

    /**
     * Display the play screen for an existing game result.
     */
    public function showPlay(GameResult $result)
    {
        Gate::authorize('view', $result->game);

        $game = $result->game;

        $gameData = $game->game_data;
        if (is_string($gameData)) {
            $gameData = json_decode($gameData, true);
        }

        return Inertia::render('Student/Games/Play', [
            'result' => [
                'id' => $result->id,
                'progress_data' => $result->progress_data,
            ],
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'grade_level' => $game->grade_level,
                'settings' => [
                    'difficulty' => $gameData['difficulty'] ?? 'standard'
                ],
            ],
        ]);
    }

    /**
     * Save progress mid-game (called when student exits).
     */
    public function saveProgress(Request $request, GameResult $result)
    {
        if ($result->student_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'progress' => 'nullable|array',
        ]);

        $result->update([
            'progress_data' => $validated['progress'],
        ]);

        return redirect()->route('student.games.index')
            ->with('success', 'Progress saved. You can resume later!');
    }

    /**
     * Submit the final score and mark game as completed.
     */
    public function submitResult(Request $request, GameResult $result)
    {
        Gate::authorize('view', $result->game);

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
        ]);

        $result->update([
            'score' => $validated['score'],
            'status' => 'completed',
            'completed_at' => now(),
            'progress_data' => null,
        ]);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'student',
            'activity_type'       => 'complete_game',
            'activity_description'=> 'Completed game: ' . $result->game->game_title . ' - Score: ' . $validated['score'],
            'related_module'      => 'Game Module',
        ]);

        return redirect()->route('student.games.results', $result->id)
            ->with('success', 'Game completed!');
    }

    /**
     * Display the results/summary after a game is completed.
     */
    public function results(GameResult $result)
    {
        Gate::authorize('view', $result->game);

        $game = $result->game;
        $student = auth()->user();
        $allResults = $game->results()
            ->where('student_id', $student->id)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $averageScore = $allResults->where('status', 'completed')->avg('score') ?? 0;
        $highestScore = $allResults->where('status', 'completed')->max('score') ?? 0;
        $lowestScore = $allResults->where('status', 'completed')->min('score') ?? 0;

        return Inertia::render('Student/Games/Results', [
            'result' => [
                'id' => $result->id,
                'score' => $result->score,
                'attempt_number' => $result->attempt_number,
                'completed_at' => $result->completed_at?->format('Y-m-d H:i'),
            ],
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'game_type' => $game->game_type,
            ],
            'statistics' => [
                'average_score' => round($averageScore, 2),
                'highest_score' => $highestScore,
                'lowest_score' => $lowestScore,
                'total_attempts' => $allResults->count(),
            ],
        ]);
    }
}
