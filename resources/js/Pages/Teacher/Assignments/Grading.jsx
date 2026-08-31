import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import DeadlineBadge from '@/Components/StatusBadge';
import Modal, { ConfirmModal } from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import useDeadlineStatuses from '@/Hooks/useDeadlineStatuses';
import { toast } from 'sonner';

import {
    DocumentIcon,
    ClipboardDocumentListIcon,
    EyeIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentGrading({ assignment, submissions, statistics, pagination }) {
    const getDeadlineStatus = useDeadlineStatuses(assignment);
    const deadlineStatus = getDeadlineStatus(assignment);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showPaperModal, setShowPaperModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ score: '', feedback: '', status: 'graded' });
    const [paperFormData, setPaperFormData] = useState({ score: '', feedback: '' });
    const [errors, setErrors] = useState({});
    const [gradeConfirmation, setGradeConfirmation] = useState(null);

    const handleGrade = (submission) => {
        setSelectedSubmission(submission);
        setFormData({
            score: submission.score || '',
            feedback: submission.feedback || '',
            status: submission.status === 'graded' ? 'graded' : 'graded',
        });
        setShowGradeModal(true);
    };

    const handleMarkPaper = (student) => {
        setSelectedStudent(student);
        setPaperFormData({ score: '', feedback: '' });
        setShowPaperModal(true);
    };

    const submitGrade = (e) => {
        e.preventDefault();
        if (!selectedSubmission?.submission_id) {
            toast.error('Unable to identify this submission. Please reopen the grading form and try again.');
            return;
        }

        setGradeConfirmation({
            type: 'grade',
            submissionId: selectedSubmission.submission_id,
            studentName: selectedSubmission.student_name,
        });
        setShowGradeModal(false);
    };

    const saveGrade = (submissionId) => {
        if (!submissionId) {
            toast.error('Unable to identify this submission. Please try again.');
            return;
        }

        setIsLoading(true);
        router.post(
            route('teacher.assignments.grade.store', [assignment.id, submissionId]),
            { score: formData.score, feedback: formData.feedback, status: formData.status },
            {
                preserveState: true,
                onSuccess: () => { setShowGradeModal(false); setSelectedSubmission(null); setIsLoading(false); toast.success('Grade saved successfully.'); },
                onError: (err) => { setErrors(err); setShowGradeModal(true); setIsLoading(false); toast.error('Please correct the highlighted fields and try again.'); },
            }
        );
    };

    const submitPaper = (e) => {
        e.preventDefault();
        if (!selectedStudent?.student_id) {
            toast.error('Unable to identify this student. Please reopen the paper receipt form and try again.');
            return;
        }

        setGradeConfirmation({
            type: 'paper',
            studentId: selectedStudent.student_id,
            studentName: selectedStudent.student_name,
        });
        setShowPaperModal(false);
    };

    const savePaper = (studentId) => {
        if (!studentId) {
            toast.error('Unable to identify this student. Please try again.');
            return;
        }

        setIsLoading(true);
        router.post(
            route('teacher.assignments.grade.mark-paper', [assignment.id, studentId]),
            { score: paperFormData.score, feedback: paperFormData.feedback },
            {
                preserveState: true,
                onSuccess: () => { setShowPaperModal(false); setSelectedStudent(null); setIsLoading(false); toast.success('Paper receipt recorded successfully.'); },
                onError: (err) => { setErrors(err); setShowPaperModal(true); setIsLoading(false); toast.error('Please correct the highlighted fields and try again.'); },
            }
        );
    };

    const confirmGradeSave = () => {
        const confirmation = gradeConfirmation;
        setGradeConfirmation(null);

        if (confirmation?.type === 'grade') {
            saveGrade(confirmation.submissionId);
            return;
        }

        if (confirmation?.type === 'paper') {
            savePaper(confirmation.studentId);
        }
    };

    const cancelGradeConfirmation = () => {
        const confirmation = gradeConfirmation;
        setGradeConfirmation(null);

        if (confirmation?.type === 'grade') {
            setShowGradeModal(true);
        }

        if (confirmation?.type === 'paper') {
            setShowPaperModal(true);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            not_submitted: 'not_submitted',
            submitted: 'submitted',
            late_submission: 'late_submission',
            reviewed: 'reviewed',
            graded: 'graded',
            returned_for_revision: 'returned_for_revision',
        };
        return map[status] || status;
    };

    const columns = [
        {
            key: 'student_name',
            label: 'Student',
            render: (row) => (
                <div className="min-w-0">
                    <div className="font-medium text-gray-800 truncate max-w-[150px]" title={row.student_name}>
                        {row.student_name}
                    </div>
                </div>
            ),
        },
        {
            key: 'submission_method',
            label: 'Method',
            render: (row) => {
                if (row.submission_method) {
                    return row.submission_method === 'digital' ? 'Online upload' : 'Paper hand-in';
                }
                if (assignment.submission_methods?.includes('digital') && assignment.submission_methods?.includes('paper')) {
                    return 'Online or paper';
                }
                return assignment.submission_methods?.includes('digital') ? 'Online upload' : 'Paper hand-in';
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={getStatusBadge(row.status)} />,
        },
        {
            key: 'score',
            label: 'Score',
            render: (row) => row.score !== null
                ? `${row.score} / ${assignment.total_points}`
                : '—',
        },
        {
            key: 'submitted_at',
            label: 'Submitted',
            render: (row) => row.submitted_at || '—',
        },
        {
            key: 'next_step',
            label: 'Next Step',
            render: (row) => {
                if (row.status === 'not_submitted') {
                    return assignment.submission_methods?.includes('paper')
                        ? 'Awaiting submission or paper receipt'
                        : 'Awaiting online upload';
                }
                if (row.status === 'returned_for_revision') return 'Awaiting resubmission';
                if (row.status === 'graded') return 'Grade recorded';
                return row.submission_method === 'digital' ? 'Review uploaded work' : 'Grade paper hand-in';
            },
        },
    ];

    const actions = (row) => {
        const list = [];

        // A digital assignment cannot be graded until the student uploads work.
        // Paper receipt is recorded by the teacher because the platform cannot verify a physical hand-in.
        if (row.status === 'not_submitted') {
            if (assignment.submission_methods?.includes('paper')) {
                list.push({
                    label: 'Record Paper Received',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    color: 'warning',
                    onClick: () => handleMarkPaper(row),
                });
            }
        } else {
            list.push({
                label: row.submission_method === 'digital' ? 'Review & Grade' : 'Grade Paper',
                icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
                color: 'success',
                onClick: () => handleGrade(row),
            });
        }

        // Single "View Files" button if there are files
        const files = row.files || [];
        if (files.length > 0 || row.file_path) {
            list.push({
                label: 'View Files',
                icon: <EyeIcon className="w-4 h-4" />,
                color: 'primary',
                onClick: () => router.visit(route('teacher.assignments.submission.files', row.submission_id), {
                    onError: () => toast.error('Unable to load the submitted files. Please try again.'),
                }),
            });
        }

        return list;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="assignment-page-clamp text-xl font-semibold leading-tight text-gray-800" title={assignment.title}>
                        Grading: {assignment.title}
                    </span>
                    <SecondaryButton onClick={() => router.visit(route('teacher.assignments.index'), {
                        onError: () => toast.error('Unable to return to assignments. Please try again.'),
                    })}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Assignments
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Grading: ${assignment.title}`} />

            <style>{`
                .assignment-page-clamp {
                    min-width: 0;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className={`mb-6 flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${deadlineStatus === 'expired' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' : deadlineStatus === 'late_submission_allowed' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200' : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>
                        <div>
                            <div className="font-semibold">Assignment deadline: {assignment.due_at_label}</div>
                            <p className="mt-1 text-sm">{deadlineStatus === 'expired' ? 'The due date has passed and new submissions are no longer accepted.' : deadlineStatus === 'late_submission_allowed' ? 'The due date has passed, but late submissions remain available.' : 'Students can submit until the deadline.'}</p>
                        </div>
                        <DeadlineBadge status={deadlineStatus} size="sm" />
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.total_students}</div>
                            <div className="text-sm font-medium text-gray-500">Total Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-emerald-600">{statistics.submitted}</div>
                            <div className="text-sm font-medium text-gray-500">Submitted</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-amber-600">{statistics.pending}</div>
                            <div className="text-sm font-medium text-gray-500">Pending</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.graded}</div>
                            <div className="text-sm font-medium text-gray-500">Graded</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {statistics.average_score ? Math.round(statistics.average_score) : '—'}
                            </div>
                            <div className="text-sm font-medium text-gray-500">Average Score</div>
                        </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6">
                                {isLoading && <LoadingSpinner overlay size="lg" />}

                                <Table
                                    columns={columns}
                                    rows={submissions}
                                    actions={actions}
                                    pagination={pagination}
                                    emptyMessage="No students found for this assignment."
                                    hoverable
                                    striped
                                    responsive
                                    tableClassName="table-fixed"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Grade Modal */}
            <Modal
                show={showGradeModal}
                onClose={() => { setShowGradeModal(false); setSelectedSubmission(null); setErrors({}); }}
                title={`Grade: ${selectedSubmission?.student_name || ''}`}
                size="md"
            >
                <form onSubmit={submitGrade} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="score" value={`Score (out of ${assignment.total_points})`} />
                        <TextInput
                            id="score"
                            type="number"
                            value={formData.score}
                            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                            className="mt-1 block w-full"
                            required
                            min="0"
                            max={assignment.total_points}
                        />
                        <InputError message={errors?.score} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="feedback" value="Feedback (Optional)" />
                        <textarea
                            id="feedback"
                            value={formData.feedback}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                            placeholder="Provide feedback to the student..."
                        />
                        <InputError message={errors?.feedback} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="status" value="Status" />
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                        >
                            <option value="graded">Graded</option>
                            <option value="returned_for_revision">Returned for Revision</option>
                        </select>
                        <InputError message={errors?.status} className="mt-2" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton type="button" onClick={() => { setShowGradeModal(false); setSelectedSubmission(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Grade'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {gradeConfirmation && (
                <ConfirmModal
                    show
                    onClose={cancelGradeConfirmation}
                    onConfirm={confirmGradeSave}
                    title={gradeConfirmation.type === 'grade' ? 'Save this grade?' : 'Record paper grade?'}
                    message={gradeConfirmation.type === 'grade'
                        ? `Save ${formData.score} out of ${assignment.total_points} for ${gradeConfirmation.studentName || 'this student'}?`
                        : `Record the paper result for ${gradeConfirmation.studentName || 'this student'}?`}
                    confirmText={gradeConfirmation.type === 'grade' ? 'Save grade' : 'Record result'}
                    confirmColor="blue"
                />
            )}

            {/* Mark Paper Modal */}
            <Modal
                show={showPaperModal}
                onClose={() => { setShowPaperModal(false); setSelectedStudent(null); setErrors({}); }}
                title={`Record Paper Received: ${selectedStudent?.student_name || ''}`}
                size="md"
            >
                <form onSubmit={submitPaper} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Confirm that you received this student's physical paper. You may record a score now or grade it later.
                    </p>
                    <div>
                        <InputLabel htmlFor="paper_score" value={`Score (out of ${assignment.total_points}) (Optional)`} />
                        <TextInput
                            id="paper_score"
                            type="number"
                            value={paperFormData.score}
                            onChange={(e) => setPaperFormData({ ...paperFormData, score: e.target.value })}
                            className="mt-1 block w-full"
                            min="0"
                            max={assignment.total_points}
                        />
                        <InputError message={errors?.score} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="paper_feedback" value="Feedback (Optional)" />
                        <textarea
                            id="paper_feedback"
                            value={paperFormData.feedback}
                            onChange={(e) => setPaperFormData({ ...paperFormData, feedback: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                            placeholder="Provide feedback..."
                        />
                        <InputError message={errors?.feedback} className="mt-2" />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton type="button" onClick={() => { setShowPaperModal(false); setSelectedStudent(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Record Paper Received'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
