import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

export default function GamesIndex({
    games,
    assigned_grades,
    statuses,
    game_types,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [typeFilter, setTypeFilter] = useState(filters?.game_type || '');
    const [isLoading, setIsLoading] = useState(false);

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

    const handlePublish = (game) => {
        if (confirm(`Publish "${game.title}"?`)) {
            router.post(route('teacher.games.publish', game.id), {}, { preserveState: true });
        }
    };

    const handleDelete = (game) => {
        if (confirm(`Delete "${game.title}"? This action cannot be undone.`)) {
            router.delete(route('teacher.games.destroy', game.id), { preserveState: true });
        }
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

    const columns = [
        { key: 'title', label: 'Game' },
        { key: 'grade_level', label: 'Grade' },
        { key: 'game_type', label: 'Type', render: (row) => row.game_type?.charAt(0).toUpperCase() + row.game_type?.slice(1) },
        { key: 'max_attempts', label: 'Attempts' },
        { key: 'due_date', label: 'Due Date', render: (row) => row.due_date || '—' },
        { key: 'participants', label: 'Participants' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: '👁️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.games.show', row.id)),
        },
        {
            label: 'Edit',
            icon: '✏️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.games.edit', row.id)),
        },
        {
            label: 'Results',
            icon: '📊',
            color: 'success',
            onClick: () => router.visit(route('teacher.games.results', row.id)),
        },
        ...(row.status === 'draft' ? [{
            label: 'Publish',
            icon: '📤',
            color: 'success',
            onClick: () => handlePublish(row),
        }] : []),
        {
            label: 'Delete',
            icon: '🗑️',
            color: 'danger',
            onClick: () => handleDelete(row),
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Games</h2>}
        >
            <Head title="Games" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
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
                            <div className="flex flex-wrap gap-3">
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
                                <PrimaryButton onClick={() => router.visit(route('teacher.games.create'))}>
                                    + Assign Game
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
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
