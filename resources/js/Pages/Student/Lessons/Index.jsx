import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import { toast } from 'sonner';

// Heroicons
import {
    BookOpenIcon,
    UserIcon,
    CalendarIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
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

export default function LessonsIndex({
    lessons,
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
        router.visit(route('student.lessons.index'), {
            data: {
                search,
                subject: subjectFilter,
                ...additional,
            },
            preserveState: true,
            onError: () => toast.error('Unable to load lessons. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...subjects.map((subject) => ({ value: subject, label: subject })),
    ];

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">My Lessons</span>}
        >
            <Head title="My Lessons" />

            <div className="student-lessons-page py-4">
                <style>{`
                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="0"] {
                        background-image: linear-gradient(135deg, rgb(30 58 95), rgb(74 41 70)) !important;
                        background-color: rgb(30 58 95) !important;
                        border-color: rgb(71 98 133) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="1"] {
                        background-image: linear-gradient(135deg, rgb(91 57 31), rgb(75 70 27)) !important;
                        background-color: rgb(91 57 31) !important;
                        border-color: rgb(133 105 53) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="2"] {
                        background-image: linear-gradient(135deg, rgb(67 45 100), rgb(83 43 72)) !important;
                        background-color: rgb(67 45 100) !important;
                        border-color: rgb(112 83 143) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="3"] {
                        background-image: linear-gradient(135deg, rgb(25 82 70), rgb(30 58 95)) !important;
                        background-color: rgb(25 82 70) !important;
                        border-color: rgb(55 123 104) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="4"] {
                        background-image: linear-gradient(135deg, rgb(87 70 25), rgb(91 42 50)) !important;
                        background-color: rgb(87 70 25) !important;
                        border-color: rgb(137 111 52) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="5"] {
                        background-image: linear-gradient(135deg, rgb(38 52 103), rgb(67 45 100)) !important;
                        background-color: rgb(38 52 103) !important;
                        border-color: rgb(76 92 153) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="6"] {
                        background-image: linear-gradient(135deg, rgb(21 75 76), rgb(25 82 70)) !important;
                        background-color: rgb(21 75 76) !important;
                        border-color: rgb(50 119 118) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="7"] {
                        background-image: linear-gradient(135deg, rgb(91 42 50), rgb(91 57 31)) !important;
                        background-color: rgb(91 42 50) !important;
                        border-color: rgb(137 77 83) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="8"] {
                        background-image: linear-gradient(135deg, rgb(20 74 95), rgb(30 58 95)) !important;
                        background-color: rgb(20 74 95) !important;
                        border-color: rgb(51 111 134) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone="9"] {
                        background-image: linear-gradient(135deg, rgb(87 70 25), rgb(75 70 27)) !important;
                        background-color: rgb(87 70 25) !important;
                        border-color: rgb(137 111 52) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone] .text-gray-800,
                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone] .text-gray-700 {
                        color: rgb(241 245 249) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone] .text-gray-600,
                    .studynest-layout.theme-dark .student-lessons-page [data-card-tone] .text-gray-500 {
                        color: rgb(203 213 225) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page [class~="bg-white/70"],
                    .studynest-layout.theme-dark .student-lessons-page [class~="bg-white/50"] {
                        background-color: rgb(15 23 42 / 0.58) !important;
                        color: rgb(226 232 240) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page .text-gray-800,
                    .studynest-layout.theme-dark .student-lessons-page .text-gray-700 {
                        color: rgb(226 232 240) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page .text-gray-600,
                    .studynest-layout.theme-dark .student-lessons-page .text-gray-500 {
                        color: rgb(148 163 184) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page .bg-white {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(51 65 85) !important;
                    }

                    .studynest-layout.theme-dark .student-lessons-page .border-gray-200 {
                        border-color: rgb(51 65 85) !important;
                    }
                `}</style>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search lessons by title, subject, or topic..."
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

                            {/* Lessons Grid */}
                            <div className="mt-6">
                                {lessons.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpenIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800">
                                            No lessons available
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Check back later for new lessons from your teacher.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {lessons.map((lesson, index) => {
                                            // Pick a gradient based on index
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    data-card-tone={index % 5}
                                                    className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/70 text-gray-700 backdrop-blur-sm">
                                                                {lesson.subject}
                                                            </span>
                                                            <span className="text-xs text-gray-600 flex items-center gap-1 shrink-0 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                                <CalendarIcon className="w-3 h-3" />
                                                                {lesson.created_at}
                                                            </span>
                                                        </div>
                                                        <h3 className="mt-3 text-lg font-semibold text-gray-800 truncate max-w-full" title={lesson.title}>
                                                            {lesson.title}
                                                        </h3>
                                                        <p className="mt-2 text-sm text-gray-700 line-clamp-2 break-words">
                                                            {lesson.description}
                                                        </p>
                                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                                            <span className="text-xs text-gray-700 flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                                <UserIcon className="w-3 h-3" />
                                                                {lesson.teacher}
                                                            </span>
                                                            <Link
                                                                href={route('student.lessons.show', lesson.id)}
                                                                onError={() => toast.error('Unable to open this lesson. Please try again.')}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                            >
                                                                <BookOpenIcon className="w-4 h-4 mr-1" />
                                                                View Lesson
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
                                    onError={() => toast.error('Unable to load that lesson page. Please try again.')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
