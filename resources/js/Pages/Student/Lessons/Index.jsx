import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { Link } from '@inertiajs/react';

export default function LessonsIndex({ lessons, subjects, filters }) {
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Lessons</h2>}
        >
            <Head title="My Lessons" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
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
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No lessons available
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Check back later for new lessons from your teacher.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {lesson.subject}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {lesson.created_at}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                    {lesson.title}
                                                </h3>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {lesson.description}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        👨‍🏫 {lesson.teacher}
                                                    </span>
                                                    <Link
                                                        href={route('student.lessons.show', lesson.id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        View Lesson →
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
