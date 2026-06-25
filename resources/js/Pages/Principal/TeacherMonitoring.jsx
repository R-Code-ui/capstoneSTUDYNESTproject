import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function TeacherMonitoring({ teachers, grade_levels, status_options, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    // Handle search
    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.teachers.index'), {
            data: { search: value, grade_level: gradeFilter, status: statusFilter },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle filter change
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
            onFinish: () => setIsLoading(false),
        });
    };

    // View teacher profile - Navigate to full page
    const handleViewProfile = (teacher) => {
        router.visit(route('principal.teachers.show', teacher.id));
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...status_options.map((status) => ({ value: status, label: status })),
    ];

    // SVG Icons
    const ViewProfileIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const columns = [
        { key: 'name', label: 'Teacher' },
        { key: 'grades', label: 'Grade Handled', render: (row) => row.grades?.join(', ') || 'None' },
        { key: 'lessons_count', label: 'Lessons' },
        { key: 'assignments_count', label: 'Assignments' },
        { key: 'quizzes_count', label: 'Quizzes' },
        { key: 'last_activity', label: 'Last Activity' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status?.toLowerCase().replace(' ', '_') || 'inactive'} /> },
    ];

    const actions = (row) => [
        {
            label: 'View Profile',
            icon: <ViewProfileIcon />,
            color: 'primary',
            onClick: () => handleViewProfile(row)
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Teacher Monitoring</h2>}
        >
            <Head title="Teacher Monitoring" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by name or teacher ID..."
                                    size="md"
                                />
                            </div>
                            <div className="flex gap-3">
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={gradeFilter}
                                    onChange={(val) => handleFilterChange('grade', val)}
                                    placeholder="Grade Level"
                                    size="md"
                                    className="w-48"
                                />
                                <FilterDropdown
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="Status"
                                    size="md"
                                    className="w-48"
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
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
