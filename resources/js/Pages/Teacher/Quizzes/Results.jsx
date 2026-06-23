import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

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

    const columns = [
        { key: 'student_name', label: 'Student' },
        { key: 'lrn', label: 'LRN' },
        { key: 'score', label: 'Score', render: (row) => row.score !== null ? `${row.score}/${row.total_questions}` : '—' },
        { key: 'attempt_number', label: 'Attempt' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={getStatusBadge(row.status)} /> },
        { key: 'completed_at', label: 'Completed', render: (row) => row.completed_at || '—' },
    ];

    const actions = (row) => [
        {
            label: 'View Details',
            icon: '👁️',
            color: 'primary',
            onClick: () => {
                if (row.attempt_id) {
                    router.visit(route('teacher.quizzes.attempt-details', [quiz.id, row.attempt_id]));
                }
            },
        },
    ];

    // Distribution colors
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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Results: {quiz.title}
                    </h2>
                    <div className="flex gap-2">
                        <PrimaryButton onClick={handleExport}>📥 Export CSV</PrimaryButton>
                        <SecondaryButton onClick={() => router.visit(route('teacher.quizzes.show', quiz.id))}>
                            Back to Quiz
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Results: ${quiz.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Statistics ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.total_students}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.total_attempts}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.average_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{statistics.passing_rate}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Passing Rate</div>
                        </Card>
                    </div>

                    {/* ===== More Statistics ===== */}
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{statistics.highest_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Highest Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.lowest_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Lowest Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{statistics.completion_rate}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statistics.max_possible_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Max Possible Score</div>
                        </Card>
                    </div>

                    {/* ===== Score Distribution ===== */}
                    {Object.keys(distribution).length > 0 && (
                        <div className="mt-6">
                            <Card title="Score Distribution">
                                <div className="space-y-3">
                                    {Object.entries(distribution).map(([range, count]) => (
                                        <div key={range}>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">{range}</span>
                                                <span className="text-gray-500 dark:text-gray-400">{count} students</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
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
                            </Card>
                        </div>
                    )}

                    {/* ===== Attempts Table ===== */}
                    <div className="mt-6">
                        <Card title="Student Attempts">
                            <Table
                                columns={columns}
                                rows={attempts}
                                actions={actions}
                                emptyMessage="No attempts found."
                                hoverable
                                striped
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
