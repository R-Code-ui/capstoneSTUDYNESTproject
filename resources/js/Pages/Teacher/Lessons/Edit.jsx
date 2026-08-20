import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

// Heroicons
import {
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function LessonsEdit({
    lesson,
    assigned_grades,
    subjects,
    trimesters,
    school_years,
    statuses,
    weeks,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileErrors, setFileErrors] = useState([]);

    // Existing file resources (ignore any 'url' resources if present)
    const initialResources = lesson.resources || [];
    const existingFileResources = initialResources.filter(r => r.type !== 'url');

    const [existingResources, setExistingResources] = useState(existingFileResources);
    const [deletedResourceIds, setDeletedResourceIds] = useState([]);

    const { data, setData, errors, put } = useForm({
        grade_level: lesson.grade_level || '',
        subject: lesson.subject || '',
        school_year: lesson.school_year || '',
        trimester: lesson.trimester || '',
        week_number: lesson.week_number || '',
        learning_competency: lesson.learning_competency || '',
        learning_objective: lesson.learning_objective || '',
        bow_code: lesson.bow_code || '',
        lesson_title: lesson.lesson_title || '',
        lesson_description: lesson.lesson_description || '',
        lesson_content: lesson.lesson_content || '',
        key_takeaways: lesson.key_takeaways || '',
        related_assignment_id: lesson.related_assignment_id || '',
        related_quiz_id: lesson.related_quiz_id || '',
        related_game_id: lesson.related_game_id || '',
        status: lesson.status || 'draft',
        publish_date: lesson.publish_date || new Date().toISOString().split('T')[0],
        resource_url: (lesson.resources || []).find((resource) => resource.type === 'url')?.path || '',
        resources: [],
        deleted_resource_ids: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setData('deleted_resource_ids', deletedResourceIds.join(','));

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === 'resources') {
                data.resources.forEach((file) => formData.append('resources[]', file));
            } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        formData.append('_method', 'PUT');

        put(route('teacher.lessons.update', lesson.id), {
            data: formData,
            forceFormData: true,
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const errors = [];
        const validFiles = [];

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'video/mp4',
        ];

        const maxSize = 100 * 1024 * 1024;
        const maxFiles = 4;
        const currentTotal = existingResources.length + data.resources.length;

        if (files.length + currentTotal > maxFiles) {
            errors.push(`You can only have a maximum of ${maxFiles} files per lesson.`);
            e.target.value = '';
            setFileErrors(errors);
            return;
        }

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`"${file.name}" is not allowed. Please upload PDF, JPG, JPEG, DOC, DOCX, PPT, PPTX, or MP4 files.`);
                return;
            }
            if (file.size > maxSize) {
                errors.push(`"${file.name}" exceeds the 100MB limit.`);
                return;
            }
            validFiles.push(file);
        });

        if (errors.length > 0) {
            setFileErrors(errors);
        } else {
            setFileErrors([]);
        }

        const newResourcesList = [...data.resources, ...validFiles];
        setData('resources', newResourcesList);
        e.target.value = '';
    };

    const removeNewFile = (index) => {
        const newResourcesList = [...data.resources];
        newResourcesList.splice(index, 1);
        setData('resources', newResourcesList);
    };

    const removeExistingResource = (resourceId) => {
        setDeletedResourceIds((prev) => [...prev, resourceId]);
        setExistingResources((prev) => prev.filter(r => r.id !== resourceId));
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return <DocumentIcon className="w-5 h-5 text-red-500" />;
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <PhotoIcon className="w-5 h-5 text-emerald-500" />;
        if (['doc', 'docx'].includes(ext)) return <DocumentIcon className="w-5 h-5 text-blue-500" />;
        if (['ppt', 'pptx'].includes(ext)) return <DocumentIcon className="w-5 h-5 text-orange-500" />;
        return <PaperClipIcon className="w-5 h-5 text-gray-500" />;
    };

    const getFileTypeLabel = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'PDF Module';
        if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Image';
        if (['doc', 'docx'].includes(ext)) return 'Worksheet';
        if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
        return 'Worksheet';
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Edit Lesson</span>}
        >
            <Head title="Edit Lesson" />
            <style>{`
                .studynest-layout.theme-dark .lesson-form-shell input:not([type="file"]),
                .studynest-layout.theme-dark .lesson-form-shell select,
                .studynest-layout.theme-dark .lesson-form-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .lesson-form-shell input::placeholder,
                .studynest-layout.theme-dark .lesson-form-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .lesson-form-shell option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
            `}</style>
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="lesson-form-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* ===== Section 1: Curriculum Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Curriculum Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                        <select
                                            id="grade_level"
                                            value={data.grade_level}
                                            onChange={(e) => setData('grade_level', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            {school_years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_year} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="trimester" value="Term" required />
                                        <select
                                            id="trimester"
                                            value={data.trimester}
                                            onChange={(e) => setData('trimester', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            <option value="">Select Term</option>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">BOW Reference</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <InputLabel htmlFor="learning_competency" value="Learning Competency" required />
                                        <textarea
                                            id="learning_competency"
                                            value={data.learning_competency}
                                            onChange={(e) => setData('learning_competency', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Information</h3>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        />
                                        <InputError message={errors.key_takeaways} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 4: Learning Resources ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Resources</h3>
                                <div className="mb-4">
                                    <InputLabel htmlFor="resource_url" value="External Lesson URL (Optional)" />
                                    <TextInput id="resource_url" type="url" value={data.resource_url} onChange={(e) => setData('resource_url', e.target.value)} className="mt-1 block w-full" placeholder="https://example.com/lesson" />
                                    <InputError message={errors.resource_url} className="mt-2" />
                                </div>

                                {/* Existing File Resources */}
                                {existingResources.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Current Files:</p>
                                        <div className="space-y-1">
                                            {existingResources.map((resource) => (
                                                <div key={resource.id} className="flex items-center justify-between text-sm text-gray-600 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(resource.name)}
                                                        <span>{resource.name}</span>
                                                        <span className="text-xs text-gray-400">({getFileTypeLabel(resource.name)})</span>
                                                        <span className="text-xs text-gray-400">({formatFileSize(resource.size)})</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingResource(resource.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Files: {existingResources.length} of 4
                                        </p>
                                    </div>
                                )}

                                {/* New Files Upload */}
                                <div className="mb-4">
                                    <InputLabel htmlFor="resources" value="Add New Files (Max 4 files total, 100MB each)" />
                                    <input
                                        id="resources"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.mp4"
                                    />
                                    {fileErrors.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {fileErrors.map((error, index) => (
                                                <p key={index} className="text-sm text-red-600">{error}</p>
                                            ))}
                                        </div>
                                    )}
                                    {data.resources.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {data.resources.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm text-gray-600 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(file.name)}
                                                        <span>{file.name}</span>
                                                        <span className="text-xs text-gray-400">({getFileTypeLabel(file.name)})</span>
                                                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFile(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <p className="text-xs text-gray-500">
                                                New files: {data.resources.length} of {4 - existingResources.length} remaining
                                            </p>
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Accepted: PDF, JPG, JPEG, DOC, DOCX, PPT, PPTX, MP4 (Max 100MB per file, Max 4 files total)
                                    </p>
                                    <InputError message={errors.resources} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 5: Related Activities ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Activities</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="related_assignment_id" value="Related Assignment (Optional)" />
                                        <select
                                            id="related_assignment_id"
                                            value={data.related_assignment_id}
                                            onChange={(e) => setData('related_assignment_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="">None</option>
                                        </select>
                                        <InputError message={errors.related_assignment_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_quiz_id" value="Related Quiz (Optional)" />
                                        <select
                                            id="related_quiz_id"
                                            value={data.related_quiz_id}
                                            onChange={(e) => setData('related_quiz_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="">None</option>
                                        </select>
                                        <InputError message={errors.related_quiz_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="related_game_id" value="Related Game (Optional)" />
                                        <select
                                            id="related_game_id"
                                            value={data.related_game_id}
                                            onChange={(e) => setData('related_game_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="">None</option>
                                        </select>
                                        <InputError message={errors.related_game_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 6: Publication Settings ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" required />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.lessons.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update Lesson'}
                                </PrimaryButton>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
