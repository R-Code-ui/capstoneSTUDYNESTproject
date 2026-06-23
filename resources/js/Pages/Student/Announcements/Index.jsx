import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function AnnouncementsIndex({ announcements, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (value) => {
        setCategoryFilter(value);
        applyFilters({ category: value });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.announcements.index'), {
            data: {
                search,
                category: categoryFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...categories.map((cat) => ({ value: cat, label: cat })),
    ];

    const getPriorityBadge = (priority) => {
        const classes = {
            normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            important: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return classes[priority] || classes.normal;
    };

    const getPriorityIcon = (priority) => {
        const icons = {
            normal: '📌',
            important: '⭐',
            urgent: '🚨',
        };
        return icons[priority] || '📌';
    };

    const getRoleBadge = (role) => {
        return role === 'principal'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Announcements</h2>}
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search announcements by title or content..."
                                    size="md"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <FilterDropdown
                                    options={categoryOptions}
                                    value={categoryFilter}
                                    onChange={handleFilterChange}
                                    placeholder="Category"
                                    size="md"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Announcements List */}
                        <div className="mt-6">
                            {announcements.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📢</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No announcements
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        There are no announcements available at the moment.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Pinned Announcements First */}
                                    {announcements.filter(a => a.is_pinned).map((announcement) => (
                                        <Link
                                            key={announcement.id}
                                            href={route('student.announcements.show', announcement.id)}
                                            className="block"
                                        >
                                            <div className={`p-5 rounded-lg border-2 transition-shadow hover:shadow-md ${
                                                announcement.is_read
                                                    ? 'bg-white dark:bg-gray-800 border-yellow-400 dark:border-yellow-600'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">📌</span>
                                                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">PINNED</span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                                                {getPriorityIcon(announcement.priority)} {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                                                {announcement.role === 'principal' ? '🏫 Principal' : '👨‍🏫 Teacher'}
                                                            </span>
                                                            {!announcement.is_read && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                            {announcement.title}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                            {announcement.content}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{announcement.category}</span>
                                                            <span>•</span>
                                                            <span>By {announcement.posted_by}</span>
                                                            <span>•</span>
                                                            <span>{announcement.created_at}</span>
                                                        </div>
                                                    </div>
                                                    <span className="ml-4 text-gray-400">→</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Regular Announcements */}
                                    {announcements.filter(a => !a.is_pinned).map((announcement) => (
                                        <Link
                                            key={announcement.id}
                                            href={route('student.announcements.show', announcement.id)}
                                            className="block"
                                        >
                                            <div className={`p-5 rounded-lg border transition-shadow hover:shadow-md ${
                                                announcement.is_read
                                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                                                {getPriorityIcon(announcement.priority)} {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                                                {announcement.role === 'principal' ? '🏫 Principal' : '👨‍🏫 Teacher'}
                                                            </span>
                                                            {!announcement.is_read && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                                                            {announcement.title}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                            {announcement.content}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{announcement.category}</span>
                                                            <span>•</span>
                                                            <span>By {announcement.posted_by}</span>
                                                            <span>•</span>
                                                            <span>{announcement.created_at}</span>
                                                        </div>
                                                    </div>
                                                    <span className="ml-4 text-gray-400">→</span>
                                                </div>
                                            </div>
                                        </Link>
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
