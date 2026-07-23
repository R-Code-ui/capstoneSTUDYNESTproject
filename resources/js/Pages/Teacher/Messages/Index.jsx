import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import ConversationListItem from '@/Components/ConversationListItem';
import { PlusIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function MessagesIndex({ conversations, unread_count, filters, pagination }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('teacher.messages.index'), {
            data: { search: value },
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDeleteConversation = (studentId, studentName) => {
        if (!confirm(`Delete the entire conversation with ${studentName}? This action cannot be undone.`)) {
            return;
        }
        router.delete(route('teacher.messages.destroy-conversation', studentId), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold leading-tight text-gray-800">
                            Messages
                        </span>
                        {unread_count > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                {unread_count} new
                            </span>
                        )}
                    </div>
                    <Link href={route('teacher.messages.create')}>
                        <PrimaryButton>
                            <PlusIcon className="w-4 h-4 mr-1" />
                            New Message
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <div className="mb-4">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by student name or Student ID..."
                                    size="md"
                                />
                            </div>

                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500">
                                        No conversations yet.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Start a new message to reach out to a student.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {conversations.map((conv) => (
                                        <div key={conv.student_id} className="flex items-center">
                                            <div className="flex-1">
                                                <ConversationListItem
                                                    conversation={conv}
                                                    onClick={() =>
                                                        router.visit(route('teacher.messages.show', conv.last_message_id))
                                                    }
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConversation(conv.student_id, conv.name);
                                                }}
                                                className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete conversation"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pagination && pagination.total > 0 && (
                                <div className="mt-6">
                                    <Pagination pagination={pagination} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
