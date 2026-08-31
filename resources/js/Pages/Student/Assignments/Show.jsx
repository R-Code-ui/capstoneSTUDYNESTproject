import { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import LoadingSpinner from '@/Components/LoadingSpinner';
import StudentResources from '@/Components/StudentResources';
import useDeadlineStatuses from '@/Hooks/useDeadlineStatuses';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

import {
    ArrowLeftIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    VideoCameraIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsShow({ assignment, resources, submission }) {
    const { flash } = usePage().props; // to show success/error messages
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(() => {
        const methods = assignment.submission_methods || [];
        return methods.includes('digital') && !methods.includes('paper') ? 'digital' : '';
    });
    const [fileErrors, setFileErrors] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [confirmingSubmission, setConfirmingSubmission] = useState(false);
    const [fileIndexToRemove, setFileIndexToRemove] = useState(null);
    const getDeadlineStatus = useDeadlineStatuses(assignment);
    const deadlineStatus = getDeadlineStatus(assignment);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const errorsList = [];
        const validFiles = [];
        const maxFiles = 8;
        const maxSize = 50 * 1024 * 1024;
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'video/mp4',
        ];

        if (files.length + selectedFiles.length > maxFiles) {
            errorsList.push(`You can only upload a maximum of ${maxFiles} files.`);
            e.target.value = '';
            setFileErrors(errorsList);
            toast.error(errorsList[0]);
            return;
        }

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                errorsList.push(`"${file.name}" is not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG, MP4.`);
                return;
            }
            if (file.size > maxSize) {
                errorsList.push(`"${file.name}" exceeds the 50MB limit.`);
                return;
            }
            validFiles.push(file);
        });

        setFileErrors(errorsList);
        errorsList.forEach((error) => toast.error(error));
        if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
        e.target.value = '';
    };

    const removeFile = () => {
        if (fileIndexToRemove === null) return;
        setSelectedFiles((prev) => prev.filter((_, index) => index !== fileIndexToRemove));
        setFileIndexToRemove(null);
        toast.success('Selected file removed.');
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedMethod) {
            toast.error('Please select a submission method.');
            return;
        }
        if (selectedMethod !== 'digital') {
            toast.info('Paper hand-ins are confirmed by your teacher after you submit the physical work.');
            return;
        }
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one file to upload.');
            return;
        }

        setConfirmingSubmission(true);
    };

    const submitAssignment = () => {
        setConfirmingSubmission(false);

        setIsSubmitting(true);
        setFormErrors({});

        // Build FormData exactly like the old single-file version, but with multiple files
        const formData = new FormData();
        formData.append('submission_method', selectedMethod);
        if (selectedMethod === 'digital') {
            selectedFiles.forEach((file) => {
                formData.append('files[]', file); // array of files
            });
        }

        // Use router.post directly – NOT useForm's post
        router.post(route('student.assignments.submit', assignment.id), formData, {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Clear form state on success
                setSelectedFiles([]);
                setSelectedMethod('');
                setFileErrors([]);
                toast.success(submission ? 'Assignment resubmitted successfully.' : 'Assignment submitted successfully.');
                router.reload(); // reload to show updated submission status
            },
            onError: (errors) => {
                setFormErrors(errors);
                toast.error('Unable to submit the assignment. Please review the highlighted fields and try again.');
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module': return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-emerald-500" />;
            case 'worksheet': return <PaperClipIcon className="w-6 h-6 text-blue-500" />;
            case 'video': return <VideoCameraIcon className="w-6 h-6 text-indigo-500" />;
            default: return <PaperClipIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getResourceLabel = (type) => {
        const labels = { pdf_module: 'PDF Module', worksheet: 'Worksheet', image: 'Image', video: 'Video' };
        return labels[type] || type;
    };

    const getSubmissionStatusBadge = (status) => {
        const map = {
            not_submitted: 'not_started',
            submitted: 'submitted',
            late_submission: 'late_submission',
            reviewed: 'reviewed',
            graded: 'graded',
            returned_for_revision: 'returned_for_revision',
        };
        return map[status] || status;
    };

    const canSubmit = () => {
        if (deadlineStatus === 'expired' || !assignment.can_submit) return false;
        if (!submission) return true;
        return submission.status === 'returned_for_revision' || submission.status === 'not_submitted';
    };

    const openResource = (url, action) => {
        const resourceWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (!resourceWindow) {
            toast.error(`Your browser blocked the resource ${action}. Please allow pop-ups and try again.`);
            return;
        }
        resourceWindow.opener = null;
    };

    const availableMethods = (assignment.submission_methods || []).filter((method) => ['digital', 'paper'].includes(method));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="min-w-0 max-w-full truncate text-xl font-semibold leading-tight text-gray-800" title={assignment.title}>{assignment.title}</span>
                    <SecondaryButton onClick={() => router.visit(route('student.assignments.index'), {
                        onError: () => toast.error('Unable to return to assignments. Please try again.'),
                    })}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Assignments
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={assignment.title} />

            <div className="student-assignment-show-page py-4">
                <style>{`
                    .studynest-layout.theme-dark .student-assignment-show-page .bg-white {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(51 65 85) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .bg-gray-50 {
                        background-color: rgb(30 41 59) !important;
                        border-color: rgb(71 85 105) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-assignment-show-page .text-gray-700 {
                        color: rgb(226 232 240) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-assignment-show-page .text-gray-500 {
                        color: rgb(148 163 184) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page [class~="border-gray-200"],
                    .studynest-layout.theme-dark .student-assignment-show-page [class~="border-gray-100"] {
                        border-color: rgb(51 65 85) !important;
                    }
                    .student-assignment-show-page .submission-method-option {
                        background-color: white;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .submission-method-option {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(71 85 105) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .submission-method-option:hover {
                        background-color: rgb(30 41 59) !important;
                        border-color: rgb(96 165 250) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .submission-method-option.is-selected {
                        background-color: rgb(30 41 59) !important;
                        border-color: rgb(37 99 235) !important;
                        box-shadow: inset 0 0 0 1px rgb(37 99 235);
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .submission-method-label {
                        color: rgb(226 232 240) !important;
                    }
                    .student-assignment-show-page .assignment-file-input::file-selector-button {
                        cursor: pointer;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .assignment-file-input::file-selector-button {
                        background-color: rgb(30 41 59) !important;
                        color: rgb(147 197 253) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .assignment-file-input::file-selector-button:hover {
                        background-color: rgb(51 65 85) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .paper-submission-notice {
                        background-color: rgb(120 53 15 / 0.2) !important;
                        border-color: rgb(180 83 9) !important;
                    }
                    .studynest-layout.theme-dark .student-assignment-show-page .paper-submission-notice p {
                        color: rgb(251 191 36) !important;
                    }
                    .student-assignment-show-page .break-words {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }
                    @media (max-width: 640px) {
                        .student-assignment-show-page .p-6 {
                            padding: 1rem;
                        }
                    }
                `}</style>
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    {isSubmitting && <LoadingSpinner overlay size="lg" />}

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {flash.error}
                        </div>
                    )}

                    {/* Assignment Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {assignment.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {submission && <StatusBadge status={getSubmissionStatusBadge(submission.status)} />}
                                <StatusBadge status={deadlineStatus} size="sm" />
                            </div>

                            <h3 className="max-w-full truncate text-2xl font-bold text-gray-800" title={assignment.title}>{assignment.title}</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClipboardDocumentListIcon className="w-4 h-4" /> Total Points
                                    </div>
                                    <div className="font-medium text-gray-800">{assignment.total_points}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" /> Due Date
                                    </div>
                                    <div className="font-medium text-gray-800">{assignment.due_date || 'No due date'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" /> Due Time
                                    </div>
                                    <div className="font-medium text-gray-800">{assignment.due_time || 'No time specified'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" /> Late Submission
                                    </div>
                                    <div className="font-medium text-gray-800">{assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Instructions</h4>
                                <div className="text-gray-700 whitespace-pre-wrap break-words line-clamp-5" title={assignment.instructions}>{assignment.instructions}</div>
                            </div>
                        </div>
                    </div>

                    {deadlineStatus === 'expired' && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                            <div className="font-semibold">This assignment has expired.</div>
                            <p className="mt-1 text-sm">The deadline was {assignment.due_at_label}. New submissions are no longer accepted.</p>
                        </div>
                    )}

                    {deadlineStatus === 'late_submission_allowed' && (
                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            <div className="font-semibold">Late submission allowed</div>
                            <p className="mt-1 text-sm">The deadline was {assignment.due_at_label}, but your teacher is still accepting submissions.</p>
                        </div>
                    )}

                    {/* Resources */}
                    {resources && resources.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <PaperClipIcon className="w-5 h-5 text-gray-500" /> Learning Resources
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-6"><StudentResources resources={resources} viewUrl={(id) => route('student.assignments.view-resource', id)} downloadUrl={(id) => route('student.assignments.download-resource', id)} onView={(url) => openResource(url, 'viewer')} onDownload={(url) => openResource(url, 'download')} /></div>
                            </div>
                        </div>
                    )}

                    {/* Submission Status */}
                    {submission && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Submission Status</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                            <StatusBadge status={getSubmissionStatusBadge(submission.status)} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Score</div>
                                            <div className="font-medium text-gray-800">
                                                {submission.score !== null ? `${submission.score}/${assignment.total_points}` : 'Not graded yet'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Submitted At</div>
                                            <div className="font-medium text-gray-800">{submission.submitted_at || 'Not submitted'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Method</div>
                                            <div className="font-medium text-gray-800 capitalize">{submission.submission_method || '—'}</div>
                                        </div>
                                    </div>
                                    {submission.feedback && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <h4 className="font-semibold text-gray-800 mb-2">Teacher Feedback</h4>
                                            <div className="text-gray-700 whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                {submission.feedback}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paper-only assignments are confirmed by the teacher, not submitted in the app. */}
                    {canSubmit() && availableMethods.includes('paper') && !availableMethods.includes('digital') && (
                        <div className="mt-6">
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                                <div className="flex items-start gap-3 text-amber-800">
                                    <DocumentTextIcon className="w-6 h-6 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold">Hand in on paper</h3>
                                        <p className="mt-1 text-sm">Complete this assignment on paper and give it to your teacher by the due date. Your teacher will confirm receipt in StudyNest.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Online submission form */}
                    {canSubmit() && availableMethods.includes('digital') && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Turn In Assignment</h3>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {availableMethods.length > 1 && (
                                        <div>
                                            <InputLabel value="Submission Method" required />
                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {availableMethods.includes('digital') && (
                                                    <button type="button" onClick={() => handleMethodSelect('digital')}
                                                        className={`submission-method-option flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                            selectedMethod === 'digital' ? 'is-selected border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                                        }`}>
                                                        <CloudArrowUpIcon className={`w-8 h-8 ${selectedMethod === 'digital' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="submission-method-label mt-2 text-sm font-medium text-gray-700">Digital Upload</span>
                                                    </button>
                                                )}
                                                {availableMethods.includes('paper') && (
                                                    <button type="button" onClick={() => handleMethodSelect('paper')}
                                                        className={`submission-method-option flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                            selectedMethod === 'paper' ? 'is-selected border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                                        }`}>
                                                        <DocumentTextIcon className={`w-8 h-8 ${selectedMethod === 'paper' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="submission-method-label mt-2 text-sm font-medium text-gray-700">Paper-Based</span>
                                                    </button>
                                                )}
                                            </div>
                                            {formErrors.submission_method && <InputError message={formErrors.submission_method} className="mt-2" />}
                                        </div>
                                        )}

                                        {selectedMethod === 'digital' && (
                                            <div>
                                                <InputLabel htmlFor="files" value="Select Files (Max 8 files, 50MB each)" required />
                                                <input id="files" type="file" multiple onChange={handleFileChange}
                                                    className="assignment-file-input mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4" />
                                                {fileErrors.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {fileErrors.map((error, idx) => <p key={idx} className="text-sm text-red-600">{error}</p>)}
                                                    </div>
                                                )}
                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {selectedFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between text-sm text-gray-600 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <PaperClipIcon className="w-4 h-4 text-gray-500" />
                                                                    <span>{file.name}</span>
                                                                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                                                </div>
                                                                <button type="button" onClick={() => setFileIndexToRemove(index)} className="text-red-500 hover:text-red-700" aria-label={`Remove ${file.name}`}>
                                                                    <XCircleIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <p className="text-xs text-gray-500">{selectedFiles.length} of 8 files selected</p>
                                                    </div>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">Accepted: PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG, MP4 (Max 50MB per file)</p>
                                                {formErrors.files && <InputError message={formErrors.files} className="mt-2" />}
                                            </div>
                                        )}

                                        {selectedMethod === 'paper' && (
                                            <div className="paper-submission-notice p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <p className="text-yellow-700">
                                                    <CheckCircleIcon className="inline-block w-5 h-5 mr-2" />
                                                    Hand your completed work directly to your teacher. StudyNest will not mark it as submitted until your teacher confirms receipt.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                            <SecondaryButton type="button" onClick={() => router.visit(route('student.assignments.index'), {
                                                onError: () => toast.error('Unable to return to assignments. Please try again.'),
                                            })}>
                                                Cancel
                                            </SecondaryButton>
                                            {selectedMethod === 'digital' ? (
                                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Submitting...' : 'Turn In Assignment'}
                                                </PrimaryButton>
                                            ) : (
                                                <span className="self-center text-sm text-gray-500">Hand the paper to your teacher to complete submission.</span>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {!canSubmit() && submission && submission.status !== 'returned_for_revision' && (
                        <div className="mt-6">
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
                                <div className="flex items-center gap-3 text-emerald-700">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">{submission.submission_method === 'paper' ? 'Paper Receipt Recorded' : 'Assignment Submitted!'}</div>
                                        <div className="text-sm text-emerald-600">
                                            {submission.status === 'graded' ? 'Your assignment has been graded.' : submission.submission_method === 'paper' ? 'Your teacher confirmed that they received your paper.' : 'Waiting for teacher to review your submission.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                show={confirmingSubmission}
                onClose={() => setConfirmingSubmission(false)}
                onConfirm={submitAssignment}
                title={submission ? 'Resubmit assignment?' : 'Submit assignment?'}
                message={submission ? 'Your new files will replace the previous submission for your teacher to review.' : 'Submit your selected files for your teacher to review?'}
                confirmText={submission ? 'Resubmit' : 'Submit'}
                cancelText="Cancel"
                confirmColor="blue"
            />
            <ConfirmModal
                show={fileIndexToRemove !== null}
                onClose={() => setFileIndexToRemove(null)}
                onConfirm={removeFile}
                title="Remove selected file?"
                message="This file will not be included in your assignment submission."
                confirmText="Remove file"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
