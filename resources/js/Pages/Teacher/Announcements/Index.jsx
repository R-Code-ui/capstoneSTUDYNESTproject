import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

// Heroicons
import {
    EyeIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    TrashIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    UserIcon,
    BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

export default function AnnouncementsIndex({
    announcements,
    assigned_grades,
    categories,
    statuses,
    priorities,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [authorFilter, setAuthorFilter] = useState(filters?.author || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'category') setCategoryFilter(value);
        if (type === 'status') setStatusFilter(value);
        if (type === 'grade') setGradeFilter(value);
        if (type === 'author') setAuthorFilter(value);

        applyFilters({
            ...(type === 'category' ? { category: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
            ...(type === 'grade' ? { grade_level: value } : {}),
            ...(type === 'author' ? { author: value } : {}),
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
                author: authorFilter,
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

    const authorOptions = [
        { value: '', label: 'All Authors' },
        { value: 'me', label: 'My Announcements' },
        { value: 'principal', label: 'Principal' },
    ];

    // 🔧 FIX: Columns with truncation
    const columns = [
        {
            key: 'title',
            label: 'Title',
            render: (row) => (
                <div className="max-w-[120px] truncate" title={row.title}>
                    {row.title}
                </div>
            ),
        },
        {
            key: 'target_audience',
            label: 'Audience',
            render: (row) => (
                <div className="max-w-[100px] truncate" title={row.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                    {row.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
            ),
        },
        {
            key: 'posted_by',
            label: 'Posted By',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.is_principal ? (
                        <>
                            <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600 font-medium">Principal</span>
                        </>
                    ) : (
                        <>
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Teacher</span>
                        </>
                    )}
                </div>
            )
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    row.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {row.priority?.charAt(0).toUpperCase() + row.priority?.slice(1)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'created_at',
            label: 'Date Posted',
            render: (row) => (
                <div className="max-w-[100px] truncate" title={row.created_at}>
                    {row.created_at}
                </div>
            ),
        },
        // 🔧 FIX: Custom Actions column with horizontal buttons
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
                const actionButtons = [];

                // View
                actionButtons.push(
                    <button
                        key="view"
                        onClick={() => router.visit(route('teacher.announcements.show', row.id))}
                        className="inline-flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="View announcement"
                        title="View"
                    >
                        <EyeIcon className="w-3.5 h-3.5" />
                    </button>
                );

                // Edit
                actionButtons.push(
                    <button
                        key="edit"
                        onClick={() => router.visit(route('teacher.announcements.edit', row.id))}
                        className="inline-flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Edit announcement"
                        title="Edit"
                    >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                    </button>
                );

                // Publish (only if draft)
                if (row.status === 'draft') {
                    actionButtons.push(
                        <button
                            key="publish"
                            onClick={() => handlePublish(row)}
                            className="inline-flex h-8 w-8 items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            aria-label="Publish announcement"
                            title="Publish"
                        >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                        </button>
                    );
                }

                // Archive (only if not archived)
                if (row.status !== 'archived') {
                    actionButtons.push(
                        <button
                            key="archive"
                            onClick={() => handleArchive(row)}
                        className="inline-flex h-8 w-8 items-center justify-center text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        aria-label="Archive announcement"
                            title="Archive"
                        >
                            <ArchiveBoxIcon className="w-3.5 h-3.5" />
                        </button>
                    );
                }

                // Delete
                actionButtons.push(
                    <button
                        key="delete"
                        onClick={() => handleDelete(row)}
                        className="inline-flex h-8 w-8 items-center justify-center text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Delete announcement"
                        title="Delete"
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                );

                return (
                    <div className="flex flex-nowrap items-center gap-1">
                        {actionButtons}
                    </div>
                );
            }
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">My Announcements</span>
                    <PrimaryButton onClick={() => router.visit(route('teacher.announcements.create'))}>
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Create Announcement
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
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
                                    <FilterDropdown
                                        options={authorOptions}
                                        value={authorFilter}
                                        onChange={(val) => handleFilterChange('author', val)}
                                        placeholder="Author"
                                        size="md"
                                        className="w-40"
                                    />
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={columns}
                                    rows={announcements}
                                    emptyMessage="No announcements found. Create your first announcement!"
                                    hoverable
                                    striped
                                    pagination={pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
