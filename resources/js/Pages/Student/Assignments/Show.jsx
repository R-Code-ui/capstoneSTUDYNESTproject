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
            if (file.size > 2 * 1024 * 1024) {
                alert('File size exceeds 2MB limit. Please upload a smaller file.');
                e.target.value = '';
                return;
            }
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
                router.reload();
            },
        });
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf_module':
                return <DocumentIcon className="w-6 h-6 text-red-500" />;
            case 'image':
                return <PhotoIcon className="w-6 h-6 text-emerald-500" />;
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
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {assignment.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                {submission && (
                                    <StatusBadge status={getSubmissionStatusBadge(submission.status)} />
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 break-words">
                                {assignment.title}
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClipboardDocumentListIcon className="w-4 h-4" />
                                        Total Points
                                    </div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.total_points}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Due Date
                                    </div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.due_date || 'No due date'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        Due Time
                                    </div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.due_time || 'No time specified'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        Late Submission
                                    </div>
                                    <div className="font-medium text-gray-800">
                                        {assignment.allow_late_submission ? 'Allowed' : 'Not Allowed'}
                                    </div>
                                </div>
                            </div>

                            {/* ===== Instructions ===== */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Instructions</h4>
                                <div className="text-gray-700 whitespace-pre-wrap break-words">
                                    {assignment.instructions}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Learning Resources ===== */}
                    {resources && resources.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <PaperClipIcon className="w-5 h-5 text-gray-500" />
                                        Learning Resources
                                    </h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-3"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getResourceIcon(resource.type)}
                                                <div>
                                                    <div className="font-medium text-gray-800 break-words">
                                                        {resource.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getResourceLabel(resource.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(resource.id)}
                                                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shrink-0"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Submission Status ===== */}
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
                                            <div className="font-medium text-gray-800">
                                                {submission.submitted_at || 'Not submitted'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Submission Method</div>
                                            <div className="font-medium text-gray-800 capitalize">
                                                {submission.submission_method || '—'}
                                            </div>
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

                    {/* ===== Submission Form ===== */}
                    {canSubmit() && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Submit Assignment</h3>
                                </div>
                                <div className="p-6">
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
                                                                ? 'border-blue-600 bg-blue-50'
                                                                : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <CloudArrowUpIcon className={`w-8 h-8 ${selectedMethod === 'digital' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="mt-2 text-sm font-medium text-gray-700">Digital Upload</span>
                                                    </button>
                                                )}
                                                {assignment.submission_methods && assignment.submission_methods.includes('photo') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMethodSelect('photo')}
                                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                            selectedMethod === 'photo'
                                                                ? 'border-blue-600 bg-blue-50'
                                                                : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <CameraIcon className={`w-8 h-8 ${selectedMethod === 'photo' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="mt-2 text-sm font-medium text-gray-700">Photo Upload</span>
                                                    </button>
                                                )}
                                                {assignment.submission_methods && assignment.submission_methods.includes('paper') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMethodSelect('paper')}
                                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition ${
                                                            selectedMethod === 'paper'
                                                                ? 'border-blue-600 bg-blue-50'
                                                                : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <DocumentTextIcon className={`w-8 h-8 ${selectedMethod === 'paper' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="mt-2 text-sm font-medium text-gray-700">Paper-Based</span>
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
                                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                                                />
                                                {selectedFile && (
                                                    <div className="mt-2 text-sm text-emerald-600">
                                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                    </div>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Accepted: PDF, DOCX, JPG, JPEG, PNG (Max 2MB)
                                                </p>
                                                <InputError message={errors.file} className="mt-2" />
                                            </div>
                                        )}

                                        {selectedMethod === 'paper' && (
                                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <p className="text-yellow-700">
                                                    <CheckCircleIcon className="inline-block w-5 h-5 mr-2" />
                                                    Submit your work directly to your teacher. They will mark it as submitted.
                                                </p>
                                            </div>
                                        )}

                                        {/* ===== Submit Button ===== */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                            <SecondaryButton type="button" onClick={() => router.visit(route('student.assignments.index'))}>
                                                Cancel
                                            </SecondaryButton>
                                            <PrimaryButton type="submit" disabled={isSubmitting || !selectedMethod}>
                                                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                                            </PrimaryButton>
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
                                        <div className="font-semibold">Assignment Submitted!</div>
                                        <div className="text-sm text-emerald-600">
                                            {submission.status === 'graded' ? 'Your assignment has been graded.' : 'Waiting for teacher to review your submission.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
