import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';

// Heroicons
import {
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function GameResults({ game, results, pagination, statistics }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            assigned: 'not_started',
            started: 'in_progress',
            completed: 'completed',
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
                        Game Results: {game.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <SecondaryButton onClick={() => router.visit(route('teacher.games.index'), {
                            onError: () => toast.error('Unable to return to games. Please try again.'),
                        })}>
                            <ArrowLeftIcon className="w-4 h-4 mr-1" />
                            Back to Games
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Results: ${game.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Statistics ===== */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.total_students}</div>
                            <div className="text-sm font-medium text-gray-500">Total Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-600">{statistics.assigned}</div>
                            <div className="text-sm font-medium text-gray-500">Assigned</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-amber-600">{statistics.started}</div>
                            <div className="text-sm font-medium text-gray-500">Started</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-emerald-600">{statistics.completed}</div>
                            <div className="text-sm font-medium text-gray-500">Completed</div>
                        </div>
                    </div>

                    {/* ===== More Statistics ===== */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{statistics.participation_rate}%</div>
                            <div className="text-sm font-medium text-gray-500">Participation Rate</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.average_score}</div>
                            <div className="text-sm font-medium text-gray-500">Average Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-emerald-600">{statistics.highest_score}</div>
                            <div className="text-sm font-medium text-gray-500">Highest Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-red-600">{statistics.lowest_score}</div>
                            <div className="text-sm font-medium text-gray-500">Lowest Score</div>
                        </div>
                    </div>

                    {/* ===== Results Table ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Student Participation</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <Table
                                        columns={columns}
                                        rows={results}
                                        emptyMessage="No results found."
                                        hoverable
                                        striped
                                        pagination={pagination}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
