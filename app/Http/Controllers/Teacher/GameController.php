<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Services\StudyNestNotificationService;

class GameController extends Controller
{
    private function gamesByGrade(): array
    {
        return [
            'Grade 4' => [
                'literacy' => ['Word Builder', 'Sentence Scramble', 'Rhyme Match', 'Alphabetical Order'],
                'numeracy' => ['Balloon Pop Math', 'Sorting Baskets', 'Coin Counter', 'Rounding Rocket'],   // ✅ Replaced Skip Counting Path
            ],
            'Grade 5' => [
                'literacy' => ['Match the Meaning', 'Story Fill-In', 'Compound Word Combiner', 'Analogy Solver'],
                'numeracy' => ['Fraction Pizza', 'Number Line Runner', 'Area Blocks', 'Decimal Number Line'],
            ],
            'Grade 6' => [
                'literacy' => ['Homophone Match', 'Prefix Power', 'Sequence the Story', 'Idiom Match'],
                'numeracy' => ['Balance Scale', 'Multiplication Frenzy', 'Coordinate Plane Treasure Hunt', 'Division Dash'],
            ],
        ];
    }

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
            ->paginate(10);

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published'];      // ✅ 'archived' removed
        $gameTypes = ['literacy', 'numeracy'];

        return Inertia::render('Teacher/Games/Index', [
            'games' => $games->map(function ($game) {
                $participantsCount = $game->results()->count();   // ✅ single number

                $participantsCount = $game->results()
                    ->whereIn('status', ['started', 'completed'])
                    ->distinct('student_id')
                    ->count('student_id');

                return [
                    'id' => $game->id,
                    'title' => $game->game_title,
                    'grade_level' => $game->grade_level,
                    'game_type' => $game->game_type,
                    'max_attempts' => $game->max_attempts,
                    'due_date' => $game->due_date ? $game->due_date->format('Y-m-d') : null,
                    'status' => $game->status,
                    'participants' => $participantsCount,
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
            'pagination' => $games->toArray(),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Game::class);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published'];
        $gameTypes = ['literacy', 'numeracy'];

        return Inertia::render('Teacher/Games/Create', [
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'game_types' => $gameTypes,
            'games_by_grade' => $this->gamesByGrade(),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Game::class);

        $validated = $request->validate([
            'grade_level' => ['required', Rule::in($assignedGrades = auth()->user()->gradeAssignments()->pluck('grade_level')->all())],
            'game_title' => 'required|string|max:255',
            'game_type' => 'required|in:literacy,numeracy',
            'game_data' => 'required|array',
            'max_attempts' => 'integer|min:1|max:5',
            'due_date' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:draft,published',
        ]);

        if (!in_array($validated['game_title'], $this->gamesByGrade()[$validated['grade_level']][$validated['game_type']] ?? [], true)) {
            return back()->withErrors(['game_title' => 'The selected game is not available for this grade and type.'])->withInput();
        }

        $validated['game_data'] = json_encode($validated['game_data']);

        $game = Game::create([
            'teacher_id' => auth()->id(),
            'max_attempts' => $validated['max_attempts'] ?? 5,
            'publish_date' => now()->format('Y-m-d'),
            ...$validated,
        ]);

        if ($game->status === 'published') {
            app(StudyNestNotificationService::class)->gamePublished($game);
        }

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'create',
            'activity_description'=> 'Created game assignment "' . $game->game_title . '"',
            'related_module'      => 'Game Module',
        ]);

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game assigned successfully!');
    }

    public function show(Game $game)
    {
        Gate::authorize('view', $game);

        $gameData = $game->game_data;
        if (is_string($gameData)) {
            $gameData = json_decode($gameData, true);
        }

        return Inertia::render('Teacher/Games/Show', [
            'game' => [
                'id' => $game->id,
                'grade_level' => $game->grade_level,
                'game_title' => $game->game_title,
                'game_type' => $game->game_type,
                'game_data' => $gameData,
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date ? $game->due_date->format('Y-m-d') : null,
                'status' => $game->status,
                'publish_date' => $game->publish_date ? $game->publish_date->format('Y-m-d') : null,
                'created_at' => $game->created_at->format('Y-m-d H:i'),
                'results' => $game->results()->with('student')
                    ->orderByDesc('attempt_number')
                    ->orderByDesc('completed_at')
                    ->orderByDesc('created_at')
                    ->get()->groupBy('student_id')->map(function ($studentResults) {
                    $result = $studentResults->where('status', 'completed')->first()
                        ?? $studentResults->where('status', 'started')->first()
                        ?? $studentResults->where('status', 'assigned')->first();
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

    public function edit(Game $game)
    {
        Gate::authorize('update', $game);

        $user = auth()->user();

        $assignedGrades = $user->gradeAssignments()->pluck('grade_level')->toArray();
        $statuses = ['draft', 'published'];
        $gameTypes = ['literacy', 'numeracy'];

        $gameData = $game->game_data;
        if (is_string($gameData)) {
            $gameData = json_decode($gameData, true);
        }

        return Inertia::render('Teacher/Games/Edit', [
            'game' => [
                'id' => $game->id,
                'grade_level' => $game->grade_level,
                'game_title' => $game->game_title,
                'game_type' => $game->game_type,
                'game_data' => $gameData,
                'max_attempts' => $game->max_attempts,
                'due_date' => $game->due_date ? $game->due_date->format('Y-m-d') : null,
                'status' => $game->status,
            ],
            'assigned_grades' => $assignedGrades,
            'statuses' => $statuses,
            'game_types' => $gameTypes,
            'games_by_grade' => $this->gamesByGrade(),
        ]);
    }

    public function update(Request $request, Game $game)
    {
        Gate::authorize('update', $game);

        $validated = $request->validate([
            'grade_level' => ['required', Rule::in($assignedGrades = auth()->user()->gradeAssignments()->pluck('grade_level')->all())],
            'game_title' => 'required|string|max:255',
            'game_type' => 'required|in:literacy,numeracy',
            'game_data' => 'required|array',
            'max_attempts' => 'integer|min:1|max:5',
            'due_date' => 'nullable|date',
            'status' => 'required|in:draft,published',
        ]);

        if (!in_array($validated['game_title'], $this->gamesByGrade()[$validated['grade_level']][$validated['game_type']] ?? [], true)) {
            return back()->withErrors(['game_title' => 'The selected game is not available for this grade and type.'])->withInput();
        }

        $validated['game_data'] = json_encode($validated['game_data']);

        $game->update([
            'max_attempts' => $validated['max_attempts'] ?? 5,
            ...$validated,
        ]);

        if ($game->wasChanged('status') && $game->status === 'published') {
            app(StudyNestNotificationService::class)->gamePublished($game);
        }

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'update',
            'activity_description'=> 'Updated game assignment "' . $game->game_title . '"',
            'related_module'      => 'Game Module',
        ]);

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game updated successfully!');
    }

    public function destroy(Game $game)
    {
        Gate::authorize('delete', $game);
        app(StudyNestNotificationService::class)->forgetFor('game', $game->id);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'delete',
            'activity_description'=> 'Deleted game assignment "' . $game->game_title . '"',
            'related_module'      => 'Game Module',
        ]);

        $game->results()->delete();
        $game->delete();

        return redirect()->route('teacher.games.index')
            ->with('success', 'Game deleted successfully!');
    }

    public function publish(Game $game)
    {
        Gate::authorize('update', $game);

        if ($game->status === 'published') {
            return redirect()->back()->with('info', 'Game is already published.');
        }

        $game->update([
            'status' => 'published',
            'publish_date' => now()->format('Y-m-d'),
        ]);

        app(StudyNestNotificationService::class)->gamePublished($game);

        ActivityLog::create([
            'user_id'             => auth()->id(),
            'user_role'           => 'teacher',
            'activity_type'       => 'publish',
            'activity_description'=> 'Published game assignment "' . $game->game_title . '"',
            'related_module'      => 'Game Module',
        ]);

        return redirect()->back()->with('success', 'Game published successfully!');
    }
}
