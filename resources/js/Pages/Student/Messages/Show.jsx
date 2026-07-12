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

export default function MessagesShow({ teacher, messages }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (!data.message.trim()) return;

        setIsSubmitting(true);
        post(route('student.messages.store'), {
            preserveScroll: true,
            onSuccess: () => reset('message'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteMessage = (messageId) => {
        if (confirm('Delete this message?')) {
            router.delete(route('student.messages.destroy', messageId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <SecondaryButton onClick={() => router.visit(route('student.messages.index'))}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </SecondaryButton>
                    <div>
                        <div className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            {teacher.name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                            Teacher
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Conversation with ${teacher.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        {/* ===== Thread ===== */}
                        <div className="overflow-y-auto px-1 py-2 max-h-[55vh] min-h-[300px]">
                            {messages.length === 0 ? (
                                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">
                                    No messages yet. Ask your question below 👋
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
                                                title="Delete message"
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
                        <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setData('category', cat.value)}
                                        className={`text-xs px-3 py-1 rounded-full border transition ${
                                            data.category === cat.value
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-400'
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
                                    className="flex-1 resize-none rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 text-sm"
                                />
                                <PrimaryButton type="submit" disabled={isSubmitting || !data.message.trim()}>
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                </PrimaryButton>
                            </div>
                            <InputError message={errors.message || errors.receiver_id || errors.category} />
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
