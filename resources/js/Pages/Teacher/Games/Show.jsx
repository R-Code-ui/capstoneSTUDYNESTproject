import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function GamesShow({ game }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            assigned: 'not_started',
            started: 'in_progress',
            completed: 'completed',
        };
        return statusMap[status] || status;
    };

    // 🔧 FIX: Added truncation to student_name column
    const resultsColumns = [
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
            key: 'score',
            label: 'Score',
            render: (row) => row.score !== null ? row.score : '---',
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

    return (
        <AuthenticatedLayout
            header={
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {game.game_title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('teacher.games.results', game.id)}>
                            <SecondaryButton>
                                <ChartBarIcon className="w-4 h-4 mr-1" />
                                Results
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.games.edit', game.id)}>
                            <SecondaryButton>
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Edit
                            </SecondaryButton>
                        </Link>
                        <Link href={route('teacher.games.index')}>
                            <PrimaryButton>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to List
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={game.game_title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{game.grade_level}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Game Type</div>
                                    <div className="font-medium text-gray-800">
                                        {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={game.status} />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Max Attempts</div>
                                    <div className="font-medium text-gray-800">{game.max_attempts}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-800">{game.due_date || 'No deadline'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{game.publish_date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{game.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Game Details ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Game Details</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Game Title</div>
                                    <div className="text-lg font-medium text-gray-800">{game.game_title}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Instructions</div>
                                    <div className="text-gray-700">
                                        {game.game_data?.instructions || 'Follow the instructions to complete the game.'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Game Configuration</div>
                                    <div className="text-gray-600 text-sm">
                                        Type: {game.game_type}
                                        {', '}
                                        Grade: {game.grade_level}
                                        {', '}
                                        Max Attempts: {game.max_attempts}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Results ===== */}
                    {game.results && game.results.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Student Results</h3>
                                </div>
                                <div className="p-6">
                                    <Table
                                        columns={resultsColumns}
                                        rows={game.results}
                                        emptyMessage="No results yet."
                                        hoverable
                                        striped
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
