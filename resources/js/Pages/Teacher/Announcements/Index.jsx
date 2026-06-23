import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

export default function AnnouncementsIndex({
    announcements,
    assigned_grades,
    categories,
    statuses,
    priorities,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'category') setCategoryFilter(value);
        if (type === 'status') setStatusFilter(value);
        if (type === 'grade') setGradeFilter(value);

        applyFilters({
            ...(type === 'category' ? { category: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
            ...(type === 'grade' ? { grade_level: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.announcements.index'), {
            data: {
                search,
                category: categoryFilter,
                status: statusFilter,
                grade_level: gradeFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePublish = (announcement) => {
        if (confirm(`Publish "${announcement.title}"?`)) {
            router.post(route('teacher.announcements.publish', announcement.id), {}, { preserveState: true });
        }
    };

    const handleArchive = (announcement) => {
        if (confirm(`Archive "${announcement.title}"?`)) {
            router.post(route('teacher.announcements.archive', announcement.id), {}, { preserveState: true });
        }
    };

    const handleDelete = (announcement) => {
        if (confirm(`Delete "${announcement.title}"? This action cannot be undone.`)) {
            router.delete(route('teacher.announcements.destroy', announcement.id), { preserveState: true });
        }
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...statuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...categories.map((cat) => ({ value: cat, label: cat })),
    ];

    const gradeOptions = [
        { value: '', label: 'All Audiences' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
        { value: 'all_assigned_students', label: 'All Assigned Students' },
    ];

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'target_audience', label: 'Audience', render: (row) => row.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        { key: 'priority', label: 'Priority', render: (row) => (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                row.priority === 'important' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
                {row.priority?.charAt(0).toUpperCase() + row.priority?.slice(1)}
            </span>
        )},
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'view_count', label: 'Views' },
        { key: 'created_at', label: 'Date Posted' },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: '👁️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.announcements.show', row.id)),
        },
        {
            label: 'Edit',
            icon: '✏️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.announcements.edit', row.id)),
        },
        ...(row.status === 'draft' ? [{
            label: 'Publish',
            icon: '📤',
            color: 'success',
            onClick: () => handlePublish(row),
        }] : []),
        ...(row.status !== 'archived' ? [{
            label: 'Archive',
            icon: '📦',
            color: 'warning',
            onClick: () => handleArchive(row),
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Announcements</h2>}
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search announcements by title or content..."
                                    size="md"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={gradeFilter}
                                    onChange={(val) => handleFilterChange('grade', val)}
                                    placeholder="Audience"
                                    size="md"
                                    className="w-40"
                                />
                                <FilterDropdown
                                    options={categoryOptions}
                                    value={categoryFilter}
                                    onChange={(val) => handleFilterChange('category', val)}
                                    placeholder="Category"
                                    size="md"
                                    className="w-40"
                                />
                                <FilterDropdown
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="Status"
                                    size="md"
                                    className="w-36"
                                />
                                <PrimaryButton onClick={() => router.visit(route('teacher.announcements.create'))}>
                                    + Create Announcement
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={announcements}
                                actions={actions}
                                emptyMessage="No announcements found. Create your first announcement!"
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
