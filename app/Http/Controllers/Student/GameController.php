<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class GameController extends Controller
{
    /**
     * Display a listing of games.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $gradeLevel = $user->grade_level;

        $search = $request->input('search');
        $gameTypeFilter = $request->input('game_type');
        $statusFilter = $request->input('status');

        $games = Game::where('grade_level', $gradeLevel)
            ->where('status', 'published')
            ->when($search, function ($query, $search) {
                return $query->where('game_title', 'like', "%{$search}%");
            })
            ->when($gameTypeFilter, function ($query, $type) {
                return $query->where('game_type', $type);
            })
            ->when($statusFilter, function ($query, $status) use ($user) {
                if ($status === 'completed') {
                    return $query->whereHas('results', function ($q) use ($user) {
                        $q->where('student_id', $user->id)->where('status', 'completed');
                    });
                } elseif ($status === 'in_progress') {
                    return $query->whereHas('results', function ($q) use ($user) {
                        $q->where('student_id', $user->id)->where('status', 'started');
                    });
                } elseif ($status === 'not_started') {
                    return $query->whereDoesntHave('results', function ($q) use ($user) {
                        $q->where('student_id', $user->id);
                    });
                }
                return $query;
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Student/Games/Index', [
            'games' => $games->map(function ($game) use ($user) {
                $result = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->first();

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'game_type' => $game->game_type,
                    'max_attempts' => $game->max_attempts,
                    'due_date' => $game->due_date ? $game->due_date->format('M d, Y') : null,
                    'status' => $result ? $result->status : 'assigned',
                    'score' => $result && $result->status === 'completed' ? $result->score : null,
                    'attempts_remaining' => $result ? $game->max_attempts - $result->attempt_number : $game->max_attempts,
                ];
            }),
            'filters' => [
                'search' => $search,
                'game_type' => $gameTypeFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Display the specified game.
     */
    public function show(Game $game)
    {
        $user = auth()->user();

        if ($game->grade_level !== $user->grade_level) {
            abort(403);
        }

        $result = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->first();

        $canPlay = true;
        $attemptsRemaining = $game->max_attempts;

        if ($result) {
            if ($result->status === 'completed') {
                $completedAttempts = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->count();
                if ($completedAttempts >= $game->max_attempts) {
                    $canPlay = false;
                }
                $attemptsRemaining = $game->max_attempts - $completedAttempts;
            } elseif ($result->status === 'started') {
                $attemptsRemaining = $game->max_attempts - ($result->attempt_number - 1);
            }
        }

        $gameData = json_decode($game->game_data, true);

        return Inertia::render('Student/Games/Show', [
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'game_type' => $game->game_type,
                'instructions' => $gameData['instructions'] ?? 'Follow the instructions to complete the game.',
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date ? $game->due_date->format('M d, Y') : null,
                'teacher' => $game->teacher->name ?? 'Unknown',
            ],
            'can_play' => $canPlay,
            'attempts_remaining' => $attemptsRemaining,
            'current_result' => $result && $result->status === 'started' ? [
                'id' => $result->id,
            ] : null,
        ]);
    }

    /**
     * Start a game.
     */
    public function play(Game $game)
    {
        $user = auth()->user();

        if ($game->grade_level !== $user->grade_level) {
            abort(403);
        }

        // Check if user has reached max attempts
        $completedAttempts = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        if ($completedAttempts >= $game->max_attempts) {
            return redirect()->back()->with('error', 'You have reached the maximum number of attempts.');
        }

        // Check for existing started result
        $existingResult = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'started')
            ->first();

        if ($existingResult) {
            return redirect()->route('student.games.play', $existingResult->id);
        }

        $attemptNumber = $completedAttempts + 1;

        $result = GameResult::create([
            'game_id' => $game->id,
            'student_id' => $user->id,
            'attempt_number' => $attemptNumber,
            'score' => null,
            'status' => 'started',
            'started_at' => now(),
        ]);

        return redirect()->route('student.games.play', $result->id);
    }

    /**
     * Display the game play interface.
     */
    public function showPlay(GameResult $result)
    {
        $user = auth()->user();

        if ($result->student_id !== $user->id) {
            abort(403);
        }

        $game = $result->game;
        $gameData = json_decode($game->game_data, true);

        return Inertia::render('Student/Games/Play', [
            'result' => [
                'id' => $result->id,
                'attempt_number' => $result->attempt_number,
            ],
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'game_type' => $game->game_type,
                'questions' => $gameData['questions'] ?? [],
                'config' => $gameData['config'] ?? [],
            ],
        ]);
    }

    /**
     * Submit game results.
     */
    public function submitResult(Request $request, GameResult $result)
    {
        $user = auth()->user();

        if ($result->student_id !== $user->id) {
            abort(403);
        }

        if ($result->status === 'completed') {
            return redirect()->route('student.games.results', $result->id);
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:0',
        ]);

        $result->update([
            'score' => $validated['score'],
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return redirect()->route('student.games.results', $result->id);
    }

    /**
     * Display game results.
     */
    public function results(GameResult $result)
    {
        $user = auth()->user();

        if ($result->student_id !== $user->id) {
            abort(403);
        }

        $game = $result->game;

        return Inertia::render('Student/Games/Results', [
            'result' => [
                'id' => $result->id,
                'score' => $result->score,
                'attempt_number' => $result->attempt_number,
                'completed_at' => $result->completed_at->format('M d, Y'),
            ],
            'game' => [
                'id' => $game->id,
                'title' => $game->game_title,
                'game_type' => $game->game_type,
            ],
            'can_play_again' => $result->attempt_number < $game->max_attempts,
        ]);
    }
}
