import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

export default function LessonsIndex({
    lessons,
    assigned_grades,
    subjects,
    statuses,
    trimesters,
    school_years,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [trimesterFilter, setTrimesterFilter] = useState(filters?.trimester || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'status') setStatusFilter(value);
        if (type === 'grade') setGradeFilter(value);
        if (type === 'trimester') setTrimesterFilter(value);

        applyFilters({
            ...(type === 'status' ? { status: value } : {}),
            ...(type === 'grade' ? { grade_level: value } : {}),
            ...(type === 'trimester' ? { trimester: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.lessons.index'), {
            data: {
                search,
                status: statusFilter,
                grade_level: gradeFilter,
                trimester: trimesterFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handlePublish = (lesson) => {
        if (confirm(`Publish "${lesson.title}"?`)) {
            router.post(route('teacher.lessons.publish', lesson.id), {}, { preserveState: true });
        }
    };

    const handleArchive = (lesson) => {
        if (confirm(`Archive "${lesson.title}"?`)) {
            router.post(route('teacher.lessons.archive', lesson.id), {}, { preserveState: true });
        }
    };

    const handleDelete = (lesson) => {
        if (confirm(`Delete "${lesson.title}"? This action cannot be undone.`)) {
            router.delete(route('teacher.lessons.destroy', lesson.id), { preserveState: true });
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

    const trimesterOptions = [
        { value: '', label: 'All Trimesters' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'subject', label: 'Subject' },
        { key: 'grade_level', label: 'Grade' },
        { key: 'trimester', label: 'Trimester' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'created_at', label: 'Date Created' },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: '👁️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.lessons.show', row.id)),
        },
        {
            label: 'Edit',
            icon: '✏️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.lessons.edit', row.id)),
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Lessons</h2>}
        >
            <Head title="Lessons" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search lessons by title, subject, or competency..."
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
                                    options={trimesterOptions}
                                    value={trimesterFilter}
                                    onChange={(val) => handleFilterChange('trimester', val)}
                                    placeholder="Trimester"
                                    size="md"
                                    className="w-40"
                                />
                                <PrimaryButton onClick={() => router.visit(route('teacher.lessons.create'))}>
                                    + Create Lesson
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={lessons}
                                actions={actions}
                                emptyMessage="No lessons found. Create your first lesson!"
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
