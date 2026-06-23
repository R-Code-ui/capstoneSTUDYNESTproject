import { useState, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function AssignmentsShow({ assignment, submission }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submissionMethod, setSubmissionMethod] = useState('digital');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const getStatusColor = (status) => {
        const colors = {
            not_submitted: 'text-gray-500 dark:text-gray-400',
            submitted: 'text-blue-600 dark:text-blue-400',
            late_submission: 'text-yellow-600 dark:text-yellow-400',
            reviewed: 'text-purple-600 dark:text-purple-400',
            graded: 'text-green-600 dark:text-green-400',
            returned_for_revision: 'text-red-600 dark:text-red-400',
        };
        return colors[status] || colors.not_submitted;
    };

    const getStatusLabel = (status) => {
        const labels = {
            not_submitted: 'Not Submitted',
            submitted: 'Submitted',
            late_submission: 'Late Submission',
            reviewed: 'Reviewed',
            graded: 'Graded',
            returned_for_revision: 'Returned for Revision',
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const labels = {
            homework: 'Homework',
            worksheet: 'Worksheet',
            performance_task: 'Performance Task',
            project: 'Project',
            reflection_activity: 'Reflection Activity',
            practice_exercise: 'Practice Exercise',
            reading_assignment: 'Reading Assignment',
        };
        return labels[type] || type;
    };

    const getResourceIcon = (type) => {
        const icons = {
            pdf_module: '📄',
            worksheet: '📝',
            image: '🖼️',
        };
        return icons[type] || '📎';
    };

    const getResourceLabel = (type) => {
        const labels = {
            pdf_module: 'PDF Module',
            worksheet: 'Worksheet',
            image: 'Image',
        };
        return labels[type] || type;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrors({ file: 'File size must be less than 10MB.' });
                setSelectedFile(null);
                return;
            }
            setErrors({});
            setSelectedFile(file);
        }
    };

    const handleSubmitDigital = (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setErrors({ file: 'Please select a file to upload.' });
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('submission_method', submissionMethod);

        router.post(route('student.assignments.submit', assignment.id), formData, {
            forceFormData: true,
            preserveState: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onError: (err) => {
                setIsSubmitting(false);
                setErrors(err);
            },
        });
    };

    const handleMarkPaper = () => {
        if (confirm('Submit this assignment as paper-based?')) {
            setIsSubmitting(true);
            router.post(route('student.assignments.mark-paper', assignment.id), {}, {
                preserveState: true,
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleDownloadResource = (resourceId) => {
        // Implement download logic if needed
        alert('Download feature coming soon.');
    };

    const isSubmitted = submission && submission.status !== 'not_submitted';
    const canSubmit = !isSubmitted && assignment.submission_methods?.length > 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {assignment.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.assignments.index'))}>
                        Back to Assignments
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={assignment.title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Assignment Information ===== */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {assignment.subject}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {getTypeLabel(assignment.type)}
                                </span>
                                {isSubmitted && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}>
                                        ✅ Submitted
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    📅 Due: {assignment.due_date} at {assignment.due_time}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {assignment.title}
                                </h3>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Total Points: <span className="font-medium text-gray-900 dark:text-white">{assignment.total_points}</span>
                                </span>
                                {isSubmitted && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Status: <span className={`font-medium ${getStatusColor(submission.status)}`}>
                                            {getStatusLabel(submission.status)}
                                        </span>
                                    </span>
                                )}
                                {isSubmitted && submission.score !== null && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Score: <span className="font-medium text-green-600 dark:text-green-400">{submission.score}/{assignment.total_points}</span>
                                    </span>
                                )}
                                {assignment.allow_late_submission && (
                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                        ⏰ Late submissions allowed
                                    </span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {assignment.instructions}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Learning Resources ===== */}
                    {assignment.resources && assignment.resources.length > 0 && (
                        <div className="mt-6">
                            <Card title="📎 Learning Resources">
                                <div className="space-y-3">
                                    {assignment.resources.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{getResourceIcon(resource.type)}</span>
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
                                                onClick={() => handleDownloadResource(resource.id)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ===== Submission Section ===== */}
                    <div className="mt-6">
                        {isSubmitted ? (
                            // Already Submitted
                            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                            <div className="font-semibold">Assignment Submitted!</div>
                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                Submitted on {submission.submitted_at}
                                            </div>
                                        </div>
                                    </div>
                                    {submission.feedback && (
                                        <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">Feedback:</div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                {submission.feedback}
                                            </div>
                                        </div>
                                    )}
                                    {submission.file_name && (
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            📎 File: {submission.file_name}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            // Not Submitted - Show Submission Methods
                            <Card title="📤 Submit Assignment">
                                {isSubmitting && <LoadingSpinner overlay size="lg" />}

                                {assignment.submission_methods?.includes('digital') && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Digital / Photo Upload</h4>
                                        <form onSubmit={handleSubmitDigital} className="space-y-4">
                                            <div>
                                                <InputLabel value="Upload File" />
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                                                    disabled={isSubmitting}
                                                />
                                                {selectedFile && (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                    </p>
                                                )}
                                                <InputError message={errors.file} className="mt-2" />
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Accepted: PDF, DOCX, JPG, JPEG, PNG (Max 10MB)
                                                </p>
                                            </div>

                                            <div>
                                                <InputLabel value="Submission Method" />
                                                <select
                                                    value={submissionMethod}
                                                    onChange={(e) => setSubmissionMethod(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="digital">Digital Upload</option>
                                                    <option value="photo">Photo Upload</option>
                                                </select>
                                            </div>

                                            <PrimaryButton type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? 'Uploading...' : 'Submit Assignment'}
                                            </PrimaryButton>
                                        </form>
                                    </div>
                                )}

                                {assignment.submission_methods?.includes('paper') && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Paper-Based Submission</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            Complete your work on paper and submit it directly to your teacher.
                                        </p>
                                        <SecondaryButton onClick={handleMarkPaper} disabled={isSubmitting}>
                                            📄 Mark as Paper Submission
                                        </SecondaryButton>
                                    </div>
                                )}

                                {(!assignment.submission_methods || assignment.submission_methods.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No submission methods available for this assignment.
                                    </p>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
