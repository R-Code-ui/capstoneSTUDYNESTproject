import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
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

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Games</span>}
        >
            <Head title="Games" />

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
                            {/* Filters */}
                            <div onFocusCapture={keepFocusedFieldVisible} className="space-y-3">
                                <div className="min-w-0">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search games by title..."
                                        size="md"
                                    />
                                </div>
                                {/* 🔧 FIX: Added items-center to align filters and button vertically */}
                                <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={(val) => handleFilterChange('grade', val)}
                                        placeholder="Grade"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={typeOptions}
                                        value={typeFilter}
                                        onChange={(val) => handleFilterChange('type', val)}
                                        placeholder="Type"
                                        size="md"
                                        className="w-full"
                                    />
                                    {/* 🔧 FIX: Added py-2 and whitespace-nowrap to match filter height */}
                                    <PrimaryButton
                                        onClick={() => router.visit(route('teacher.games.create'))}
                                        className="min-h-11 w-full justify-center whitespace-nowrap xl:col-auto xl:w-auto"
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
                                    compact
                                    responsive
                                    responsiveAt="tablet"
                                    actionsClassName="flex-nowrap"
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
