import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    EyeIcon,
    PlusIcon,
    InboxIcon,
    PaperAirplaneIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export default function MessagesIndex({
    inboxMessages,
    sentMessages,
    unread_count,
    categories,
    statuses,
    filters,
}) {
    const [activeTab, setActiveTab] = useState('inbox');
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('teacher.messages.index'), {
            data: { search: value, status: statusFilter },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setIsLoading(true);
        router.visit(route('teacher.messages.index'), {
            data: { search, status: value },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const messages = activeTab === 'inbox' ? inboxMessages : sentMessages;
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
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.messages.show', row.id)),
        },
        {
            label: 'Delete',
            icon: <TrashIcon className="w-4 h-4" />,
            color: 'danger',
            onClick: () => {
                if (confirm('Are you sure you want to delete this message?')) {
                    router.delete(route('teacher.messages.destroy', row.id), {
                        preserveState: true,
                    });
                }
            },
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Messages</span>
                    <Link href={route('teacher.messages.create')}>
                        <PrimaryButton>
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Compose
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('inbox')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                                        activeTab === 'inbox'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <InboxIcon className="w-4 h-4" />
                                    Inbox
                                    {unread_count > 0 && (
                                        <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                            {unread_count}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('sent')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                                        activeTab === 'sent'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                    Sent
                                </button>
                            </nav>
                        </div>

                        {/* Filters – only for inbox */}
                        {activeTab === 'inbox' && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search inbox..."
                                        size="md"
                                    />
                                </div>
                                <FilterDropdown
                                    options={[{ value: '', label: 'All Status' }, ...statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
                                    value={statusFilter}
                                    onChange={handleStatusFilter}
                                    placeholder="Status"
                                    size="md"
                                    className="w-36"
                                />
                            </div>
                        )}

                        {isLoading && <LoadingSpinner overlay size="lg" />}

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
