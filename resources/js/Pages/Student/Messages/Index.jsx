import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SearchBar from '@/Components/SearchBar';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Pagination from '@/Components/Pagination';
import ConversationListItem from '@/Components/ConversationListItem';
import MessageGroupList from '@/Components/MessageGroupList';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';

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

export default function MessagesIndex({ conversations, unread_count, filters, pagination, groups = [], group_pagination }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationToRemove, setConversationToRemove] = useState(null);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('student.messages.index'), {
            data: { search: value },
            preserveState: true,
            preserveScroll: true,
            onError: () => toast.error('Unable to filter messages. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleDeleteConversation = () => {
        if (!conversationToRemove) return;
        const { teacherId } = conversationToRemove;
        setConversationToRemove(null);
        router.delete(route('student.messages.destroy-conversation', teacherId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Conversation removed from your messages.'),
            onError: () => toast.error('Unable to remove the conversation. Please try again.'),
        });
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 w-full">
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
                </div>
            }
        >
            <Head title="Messages" />

            <div className="student-messages-index py-6 pb-[max(5.5rem,calc(4rem+env(safe-area-inset-bottom)))] sm:py-10" onFocusCapture={keepFocusedFieldVisible}>
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
                    .student-messages-index input,
                    .student-messages-index select,
                    .student-messages-index textarea { scroll-margin-block: 8rem; }
                    .student-message-card { transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
                    @media (max-width: 639px) {
                        .student-messages-index .student-messages-shell { border-radius: 0.75rem; }
                        .student-messages-index .student-message-card button { gap: 0.65rem; padding: 0.75rem; }
                        .student-messages-index .student-message-card button > div:nth-child(2) { min-width: 0; }
                        .student-messages-index input:not([type="checkbox"]):not([type="radio"]),
                        .student-messages-index select,
                        .student-messages-index textarea { font-size: 16px; }
                    }
                    @keyframes message-action-float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }
                    @media (hover: hover) and (pointer: fine) {
                        .student-message-card:hover { transform: translateY(-2px); }
                    }
                    @media (hover: none), (prefers-reduced-motion: reduce) {
                        .student-message-card { transform: none !important; transition-duration: .01ms !important; }
                        .student-message-compose-fab { animation: none !important; }
                    }
                `}</style>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 xl:px-8">
                    <div className="student-messages-shell bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by teacher name..."
                                    size="md"
                                />
                            </div>

                            <MessageGroupList groups={groups} pagination={group_pagination} routeName="student.messages.groups.show" />

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
                                                    <div data-message-tone={index % GRADIENT_COLORS.length} className={`student-message-card bg-gradient-to-br ${gradient.from} ${gradient.to} overflow-hidden rounded-2xl border border-gray-200/60 shadow-sm hover:border-blue-300 hover:shadow-md`}>
                                                        <ConversationListItem
                                                            conversation={conv}
                                                            onClick={() =>
                                                                router.visit(route('student.messages.show', conv.last_message_id), {
                                                                    onError: () => toast.error('Unable to open this conversation. Please try again.'),
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConversationToRemove({ teacherId: conv.teacher_id, teacherName: conv.name });
                                                    }}
                                                    className="ml-2 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                                    aria-label={`Remove conversation with ${conv.name}`}
                                                    title="Remove conversation"
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
                                    <Pagination
                                        pagination={pagination}
                                        onError={() => toast.error('Unable to load that messages page. Please try again.')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Link
                    href={route('student.messages.create')}
                    onError={() => toast.error('Unable to open the new-message form. Please try again.')}
                    aria-label="Ask a teacher"
                    className="student-message-compose-fab fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-safe:animate-[message-action-float_2.75s_ease-in-out_infinite] dark:focus-visible:ring-offset-slate-950 sm:right-6"
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Ask
                </Link>
            </div>
            <ConfirmModal
                show={Boolean(conversationToRemove)}
                onClose={() => setConversationToRemove(null)}
                onConfirm={handleDeleteConversation}
                title="Remove conversation?"
                message={`Remove the conversation with ${conversationToRemove?.teacherName || 'this teacher'} from your messages? The teacher will still see it.`}
                confirmText="Remove"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
