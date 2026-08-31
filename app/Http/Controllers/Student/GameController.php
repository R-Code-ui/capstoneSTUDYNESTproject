<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
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
        $studentGrade = $student->currentEnrollment?->grade_level ?? $student->grade_level;
        $search = $request->input('search');
        $gameType = $request->input('game_type');
        $statusFilter = $request->input('status'); // 'assigned', 'started', 'completed'

        $gamesQuery = Game::where('grade_level', $studentGrade)
            ->currentlyPublished()
            ->with(['teacher', 'results' => function ($query) use ($student) {
                $query->where('student_id', $student->id)
                    ->orderByDesc('attempt_number')
                    ->orderByDesc('created_at');
            }])
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
                    $q->where('student_id', $student->id)->whereIn('status', ['started', 'completed']);
                });
            } elseif ($statusFilter === 'started') {
                $gamesQuery->whereHas('results', function ($q) use ($student) {
                    $q->where('student_id', $student->id)
                      ->where('status', 'started');
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
                $results = $game->results;
                $completedCount = $results->where('status', 'completed')->count();
                $attemptsUsed = $results->whereIn('status', ['started', 'completed'])->count();
                $attemptsRemaining = max(0, $game->max_attempts - $attemptsUsed);

                $hasStarted = $results->where('status', 'started')->first();
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
                    'deadline_status' => $game->deadlineStatus(),
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
        $currentResult = $results->where('status', 'started')->first();

        $attemptsUsed = $results->whereIn('status', ['started', 'completed'])->count();
        $canPlay = $attemptsUsed < $game->max_attempts && !$game->isExpired();
        $attemptsRemaining = max(0, $game->max_attempts - $attemptsUsed);

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
                'deadline_status' => $game->deadlineStatus(),
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
        $result = DB::transaction(function () use ($game, $student) {
            $results = GameResult::where('game_id', $game->id)
                ->where('student_id', $student->id)
                ->lockForUpdate()
                ->orderByDesc('attempt_number')
                ->get();

            if ($game->isExpired()) {
                abort(422, 'This game is past its due date.');
            }

            $current = $results->where('status', 'started')->first();

            if ($current) {
                return $current;
            }

            $attemptsUsed = $results->whereIn('status', ['started', 'completed'])->count();
            if ($attemptsUsed >= $game->max_attempts) {
                abort(422, 'You have reached the maximum number of attempts.');
            }

            $assigned = $results->where('status', 'assigned')->first();
            if ($assigned) {
                $assigned->update(['status' => 'started', 'started_at' => now()]);
                return $assigned->fresh();
            }

            return GameResult::create([
                'game_id' => $game->id,
                'student_id' => $student->id,
                'attempt_number' => ($results->max('attempt_number') ?? 0) + 1,
                'status' => 'started',
                'started_at' => now(),
            ]);
        });

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
        abort_unless($result->student_id === auth()->id(), 403);
        abort_unless($result->status === 'started', 409);
        Gate::authorize('view', $result->game);

        $game = $result->game;
        abort_if($game->isExpired(), 422, 'This game is past its due date.');

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
        abort_unless($result->student_id === auth()->id(), 403);
        abort_unless($result->status === 'started', 409);

        $validated = $request->validate([
            'progress' => ['nullable', 'array', 'max:30'],
            'progress.roundIndex' => ['nullable', 'integer', 'min:0', 'max:100'],
            'progress.correctCount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'progress.correctTaps' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'progress.wrongTaps' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'progress.overshoots' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'progress.attempts' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'progress.matchedWords' => ['nullable', 'array', 'max:100'],
            'progress.filledBlanks' => ['nullable', 'array', 'max:100'],
            'progress.usedWords' => ['nullable', 'array', 'max:100'],
            'progress.items' => ['nullable', 'array', 'max:100'],
        ]);

        $result->update([
            'progress_data' => $validated['progress'] ?? null,
        ]);

        return redirect()->route('student.games.index')
            ->with('success', 'Progress saved. You can resume later!');
    }

    /**
     * Submit the final score and mark game as completed.
     */
    public function submitResult(Request $request, GameResult $result)
    {
        abort_unless($result->student_id === auth()->id(), 403);
        abort_unless($result->status === 'started', 409);
        Gate::authorize('view', $result->game);
        abort_if($result->game->isExpired(), 422, 'This game is past its due date.');

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
        abort_unless($result->student_id === auth()->id(), 403);
        Gate::authorize('view', $result->game);
        abort_unless($result->status === 'completed', 404);

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
