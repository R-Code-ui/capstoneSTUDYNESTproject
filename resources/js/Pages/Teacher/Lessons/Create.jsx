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

export default function LessonsCreate({
    assigned_grades,
    subjects,
    trimesters,
    school_years,
    statuses,
    weeks,
    related_assignments,
    related_quizzes,
    related_games,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, errors, post } = useForm({
        grade_level: '',
        subject: '',
        school_year: school_years[0] || '',
        trimester: '',
        week_number: '',
        learning_competency: '',
        learning_objective: '',
        bow_code: '',
        lesson_title: '',
        lesson_description: '',
        lesson_content: '',
        key_takeaways: '',
        related_assignment_id: '',
        related_quiz_id: '',
        related_game_id: '',
        status: 'draft',
        publish_date: new Date().toISOString().split('T')[0],
        resources: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === 'resources') {
                data.resources.forEach((file) => {
                    formData.append('resources[]', file);
                });
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        post(route('teacher.lessons.store'), {
            data: formData,
            forceFormData: true,
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setData('resources', files);
    };

    const removeFile = (index) => {
        const newResources = [...data.resources];
        newResources.splice(index, 1);
        setData('resources', newResources);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Create Lesson</h2>}
        >
            <Head title="Create Lesson" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Section 1: Curriculum Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Curriculum Information</h3>
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
                                </div>
                            </div>

                            {/* ===== Section 2: BOW Reference ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">BOW Reference</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <InputLabel htmlFor="learning_competency" value="Learning Competency" required />
                                        <textarea
                                            id="learning_competency"
                                            value={data.learning_competency}
                                            onChange={(e) => setData('learning_competency', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        />
                                        <InputError message={errors.learning_competency} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="learning_objective" value="Learning Objective" required />
                                        <textarea
                                            id="learning_objective"
                                            value={data.learning_objective}
                                            onChange={(e) => setData('learning_objective', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        />
                                        <InputError message={errors.learning_objective} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="bow_code" value="BOW Code (Optional)" />
                                        <TextInput
                                            id="bow_code"
                                            value={data.bow_code}
                                            onChange={(e) => setData('bow_code', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="e.g., ENG5-T1-W3"
                                        />
                                        <InputError message={errors.bow_code} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 3: Lesson Information ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lesson Information</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <InputLabel htmlFor="lesson_title" value="Lesson Title" required />
                                        <TextInput
                                            id="lesson_title"
                                            value={data.lesson_title}
                                            onChange={(e) => setData('lesson_title', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.lesson_title} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="lesson_description" value="Lesson Description" required />
                                        <textarea
                                            id="lesson_description"
                                            value={data.lesson_description}
                                            onChange={(e) => setData('lesson_description', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        />
                                        <InputError message={errors.lesson_description} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="lesson_content" value="Lesson Content" required />
                                        <textarea
                                            id="lesson_content"
                                            value={data.lesson_content}
                                            onChange={(e) => setData('lesson_content', e.target.value)}
                                            rows={6}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                            placeholder="Write your lesson content here..."
                                        />
                                        <InputError message={errors.lesson_content} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="key_takeaways" value="Key Takeaways (Optional)" />
                                        <textarea
                                            id="key_takeaways"
                                            value={data.key_takeaways}
                                            onChange={(e) => setData('key_takeaways', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        />
                                        <InputError message={errors.key_takeaways} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 4: Learning Resources ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Resources</h3>
                                <div>
                                    <InputLabel htmlFor="resources" value="Upload Resources (Max 5 files, 10MB each)" />
                                    <input
                                        id="resources"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    {data.resources.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {data.resources.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Accepted: PDF, JPG, JPEG, PNG (Max 10MB per file)</p>
                                    <InputError message={errors.resources} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 5: Related Activities ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Activities</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="related_assignment_id" value="Related Assignment (Optional)" />
                                        <select
                                            id="related_assignment_id"
                                            value={data.related_assignment_id}
                                            onChange={(e) => setData('related_assignment_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="">None</option>
                                            {related_assignments.map((assignment) => (
                                                <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_assignment_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_quiz_id" value="Related Quiz (Optional)" />
                                        <select
                                            id="related_quiz_id"
                                            value={data.related_quiz_id}
                                            onChange={(e) => setData('related_quiz_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="">None</option>
                                            {related_quizzes.map((quiz) => (
                                                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_quiz_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_game_id" value="Related Game (Optional)" />
                                        <select
                                            id="related_game_id"
                                            value={data.related_game_id}
                                            onChange={(e) => setData('related_game_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="">None</option>
                                            {related_games.map((game) => (
                                                <option key={game.id} value={game.id}>{game.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_game_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 6: Publication Settings ===== */}
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
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.lessons.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Lesson'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
