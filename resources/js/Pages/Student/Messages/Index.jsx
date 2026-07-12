import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import ConversationListItem from '@/Components/ConversationListItem';
import { PencilSquareIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function MessagesIndex({ conversations, unread_count, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('student.messages.index'), {
            data: { search: value },
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Messages
                        </span>
                        {unread_count > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                {unread_count} new
                            </span>
                        )}
                    </div>
                    <Link href={route('student.messages.create')}>
                        <PrimaryButton>
                            <PencilSquareIcon className="w-4 h-4 mr-1" />
                            Ask Teacher
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <div className="mb-4">
                            <SearchBar
                                value={search}
                                onChange={handleSearch}
                                placeholder="Search by teacher name..."
                                size="md"
                            />
                        </div>

                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    No conversations yet.
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    Tap "Ask Teacher" to send your first question.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {conversations.map((conv) => (
                                    <ConversationListItem
                                        key={conv.teacher_id}
                                        conversation={conv}
                                        onClick={() =>
                                            router.visit(route('student.messages.show', conv.last_message_id))
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
