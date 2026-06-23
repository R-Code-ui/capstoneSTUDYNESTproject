import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function GamesShow({ game }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            assigned: 'not_started',
            started: 'in_progress',
            completed: 'completed',
        };
        return statusMap[status] || status;
    };

    const resultsColumns = [
        { key: 'student_name', label: 'Student' },
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
                        {game.game_title}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('teacher.games.results', game.id)}>
                            <SecondaryButton>📊 Results</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.games.edit', game.id)}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.games.index')}>
                            <PrimaryButton>Back to List</PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={game.game_title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <Card>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                <div className="font-medium text-gray-900 dark:text-white">{game.grade_level}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Game Type</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                    {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge status={game.status} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Max Attempts</div>
                                <div className="font-medium text-gray-900 dark:text-white">{game.max_attempts}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{game.due_date || 'No deadline'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Publish Date</div>
                                <div className="font-medium text-gray-900 dark:text-white">{game.publish_date}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Created At</div>
                                <div className="font-medium text-gray-900 dark:text-white">{game.created_at}</div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Game Details ===== */}
                    <div className="mt-6">
                        <Card title="Game Details">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Game Title</div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-white">{game.game_title}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Instructions</div>
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {game.game_data?.instructions || 'Follow the instructions to complete the game.'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Game Configuration</div>
                                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                                        Type: {game.game_type}
                                        {', '}
                                        Grade: {game.grade_level}
                                        {', '}
                                        Max Attempts: {game.max_attempts}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Results ===== */}
                    {game.results && game.results.length > 0 && (
                        <div className="mt-6">
                            <Card title="Student Results">
                                <Table
                                    columns={resultsColumns}
                                    rows={game.results}
                                    emptyMessage="No results yet."
                                    hoverable
                                    striped
                                />
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
