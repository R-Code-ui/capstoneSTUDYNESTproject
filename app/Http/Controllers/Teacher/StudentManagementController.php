<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentManagementController extends Controller
{
    /**
     * Display a listing of students for the teacher's assigned grades.
     */
    public function index(Request $request)
    {
        // Teacher must have permission to manage students
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $request->validate([
            'search' => 'nullable|string|max:255',
            'grade_level' => ['nullable', Rule::in($assignedGrades)],
            'gender' => 'nullable|in:male,female',
            'status' => 'nullable|in:active,inactive',
            'sort' => 'nullable|in:name_asc,name_desc,created_at_desc',
        ]);

        $search = $request->input('search');
        $gradeFilter = $request->input('grade_level');
        $genderFilter = $request->input('gender');
        $statusFilter = $request->input('status');   // 'active', 'inactive'
        $sort = $request->input('sort', 'name_asc'); // default sort by name A-Z

        $studentsQuery = User::role('student')
            ->whereIn('grade_level', $assignedGrades)
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%");
                });
            })
            ->when($gradeFilter, function ($query, $grade) {
                return $query->where('grade_level', $grade);
            })
            ->when($genderFilter, function ($query, $gender) {
                return $query->where('gender', $gender);
            })
            ->when($statusFilter === 'active', function ($query) {
                return $query->where('is_active', true);
            })
            ->when($statusFilter === 'inactive', function ($query) {
                return $query->where('is_active', false);
            });

        // Sorting
        if ($sort === 'name_asc') {
            $studentsQuery->orderByRaw("LOWER(SUBSTRING_INDEX(TRIM(name), ' ', -1)) ASC")
                ->orderBy('name', 'asc');
        } elseif ($sort === 'name_desc') {
            $studentsQuery->orderByRaw("LOWER(SUBSTRING_INDEX(TRIM(name), ' ', -1)) DESC")
                ->orderBy('name', 'desc');
        } else {
            $studentsQuery->orderBy('created_at', 'desc');
        }

        $students = $studentsQuery->paginate(10)->withQueryString();

        return Inertia::render('Teacher/StudentManagement', [
            'students' => $students->map(function ($student) {
                $nameParts = preg_split('/\s+/', trim($student->name), -1, PREG_SPLIT_NO_EMPTY);
                $firstName = $nameParts[0] ?? '';
                $lastName = count($nameParts) > 1 ? array_pop($nameParts) : '';

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'first_name' => $firstName,
                    'middle_name' => implode(' ', array_slice($nameParts, 1)),
                    'last_name' => $lastName,
                    'lrn' => $student->lrn,
                    'grade_level' => $student->grade_level,
                    'gender' => $student->gender,
                    'is_active' => $student->is_active,
                    'created_at' => $student->created_at->format('Y-m-d'),
                ];
            }),
            'assigned_grades' => $assignedGrades,
            'status_options' => [
                ['value' => '', 'label' => 'All Status'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'sort_options' => [
                ['value' => 'name_asc', 'label' => 'Name A‑Z'],
                ['value' => 'name_desc', 'label' => 'Name Z‑A'],
            ],
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeFilter,
                'gender' => $genderFilter,
                'status' => $statusFilter,
                'sort' => $sort,
            ],
            'pagination' => $students->toArray(),
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => 'required|string|unique:users,lrn',
            'grade_level' => ['required', Rule::in($assignedGrades)], // dynamic assigned grades
            'gender' => 'required|in:male,female',
        ]);

        // Ensure the teacher is assigned to this grade level
        if (!in_array($validated['grade_level'], $assignedGrades)) {
            return redirect()->back()->with('error', 'You are not assigned to this grade level.');
        }

        // Construct full name
        $name = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ? $validated['middle_name'] . ' ' : '') . $validated['last_name']);

        $user = User::create([
            'name' => $name,
            'lrn' => $validated['lrn'],
            'grade_level' => $validated['grade_level'],
            'gender' => $validated['gender'],
            'email' => $validated['lrn'] . '@studynest.local',
            'password' => Hash::make('Student123'),
            'is_active' => true,
        ]);

        $user->assignRole('student');

        return redirect()->back()->with('success', 'Student created successfully!');
    }

    /**
     * Update an existing student.
     */
    public function update(Request $request, $id)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $user = User::findOrFail($id);

        // Ensure student is in teacher's assigned grades
        if (!$user->hasRole('student') || !in_array($user->grade_level, $assignedGrades, true)) {
            abort(403, 'You can only manage students in your assigned grades.');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'lrn' => ['required', 'string', Rule::unique('users', 'lrn')->ignore($user->id)],
            'grade_level' => ['required', Rule::in($assignedGrades)],
            'gender' => 'required|in:male,female',
            'is_active' => 'boolean',
        ]);

        if (!in_array($validated['grade_level'], $assignedGrades)) {
            return redirect()->back()->with('error', 'You are not assigned to this grade level.');
        }

        $name = trim($validated['first_name'] . ' ' . ($validated['middle_name'] ? $validated['middle_name'] . ' ' : '') . $validated['last_name']);

        $user->update([
            'name' => $name,
            'lrn' => $validated['lrn'],
            'grade_level' => $validated['grade_level'],
            'gender' => $validated['gender'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        return redirect()->back()->with('success', 'Student updated successfully!');
    }

    /**
     * Reset password for a student.
     */
    public function resetPassword(Request $request, $id)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $user = User::findOrFail($id);

        if (!$user->hasRole('student') || !in_array($user->grade_level, $assignedGrades, true)) {
            abort(403);
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return redirect()->back()->with('success', 'Password reset successfully!');
    }

    /**
     * Archive a student account.
     */
    public function archive($id)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $user = User::findOrFail($id);

        if (!$user->hasRole('student') || !in_array($user->grade_level, $assignedGrades, true)) {
            abort(403);
        }

        $user->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Student archived successfully!');
    }

    /**
     * Restore a student account.
     */
    public function restore($id)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $user = User::findOrFail($id);

        if (!$user->hasRole('student') || !in_array($user->grade_level, $assignedGrades, true)) {
            abort(403);
        }

        $user->update(['is_active' => true]);

        return redirect()->back()->with('success', 'Student restored successfully!');
    }

    /**
     * Permanently delete a student.
     */
    public function destroy($id)
    {
        Gate::authorize('student.manage');

        $teacher = auth()->user();
        $assignedGrades = $teacher->gradeAssignments()->pluck('grade_level')->toArray();

        $user = User::findOrFail($id);

        if (!$user->hasRole('student') || !in_array($user->grade_level, $assignedGrades, true)) {
            abort(403);
        }

        $user->syncRoles([]);
        $user->delete();

        return redirect()->back()->with('success', 'Student deleted successfully!');
    }
}
