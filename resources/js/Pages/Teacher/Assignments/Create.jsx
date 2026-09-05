import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import ExternalLinksInput from '@/Components/ExternalLinksInput';
import PublishingOptions from '@/Components/PublishingOptions';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

// Heroicons
import {
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsCreate({
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
    const [fileErrors, setFileErrors] = useState([]);
    const [fileIndexToRemove, setFileIndexToRemove] = useState(null);

    const { data, setData, errors, post } = useForm({
        grade_level: '',
        subject: '',
        school_year: school_years[0] || '',
        trimester: '',
        week_number: '',
        related_lesson_id: '',
        assignment_title: '',
        assignment_type: '',
        instructions: '',
        total_points: '',
        allow_late_submission: false,
        due_date: '',
        due_time: '',
        submission_methods: [],
        status: 'draft',
        publish_date: '',
        resource_urls: [],
        resources: [],
        bow_code: '',
        learning_competency: '',
        learning_objective: '',
    });

    const handleLessonChange = (e) => {
        const lessonId = e.target.value;
        setData('related_lesson_id', lessonId);

        if (lessonId) {
            const selectedLesson = related_lessons.find(
                lesson => lesson.id === parseInt(lessonId)
            );
            if (selectedLesson) {
                setData('bow_code', selectedLesson.bow_code || '');
                setData('learning_competency', selectedLesson.learning_competency || '');
                setData('learning_objective', selectedLesson.learning_objective || '');
            }
        } else {
            setData('bow_code', '');
            setData('learning_competency', '');
            setData('learning_objective', '');
        }
    };

    const relatedLessonsForSelectedGrade = related_lessons.filter(
        (lesson) => lesson.grade_level === data.grade_level
    );

    const handleGradeLevelChange = (e) => {
        const gradeLevel = e.target.value;
        const selectedLesson = related_lessons.find(
            (lesson) => lesson.id === parseInt(data.related_lesson_id)
        );

        setData('grade_level', gradeLevel);

        if (selectedLesson && selectedLesson.grade_level !== gradeLevel) {
            setData('related_lesson_id', '');
            setData('bow_code', '');
            setData('learning_competency', '');
            setData('learning_objective', '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dueDateTime = new Date(`${data.due_date}T${data.due_time}`);
        if (!data.due_date || !data.due_time || dueDateTime <= new Date()) {
            toast.error('The due date and time must be in the future.');
            return;
        }
        setIsSubmitting(true);

        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            if (key === 'resources') {
                data.resources.forEach((file) => {
                    formData.append('resources[]', file);
                });
            } else if (key === 'resource_urls') {
                data.resource_urls.filter(Boolean).forEach((url) => formData.append('resource_urls[]', url));
            } else if (key === 'submission_methods') {
                data.submission_methods.forEach((method) => {
                    formData.append('submission_methods[]', method);
                });
            } else if (key === 'allow_late_submission') {
                formData.append(key, data[key] ? '1' : '0');
            } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        post(route('teacher.assignments.store'), {
            data: formData,
            forceFormData: true,
            preserveState: true,
            onSuccess: () => toast.success('Assignment created successfully.'),
            onError: () => toast.error('Please correct the highlighted fields and try again.'),
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
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
            'application/vnd.ms-powerpoint', // older .ppt
            'video/mp4',
        ];

        const maxSize = 50 * 1024 * 1024;
        const maxFiles = 8;

        if (files.length + data.resources.length > maxFiles) {
            errors.push(`You can only upload a maximum of ${maxFiles} files.`);
            e.target.value = '';
            setFileErrors(errors);
            toast.error(errors[0]);
            return;
        }

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                errors.push(`"${file.name}" is not allowed. Please upload PDF, JPG, JPEG, DOC, DOCX, PPT, PPTX, or MP4 files.`);
                return;
            }
            if (file.size > maxSize) {
                errors.push(`"${file.name}" exceeds the 50MB limit.`);
                return;
            }
            validFiles.push(file);
        });

        if (errors.length > 0) {
            setFileErrors(errors);
            toast.error('Some files could not be added. Please review the file requirements.');
        } else {
            setFileErrors([]);
        }

        const newResources = [...data.resources, ...validFiles];
        setData('resources', newResources);
        e.target.value = '';
    };

    const removeFile = () => {
        if (fileIndexToRemove === null) return;
        const newResources = [...data.resources];
        newResources.splice(fileIndexToRemove, 1);
        setData('resources', newResources);
        setFileIndexToRemove(null);
        toast.success('Selected file removed.');
    };

    const toggleSubmissionMethod = (method) => {
        const current = data.submission_methods;
        if (current.includes(method)) {
            setData('submission_methods', current.filter((m) => m !== method));
        } else {
            setData('submission_methods', [...current, method]);
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) {
            return <DocumentIcon className="w-5 h-5 text-red-500" />;
        }
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            return <PhotoIcon className="w-5 h-5 text-emerald-500" />;
        }
        if (['doc', 'docx'].includes(ext)) {
            return <DocumentIcon className="w-5 h-5 text-blue-500" />;
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return <DocumentIcon className="w-5 h-5 text-orange-500" />;
        }
        return <PaperClipIcon className="w-5 h-5 text-gray-500" />;
    };

    const getFileTypeLabel = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'PDF Module';
        if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Image';
        if (['doc', 'docx'].includes(ext)) return 'Word Document';
        if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
        return 'Worksheet';
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Create Assignment</span>}
        >
            <Head title="Create Assignment" />

            <style>{`
                .studynest-layout.theme-dark .assignment-form-shell input:not([type="file"]),
                .studynest-layout.theme-dark .assignment-form-shell select,
                .studynest-layout.theme-dark .assignment-form-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .assignment-form-shell input::placeholder,
                .studynest-layout.theme-dark .assignment-form-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .assignment-form-shell option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
                .assignment-form-shell input,
                .assignment-form-shell select,
                .assignment-form-shell textarea { scroll-margin-block: 7rem; }
                .studynest-layout.theme-dark .assignment-form-actions {
                    background-color: rgb(15 23 42 / 0.96);
                    border-color: rgb(51 65 85);
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="assignment-form-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} onFocusCapture={keepFocusedFieldVisible} className="space-y-6 p-4 pb-24 sm:p-6 sm:pb-6">
                            {/* ===== Section 1: Academic Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="grade_level" value="Grade Level" required />
                                        <select
                                            id="grade_level"
                                            value={data.grade_level}
                                            onChange={handleGradeLevelChange}
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
                                    <div>
                                        <InputLabel htmlFor="related_lesson_id" value="Related Lesson (Optional)" />
                                        <select
                                            id="related_lesson_id"
                                            value={data.related_lesson_id}
                                            onChange={handleLessonChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="">None</option>
                                            {relatedLessonsForSelectedGrade.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.related_lesson_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 2: BOW Reference (Auto-filled) ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">BOW Reference</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <InputLabel htmlFor="bow_code" value="BOW Code" />
                                        <TextInput
                                            id="bow_code"
                                            value={data.bow_code}
                                            onChange={(e) => setData('bow_code', e.target.value)}
                                            className="mt-1 block w-full bg-gray-100"
                                            readOnly
                                            placeholder="Auto-filled from lesson"
                                        />
                                        <InputError message={errors.bow_code} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="learning_competency" value="Learning Competency" />
                                        <textarea
                                            id="learning_competency"
                                            value={data.learning_competency}
                                            onChange={(e) => setData('learning_competency', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-800"
                                            readOnly
                                            placeholder="Auto-filled from lesson"
                                        />
                                        <InputError message={errors.learning_competency} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="learning_objective" value="Learning Objective" />
                                        <textarea
                                            id="learning_objective"
                                            value={data.learning_objective}
                                            onChange={(e) => setData('learning_objective', e.target.value)}
                                            rows={2}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-800"
                                            readOnly
                                            placeholder="Auto-filled from lesson"
                                        />
                                        <InputError message={errors.learning_objective} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 3: Assignment Details ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment Details</h3>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            {assignment_types.map((type) => (
                                                <option key={type} value={type}>
                                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                            required
                                        />
                                        <InputError message={errors.instructions} className="mt-2" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            <InputLabel htmlFor="allow_late_submission" value="Allow Late Submission" />
                                            <select
                                                id="allow_late_submission"
                                                value={data.allow_late_submission ? '1' : '0'}
                                                onChange={(e) => setData('allow_late_submission', e.target.value === '1')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                                min={new Date().toLocaleDateString('en-CA')}
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

                            {/* ===== Section 4: Submission Settings ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Submission Settings</h3>
                                <div>
                                    <InputLabel value="How can students submit?" required />
                                    <p className="mt-1 text-sm text-gray-500">Online upload is submitted by the student. Paper hand-ins are confirmed by you after receiving the physical work.</p>
                                    <div className="mt-2 space-y-2">
                                        {submission_methods.map((method) => (
                                            <label key={method} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={data.submission_methods.includes(method)}
                                                    onChange={() => toggleSubmissionMethod(method)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-600"
                                                />
                                                <span className="text-gray-700">
                                                    {method === 'digital' ? 'Online file upload' : 'Paper hand-in'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.submission_methods} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 5: Learning Resources ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Resources</h3>
                                <div className="mb-5"><ExternalLinksInput value={data.resource_urls} onChange={(urls) => setData('resource_urls', urls)} errors={errors} /></div>
                                <div>
                                    <InputLabel htmlFor="resources" value="Upload Resources (Max 8 files, 50MB each)" />
                                    <input
                                        id="resources"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.mp4"
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
                                                        onClick={() => setFileIndexToRemove(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <p className="text-xs text-gray-500">
                                                Total: {data.resources.length} of 8 files
                                            </p>
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Accepted: PDF, JPG, JPEG, DOC, DOCX, PPTX, MP4 (Max 50MB per file, Max 8 files total)
                                    </p>
                                    <InputError message={errors.resources} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 6: Publication Settings ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Settings</h3>
                                <PublishingOptions data={data} setData={setData} errors={errors} />
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="assignment-form-actions sticky bottom-3 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_18px_-18px_rgba(15,23,42,0.55)] backdrop-blur sm:static sm:mx-0 sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0 sm:shadow-none">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.assignments.index'))} className="w-full justify-center sm:w-auto">
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting} className="w-full justify-center sm:w-auto">
                                    {isSubmitting ? 'Creating...' : 'Create Assignment'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ConfirmModal
                show={fileIndexToRemove !== null}
                onClose={() => setFileIndexToRemove(null)}
                onConfirm={removeFile}
                title="Remove selected file?"
                message="This file will not be included when you create the assignment."
                confirmText="Remove file"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
