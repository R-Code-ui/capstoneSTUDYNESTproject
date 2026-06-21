<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Game;
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
        Gate::authorize('viewAny', Game::class);

        $user = auth()->user();

        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $gradeFilter = $request->input('grade_level');
        $typeFilter = $request->input('game_type');

        $games = Game::where('teacher_id', $user->id)
            ->when($search, function ($query, $search) {
                return $query->where('game_title', 'like', "%{$search}%");
            })
            ->when($statusFilter, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($typeFilter, function ($query, $type) {
                return $query->where('game_type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published', 'archived'];
        $gameTypes = ['literacy', 'numeracy'];

        return Inertia::render('Teacher/Games/Index', [
            'games' => $games->map(function ($game) {
                $resultsCount = $game->results()->count();
                $completedCount = $game->results()->where('status', 'completed')->count();

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'grade_level' => $game->grade_level,
                    'game_type' => $game->game_type,
                    'max_attempts' => $game->max_attempts,
                    'due_date' => $game->due_date,
                    'status' => $game->status,
                    'participants' => $completedCount . '/' . $resultsCount,
                    'created_at' => $game->created_at->format('Y-m-d'),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'game_types' => $gameTypes,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'grade_level' => $gradeFilter,
                'game_type' => $typeFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new game assignment.
     */
    public function create()
    {
        Gate::authorize('create', Game::class);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published'];
        $gameTypes = ['literacy', 'numeracy'];

        // Define available games by grade level
        $gamesByGrade = [
            'Grade 4' => [
                'literacy' => ['Word Identification', 'Vocabulary Matching', 'Reading Practice'],
                'numeracy' => ['Basic Arithmetic', 'Number Matching', 'Addition and Subtraction Challenge'],
            ],
            'Grade 5' => [
                'literacy' => ['Reading Comprehension', 'Vocabulary Matching', 'Sentence Completion'],
                'numeracy' => ['Timed Math Challenge', 'Fraction Practice', 'Multiplication Challenge'],
            ],
            'Grade 6' => [
                'literacy' => ['Reading Comprehension', 'Advanced Vocabulary', 'Context Clue Challenge'],
                'numeracy' => ['Problem Solving Activity', 'Fraction and Decimal Challenge', 'Mathematical Reasoning Activity'],
            ],
        ];

        return Inertia::render('Teacher/Games/Create', [
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'game_types' => $gameTypes,
            'games_by_grade' => $gamesByGrade,
        ]);
    }

    /**
     * Store a newly created game assignment.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Game::class);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'game_title' => 'required|string|max:255',
            'game_type' => 'required|in:literacy,numeracy',
            'game_data' => 'required|array',
            'max_attempts' => 'integer|min:1|max:5',
            'due_date' => 'nullable|date|after:today',
            'status' => 'required|in:draft,published',
        ]);

        $game = Game::create([
            'teacher_id' => auth()->id(),
            'game_data' => json_encode($validated['game_data']),
            'max_attempts' => $validated['max_attempts'] ?? 1,
            'publish_date' => $validated['status'] === 'published' ? now()->format('Y-m-d') : now()->format('Y-m-d'),
            ...$validated,
        ]);

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game assigned successfully!');
    }

    /**
     * Display the specified game.
     */
    public function show(Game $game)
    {
        Gate::authorize('view', $game);

        return Inertia::render('Teacher/Games/Show', [
            'game' => [
                'id' => $game->id,
                'grade_level' => $game->grade_level,
                'game_title' => $game->game_title,
                'game_type' => $game->game_type,
                'game_data' => json_decode($game->game_data, true),
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date,
                'status' => $game->status,
                'publish_date' => $game->publish_date,
                'created_at' => $game->created_at->format('Y-m-d H:i'),
                'results' => $game->results()->with('student')->get()->map(function ($result) {
                    return [
                        'student_id' => $result->student_id,
                        'student_name' => $result->student->name,
                        'score' => $result->score,
                        'attempt_number' => $result->attempt_number,
                        'status' => $result->status,
                        'completed_at' => $result->completed_at ? $result->completed_at->format('Y-m-d H:i') : null,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified game.
     */
    public function edit(Game $game)
    {
        Gate::authorize('update', $game);

        $user = auth()->user();
        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published'];
        $gameTypes = ['literacy', 'numeracy'];

        $gamesByGrade = [
            'Grade 4' => [
                'literacy' => ['Word Identification', 'Vocabulary Matching', 'Reading Practice'],
                'numeracy' => ['Basic Arithmetic', 'Number Matching', 'Addition and Subtraction Challenge'],
            ],
            'Grade 5' => [
                'literacy' => ['Reading Comprehension', 'Vocabulary Matching', 'Sentence Completion'],
                'numeracy' => ['Timed Math Challenge', 'Fraction Practice', 'Multiplication Challenge'],
            ],
            'Grade 6' => [
                'literacy' => ['Reading Comprehension', 'Advanced Vocabulary', 'Context Clue Challenge'],
                'numeracy' => ['Problem Solving Activity', 'Fraction and Decimal Challenge', 'Mathematical Reasoning Activity'],
            ],
        ];

        return Inertia::render('Teacher/Games/Edit', [
            'game' => [
                'id' => $game->id,
                'grade_level' => $game->grade_level,
                'game_title' => $game->game_title,
                'game_type' => $game->game_type,
                'game_data' => json_decode($game->game_data, true),
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date,
                'status' => $game->status,
            ],
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'game_types' => $gameTypes,
            'games_by_grade' => $gamesByGrade,
        ]);
    }

    /**
     * Update the specified game.
     */
    public function update(Request $request, Game $game)
    {
        Gate::authorize('update', $game);

        $validated = $request->validate([
            'grade_level' => 'required|string',
            'game_title' => 'required|string|max:255',
            'game_type' => 'required|in:literacy,numeracy',
            'game_data' => 'required|array',
            'max_attempts' => 'integer|min:1|max:5',
            'due_date' => 'nullable|date|after:today',
            'status' => 'required|in:draft,published',
        ]);

        $game->update([
            'game_data' => json_encode($validated['game_data']),
            'max_attempts' => $validated['max_attempts'] ?? 1,
            ...$validated,
        ]);

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game updated successfully!');
    }

    /**
     * Remove the specified game.
     */
    public function destroy(Game $game)
    {
        Gate::authorize('delete', $game);

        $game->results()->delete();
        $game->delete();

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game deleted successfully!');
    }

    /**
     * Publish a game.
     */
    public function publish(Game $game)
    {
        Gate::authorize('update', $game);

        $game->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        return redirect()->back()->with('success', 'Game published successfully!');
    }
}
