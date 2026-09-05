<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentDirectoryController extends Controller
{
    private const GRADE_LEVELS = ['Grade 4', 'Grade 5', 'Grade 6'];

    /** Display a school-wide, read-only student directory for principals. */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'grade_level' => ['nullable', Rule::in(self::GRADE_LEVELS)],
            'school_year' => ['nullable', Rule::in(config('school.school_years'))],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
        ]);

        $search = trim($validated['search'] ?? '');
        $userId = preg_match('/^(?:STU-)?0*(\d+)$/i', $search, $matches)
            ? (int) $matches[1]
            : null;

        $students = User::role('student')
            ->with('currentEnrollment')
            ->when($search !== '', function ($query) use ($search, $userId) {
                $query->where(function ($students) use ($search, $userId) {
                    $students->where('name', 'like', "%{$search}%");

                    if ($userId !== null) {
                        $students->orWhere('id', $userId);
                    }
                });
            })
            ->when($validated['grade_level'] ?? null, fn ($query, $grade) => $query->where('grade_level', $grade))
            ->when($validated['school_year'] ?? null, fn ($query, $year) => $query->whereHas('enrollments', fn ($enrollments) => $enrollments->where('school_year', $year)->where('status', 'active')))
            ->when(($validated['status'] ?? null) === 'active', fn ($query) => $query->where('is_active', true))
            ->when(($validated['status'] ?? null) === 'inactive', fn ($query) => $query->where('is_active', false))
            ->when($validated['gender'] ?? null, fn ($query, $gender) => $query->where('gender', $gender))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Principal/StudentDirectory', [
            'students' => $students->through(fn (User $student) => [
                'id' => $student->id,
                'user_id' => 'STU-' . str_pad((string) $student->id, 6, '0', STR_PAD_LEFT),
                'name' => $student->name,
                'grade_level' => $student->grade_level ?: '—',
                'school_year' => $student->currentEnrollment?->school_year ?: '—',
                'gender' => $student->gender ? ucfirst($student->gender) : '—',
                'is_active' => $student->is_active,
                'created_at' => $student->created_at?->format('M j, Y'),
            ])->items(),
            'pagination' => $students->toArray(),
            'grade_levels' => self::GRADE_LEVELS,
            'school_years' => config('school.school_years'),
            'filters' => [
                'search' => $search,
                'grade_level' => $validated['grade_level'] ?? '',
                'school_year' => $validated['school_year'] ?? '',
                'status' => $validated['status'] ?? '',
                'gender' => $validated['gender'] ?? '',
            ],
        ]);
    }
}
