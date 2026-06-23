import { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function UserForm({
    userType = 'teacher', // 'teacher' | 'student'
    initialData = {},
    gradeLevels = ['Grade 4', 'Grade 5', 'Grade 6'],
    subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'GMRC', 'EPP/TLE'],
    onSubmit,
    onCancel,
    isLoading = false,
    errors = {},
    submitLabel = 'Create',
    cancelLabel = 'Cancel',
    title = '',
    className = '',
    compact = false,
    showEmail = false,
    showPassword = false,
    passwordRequired = false,
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        ...initialData,
    });

    const [selectedGrades, setSelectedGrades] = useState(
        initialData.grade_levels || initialData.grade_assignments || []
    );

    // Sync form data when initialData changes
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            ...initialData,
        }));
        if (initialData.grade_levels || initialData.grade_assignments) {
            setSelectedGrades(initialData.grade_levels || initialData.grade_assignments || []);
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGradeToggle = (grade) => {
        setSelectedGrades((prev) =>
            prev.includes(grade)
                ? prev.filter((g) => g !== grade)
                : [...prev, grade]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            ...formData,
        };

        // Add grade levels for teachers
        if (userType === 'teacher') {
            submitData.grade_levels = selectedGrades;
        }

        onSubmit(submitData);
    };

    const fieldSize = compact ? 'text-sm' : '';

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
            {title && (
                <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-base' : 'text-lg'}`}>
                    {title}
                </h3>
            )}

            {/* ===== Full Name ===== */}
            <div>
                <InputLabel htmlFor="name" value="Full Name" />
                <TextInput
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`mt-1 block w-full ${fieldSize}`}
                    required
                    disabled={isLoading}
                />
                <InputError message={errors?.name} className="mt-2" />
            </div>

            {/* ===== Email (Optional) ===== */}
            {showEmail && (
                <div>
                    <InputLabel htmlFor="email" value="Email (Optional)" />
                    <TextInput
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`mt-1 block w-full ${fieldSize}`}
                        disabled={isLoading}
                    />
                    <InputError message={errors?.email} className="mt-2" />
                </div>
            )}

            {/* ===== Teacher Specific Fields ===== */}
            {userType === 'teacher' && (
                <>
                    <div>
                        <InputLabel htmlFor="teacher_id" value="Teacher ID" />
                        <TextInput
                            id="teacher_id"
                            name="teacher_id"
                            type="text"
                            value={formData.teacher_id || ''}
                            onChange={(e) => handleChange('teacher_id', e.target.value)}
                            className={`mt-1 block w-full ${fieldSize}`}
                            required
                            disabled={isLoading}
                            placeholder="e.g., TCH-001"
                        />
                        <InputError message={errors?.teacher_id} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Assigned Grades" />
                        <div className={`mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 ${compact ? 'text-sm' : ''}`}>
                            {gradeLevels.map((grade) => (
                                <label key={grade} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedGrades.includes(grade)}
                                        onChange={() => handleGradeToggle(grade)}
                                        disabled={isLoading}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">{grade}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors?.grade_levels} className="mt-2" />
                    </div>
                </>
            )}

            {/* ===== Student Specific Fields ===== */}
            {userType === 'student' && (
                <>
                    <div>
                        <InputLabel htmlFor="lrn" value="LRN" />
                        <TextInput
                            id="lrn"
                            name="lrn"
                            type="text"
                            value={formData.lrn || ''}
                            onChange={(e) => handleChange('lrn', e.target.value)}
                            className={`mt-1 block w-full ${fieldSize}`}
                            required
                            disabled={isLoading}
                            placeholder="e.g., 118784260018"
                        />
                        <InputError message={errors?.lrn} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="grade_level" value="Grade Level" />
                        <select
                            id="grade_level"
                            name="grade_level"
                            value={formData.grade_level || ''}
                            onChange={(e) => handleChange('grade_level', e.target.value)}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 ${fieldSize}`}
                            required
                            disabled={isLoading}
                        >
                            <option value="">Select Grade Level</option>
                            {gradeLevels.map((grade) => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                        <InputError message={errors?.grade_level} className="mt-2" />
                    </div>
                </>
            )}

            {/* ===== Password (Optional) ===== */}
            {showPassword && (
                <>
                    <div>
                        <InputLabel htmlFor="password" value={passwordRequired ? 'Password' : 'New Password (Optional)'} />
                        <TextInput
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className={`mt-1 block w-full ${fieldSize}`}
                            required={passwordRequired}
                            disabled={isLoading}
                            minLength={8}
                            placeholder={passwordRequired ? 'Enter new password' : 'Leave blank to keep current'}
                        />
                        <InputError message={errors?.password} className="mt-2" />
                    </div>

                    {passwordRequired && (
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation || ''}
                                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                className={`mt-1 block w-full ${fieldSize}`}
                                required={passwordRequired}
                                disabled={isLoading}
                            />
                            <InputError message={errors?.password_confirmation} className="mt-2" />
                        </div>
                    )}
                </>
            )}

            {/* ===== Status Toggle (for edit mode) ===== */}
            {'is_active' in initialData && (
                <div>
                    <InputLabel value="Account Status" />
                    <div className="flex items-center gap-3 mt-1">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="is_active"
                                value="1"
                                checked={formData.is_active === true || formData.is_active === 1 || formData.is_active === '1'}
                                onChange={() => handleChange('is_active', true)}
                                disabled={isLoading}
                                className="rounded-full border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className={`text-gray-700 dark:text-gray-300 ${compact ? 'text-sm' : ''}`}>Active</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="is_active"
                                value="0"
                                checked={formData.is_active === false || formData.is_active === 0 || formData.is_active === '0'}
                                onChange={() => handleChange('is_active', false)}
                                disabled={isLoading}
                                className="rounded-full border-gray-300 text-red-600 shadow-sm focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className={`text-gray-700 dark:text-gray-300 ${compact ? 'text-sm' : ''}`}>Inactive</span>
                        </label>
                    </div>
                    <InputError message={errors?.is_active} className="mt-2" />
                </div>
            )}

            {/* ===== Actions ===== */}
            <div className={`flex justify-end gap-3 pt-4 ${!compact ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                {onCancel && (
                    <SecondaryButton
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className={compact ? 'text-sm' : ''}
                    >
                        {cancelLabel}
                    </SecondaryButton>
                )}
                <PrimaryButton
                    type="submit"
                    disabled={isLoading}
                    className={compact ? 'text-sm' : ''}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        submitLabel
                    )}
                </PrimaryButton>
            </div>
        </form>
    );
}

// ============================================================
// HELPER: TEACHER FORM
// ============================================================

export function TeacherForm(props) {
    return <UserForm {...props} userType="teacher" />;
}

// ============================================================
// HELPER: STUDENT FORM
// ============================================================

export function StudentForm(props) {
    return <UserForm {...props} userType="student" />;
}
