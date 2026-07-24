import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';

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

// Soft gradient combinations for cards
const GRADIENT_COLORS = [
    { from: 'from-blue-100', to: 'to-pink-100' },
    { from: 'from-orange-100', to: 'to-yellow-100' },
    { from: 'from-purple-100', to: 'to-pink-100' },
    { from: 'from-emerald-100', to: 'to-blue-100' },
    { from: 'from-yellow-100', to: 'to-rose-100' },
    { from: 'from-indigo-100', to: 'to-purple-100' },
    { from: 'from-teal-100', to: 'to-emerald-100' },
    { from: 'from-rose-100', to: 'to-orange-100' },
    { from: 'from-cyan-100', to: 'to-blue-100' },
    { from: 'from-amber-100', to: 'to-yellow-100' },
];

export default function AssignmentsIndex({
    assignments,
    subjects,
    filters,
    pagination,
}) {
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
            late_submission: 'text-amber-500',
            reviewed: 'text-purple-500',
            graded: 'text-emerald-500',
            returned_for_revision: 'text-red-500',
        };
        return colors[status] || 'text-gray-500';
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Assignments</span>}
        >
            <Head title="My Assignments" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl">
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
                                        <ClipboardDocumentListIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800">
                                            No assignments available
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Check back later for new assignments from your teacher.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {assignments.map((assignment, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            return (
                                                <div
                                                    key={assignment.id}
                                                    className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                {assignment.subject}
                                                            </span>
                                                            <span className={`text-xs font-medium ${getStatusColor(assignment.status)} bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm`}>
                                                                {getStatusLabel(assignment.status)}
                                                            </span>
                                                        </div>
                                                        <h3 className="mt-3 text-lg font-semibold text-gray-800 truncate max-w-full" title={assignment.title}>
                                                            {assignment.title}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="text-sm text-gray-700 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                                {assignment.assignment_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            {assignment.due_date && (
                                                                <span className="text-sm text-gray-700 flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                                    <CalendarIcon className="w-3 h-3" />
                                                                    {assignment.due_date}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {assignment.is_graded && (
                                                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                                Score: {assignment.score}/{assignment.total_points}
                                                            </div>
                                                        )}
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <Link
                                                                href={route('student.assignments.show', assignment.id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                            >
                                                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                Open Assignment
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <Pagination pagination={pagination} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
