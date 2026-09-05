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

export default function MessagesIndex({ conversations, unread_count, filters, pagination, groups = [], group_pagination, assigned_grades = [] }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeLevel, setGradeLevel] = useState(filters?.grade_level || '');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationToRemove, setConversationToRemove] = useState(null);

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('teacher.messages.index'), {
            data: { search: value, grade_level: gradeLevel },
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleGradeChange = (value) => {
        setGradeLevel(value);
        router.visit(route('teacher.messages.index'), {
            data: { search, grade_level: value },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const removeConversation = () => {
        if (!conversationToRemove) return;

        router.delete(route('teacher.messages.destroy-conversation', conversationToRemove.studentId), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Conversation removed from your messages.');
                setConversationToRemove(null);
            },
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

            <style>{`
                /* Scope these control colors to Messages so light mode and other pages keep their existing UI. */
                .studynest-layout.theme-dark .teacher-messages-index #message-grade-filter {
                    color-scheme: dark;
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .teacher-messages-index #message-grade-filter option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
                @keyframes message-action-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>

            <div className="teacher-messages-index py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div onFocusCapture={keepFocusedFieldVisible} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by student name or Student ID..."
                                    size="md"
                                />
                            </div>

                            {assigned_grades.length > 1 && (
                                <div className="mb-4">
                                    <label htmlFor="message-grade-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Grade Level
                                    </label>
                                    <select id="message-grade-filter" value={gradeLevel} onChange={(e) => handleGradeChange(e.target.value)} className="w-full rounded-md border-gray-300 text-base shadow-sm sm:text-sm xl:w-56">
                                        <option value="">All Assigned Grades</option>
                                        {assigned_grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                                    </select>
                                </div>
                            )}

                            <MessageGroupList groups={groups} pagination={group_pagination} routeName="teacher.messages.groups.show" canCreate canManage createGrade={gradeLevel} />

                            <h2 className="mb-3 text-sm font-bold tracking-wide text-slate-500 uppercase">Direct Messages</h2>

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
                                                    setConversationToRemove({ studentId: conv.student_id, studentName: conv.name });
                                                }}
                                                aria-label="Remove conversation from your messages"
                                                className="group relative ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-offset-slate-900"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                                                    Remove conversation
                                                    <span className="absolute right-3 top-full border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                                                </span>
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
                <Link
                    href={route('teacher.messages.create')}
                    aria-label="Compose a message"
                    className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-safe:animate-[message-action-float_2.75s_ease-in-out_infinite] dark:focus-visible:ring-offset-slate-950"
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Compose
                </Link>
            </div>
            <ConfirmModal
                show={Boolean(conversationToRemove)}
                onClose={() => setConversationToRemove(null)}
                onConfirm={removeConversation}
                title="Remove conversation?"
                message={`Remove the conversation with ${conversationToRemove?.studentName || 'this student'} from your messages? The student will still see it.`}
                confirmText="Remove"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
