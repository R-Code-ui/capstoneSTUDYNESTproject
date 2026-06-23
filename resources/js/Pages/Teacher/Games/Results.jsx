import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function GameResults({ game, results, statistics }) {
    const handleExport = () => {
        window.open(route('teacher.games.export', game.id), '_blank');
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            assigned: 'not_started',
            started: 'in_progress',
            completed: 'completed',
        };
        return statusMap[status] || status;
    };

    const columns = [
        { key: 'student_name', label: 'Student' },
        { key: 'lrn', label: 'LRN' },
        { key: 'score', label: 'Score', render: (row) => row.score !== null ? row.score : '—' },
        { key: 'attempt_number', label: 'Attempt' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={getStatusBadge(row.status)} /> },
        { key: 'completed_at', label: 'Completed', render: (row) => row.completed_at || '—' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Game Results: {game.title}
                    </h2>
                    <div className="flex gap-2">
                        <PrimaryButton onClick={handleExport}>📥 Export CSV</PrimaryButton>
                        <SecondaryButton onClick={() => router.visit(route('teacher.games.show', game.id))}>
                            Back to Game
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Results: ${game.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Statistics ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.total_students}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{statistics.assigned}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Assigned</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{statistics.started}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Started</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.completed}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                        </Card>
                    </div>

                    {/* ===== More Statistics ===== */}
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{statistics.participation_rate}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Participation Rate</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.average_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.highest_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Highest Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.lowest_score}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Lowest Score</div>
                        </Card>
                    </div>

                    {/* ===== Results Table ===== */}
                    <div className="mt-6">
                        <Card title="Student Participation">
                            <Table
                                columns={columns}
                                rows={results}
                                emptyMessage="No results found."
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
