import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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

export default function QuizzesIndex({
    quizzes,
    assigned_grades,
    statuses,
    quiz_types,
    trimesters,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [typeFilter, setTypeFilter] = useState(filters?.quiz_type || '');
    const [isLoading, setIsLoading] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

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
            ...(type === 'type' ? { quiz_type: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.quizzes.index'), {
            data: {
                search,
                status: statusFilter,
                grade_level: gradeFilter,
                quiz_type: typeFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDelete = () => {
        if (!quizToDelete) return;

        const quiz = quizToDelete;
        setQuizToDelete(null);
        router.delete(route('teacher.quizzes.destroy', quiz.id), {
            preserveState: true,
            onSuccess: () => toast.success('Quiz deleted successfully.'),
            onError: () => toast.error('Unable to delete this quiz. Please try again.'),
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

    const typeOptions = [
        { value: '', label: 'All Types' },
        ...quiz_types.map((type) => ({ value: type, label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
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
            key: 'questions',
            label: 'Questions',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.questions}>
                    {row.questions}
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
            onClick: () => router.visit(route('teacher.quizzes.show', row.id)),
        },
        {
            label: 'Edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.quizzes.edit', row.id)),
        },
        {
            label: 'Results',
            icon: <ChartBarIcon className="w-4 h-4" />,
            color: 'success',
            onClick: () => router.visit(route('teacher.quizzes.results', row.id)),
        },
        {
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            color: 'danger',
            onClick: () => setQuizToDelete(row),
        },
    ];

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Quizzes</span>}
        >
            <Head title="Quizzes" />

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
                                        placeholder="Search quizzes by title or subject..."
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
                                        onClick={() => router.visit(route('teacher.quizzes.create'))}
                                        className="min-h-11 w-full justify-center whitespace-nowrap xl:col-auto xl:w-auto"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Create Quiz
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={columns}
                                    rows={quizzes}
                                    actions={actions}
                                    emptyMessage="No quizzes found. Create your first quiz!"
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

            {quizToDelete && (
                <ConfirmModal
                    show
                    onClose={() => setQuizToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete quiz?"
                    message={`“${quizToDelete.title}” and its questions will be permanently deleted. This action cannot be undone.`}
                    confirmText="Delete permanently"
                    danger
                />
            )}
        </AuthenticatedLayout>
    );
}
