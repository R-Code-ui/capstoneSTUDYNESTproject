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
    TrashIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function LessonsIndex({
    lessons,
    assigned_grades,
    subjects,
    statuses,
    trimesters,
    school_years,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [trimesterFilter, setTrimesterFilter] = useState(filters?.trimester || '');
    const [isLoading, setIsLoading] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
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

    const handleDelete = () => {
        if (!lessonToDelete) return;

        const lesson = lessonToDelete;
        setLessonToDelete(null);
        router.delete(route('teacher.lessons.destroy', lesson.id), {
            preserveState: true,
            onSuccess: () => toast.success('Lesson deleted successfully.'),
            onError: () => toast.error('Unable to delete this lesson. Please try again.'),
        });
    };

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...statuses
            .filter((status) => status !== 'archived')
            .map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const trimesterOptions = [
        { value: '', label: 'All Terms' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    // 🔧 FIX: Added truncation to columns that might overflow
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
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'completion',
            label: 'Completion',
            render: (row) => (
                <div className="whitespace-nowrap">
                    <div className="font-medium text-gray-800">
                        {row.completed_students} / {row.total_students}
                    </div>
                    <div className="text-xs text-gray-500">students completed</div>
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Date Created',
            render: (row) => (
                <div className="max-w-[100px] truncate" title={row.created_at}>
                    {row.created_at}
                </div>
            ),
        },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.lessons.show', row.id)),
        },
        {
            label: 'Edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.lessons.edit', row.id)),
        },
        {
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            color: 'danger',
            onClick: () => setLessonToDelete(row),
        },
    ];

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Lessons</span>}
        >
            <Head title="Lessons" />
            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6">
                            {/* Filters */}
                            <div onFocusCapture={keepFocusedFieldVisible} className="space-y-3">
                                <div className="min-w-0">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search lessons by title, subject, or competency..."
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
                                        options={trimesterOptions}
                                        value={trimesterFilter}
                                        onChange={(val) => handleFilterChange('trimester', val)}
                                        placeholder="Term"
                                        size="md"
                                        className="w-full"
                                    />
                                    {/* 🔧 FIX: Added py-2 and whitespace-nowrap to match filter height */}
                                    <PrimaryButton
                                        onClick={() => router.visit(route('teacher.lessons.create'))}
                                        className="min-h-11 w-full justify-center whitespace-nowrap xl:w-auto"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Create Lesson
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

            {lessonToDelete && (
                <ConfirmModal
                    show
                    onClose={() => setLessonToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete lesson?"
                    message={`“${lessonToDelete.title}” and its resources will be permanently deleted. This action cannot be undone.`}
                    confirmText="Delete permanently"
                    danger
                />
            )}
        </AuthenticatedLayout>
    );
}
