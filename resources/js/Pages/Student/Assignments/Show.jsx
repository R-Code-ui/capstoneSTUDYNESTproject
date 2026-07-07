import { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import LoadingSpinner from '@/Components/LoadingSpinner';

// Heroicons
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentIcon,
    PhotoIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    CameraIcon,
    CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsShow({ assignment, resources, submission }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('');

    const { data, setData, errors, post } = useForm({
        submission_method: '',
        file: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit. Please upload a smaller file.');
                e.target.value = '';
                return;
            }
            // Check file type
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert('File type not allowed. Please upload PDF, DOCX, JPG, JPEG, or PNG.');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setData('file', file);
        }
    };

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setData('submission_method', method);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedMethod) {
            alert('Please select a submission method.');
            return;
        }

        if ((selectedMethod === 'digital' || selectedMethod === 'photo') && !selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('submission_method', selectedMethod);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        post(route('student.assignments.submit', assignment.id), {
            data: formData,
            forceFormData: true,
            preserveState: true,
            onFinish: () => {
                setIsSubmitting(false);
                // Refresh the page to show updated submission status
                router.reload();
            },
        });
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module':
                return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image':
                return <PhotoIcon className="w-6 h-6 text-green-500" />;
            case 'worksheet':
                return <PaperClipIcon className="w-6 h-6 text-blue-500" />;
            default:
                return <PaperClipIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    const getResourceLabel = (type) => {
        const labels = {
            pdf_module: 'PDF Module',
            worksheet: 'Worksheet',
            image: 'Image',
        };
        return labels[type] || type;
    };

    const getSubmissionStatusBadge = (status) => {
        const statusMap = {
            not_submitted: 'not_started',
            submitted: 'submitted',
            late_submission: 'late_submission',
            reviewed: 'reviewed',
            graded: 'graded',
            returned_for_revision: 'returned_for_revision',
        };
        return statusMap[status] || status;
    };

    const canSubmit = () => {
        if (!submission) return true;
        return submission.status === 'returned_for_revision' || submission.status === 'not_submitted';
    };

    const handleDownload = (resourceId) => {
        window.open(route('student.assignments.download-resource', resourceId), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {assignment.title}
                    </span>
                    <SecondaryButton onClick={() => router.visit(route('student.assignments.index'))}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Assignments
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={assignment.title} />

            <div className="py-4">
                <div className="mx-auto max-w-4xl">
                    {isSubmitting && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Assignment Information ===== */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {assignment.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {submission && (
                                    <StatusBadge status={getSubmissionStatusBadge(submission.status)} />
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {assignment.title}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClipboardDocumentListIcon className="w-4 h-4" />
                                        Total Points
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {assignment.total_points}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Due Date
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {assignment.due_date || 'No due date'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        Due Time
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {assignment.due_time || 'No time specified'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        Late Submission
                                    </div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}
                                    </div>
                                </div>
                            </div>

                            {/* ===== Instructions ===== */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {assignment.instructions}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Learning Resources ===== */}
                    {resources && resources.length > 0 && (
                        <div className="mt-6">
                            <Card title={
                                <div className="flex items-center gap-2">
                                    <PaperClipIcon className="w-5 h-5 text-gray-500" />
                                    Learning Resources
                                </div>
                            }>
                                <div className="space-y-3">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getResourceIcon(resource.type)}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {resource.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {getResourceLabel(resource.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(resource.id)}
                                                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Submission Status ===== */}
                    {submission && (
                        <div className="mt-6">
                            <Card title="Submission Status">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                            <StatusBadge status={getSubmissionStatusBadge(submission.status)} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {submission.score !== null ? `${submission.score}/${assignment.total_points}` : 'Not graded yet'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Submitted At</div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {submission.submitted_at || 'Not submitted'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Submission Method</div>
                                            <div className="font-medium text-gray-900 dark:text-white capitalize">
                                                {submission.submission_method || '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {submission.feedback && (
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Teacher Feedback</h4>
                                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                {submission.feedback}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Submission Form ===== */}
                    {canSubmit() && (
                        <div className="mt-6">
                            <Card title="Submit Assignment">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* ===== Submission Method ===== */}
                                    <div>
                                        <InputLabel value="Submission Method" required />
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {assignment.submission_methods && assignment.submission_methods.includes('digital') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMethodSelect('digital')}
                                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                        selectedMethod === 'digital'
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <CloudArrowUpIcon className={`w-8 h-8 ${selectedMethod === 'digital' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                    <span className="mt-2 text-sm font-medium">Digital Upload</span>
                                                </button>
                                            )}
                                            {assignment.submission_methods && assignment.submission_methods.includes('photo') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMethodSelect('photo')}
                                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                        selectedMethod === 'photo'
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <CameraIcon className={`w-8 h-8 ${selectedMethod === 'photo' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                    <span className="mt-2 text-sm font-medium">Photo Upload</span>
                                                </button>
                                            )}
                                            {assignment.submission_methods && assignment.submission_methods.includes('paper') && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleMethodSelect('paper')}
                                                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                        selectedMethod === 'paper'
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <DocumentTextIcon className={`w-8 h-8 ${selectedMethod === 'paper' ? 'text-blue-500' : 'text-gray-400'}`} />
                                                    <span className="mt-2 text-sm font-medium">Paper-Based</span>
                                                </button>
                                            )}
                                        </div>
                                        <InputError message={errors.submission_method} className="mt-2" />
                                    </div>

                                    {/* ===== File Upload ===== */}
                                    {(selectedMethod === 'digital' || selectedMethod === 'photo') && (
                                        <div>
                                            <InputLabel htmlFor="file" value="Select File (PDF, DOCX, JPG, JPEG, PNG - Max 2MB)" required />
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                                accept=".pdf,.docx,.jpg,.jpeg,.png"
                                            />
                                            {selectedFile && (
                                                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                </div>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Accepted: PDF, DOCX, JPG, JPEG, PNG (Max 2MB)
                                            </p>
                                            <InputError message={errors.file} className="mt-2" />
                                        </div>
                                    )}

                                    {selectedMethod === 'paper' && (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-yellow-700 dark:text-yellow-300">
                                                <CheckCircleIcon className="inline-block w-5 h-5 mr-2" />
                                                Submit your work directly to your teacher. They will mark it as submitted.
                                            </p>
                                        </div>
                                    )}

                                    {/* ===== Submit Button ===== */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <SecondaryButton type="button" onClick={() => router.visit(route('student.assignments.index'))}>
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton type="submit" disabled={isSubmitting || !selectedMethod}>
                                            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {!canSubmit() && submission && submission.status !== 'returned_for_revision' && (
                        <div className="mt-6">
                            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Assignment Submitted!</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">
                                            {submission.status === 'graded' ? 'Your assignment has been graded.' : 'Waiting for teacher to review your submission.'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
