import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import DeadlineBadge from '@/Components/StatusBadge';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';

// Heroicons
import {
    EyeIcon,
    PencilSquareIcon,
    ChartBarIcon,
    TrashIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function GamesIndex({
    games,
    assigned_grades,
    statuses,
    game_types,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [typeFilter, setTypeFilter] = useState(filters?.game_type || '');
    const [isLoading, setIsLoading] = useState(false);
    const [gameToDelete, setGameToDelete] = useState(null);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'status') setStatusFilter(value);
        if (type === 'grade') setGradeFilter(value);
        if (type === 'type') setTypeFilter(value);

        applyFilters({
            ...(type === 'status' ? { status: value } : {}),
            ...(type === 'grade' ? { grade_level: value } : {}),
            ...(type === 'type' ? { game_type: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.games.index'), {
            data: {
                search,
                status: statusFilter,
                grade_level: gradeFilter,
                game_type: typeFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const deleteGame = () => {
        if (!gameToDelete) return;

        router.delete(route('teacher.games.destroy', gameToDelete.id), {
            preserveState: true,
            onSuccess: () => {
                toast.success('Game deleted successfully.');
                setGameToDelete(null);
            },
            onError: () => toast.error('Unable to delete the game. Please try again.'),
        });
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...statuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const typeOptions = [
        { value: '', label: 'All Types' },
        ...game_types.map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) })),
    ];

    // 🔧 FIX: Added truncation to columns that may overflow
    const columns = [
        {
            key: 'title',
            label: 'Game',
            render: (row) => (
                <div className="max-w-[120px] truncate" title={row.title}>
                    {row.title}
                </div>
            ),
        },
        {
            key: 'grade_level',
            label: 'Grade',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.grade_level}>
                    {row.grade_level}
                </div>
            ),
        },
        {
            key: 'game_type',
            label: 'Type',
            render: (row) => (
                <div className="max-w-[80px] truncate" title={row.game_type?.charAt(0).toUpperCase() + row.game_type?.slice(1)}>
                    {row.game_type?.charAt(0).toUpperCase() + row.game_type?.slice(1)}
                </div>
            ),
        },
        {
            key: 'max_attempts',
            label: 'Attempts',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.max_attempts}>
                    {row.max_attempts}
                </div>
            ),
        },
        {
            key: 'due_date',
            label: 'Due Date',
            render: (row) => (
                <div className="space-y-1" title={row.due_date}>
                    <div className="whitespace-nowrap">{row.due_date || 'No deadline'}</div>
                    {row.deadline_status && <DeadlineBadge status={row.deadline_status} size="sm" />}
                </div>
            ),
        },
        {
            key: 'participants',
            label: 'Participants',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.participants}>
                    {row.participants}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.games.show', row.id)),
        },
        {
            label: 'Edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.games.edit', row.id)),
        },
        {
            label: 'Results',
            icon: <ChartBarIcon className="w-4 h-4" />,
            color: 'success',
            onClick: () => router.visit(route('teacher.games.results', row.id)),
        },
        {
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            color: 'danger',
            onClick: () => setGameToDelete(row),
        },
    ];

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Games</span>}
        >
            <Head title="Games" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search games by title..."
                                        size="md"
                                    />
                                </div>
                                {/* 🔧 FIX: Added items-center to align filters and button vertically */}
                                <div className="flex flex-wrap gap-3 items-center">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={(val) => handleFilterChange('grade', val)}
                                        placeholder="Grade"
                                        size="md"
                                        className="w-36"
                                    />
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-36"
                                    />
                                    <FilterDropdown
                                        options={typeOptions}
                                        value={typeFilter}
                                        onChange={(val) => handleFilterChange('type', val)}
                                        placeholder="Type"
                                        size="md"
                                        className="w-40"
                                    />
                                    {/* 🔧 FIX: Added py-2 and whitespace-nowrap to match filter height */}
                                    <PrimaryButton
                                        onClick={() => router.visit(route('teacher.games.create'))}
                                        className="py-2 whitespace-nowrap"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Assign Game
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={columns}
                                    rows={games}
                                    actions={actions}
                                    emptyMessage="No games assigned. Assign your first game!"
                                    hoverable
                                    striped
                                    pagination={pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={Boolean(gameToDelete)}
                onClose={() => setGameToDelete(null)}
                onConfirm={deleteGame}
                title="Delete game?"
                message={`Delete “${gameToDelete?.title || gameToDelete?.game_title || 'this game'}”? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
