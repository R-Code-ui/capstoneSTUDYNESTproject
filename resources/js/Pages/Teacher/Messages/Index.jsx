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
    const [activeTab, setActiveTab] = useState('inbox');
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
        const routeName = activeTab === 'inbox' ? 'teacher.messages.index' : 'teacher.messages.sent';
        router.visit(route(routeName), {
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsLoading(true);
        const routeName = tab === 'inbox' ? 'teacher.messages.index' : 'teacher.messages.sent';
        router.visit(route(routeName), {
            data: {
                search,
                category: categoryFilter,
                status: statusFilter,
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

    // Determine which columns to show based on tab
    const columns = activeTab === 'inbox'
        ? [
            { key: 'from', label: 'From' },
            { key: 'subject', label: 'Subject' },
            { key: 'category', label: 'Category', render: (row) => row.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'created_at', label: 'Date' },
        ]
        : [
            { key: 'to', label: 'To' },
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
            onClick: () => router.visit(route('teacher.messages.show', row.id)),
        },
        ...(activeTab === 'inbox' && row.status !== 'replied' ? [{
            label: 'Reply',
            icon: '💬',
            color: 'success',
            onClick: () => router.visit(route('teacher.messages.show', row.id)),
        }] : []),
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Messages</h2>
                    <Link href={route('teacher.messages.create')}>
                        <PrimaryButton>+ Compose Message</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* ===== Tabs ===== */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => handleTabChange('inbox')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                                        activeTab === 'inbox'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Inbox
                                    {unread_count > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                            {unread_count}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleTabChange('sent')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                                        activeTab === 'sent'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Sent
                                </button>
                            </nav>
                        </div>

                        {/* ===== Filters ===== */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder={`Search ${activeTab} messages...`}
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
                                emptyMessage={activeTab === 'inbox' ? 'No messages in your inbox.' : 'No sent messages.'}
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
