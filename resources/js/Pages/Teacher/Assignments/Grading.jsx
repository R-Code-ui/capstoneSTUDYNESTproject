import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

import {
    DocumentIcon,
    ClipboardDocumentListIcon,
    EyeIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentGrading({ assignment, submissions, statistics }) {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showPaperModal, setShowPaperModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ score: '', feedback: '', status: 'graded' });
    const [paperFormData, setPaperFormData] = useState({ score: '', feedback: '' });
    const [errors, setErrors] = useState({});

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
        setIsLoading(true);
        router.post(
            route('teacher.assignments.grade.store', [assignment.id, selectedSubmission.submission_id]),
            { score: formData.score, feedback: formData.feedback, status: formData.status },
            {
                preserveState: true,
                onSuccess: () => { setShowGradeModal(false); setIsLoading(false); },
                onError: (err) => { setErrors(err); setIsLoading(false); },
            }
        );
    };

    const submitPaper = (e) => {
        e.preventDefault();
        setIsLoading(true);
        router.post(
            route('teacher.assignments.grade.mark-paper', [assignment.id, selectedStudent.student_id]),
            { score: paperFormData.score, feedback: paperFormData.feedback },
            {
                preserveState: true,
                onSuccess: () => { setShowPaperModal(false); setIsLoading(false); },
                onError: (err) => { setErrors(err); setIsLoading(false); },
            }
        );
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
                <div>
                    <div className="font-medium text-gray-800 truncate max-w-[150px]" title={row.student_name}>
                        {row.student_name}
                    </div>
                    <div className="text-xs text-gray-400">
                        Student ID: {row.lrn}
                    </div>
                </div>
            ),
        },
        {
            key: 'submission_method',
            label: 'Method',
            render: (row) => row.submission_method
                ? row.submission_method.charAt(0).toUpperCase() + row.submission_method.slice(1)
                : '—',
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
    ];

    const actions = (row) => {
        const list = [];

        // Grade or Mark Paper
        if (row.status === 'not_submitted') {
            if (assignment.submission_methods?.includes('paper')) {
                list.push({
                    label: 'Mark Paper',
                    icon: <DocumentIcon className="w-4 h-4" />,
                    color: 'warning',
                    onClick: () => handleMarkPaper(row),
                });
            }
        } else {
            list.push({
                label: 'Grade',
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
                onClick: () => router.visit(route('teacher.assignments.submission.files', row.submission_id)),
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
                    <SecondaryButton onClick={() => router.visit(route('teacher.assignments.index'))}>
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
                                    emptyMessage="No students found for this assignment."
                                    hoverable
                                    striped
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

            {/* Mark Paper Modal */}
            <Modal
                show={showPaperModal}
                onClose={() => { setShowPaperModal(false); setSelectedStudent(null); setErrors({}); }}
                title={`Mark Paper Submission: ${selectedStudent?.student_name || ''}`}
                size="md"
            >
                <form onSubmit={submitPaper} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Mark this student's paper-based submission as completed.
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
                            {isLoading ? 'Saving...' : 'Mark as Submitted'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
