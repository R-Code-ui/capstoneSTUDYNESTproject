import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import ConversationListItem from '@/Components/ConversationListItem';
import MessageGroupList from '@/Components/MessageGroupList';
import { PencilSquareIcon, ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';

// Soft gradient combinations for conversation items
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

export default function MessagesIndex({ conversations, unread_count, filters, pagination, groups = [] }) {
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

    const handleDeleteConversation = (teacherId, teacherName) => {
        if (!confirm(`Remove the conversation with ${teacherName} from your messages? The teacher will still see it.`)) {
            return;
        }
        router.delete(route('student.messages.destroy-conversation', teacherId), {
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

            <div className="student-messages-index py-12">
                <style>{`
                    .student-messages-index .student-messages-shell {
                        background: #ffffff;
                    }
                    .student-messages-index .student-message-card {
                        color: #1e293b;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-messages-shell {
                        background: #0f172a !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card[data-message-tone="0"] {
                        background: linear-gradient(135deg, #1e3a5f, #4a2946) !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card[data-message-tone="1"] {
                        background: linear-gradient(135deg, #5b391f, #4b461b) !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card[data-message-tone="2"] {
                        background: linear-gradient(135deg, #432d64, #532b48) !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card[data-message-tone="3"] {
                        background: linear-gradient(135deg, #195246, #1e3a5f) !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card[data-message-tone="4"] {
                        background: linear-gradient(135deg, #574619, #5b2a32) !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card .text-gray-900,
                    .studynest-layout.theme-dark .student-messages-index .student-message-card .text-gray-800,
                    .studynest-layout.theme-dark .student-messages-index .student-message-card .text-gray-700 {
                        color: #f1f5f9 !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card .text-gray-500,
                    .studynest-layout.theme-dark .student-messages-index .student-message-card .text-gray-400 {
                        color: #cbd5e1 !important;
                    }
                    .studynest-layout.theme-dark .student-messages-index .student-message-card button:hover {
                        background-color: rgb(255 255 255 / 0.24) !important;
                    }
                    @media (max-width: 640px) {
                        .student-messages-index { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                        .student-messages-index .student-messages-shell { border-radius: 0.75rem; }
                        .student-messages-index .student-message-card button { gap: 0.65rem; padding: 0.75rem; }
                        .student-messages-index .student-message-card button > div:nth-child(2) { min-width: 0; }
                    }
                `}</style>
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="student-messages-shell bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <div className="mb-4">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by teacher name..."
                                    size="md"
                                />
                            </div>

                            <MessageGroupList groups={groups} routeName="student.messages.groups.show" />

                            <h2 className="mb-3 text-sm font-bold tracking-wide text-slate-500 uppercase">Direct Messages</h2>

                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500">
                                        No conversations yet.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Tap "Ask Teacher" to send your first question.
                                    </p>
                                </div>
                            ) : (
                                // 🔧 FIX: Replaced divide-y with space-y-4 for proper gap between items
                                <div className="space-y-4">
                                    {conversations.map((conv, index) => {
                                        const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                        return (
                                            <div key={conv.teacher_id} className="flex items-center">
                                                <div className="flex-1 min-w-0">
                                                    <div data-message-tone={index % GRADIENT_COLORS.length} className={`student-message-card bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden`}>
                                                        <ConversationListItem
                                                            conversation={conv}
                                                            onClick={() =>
                                                                router.visit(route('student.messages.show', conv.last_message_id))
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteConversation(conv.teacher_id, conv.name);
                                                    }}
                                                    className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                                    title="Remove conversation from your messages"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
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
