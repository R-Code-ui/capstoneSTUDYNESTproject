import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';

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
                                <Pagination pagination={pagination} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
