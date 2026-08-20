import { useState, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ChatBubble from '@/Components/ChatBubble';
import {
    ArrowLeftIcon,
    PaperAirplaneIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

const CATEGORIES = [
    { value: 'lesson', label: 'Lesson' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'educational_game', label: 'Game' },
    { value: 'general_academic_concern', label: 'Concern' },
];

export default function MessagesShow({ student, messages }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const bottomRef = useRef(null);

    const lastCategory = messages.length > 0
        ? messages[messages.length - 1].category
        : 'general_academic_concern';

    const { data, setData, errors, post, reset } = useForm({
        receiver_id: student.id,
        subject: '',
        category: lastCategory,
        message: '',
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        setIsSubmitting(true);
        post(route('teacher.messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteMessage = (messageId) => {
        if (confirm('Remove this message from your messages? The student will still see it.')) {
            router.delete(route('teacher.messages.destroy', messageId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <SecondaryButton onClick={() => router.visit(route('teacher.messages.index'))}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </SecondaryButton>
                    <div>
                        <div className="text-xl font-semibold leading-tight text-gray-800">
                            {student.name}
                        </div>
                        <div className="text-xs text-gray-400">
                            {student.grade_level}{student.lrn ? ` • Student ID: ${student.lrn}` : ''}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Conversation with ${student.name}`} />

            <style>{`
                .studynest-layout.theme-dark .message-conversation-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .message-conversation-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .message-conversation-shell .message-choice:not(.is-selected) {
                    background-color: rgb(15 23 42);
                    color: rgb(203 213 225);
                    border-color: rgb(71 85 105);
                }
                .studynest-layout.theme-dark .message-conversation-shell .message-choice:not(.is-selected):hover {
                    background-color: rgb(30 41 59);
                    border-color: rgb(96 165 250);
                }
            `}</style>

            <div className="teacher-message-show py-12">
                <style>{`
                    .teacher-message-show .student-chat-text,
                    .teacher-message-show .student-incoming-message {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }
                    @media (max-width: 640px) {
                        .teacher-message-show { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                        .teacher-message-show .message-conversation-shell > div { padding: 1rem; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="message-conversation-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            {/* ===== Thread ===== */}
                            <div className="overflow-y-auto px-1 py-2 max-h-[55vh] min-h-[300px]">
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-gray-400 py-10">
                                        No messages yet. Say hello 👋
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className="group relative">
                                            <ChatBubble message={msg} />
                                            {msg.is_mine && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="hidden group-hover:flex absolute -right-1 top-0 text-gray-300 hover:text-red-500"
                                                    title="Remove message from your messages"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* ===== Composer ===== */}
                            <form onSubmit={handleSend} className="border-t border-gray-200 pt-4 mt-2 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setData('category', cat.value)}
                                            className={`message-choice text-xs px-3 py-1 rounded-full border transition ${
                                                data.category === cat.value
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-end gap-2">
                                    <textarea
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend(e);
                                            }
                                        }}
                                        rows={2}
                                        placeholder="Type a message..."
                                        className="flex-1 resize-none rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800 text-sm"
                                    />
                                    <PrimaryButton type="submit" disabled={isSubmitting || !data.message.trim()}>
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                    </PrimaryButton>
                                </div>
                                <InputError message={errors.message || errors.receiver_id || errors.category} />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
