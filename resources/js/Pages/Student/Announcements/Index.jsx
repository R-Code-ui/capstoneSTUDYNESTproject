import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import {
    MegaphoneIcon,
    MapPinIcon,
    StarIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    UserIcon,
    ArrowRightIcon,
    ChevronRightIcon,
    BuildingOfficeIcon,
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

export default function AnnouncementsIndex({
    announcements,
    categories,
    filters,
    pagination,
}) {
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
            normal: 'bg-blue-100 text-blue-800',
            important: 'bg-yellow-100 text-yellow-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return classes[priority] || classes.normal;
    };

    const getPriorityIcon = (priority) => {
        const icons = {
            normal: <MapPinIcon className="w-3.5 h-3.5" />,
            important: <StarIcon className="w-3.5 h-3.5" />,
            urgent: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
        };
        return icons[priority] || icons.normal;
    };

    const getPriorityLabel = (priority) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const getRoleBadge = (role) => {
        return role === 'principal'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800';
    };

    const getRoleLabel = (role) => {
        return role === 'principal' ? 'Principal' : 'Teacher';
    };

    const getRoleIcon = (role) => {
        return role === 'principal'
            ? <BuildingOfficeIcon className="w-3.5 h-3.5" />
            : <UserIcon className="w-3.5 h-3.5" />;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Announcements</h2>}
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
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
                                        <div className="flex justify-center mb-4">
                                            <MegaphoneIcon className="w-16 h-16 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-800">
                                            No announcements
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
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
                                                <div className={`bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-400 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden ${
                                                    announcement.is_read
                                                        ? 'opacity-90'
                                                        : ''
                                                }`}>
                                                    <div className="p-5">
                                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600">
                                                                        <MapPinIcon className="w-3.5 h-3.5" />
                                                                        PINNED
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                                                        {getPriorityIcon(announcement.priority)}
                                                                        {getPriorityLabel(announcement.priority)}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                                                        {getRoleIcon(announcement.role)}
                                                                        {getRoleLabel(announcement.role)}
                                                                    </span>
                                                                    {!announcement.is_read && (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            New
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h3 className="mt-2 text-lg font-semibold text-gray-800 truncate max-w-full" title={announcement.title}>
                                                                    {announcement.title}
                                                                </h3>
                                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2 break-words">
                                                                    {announcement.content}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                    <span>{announcement.category}</span>
                                                                    <span>•</span>
                                                                    <span>By {announcement.posted_by}</span>
                                                                    <span>•</span>
                                                                    <span>{announcement.created_at}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}

                                        {/* Regular Announcements */}
                                        {announcements.filter(a => !a.is_pinned).map((announcement, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            return (
                                                <Link
                                                    key={announcement.id}
                                                    href={route('student.announcements.show', announcement.id)}
                                                    className="block"
                                                >
                                                    <div className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden ${
                                                        announcement.is_read
                                                            ? 'opacity-90'
                                                            : ''
                                                    }`}>
                                                        <div className="p-5">
                                                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                                                            {getPriorityIcon(announcement.priority)}
                                                                            {getPriorityLabel(announcement.priority)}
                                                                        </span>
                                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                                                            {getRoleIcon(announcement.role)}
                                                                            {getRoleLabel(announcement.role)}
                                                                        </span>
                                                                        {!announcement.is_read && (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="mt-2 text-lg font-semibold text-gray-800 truncate max-w-full" title={announcement.title}>
                                                                        {announcement.title}
                                                                    </h3>
                                                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2 break-words">
                                                                        {announcement.content}
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                                        <span>{announcement.category}</span>
                                                                        <span>•</span>
                                                                        <span>By {announcement.posted_by}</span>
                                                                        <span>•</span>
                                                                        <span>{announcement.created_at}</span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
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
