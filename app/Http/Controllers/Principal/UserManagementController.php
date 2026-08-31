<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherGradeAssignment;
use App\Services\StudyNestNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display a listing of teachers.
     */
    public function index(Request $request)
    {
        Gate::authorize('user.manage');

        $search = $request->input('search');
        $gradeFilter = $request->input('grade_level');
        $statusFilter = $request->input('status');
        $sort = $request->input('sort', 'created_at_desc');

        $request->validate([
            'search' => 'nullable|string|max:255',
            'grade_level' => 'nullable|in:Grade 4,Grade 5,Grade 6',
            'status' => 'nullable|in:active,inactive',
            'sort' => 'nullable|in:name_asc,name_desc,created_at_desc',
        ]);

        // ===== TEACHERS QUERY WITH PAGINATION =====
        $teachersQuery = User::role('teacher')
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('teacher_id', 'like', "%{$search}%");
                });
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->whereHas('gradeAssignments', function ($q) use ($grade) {
                    $q->where('grade_level', $grade);
                });
            })
            ->when($statusFilter === 'active', fn ($query) => $query->where('is_active', true))
            ->when($statusFilter === 'inactive', fn ($query) => $query->where('is_active', false));

        if ($sort === 'name_asc') {
            $teachersQuery->orderByRaw("LOWER(SUBSTRING_INDEX(TRIM(name), ' ', -1)) ASC")
                ->orderBy('name', 'asc');
        } elseif ($sort === 'name_desc') {
            $teachersQuery->orderByRaw("LOWER(SUBSTRING_INDEX(TRIM(name), ' ', -1)) DESC")
                ->orderBy('name', 'desc');
        } else {
            $teachersQuery->orderBy('created_at', 'desc');
        }

        $teachers = $teachersQuery->paginate(10)->withQueryString();

        // Load grade assignments for each teacher
        $teachers->each(function ($teacher) {
            $teacher->load('gradeAssignments');
        });

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];

        return Inertia::render('Principal/UserManagement', [
            'teachers' => $teachers->map(function ($teacher) {
                $nameParts = preg_split('/\s+/', trim($teacher->name), -1, PREG_SPLIT_NO_EMPTY);
                $firstName = $nameParts[0] ?? '';
                $lastName = count($nameParts) > 1 ? array_pop($nameParts) : '';

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'first_name' => $firstName,
                    'middle_name' => implode(' ', array_slice($nameParts, 1)),
                    'last_name' => $lastName,
                    'teacher_id' => $teacher->teacher_id,
                    'grade_assignments' => $teacher->gradeAssignments->pluck('grade_level')->toArray(),
                    'is_active' => $teacher->is_active,
                    'created_at' => $teacher->created_at->format('Y-m-d'),
                ];
            }),
            'grade_levels' => $gradeLevels,
            'status_options' => [
                ['value' => '', 'label' => 'All Status'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'sort_options' => [
                ['value' => 'name_asc', 'label' => 'Last Name (A-Z)'],
                ['value' => 'name_desc', 'label' => 'Last Name (Z-A)'],
                ['value' => 'created_at_desc', 'label' => 'Recently Added'],
            ],
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeFilter,
                'status' => $statusFilter,
                'sort' => $sort,
            ],
            'teachers_pagination' => $teachers->toArray(),
        ]);
    }

    /**
     * Store a newly created teacher.
     */
    public function storeTeacher(Request $request)
    {
        Gate::authorize('teacher.manage');

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'teacher_id' => 'required|string|unique:users,teacher_id',
            'grade_levels' => 'required|array',
            'grade_levels.*' => ['in:Grade 4,Grade 5,Grade 6', 'distinct'],
            'email' => 'nullable|email|unique:users,email',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $this->formatName($validated),
                'teacher_id' => $validated['teacher_id'],
                'email' => $validated['email'] ?? $validated['teacher_id'] . '@studynest.local',
                'password' => Hash::make('Teacher123'),
                'is_active' => true,
                'must_change_password' => true,
            ]);

            $user->assignRole('teacher');

            foreach ($validated['grade_levels'] as $grade) {
                TeacherGradeAssignment::create([
                    'teacher_id' => $user->id,
                    'grade_level' => $grade,
                ]);
            }

            return $user;
        });

        app(StudyNestNotificationService::class)->userCreated($user, auth()->user());

        return redirect()->back()->with('success', 'Teacher created successfully!');
    }

    /**
     * Update a teacher.
     */
    public function updateTeacher(Request $request, $id)
    {
        Gate::authorize('teacher.manage');

        $user = User::role('teacher')->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'teacher_id' => ['required', 'string', Rule::unique('users', 'teacher_id')->ignore($user->id)],
            'grade_levels' => 'required|array',
            'grade_levels.*' => ['in:Grade 4,Grade 5,Grade 6', 'distinct'],
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->update([
                'name' => $this->formatName($validated),
                'teacher_id' => $validated['teacher_id'],
                'is_active' => $validated['is_active'] ?? $user->is_active,
            ]);

            TeacherGradeAssignment::where('teacher_id', $user->id)->delete();
            foreach ($validated['grade_levels'] as $grade) {
                TeacherGradeAssignment::create([
                    'teacher_id' => $user->id,
                    'grade_level' => $grade,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Teacher updated successfully!');
    }

    /**
     * Reset password for a user.
     */
    public function resetPassword(Request $request, $id)
    {
        Gate::authorize('user.manage');

        $user = User::role('teacher')->findOrFail($id);

        $validated = $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'must_change_password' => false,
        ]);

        return redirect()->back()->with('success', 'Password reset successfully!');
    }

    /**
     * Archive a user account.
     */
    public function archive($id)
    {
        Gate::authorize('user.manage');

        $user = User::role('teacher')->findOrFail($id);
        $user->update(['is_active' => false]);
        app(StudyNestNotificationService::class)->userStatusChanged($user, 'archived', auth()->user());

        return redirect()->back()->with('success', 'User archived successfully!');
    }

    /**
     * Restore a user account.
     */
    public function restore($id)
    {
        Gate::authorize('user.manage');

        $user = User::role('teacher')->findOrFail($id);
        $user->update(['is_active' => true]);
        app(StudyNestNotificationService::class)->userStatusChanged($user, 'restored', auth()->user());

        return redirect()->back()->with('success', 'User restored successfully!');
    }

    /**
     * Permanently delete a user.
     */
    public function destroy($id)
    {
        Gate::authorize('user.manage');

        $user = User::role('teacher')->findOrFail($id);

        // Delete grade assignments if teacher
        if ($user->hasRole('teacher')) {
            TeacherGradeAssignment::where('teacher_id', $user->id)->delete();
        }

        // Remove all roles
        $user->syncRoles([]);

        // Delete the user
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully!');
    }

    /** Build the single name value used by the existing users table. */
    private function formatName(array $name): string
    {
        return implode(' ', array_filter([
            trim($name['first_name']),
            trim($name['middle_name'] ?? ''),
            trim($name['last_name']),
        ]));
    }
}
