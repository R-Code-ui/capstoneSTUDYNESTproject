import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import StatusBadge from '@/Components/StatusBadge';
import Pagination from '@/Components/Pagination';
import useDeadlineStatuses from '@/Hooks/useDeadlineStatuses';
import { toast } from 'sonner';

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
    const getDeadlineStatus = useDeadlineStatuses(assignments);

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
            onError: () => toast.error('Unable to load assignments. Please try again.'),
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

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Assignments</span>}
        >
            <Head title="My Assignments" />

            <div onFocusCapture={keepFocusedFieldVisible} className="student-assignments-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6">
                <style>{`
                    .student-assignments-page input,
                    .student-assignments-page select,
                    .student-assignments-page textarea { scroll-margin-block: 7rem; }
                    @media (max-width: 639px) {
                        .student-assignments-page input,
                        .student-assignments-page select,
                        .student-assignments-page textarea { font-size: 16px; }
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone="0"] {
                        background-image: linear-gradient(135deg, rgb(30 58 95), rgb(74 41 70)) !important;
                        background-color: rgb(30 58 95) !important;
                        border-color: rgb(71 98 133) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone="1"] {
                        background-image: linear-gradient(135deg, rgb(91 57 31), rgb(75 70 27)) !important;
                        background-color: rgb(91 57 31) !important;
                        border-color: rgb(133 105 53) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone="2"] {
                        background-image: linear-gradient(135deg, rgb(67 45 100), rgb(83 43 72)) !important;
                        background-color: rgb(67 45 100) !important;
                        border-color: rgb(112 83 143) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone="3"] {
                        background-image: linear-gradient(135deg, rgb(25 82 70), rgb(30 58 95)) !important;
                        background-color: rgb(25 82 70) !important;
                        border-color: rgb(55 123 104) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone="4"] {
                        background-image: linear-gradient(135deg, rgb(87 70 25), rgb(91 42 50)) !important;
                        background-color: rgb(87 70 25) !important;
                        border-color: rgb(137 111 52) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone] .text-gray-800,
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone] .text-gray-700 {
                        color: rgb(241 245 249) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone] .text-gray-600,
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone] .text-gray-500 {
                        color: rgb(203 213 225) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [class~="bg-white/70"],
                    .studynest-layout.theme-dark .student-assignments-page [class~="bg-white/50"] {
                        background-color: rgb(15 23 42 / 0.58) !important;
                        color: rgb(226 232 240) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page [data-card-tone] [class~="bg-emerald-100"] {
                        background-color: rgb(6 95 70 / 0.42) !important;
                        color: rgb(167 243 208) !important;
                    }
                    .studynest-layout.theme-dark .student-assignments-page > div > .bg-white {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(51 65 85) !important;
                    }
                    @media (max-width: 640px) {
                        .student-assignments-page .p-6 {
                            padding: 1rem;
                        }
                    }
                    @media (hover: none), (prefers-reduced-motion: reduce) {
                        .student-assignment-card:hover { transform: none; }
                        .student-assignment-card { transition-duration: 0.01ms !important; }
                    }
                `}</style>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
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
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                                        {assignments.map((assignment, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            // ✅ Score display logic: show slash only if total_points exists
                                            const scoreText = assignment.is_graded
                                                ? (assignment.total_points
                                                    ? `Score: ${assignment.score}/${assignment.total_points}`
                                                    : `Score: ${assignment.score}`)
                                                : '';

                                            return (
                                                <div
                                                    key={assignment.id}
                                                    data-card-tone={index % 5}
                                                    className={`student-assignment-card overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                {assignment.subject}
                                                            </span>
                                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                                <span className={`text-xs font-medium ${getStatusColor(assignment.status)} bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm`}>
                                                                    {getStatusLabel(assignment.status)}
                                                                </span>
                                                                <StatusBadge status={getDeadlineStatus(assignment)} size="sm" />
                                                            </div>
                                                        </div>
                                                        <h3 className="mt-3 max-w-full break-words text-lg font-semibold text-gray-800" title={assignment.title}>
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
                                                                {scoreText}
                                                            </div>
                                                        )}
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <Link
                                                                href={route('student.assignments.show', assignment.id)}
                                                                onError={() => toast.error('Unable to open this assignment. Please try again.')}
                                                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
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
                                <Pagination
                                    pagination={pagination}
                                    onError={() => toast.error('Unable to load that assignment page. Please try again.')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
