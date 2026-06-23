import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function AssignmentsEdit({
    assignment,
    assigned_grades,
    subjects,
    assignment_types,
    trimesters,
    school_years,
    statuses,
    weeks,
    submission_methods,
    related_lessons,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, errors, put } = useForm({
        grade_level: assignment.grade_level || '',
        subject: assignment.subject || '',
        school_year: assignment.school_year || '',
        trimester: assignment.trimester || '',
        week_number: assignment.week_number || '',
        related_lesson_id: assignment.related_lesson_id || '',
        assignment_title: assignment.assignment_title || '',
        assignment_type: assignment.assignment_type || '',
        instructions: assignment.instructions || '',
        total_points: assignment.total_points || '',
        estimated_time: assignment.estimated_time || '',
        allow_late_submission: assignment.allow_late_submission || false,
        due_date: assignment.due_date || '',
        due_time: assignment.due_time || '',
        submission_methods: assignment.submission_methods || [],
        status: assignment.status || 'draft',
        publish_date: assignment.publish_date || new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === 'submission_methods') {
                data.submission_methods.forEach((method) => {
                    formData.append('submission_methods[]', method);
                });
            } else if (key === 'allow_late_submission') {
                formData.append(key, data[key] ? '1' : '0');
            } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });
        formData.append('_method', 'PUT');

        post(route('teacher.assignments.update', assignment.id), {
            data: formData,
            forceFormData: true,
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Use post with _method instead of put for FormData
    const { post } = useForm();

    const toggleSubmissionMethod = (method) => {
        const current = data.submission_methods;
        if (current.includes(method)) {
            setData('submission_methods', current.filter((m) => m !== method));
        } else {
            setData('submission_methods', [...current, method]);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Edit Assignment</h2>}
        >
            <Head title="Edit Assignment" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Section 1: Academic Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                        <select
                                            id="grade_level"
                                            value={data.grade_level}
                                            onChange={(e) => setData('grade_level', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Grade Level</option>
                                            {assigned_grades.map((grade) => (
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.grade_level} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="subject" value="Subject" required />
                                        <select
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map((subject) => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.subject} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="school_year" value="School Year" required />
                                        <select
                                            id="school_year"
                                            value={data.school_year}
                                            onChange={(e) => setData('school_year', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {school_years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_year} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="trimester" value="Trimester" required />
                                        <select
                                            id="trimester"
                                            value={data.trimester}
                                            onChange={(e) => setData('trimester', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Trimester</option>
                                            {trimesters.map((trimester) => (
                                                <option key={trimester} value={trimester}>{trimester}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.trimester} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="week_number" value="Week Number" required />
                                        <select
                                            id="week_number"
                                            value={data.week_number}
                                            onChange={(e) => setData('week_number', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Week</option>
                                            {weeks.map((week) => (
                                                <option key={week} value={week}>{week}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.week_number} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_lesson_id" value="Related Lesson (Optional)" />
                                        <select
                                            id="related_lesson_id"
                                            value={data.related_lesson_id}
                                            onChange={(e) => setData('related_lesson_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="">None</option>
                                            {related_lessons.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_lesson_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 2: Assignment Details ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <InputLabel htmlFor="assignment_title" value="Assignment Title" required />
                                        <TextInput
                                            id="assignment_title"
                                            value={data.assignment_title}
                                            onChange={(e) => setData('assignment_title', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.assignment_title} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="assignment_type" value="Assignment Type" required />
                                        <select
                                            id="assignment_type"
                                            value={data.assignment_type}
                                            onChange={(e) => setData('assignment_type', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {assignment_types.map((type) => (
                                                <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.assignment_type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="instructions" value="Instructions" required />
                                        <textarea
                                            id="instructions"
                                            value={data.instructions}
                                            onChange={(e) => setData('instructions', e.target.value)}
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        />
                                        <InputError message={errors.instructions} className="mt-2" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel htmlFor="total_points" value="Total Points" required />
                                            <TextInput
                                                id="total_points"
                                                type="number"
                                                value={data.total_points}
                                                onChange={(e) => setData('total_points', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                                min="1"
                                            />
                                            <InputError message={errors.total_points} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="estimated_time" value="Est. Time (minutes)" />
                                            <TextInput
                                                id="estimated_time"
                                                type="number"
                                                value={data.estimated_time}
                                                onChange={(e) => setData('estimated_time', e.target.value)}
                                                className="mt-1 block w-full"
                                                min="1"
                                            />
                                            <InputError message={errors.estimated_time} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="allow_late_submission" value="Allow Late Submission" />
                                            <select
                                                id="allow_late_submission"
                                                value={data.allow_late_submission ? '1' : '0'}
                                                onChange={(e) => setData('allow_late_submission', e.target.value === '1')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            >
                                                <option value="0">No</option>
                                                <option value="1">Yes</option>
                                            </select>
                                            <InputError message={errors.allow_late_submission} className="mt-2" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel htmlFor="due_date" value="Due Date" required />
                                            <TextInput
                                                id="due_date"
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.due_date} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="due_time" value="Due Time" required />
                                            <TextInput
                                                id="due_time"
                                                type="time"
                                                value={data.due_time}
                                                onChange={(e) => setData('due_time', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                            />
                                            <InputError message={errors.due_time} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 3: Submission Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Settings</h3>
                                <div>
                                    <InputLabel value="Submission Methods" required />
                                    <div className="mt-2 space-y-2">
                                        {submission_methods.map((method) => (
                                            <label key={method} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={data.submission_methods.includes(method)}
                                                    onChange={() => toggleSubmissionMethod(method)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {method.charAt(0).toUpperCase() + method.slice(1)} Upload
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.submission_methods} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 4: Publication Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publication Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" required />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="publish_date" value="Publish Date" required />
                                        <TextInput
                                            id="publish_date"
                                            type="date"
                                            value={data.publish_date}
                                            onChange={(e) => setData('publish_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.publish_date} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.assignments.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Assignment'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
