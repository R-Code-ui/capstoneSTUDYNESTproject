<?php

namespace App\Http\Controllers\Principal;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TeacherGradeAssignment;
use Illuminate\Http\Request;
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

        // ===== TEACHERS QUERY WITH PAGINATION =====
        $teachersQuery = User::role('teacher')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('teacher_id', 'like', "%{$search}%");
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->whereHas('gradeAssignments', function ($q) use ($grade) {
                    $q->where('grade_level', $grade);
                });
            })
            ->orderBy('created_at', 'desc');

        $teachers = $teachersQuery->paginate(10);

        // Load grade assignments for each teacher
        $teachers->each(function ($teacher) {
            $teacher->load('gradeAssignments');
        });

        $gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'];

        return Inertia::render('Principal/UserManagement', [
            'teachers' => $teachers->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'teacher_id' => $teacher->teacher_id,
                    'grade_assignments' => $teacher->gradeAssignments->pluck('grade_level')->toArray(),
                    'is_active' => $teacher->is_active,
                    'created_at' => $teacher->created_at->format('Y-m-d'),
                ];
            }),
            'grade_levels' => $gradeLevels,
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeFilter,
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
            'name' => 'required|string|max:255',
            'teacher_id' => 'required|string|unique:users,teacher_id',
            'grade_levels' => 'required|array',
            'grade_levels.*' => 'in:Grade 4,Grade 5,Grade 6',
            'email' => 'nullable|email|unique:users,email',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'teacher_id' => $validated['teacher_id'],
            'email' => $validated['email'] ?? $validated['teacher_id'] . '@studynest.local',
            'password' => Hash::make('Teacher123'),
            'is_active' => true,
        ]);

        $user->assignRole('teacher');

        foreach ($validated['grade_levels'] as $grade) {
            TeacherGradeAssignment::create([
                'teacher_id' => $user->id,
                'grade_level' => $grade,
            ]);
        }

        return redirect()->back()->with('success', 'Teacher created successfully!');
    }

    /**
     * Update a teacher.
     */
    public function updateTeacher(Request $request, $id)
    {
        Gate::authorize('teacher.manage');

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'teacher_id' => ['required', 'string', Rule::unique('users', 'teacher_id')->ignore($user->id)],
            'grade_levels' => 'required|array',
            'grade_levels.*' => 'in:Grade 4,Grade 5,Grade 6',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
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

        return redirect()->back()->with('success', 'Teacher updated successfully!');
    }

    /**
     * Reset password for a user.
     */
    public function resetPassword(Request $request, $id)
    {
        Gate::authorize('user.manage');

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return redirect()->back()->with('success', 'Password reset successfully!');
    }

    /**
     * Archive a user account.
     */
    public function archive($id)
    {
        Gate::authorize('user.manage');

        $user = User::findOrFail($id);
        $user->update(['is_active' => false]);

        return redirect()->back()->with('success', 'User archived successfully!');
    }

    /**
     * Restore a user account.
     */
    public function restore($id)
    {
        Gate::authorize('user.manage');

        $user = User::findOrFail($id);
        $user->update(['is_active' => true]);

        return redirect()->back()->with('success', 'User restored successfully!');
    }

    /**
     * Permanently delete a user.
     */
    public function destroy($id)
    {
        Gate::authorize('user.manage');

        $user = User::findOrFail($id);

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
}
