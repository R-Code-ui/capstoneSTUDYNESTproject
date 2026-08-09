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
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    TrashIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsIndex({
    assignments,
    assigned_grades,
    statuses,
    assignment_types,
    trimesters,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [typeFilter, setTypeFilter] = useState(filters?.assignment_type || '');
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
            ...(type === 'type' ? { assignment_type: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.assignments.index'), {
            data: {
                search,
                status: statusFilter,
                grade_level: gradeFilter,
                assignment_type: typeFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePublish = (assignment) => {
        if (confirm(`Publish "${assignment.title}"?`)) {
            router.post(route('teacher.assignments.publish', assignment.id), {}, { preserveState: true });
        }
    };

    const handleDelete = (assignment) => {
        if (confirm(`Delete "${assignment.title}"? This action cannot be undone.`)) {
            router.delete(route('teacher.assignments.destroy', assignment.id), { preserveState: true });
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
        ...assignment_types.map((type) => ({ value: type, label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
    ];

    // 🔧 FIX: Added truncation to columns that may overflow
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
            key: 'subject',
            label: 'Subject',
            render: (row) => (
                <div className="max-w-[80px] truncate" title={row.subject}>
                    {row.subject}
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
            key: 'type',
            label: 'Type',
            render: (row) => (
                <div className="max-w-[90px] truncate" title={row.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                    {row.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
            ),
        },
        {
            key: 'due_date',
            label: 'Due Date',
            render: (row) => (
                <div className="max-w-[90px] truncate" title={row.due_date}>
                    {row.due_date}
                </div>
            ),
        },
        {
            key: 'submissions',
            label: 'Submissions',
            render: (row) => (
                <div className="max-w-[80px] truncate" title={row.submissions}>
                    {row.submissions}
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
            onClick: () => router.visit(route('teacher.assignments.show', row.id)),
        },
        {
            label: 'Edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.assignments.edit', row.id)),
        },
        {
            label: 'Grade',
            icon: <ClipboardDocumentListIcon className="w-4 h-4" />,
            color: 'success',
            onClick: () => router.visit(route('teacher.assignments.grade', row.id)),
        },
        ...(row.status === 'draft' ? [{
            label: 'Publish',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            color: 'success',
            onClick: () => handlePublish(row),
        }] : []),
        {
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            color: 'danger',
            onClick: () => handleDelete(row),
        },
    ];

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Assignments</span>}
        >
            <Head title="Assignments" />

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
                                        placeholder="Search assignments by title or subject..."
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
                                        onClick={() => router.visit(route('teacher.assignments.create'))}
                                        className="py-2 whitespace-nowrap"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Create Assignment
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={columns}
                                    rows={assignments}
                                    actions={actions}
                                    emptyMessage="No assignments found. Create your first assignment!"
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
