import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'sonner';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    ChartBarIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function GamesShow({ game }) {
    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');
    const getStatusBadge = (status) => {
        const statusMap = {
            assigned: 'not_started',
            started: 'in_progress',
            completed: 'completed',
        };
        return statusMap[status] || status;
    };

    // Results table columns
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
                <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Link
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            href={route('teacher.games.index')}
                            onError={handleNavigationError}
                            aria-label="Back to Games"
                            title="Back to Games"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Link>
                        <span className="game-show-title min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-800" title={game.game_title}>
                            {game.game_title}
                        </span>
                    </div>
                    <div className="flex w-full flex-row flex-wrap justify-end gap-2 xl:ml-auto xl:w-auto xl:shrink-0">
                        <Link className="w-auto" href={route('teacher.games.results', game.id)} onError={handleNavigationError}>
                            <SecondaryButton className="min-h-11 w-auto justify-center">
                                <ChartBarIcon className="mr-1 h-4 w-4" />
                                View Results
                            </SecondaryButton>
                        </Link>
                        <Link className="w-auto" href={route('teacher.games.edit', game.id)} onError={handleNavigationError}>
                            <PrimaryButton className="min-h-11 w-auto justify-center">
                                <PencilSquareIcon className="mr-1 h-4 w-4" />
                                Edit Game
                            </PrimaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={game.game_title} />

            <style>{`
                .game-show-title {
                    min-width: 0;
                    max-width: min(100%, 48rem);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Basic Information ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Grade Level</div>
                                    <div className="font-medium text-gray-800">{game.grade_level}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Game Type</div>
                                    <div className="font-medium text-gray-800">
                                        {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Status</div>
                                    <StatusBadge status={game.status} />
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Max Attempts</div>
                                    <div className="font-medium text-gray-800">{game.max_attempts}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</div>
                                    <div className="font-medium text-gray-800">{game.due_date || 'No deadline'}</div>
                                </div>
                                {game.deadline_status && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Deadline</div>
                                        <StatusBadge status={game.deadline_status} size="sm" />
                                    </div>
                                )}
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{game.publish_date}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Created At</div>
                                    <div className="font-medium text-gray-800">{game.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Game Details ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-sm font-semibold text-gray-700">Game Details</h3>
                            </div>
                            <div className="space-y-3 p-4 sm:p-6">
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
                                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <h3 className="text-sm font-semibold text-gray-700">Student Results</h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <Table
                                        columns={resultsColumns}
                                        rows={game.results}
                                        emptyMessage="No results yet."
                                        hoverable
                                        striped
                                        responsive
                                        responsiveAt="tablet"
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
