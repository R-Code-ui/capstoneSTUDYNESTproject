import { useState, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ChatBubble from '@/Components/ChatBubble';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';
import {
    ArrowLeftIcon,
    PaperAirplaneIcon,
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
    const [messageToRemove, setMessageToRemove] = useState(null);
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
        if (!data.message.trim()) {
            toast.error('Message content is required.');
            return;
        }

        setIsSubmitting(true);
        post(route('teacher.messages.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                toast.success('Message sent successfully.');
            },
            onError: () => toast.error('Unable to send the message. Please check the highlighted fields.'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const removeMessage = () => {
        if (!messageToRemove) return;

        router.delete(route('teacher.messages.destroy', messageToRemove), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Message removed from your messages.');
                setMessageToRemove(null);
            },
            onError: () => toast.error('Unable to remove the message. Please try again.'),
        });
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
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
                .studynest-layout.theme-dark .message-conversation-shell .message-choice.is-selected {
                    background-color: rgb(37 99 235) !important;
                    color: rgb(255 255 255) !important;
                    border-color: rgb(96 165 250) !important;
                    box-shadow: 0 0 0 2px rgb(96 165 250 / 0.28);
                }
                .message-conversation-shell textarea { scroll-margin-block: 7rem; }
                .studynest-layout.theme-dark .message-composer-actions { background-color: rgb(15 23 42 / 0.96); border-color: rgb(51 65 85); }
            `}</style>

            <div className="teacher-message-show py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <style>{`
                    .teacher-message-show .student-chat-text,
                    .teacher-message-show .student-incoming-message {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }
                    .studynest-layout.theme-dark .teacher-message-show .student-incoming-message {
                        background: #334155 !important;
                        color: #f1f5f9 !important;
                    }
                    .studynest-layout.theme-dark .teacher-message-show .direct-message-sender { color: #cbd5e1 !important; }
                    .studynest-layout.theme-dark .teacher-message-show .direct-message-avatar {
                        background: #3730a3 !important;
                        color: #e0e7ff !important;
                    }
                    @media (max-width: 640px) {
                        .teacher-message-show { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                        .teacher-message-show .message-conversation-shell > div { padding: 1rem; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="message-conversation-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6">
                            {/* ===== Thread ===== */}
                            <div className="max-h-[60vh] min-h-[300px] space-y-1 overflow-y-auto px-1 py-2">
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-gray-400 py-10">
                                        No messages yet. Say hello 👋
                                    </p>
                                ) : (
                                    messages.map((msg, index) => {
                                        const previous = messages[index - 1];
                                        const next = messages[index + 1];
                                        const startsGroup = !previous || previous.is_mine !== msg.is_mine || previous.category !== msg.category;
                                        const endsGroup = !next || next.is_mine !== msg.is_mine || next.category !== msg.category;

                                        return <ChatBubble key={msg.id} message={msg} senderName={student.name} startsGroup={startsGroup} endsGroup={endsGroup} onDelete={msg.is_mine ? () => setMessageToRemove(msg.id) : null} />;
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* ===== Composer ===== */}
                            <form onSubmit={handleSend} onFocusCapture={keepFocusedFieldVisible} className="message-composer-actions sticky bottom-0 z-10 -mx-4 space-y-2 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0">
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setData('category', cat.value)}
                                            className={`message-choice text-xs px-3 py-1 rounded-full border transition ${
                                                data.category === cat.value
                                                    ? 'is-selected bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'
                                            }`}
                                            aria-pressed={data.category === cat.value}
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
                                        className="flex-1 resize-none rounded-md border-gray-300 text-base text-gray-800 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
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
            <ConfirmModal
                show={Boolean(messageToRemove)}
                onClose={() => setMessageToRemove(null)}
                onConfirm={removeMessage}
                title="Remove message?"
                message="Remove this message from your messages? The student will still see it."
                confirmText="Remove"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
