import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
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

export default function MessagesShow({ teacher, messages }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageToRemove, setMessageToRemove] = useState(null);
    const bottomRef = useRef(null);

    const lastCategory = messages.length > 0
        ? messages[messages.length - 1].category
        : 'general_academic_concern';

    const { data, setData, errors, post, reset } = useForm({
        receiver_id: teacher.id,
        subject: '',
        category: lastCategory,
        message: '',
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!data.receiver_id) {
            toast.error('Please select a recipient.');
            return;
        }
        if (!data.category) {
            toast.error('Please select a message category.');
            return;
        }
        if (!data.message.trim()) {
            toast.error('Please enter a message.');
            return;
        }

        setIsSubmitting(true);
        post(route('student.messages.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                toast.success('Message sent.');
            },
            onError: () => toast.error('Unable to send the message. Please review the highlighted fields and try again.'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteMessage = () => {
        if (!messageToRemove) return;
        router.delete(route('student.messages.destroy', messageToRemove), {
            preserveScroll: true,
            onSuccess: () => toast.success('Message removed from your messages.'),
            onError: () => toast.error('Unable to remove the message. Please try again.'),
            onFinish: () => setMessageToRemove(null),
        });
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="w-full">
                    <Link href={route('student.messages.index')} onError={() => toast.error('Unable to return to messages. Please try again.')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-slate-800 xl:hidden">
                        <ArrowLeftIcon className="h-4 w-4" /> Back to Messages
                    </Link>
                    <div className="hidden w-full items-center justify-between gap-4 xl:flex">
                        <div className="min-w-0">
                            <div className="break-words text-xl font-semibold leading-tight text-gray-800">{teacher.name}</div>
                            <div className="text-xs text-gray-400">Teacher</div>
                        </div>
                        <Link href={route('student.messages.index')} onError={() => toast.error('Unable to return to messages. Please try again.')} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-slate-800">
                            <ArrowLeftIcon className="h-4 w-4" /> Back to Messages
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Conversation with ${teacher.name}`} />

            <div className="student-message-show py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <style>{`
                    .student-message-show .student-message-thread { background: #ffffff; }
                    .student-message-show .student-message-thread textarea { overflow-wrap: anywhere; }
                    .student-message-show .student-chat-text { overflow-wrap: anywhere; word-break: break-word; }
                    .studynest-layout.theme-dark .student-message-show .student-message-thread {
                        background: #0f172a !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .student-message-thread textarea {
                        background: #1e293b !important;
                        border-color: #475569 !important;
                        color: #e2e8f0 !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .student-message-thread textarea::placeholder { color: #94a3b8 !important; }
                    .student-message-show .student-message-thread .student-incoming-message {
                        background: #f1f5f9 !important;
                        color: #1e293b !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .student-message-thread .student-incoming-message {
                        background: #334155 !important;
                        color: #f1f5f9 !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .direct-message-sender { color: #cbd5e1 !important; }
                    .studynest-layout.theme-dark .student-message-show .direct-message-avatar {
                        background: #3730a3 !important;
                        color: #e0e7ff !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .message-choice:not(.is-selected) {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(71 85 105) !important;
                        color: rgb(203 213 225) !important;
                    }
                    .studynest-layout.theme-dark .student-message-show .message-choice:not(.is-selected):hover { background-color: rgb(30 41 59) !important; border-color: rgb(96 165 250) !important; }
                    .studynest-layout.theme-dark .student-message-show .student-message-composer { background-color: rgb(15 23 42 / .97) !important; border-color: rgb(51 65 85) !important; }
                    .student-message-show input,
                    .student-message-show select,
                    .student-message-show textarea { scroll-margin-block: 8rem; }
                    @media (max-width: 639px) {
                        .student-message-show input:not([type="checkbox"]):not([type="radio"]),
                        .student-message-show select,
                        .student-message-show textarea { min-width: 0; font-size: 16px; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:px-8">
                    <div className="student-message-thread overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-4 sm:p-6">
                            <div className="mb-3 flex items-center gap-3 border-b border-gray-200 pb-3 xl:hidden">
                                <div className="direct-message-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{teacher.name?.charAt(0)}</div>
                                <div className="min-w-0"><p className="break-words font-bold text-gray-800">{teacher.name}</p><p className="text-xs text-gray-500">Teacher</p></div>
                            </div>
                            {/* ===== Thread ===== */}
                            <div className="max-h-[60vh] min-h-[300px] space-y-1 overflow-y-auto px-1 py-2">
                                {messages.length === 0 ? (
                                    <p className="text-center text-sm text-gray-400 py-10">
                                        No messages yet. Ask your question below 👋
                                    </p>
                                ) : (
                                    messages.map((msg, index) => {
                                        const previous = messages[index - 1];
                                        const next = messages[index + 1];
                                        const startsGroup = !previous || previous.is_mine !== msg.is_mine || previous.category !== msg.category;
                                        const endsGroup = !next || next.is_mine !== msg.is_mine || next.category !== msg.category;

                                        return <ChatBubble key={msg.id} message={msg} senderName={teacher.name} senderRole="Teacher" startsGroup={startsGroup} endsGroup={endsGroup} onDelete={msg.is_mine ? () => setMessageToRemove(msg.id) : null} />;
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* ===== Composer ===== */}
                            <form onSubmit={handleSend} onFocusCapture={keepFocusedFieldVisible} className="student-message-composer sticky bottom-0 z-10 -mx-4 mt-2 space-y-2 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0">
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setData('category', cat.value)}
                                            className={`message-choice ${data.category === cat.value ? 'is-selected' : ''} inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs transition ${
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
                                        placeholder="Type your question..."
                                        className="min-h-12 flex-1 resize-none rounded-xl border-gray-300 text-base text-gray-800 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                                    />
                                    <PrimaryButton className="min-h-11 min-w-11 justify-center px-3" type="submit" disabled={isSubmitting || !data.message.trim()} aria-label="Send message">
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
                onConfirm={handleDeleteMessage}
                title="Remove message?"
                message="Remove this message from your messages? The teacher will still see it."
                confirmText="Remove"
                cancelText="Cancel"
                danger
            />
        </AuthenticatedLayout>
    );
}
