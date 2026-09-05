import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';

export default function TeacherMonitoring({
    teachers,
    grade_levels,
    status_options,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.teachers.index'), {
            data: { search: value, grade_level: gradeFilter, status: statusFilter },
            preserveState: true,
            onError: () => toast.error('Unable to load teacher monitoring data. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'grade') setGradeFilter(value);
        if (type === 'status') setStatusFilter(value);

        setIsLoading(true);
        router.visit(route('principal.teachers.index'), {
            data: {
                search,
                grade_level: type === 'grade' ? value : gradeFilter,
                status: type === 'status' ? value : statusFilter,
            },
            preserveState: true,
            onError: () => toast.error('Unable to apply the teacher monitoring filters. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleViewProfile = (teacher) => {
        router.visit(route('principal.teachers.show', teacher.id), {
            onError: () => toast.error('Unable to load this teacher profile. Please try again.'),
        });
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...status_options.map((status) => ({ value: status, label: status })),
    ];

    const ViewProfileIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const columns = [
        {
            key: 'name',
            label: 'Teacher',
            render: (row) => (
                <span className="block max-w-[180px] truncate" title={row.name || ''}>
                    {row.name || '—'}
                </span>
            ),
        },
        {
            key: 'grades',
            label: 'Grade Handled',
            render: (row) => (
                <span className="block max-w-[120px] truncate" title={row.grades?.join(', ') || 'None'}>
                    {row.grades?.join(', ') || 'None'}
                </span>
            ),
        },
        {
            key: 'lessons_count',
            label: 'Lessons',
            render: (row) => row.lessons_count ?? 0
        },
        {
            key: 'assignments_count',
            label: 'Assignments',
            render: (row) => row.assignments_count ?? 0
        },
        {
            key: 'quizzes_count',
            label: 'Quizzes',
            render: (row) => row.quizzes_count ?? 0
        },
        {
            key: 'last_activity',
            label: 'Last Activity',
            render: (row) => (
                <span className="block truncate" title={row.last_activity || '—'}>
                    {row.last_activity || '—'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const status = row.status?.toLowerCase().replace(' ', '_') || 'inactive';

                return (
                    <StatusBadge
                        status={status}
                        className={`principal-teacher-status ${status === 'active' ? 'principal-teacher-status-active' : 'principal-teacher-status-inactive'}`}
                    />
                );
            },
        },
    ];

    const actions = (row) => [
        {
            label: 'View Details',
            icon: <ViewProfileIcon />,
            color: 'primary',
            onClick: () => handleViewProfile(row)
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
            header={<h2 className="text-xl font-bold text-gray-800">Teacher Monitoring</h2>}
        >
            <Head title="Teacher Monitoring" />

            <style>{`
                .studynest-layout.theme-dark .principal-teacher-status-inactive {
                    background-color: rgb(71 85 105) !important;
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .principal-teacher-status-active {
                    background-color: rgb(167 243 208) !important;
                    color: rgb(6 78 59) !important;
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6" onFocusCapture={keepFocusedFieldVisible}>
                            {/* Filters */}
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-4">
                                <div className="min-w-0">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search by name or teacher ID..."
                                        size="md"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={(val) => handleFilterChange('grade', val)}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-full xl:w-48"
                                    />
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full xl:w-48"
                                    />
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={columns}
                                    rows={teachers}
                                    actions={actions}
                                    emptyMessage="No teachers found."
                                    hoverable
                                    striped
                                    compact
                                    responsive
                                    responsiveAt="tablet"
                                    tableClassName="table-fixed"
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
