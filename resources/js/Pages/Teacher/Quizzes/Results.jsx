import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    ArrowLeftIcon,
    EyeIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export default function QuizResults({ quiz, attempts, statistics, distribution }) {
    const handleExport = () => {
        window.open(route('teacher.quizzes.export', quiz.id), '_blank');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            not_started: 'not_started',
            started: 'in_progress',
            completed: 'completed',
            failed: 'failed',
        };
        return statusMap[status] || status;
    };

    // 🔧 FIX: Added truncation to student_name and lrn columns
    const columns = [
        {
            key: 'student_name',
            label: 'Student',
            render: (row) => (
                <div className="max-w-[120px] truncate" title={row.student_name}>
                    {row.student_name}
                </div>
            ),
        },
        {
            key: 'lrn',
            label: 'Student ID',
            render: (row) => (
                <div className="max-w-[100px] truncate" title={row.lrn}>
                    {row.lrn}
                </div>
            ),
        },
        {
            key: 'score',
            label: 'Score',
            render: (row) => row.score !== null ? `${row.score}/${row.total_questions}` : '---',
        },
        {
            key: 'attempt_number',
            label: 'Attempt',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.attempt_number}>
                    {row.attempt_number}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={getStatusBadge(row.status)} />,
        },
        {
            key: 'completed_at',
            label: 'Completed',
            render: (row) => row.completed_at || '---',
        },
    ];

    const actions = (row) => [
        {
            label: 'View Details',
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => {
                if (row.attempt_id) {
                    router.visit(route('teacher.quizzes.attempt-details', [quiz.id, row.attempt_id]));
                }
            },
        },
    ];

    const distributionColors = {
        '0-20%': 'bg-red-500',
        '21-40%': 'bg-orange-500',
        '41-60%': 'bg-yellow-500',
        '61-80%': 'bg-blue-500',
        '81-100%': 'bg-green-500',
    };

    return (
        <AuthenticatedLayout
            header={
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        Results: {quiz.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <PrimaryButton onClick={handleExport}>
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            Export CSV
                        </PrimaryButton>
                        <SecondaryButton onClick={() => router.visit(route('teacher.quizzes.index'))}>
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Quizzes
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Results: ${quiz.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Statistics ===== */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.total_students}</div>
                            <div className="text-sm font-medium text-gray-500">Total Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-emerald-600">{statistics.total_attempts}</div>
                            <div className="text-sm font-medium text-gray-500">Total Attempts</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.average_score}</div>
                            <div className="text-sm font-medium text-gray-500">Average Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{statistics.passing_rate}%</div>
                            <div className="text-sm font-medium text-gray-500">Passing Rate</div>
                        </div>
                    </div>

                    {/* ===== More Statistics ===== */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-amber-600">{statistics.highest_score}</div>
                            <div className="text-sm font-medium text-gray-500">Highest Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-red-600">{statistics.lowest_score}</div>
                            <div className="text-sm font-medium text-gray-500">Lowest Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-teal-600">{statistics.completion_rate}%</div>
                            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-600">{statistics.max_possible_score}</div>
                            <div className="text-sm font-medium text-gray-500">Max Possible Score</div>
                        </div>
                    </div>

                    {/* ===== Score Distribution ===== */}
                    {Object.keys(distribution).length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Score Distribution</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    {Object.entries(distribution).map(([range, count]) => (
                                        <div key={range}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">{range}</span>
                                                <span className="text-gray-500">{count} students</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4">
                                                <div
                                                    className={`h-4 rounded-full ${distributionColors[range] || 'bg-gray-500'} transition-all duration-500`}
                                                    style={{
                                                        width: `${statistics.total_students > 0 ? (count / statistics.total_students) * 100 : 0}%`,
                                                        minWidth: count > 0 ? '8px' : '0',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Attempts Table ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Student Attempts</h3>
                            </div>
                            <div className="p-6">
                                <Table
                                    columns={columns}
                                    rows={attempts}
                                    actions={actions}
                                    emptyMessage="No attempts found."
                                    hoverable
                                    striped
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
