import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

export default function MessagesIndex({
    messages,
    unread_count,
    categories,
    statuses,
    filters,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'category') setCategoryFilter(value);
        if (type === 'status') setStatusFilter(value);

        applyFilters({
            ...(type === 'category' ? { category: value } : {}),
            ...(type === 'status' ? { status: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('student.messages.index'), {
            data: {
                search,
                category: categoryFilter,
                status: statusFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...categories.map((cat) => ({ value: cat, label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...statuses.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
    ];

    const columns = [
        { key: 'from', label: 'From' },
        { key: 'subject', label: 'Subject' },
        { key: 'category', label: 'Category', render: (row) => row.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        { key: 'created_at', label: 'Date' },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: '👁️',
            color: 'primary',
            onClick: () => router.visit(route('student.messages.show', row.id)),
        },
        ...(row.status !== 'replied' ? [{
            label: 'Reply',
            icon: '💬',
            color: 'success',
            onClick: () => router.visit(route('student.messages.show', row.id)),
        }] : []),
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Messages</h2>
                    <Link href={route('student.messages.create')}>
                        <PrimaryButton>✏️ Ask Teacher</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* ===== Header with Unread Count ===== */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-medium text-gray-900 dark:text-white">Inbox</span>
                                {unread_count > 0 && (
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                        {unread_count} unread
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ===== Filters ===== */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search messages by subject, teacher, or content..."
                                    size="md"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <FilterDropdown
                                    options={categoryOptions}
                                    value={categoryFilter}
                                    onChange={(val) => handleFilterChange('category', val)}
                                    placeholder="Category"
                                    size="md"
                                    className="w-48"
                                />
                                <FilterDropdown
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="Status"
                                    size="md"
                                    className="w-36"
                                />
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={messages}
                                actions={actions}
                                emptyMessage="No messages in your inbox."
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
