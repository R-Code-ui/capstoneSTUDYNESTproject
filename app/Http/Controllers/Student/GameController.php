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
            ->paginate(10);

        return Inertia::render('Student/Games/Index', [
            'games' => $games->map(function ($game) use ($user) {
                // Count completed attempts
                $completedCount = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->count();

                // Latest completed attempt (for results link)
                $latestCompleted = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->orderBy('completed_at', 'desc')
                    ->first();

                // Check for any in-progress attempt
                $hasStarted = GameResult::where('game_id', $game->id)
                    ->where('student_id', $user->id)
                    ->where('status', 'started')
                    ->exists();

                // Determine status
                if ($hasStarted) {
                    $status = 'started';
                } elseif ($completedCount > 0) {
                    $status = 'completed';
                } else {
                    $status = 'assigned';
                }

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'game_type' => $game->game_type,
                    'max_attempts' => $game->max_attempts,
                    'due_date' => $game->due_date ? $game->due_date->format('M d, Y') : null,
                    'status' => $status,
                    'score' => $latestCompleted ? $latestCompleted->score : null,
                    'attempts_remaining' => $game->max_attempts - $completedCount,
                    'latest_completed_attempt_id' => $latestCompleted ? $latestCompleted->id : null,
                ];
            }),
            'filters' => [
                'search' => $search,
                'game_type' => $gameTypeFilter,
                'status' => $statusFilter,
            ],
            'pagination' => $games->toArray(),
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

        $completedCount = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $latestCompleted = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->first();

        $existingStarted = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'started')
            ->first();

        $canPlay = $completedCount < $game->max_attempts;
        $attemptsRemaining = $game->max_attempts - $completedCount;

        // Handle game_data
        $gameData = is_string($game->game_data)
            ? json_decode($game->game_data, true)
            : $game->game_data;

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
            'current_result' => $existingStarted ? [
                'id' => $existingStarted->id,
            ] : null,
            'latest_completed_attempt_id' => $latestCompleted ? $latestCompleted->id : null,
        ]);
    }

    /**
     * Start a game (now a GET request).
     */
    public function play(Game $game)
    {
        $user = auth()->user();

        if ($game->grade_level !== $user->grade_level) {
            abort(403);
        }

        $completedAttempts = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        if ($completedAttempts >= $game->max_attempts) {
            return redirect()->back()->with('error', 'You have reached the maximum number of attempts.');
        }

        $existingResult = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'started')
            ->first();

        if ($existingResult) {
            return redirect()->route('student.games.play.show', $existingResult->id);
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

        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'play',
            'activity_description'=> 'Started game "' . $game->game_title . '" (Attempt ' . $attemptNumber . ')',
            'related_module'      => 'Game Module',
        ]);

        return redirect()->route('student.games.play.show', $result->id);
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

        $gameData = is_string($game->game_data)
            ? json_decode($game->game_data, true)
            : $game->game_data;

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

        ActivityLog::create([
            'user_id'             => $user->id,
            'user_role'           => 'student',
            'activity_type'       => 'play',
            'activity_description'=> 'Completed game "' . $result->game->game_title . '" with score ' . $validated['score'],
            'related_module'      => 'Game Module',
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

        $completedCount = GameResult::where('game_id', $game->id)
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

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
            'can_play_again' => $completedCount < $game->max_attempts,
        ]);
    }
}
