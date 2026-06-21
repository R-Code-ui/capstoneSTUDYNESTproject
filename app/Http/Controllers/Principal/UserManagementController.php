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
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * Display a listing of teachers and students.
     */
    public function index(Request $request)
    {
        Gate::authorize('user.manage');

        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $gradeFilter = $request->input('grade_level');

        $users = User::query()
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%")
                    ->orWhere('teacher_id', 'like', "%{$search}%");
            })
            ->when($roleFilter, function ($query, $role) {
                return $query->role($role);
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Load roles and grade assignments for each user
        $users->each(function ($user) {
            $user->load('roles');
            if ($user->hasRole('teacher')) {
                $user->load('gradeAssignments');
            }
        });

        $teachers = $users->filter(function ($user) {
            return $user->hasRole('teacher');
        })->values();

        $students = $users->filter(function ($user) {
            return $user->hasRole('student');
        })->values();

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
            'students' => $students->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'lrn' => $student->lrn,
                    'grade_level' => $student->grade_level,
                    'is_active' => $student->is_active,
                    'created_at' => $student->created_at->format('Y-m-d'),
                ];
            }),
            'grade_levels' => $gradeLevels,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'grade_level' => $gradeFilter,
            ],
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
            'password' => Hash::make('Teacher123'), // Temporary password
            'is_active' => true,
        ]);

        $user->assignRole('teacher');

        // Assign grade levels
        foreach ($validated['grade_levels'] as $grade) {
            TeacherGradeAssignment::create([
                'teacher_id' => $user->id,
                'grade_level' => $grade,
            ]);
        }

        return redirect()->back()->with('success', 'Teacher created successfully!');
    }

    /**
     * Store a newly created student.
     */
    public function storeStudent(Request $request)
    {
        Gate::authorize('student.manage');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lrn' => 'required|string|unique:users,lrn',
            'grade_level' => 'required|in:Grade 4,Grade 5,Grade 6',
            'email' => 'nullable|email|unique:users,email',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'lrn' => $validated['lrn'],
            'grade_level' => $validated['grade_level'],
            'email' => $validated['email'] ?? $validated['lrn'] . '@studynest.local',
            'password' => Hash::make('Student123'), // Temporary password
            'is_active' => true,
        ]);

        $user->assignRole('student');

        return redirect()->back()->with('success', 'Student created successfully!');
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

        // Update grade assignments
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
     * Update a student.
     */
    public function updateStudent(Request $request, $id)
    {
        Gate::authorize('student.manage');

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lrn' => ['required', 'string', Rule::unique('users', 'lrn')->ignore($user->id)],
            'grade_level' => 'required|in:Grade 4,Grade 5,Grade 6',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
            'lrn' => $validated['lrn'],
            'grade_level' => $validated['grade_level'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        return redirect()->back()->with('success', 'Student updated successfully!');
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
}
