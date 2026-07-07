import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import StatusBadge from '@/Components/StatusBadge';

// Heroicons
import {
    ClipboardDocumentListIcon,
    CalendarIcon,
    UserIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function AssignmentsIndex({ assignments, subjects, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (value) => {
        setSubjectFilter(value);
        applyFilters({ subject: value });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.assignments.index'), {
            data: {
                search,
                subject: subjectFilter,
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

    const getStatusColor = (status) => {
        const colors = {
            not_submitted: 'text-gray-500',
            submitted: 'text-blue-500',
            late_submission: 'text-yellow-500',
            reviewed: 'text-purple-500',
            graded: 'text-green-500',
            returned_for_revision: 'text-red-500',
        };
        return colors[status] || 'text-gray-500';
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Assignments</span>}
        >
            <Head title="My Assignments" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl">
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
                            <div className="w-full sm:w-48">
                                <FilterDropdown
                                    options={subjectOptions}
                                    value={subjectFilter}
                                    onChange={handleFilterChange}
                                    placeholder="Subject"
                                    size="md"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Assignments Grid */}
                        <div className="mt-6">
                            {assignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <ClipboardDocumentListIcon className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No assignments available
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Check back later for new assignments from your teacher.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {assignment.subject}
                                                    </span>
                                                    <span className={`text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                        {getStatusLabel(assignment.status)}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                    {assignment.title}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                    {assignment.due_date && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            {assignment.due_date}
                                                        </span>
                                                    )}
                                                </div>
                                                {assignment.is_graded && (
                                                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                        Score: {assignment.score}/{assignment.total_points}
                                                    </div>
                                                )}
                                                <div className="mt-4 flex items-center justify-between">
                                                    <Link
                                                        href={route('student.assignments.show', assignment.id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                        Open Assignment
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
