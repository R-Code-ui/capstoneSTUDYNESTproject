import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { Link } from '@inertiajs/react';

export default function AssignmentsIndex({ assignments, subjects, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'subject') setSubjectFilter(value);
        if (type === 'status') setStatusFilter(value);

        applyFilters({
            ...(type === 'subject' ? { subject: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.assignments.index'), {
            data: {
                search,
                subject: subjectFilter,
                status: statusFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...subjects.map((subject) => ({ value: subject, label: subject })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
    ];

    const getStatusColor = (status) => {
        const colors = {
            not_submitted: 'text-gray-500 dark:text-gray-400',
            submitted: 'text-blue-600 dark:text-blue-400',
            late_submission: 'text-yellow-600 dark:text-yellow-400',
            reviewed: 'text-purple-600 dark:text-purple-400',
            graded: 'text-green-600 dark:text-green-400',
            returned_for_revision: 'text-red-600 dark:text-red-400',
        };
        return colors[status] || colors.not_submitted;
    };

    const getStatusLabel = (status) => {
        const labels = {
            not_submitted: 'Not Submitted',
            submitted: 'Submitted',
            late_submission: 'Late Submission',
            reviewed: 'Reviewed',
            graded: 'Graded',
            returned_for_revision: 'Returned for Revision',
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const labels = {
            homework: 'Homework',
            worksheet: 'Worksheet',
            performance_task: 'Performance Task',
            project: 'Project',
            reflection_activity: 'Reflection Activity',
            practice_exercise: 'Practice Exercise',
            reading_assignment: 'Reading Assignment',
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Assignments</h2>}
        >
            <Head title="My Assignments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
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
                            <div className="flex flex-wrap gap-3">
                                <div className="w-full sm:w-40">
                                    <FilterDropdown
                                        options={subjectOptions}
                                        value={subjectFilter}
                                        onChange={(val) => handleFilterChange('subject', val)}
                                        placeholder="Subject"
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                                <div className="w-full sm:w-40">
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Assignments Grid */}
                        <div className="mt-6">
                            {assignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No assignments available
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Check back later for new assignments from your teacher.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {assignment.subject}
                                                        </span>
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                            {getTypeLabel(assignment.type)}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {assignment.due_date}
                                                    </span>
                                                </div>

                                                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                                                    {assignment.title}
                                                </h3>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {assignment.total_points} points
                                                        </span>
                                                        <span className={`ml-3 text-sm font-medium ${getStatusColor(assignment.status)}`}>
                                                            {getStatusLabel(assignment.status)}
                                                        </span>
                                                        {assignment.score !== null && assignment.score !== undefined && (
                                                            <span className="ml-3 text-sm font-medium text-green-600 dark:text-green-400">
                                                                Score: {assignment.score}/{assignment.total_points}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={route('student.assignments.show', assignment.id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        {assignment.status === 'not_submitted' ? 'Submit' : 'View'} →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
