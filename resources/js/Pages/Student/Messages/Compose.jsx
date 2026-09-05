import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';
import {
    UserIcon,
    PaperAirplaneIcon,
    ArrowLeftIcon,
    BookOpenIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    PuzzlePieceIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_OPTIONS = [
    { value: 'lesson', label: 'Lesson', icon: BookOpenIcon },
    { value: 'assignment', label: 'Assignment', icon: DocumentTextIcon },
    { value: 'quiz', label: 'Quiz', icon: AcademicCapIcon },
    { value: 'educational_game', label: 'Game', icon: PuzzlePieceIcon },
    { value: 'general_academic_concern', label: 'Concern', icon: ChatBubbleLeftRightIcon },
];

export default function MessagesCompose({ teachers }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, errors, post } = useForm({
        receiver_id: '',
        category: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.receiver_id) {
            toast.error('Please select a teacher.');
            return;
        }
        if (!data.category) {
            toast.error('Please select a category.');
            return;
        }
        if (!data.message.trim()) {
            toast.error('Please enter a message.');
            return;
        }
        setIsSubmitting(true);

        post(route('student.messages.store'), {
            preserveState: true,
            onSuccess: () => toast.success('Message sent.'),
            onError: () => toast.error('Unable to send the message. Please review the highlighted fields and try again.'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const teacherOptions = [
        { value: '', label: 'Select Teacher' },
        ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })),
    ];

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
                        <span className="text-xl font-semibold leading-tight text-gray-800">Ask Teacher</span>
                        <Link href={route('student.messages.index')} onError={() => toast.error('Unable to return to messages. Please try again.')} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-blue-300 dark:hover:bg-slate-800">
                            <ArrowLeftIcon className="h-4 w-4" /> Back to Messages
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Ask Teacher" />

            <div className="student-message-compose py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <style>{`
                    .studynest-layout.theme-dark .student-message-compose .student-message-form {
                        background: #0f172a !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-message-compose select,
                    .studynest-layout.theme-dark .student-message-compose textarea {
                        background-color: #1e293b !important;
                        border-color: #475569 !important;
                        color: #e2e8f0 !important;
                    }
                    .studynest-layout.theme-dark .student-message-compose select option {
                        background: #1e293b;
                        color: #e2e8f0;
                    }
                    .studynest-layout.theme-dark .student-message-compose textarea::placeholder { color: #94a3b8 !important; }
                    .studynest-layout.theme-dark .student-message-compose .message-choice:not(.is-selected) {
                        background-color: rgb(15 23 42) !important;
                        border-color: rgb(71 85 105) !important;
                        color: rgb(203 213 225) !important;
                    }
                    .studynest-layout.theme-dark .student-message-compose .message-choice:not(.is-selected):hover { background-color: rgb(30 41 59) !important; border-color: rgb(96 165 250) !important; }
                    .studynest-layout.theme-dark .student-message-compose .student-message-compose-actions { background-color: rgb(15 23 42 / .97) !important; border-color: rgb(51 65 85) !important; }
                    .student-message-compose input,
                    .student-message-compose select,
                    .student-message-compose textarea { scroll-margin-block: 8rem; }
                    .student-message-compose textarea { overflow-wrap: anywhere; word-break: break-word; }
                    @media (max-width: 639px) {
                        .student-message-compose input:not([type="checkbox"]):not([type="radio"]),
                        .student-message-compose select,
                        .student-message-compose textarea { font-size: 16px; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 xl:px-8">
                    <div className="student-message-form overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} onFocusCapture={keepFocusedFieldVisible} className="space-y-6 p-4 pb-24 sm:p-6 sm:pb-6">
                            {/* ===== Recipient ===== */}
                            <div>
                                <InputLabel htmlFor="receiver_id" value="Select Teacher" required />
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        id="receiver_id"
                                        value={data.receiver_id}
                                        onChange={(e) => setData('receiver_id', e.target.value)}
                                        className="mt-1 block min-h-11 w-full rounded-xl border-gray-300 pl-10 text-base text-gray-800 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                                        required
                                    >
                                        {teacherOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <InputError message={errors.receiver_id} className="mt-2" />
                            </div>

                            {/* ===== Category (pill buttons) ===== */}
                            <div>
                                <InputLabel value="What is this about?" required />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map((cat) => {
                                        const CategoryIcon = cat.icon;

                                        return (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setData('category', cat.value)}
                                                className={`message-choice ${data.category === cat.value ? 'is-selected' : ''} flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${
                                                    data.category === cat.value
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                                }`}
                                            >
                                                <CategoryIcon className="h-4 w-4" />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* ===== Message ===== */}
                            <div>
                                <InputLabel htmlFor="message" value="Message" required />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={6}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-base text-gray-800 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
                                    required
                                    placeholder="Write your question or message here..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="student-message-compose-actions sticky bottom-0 z-10 -mx-4 flex border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
                                <PrimaryButton
                                    className="min-h-11 w-full justify-center sm:w-auto"
                                    type="submit"
                                    disabled={isSubmitting || !data.receiver_id || !data.category || !data.message}
                                >
                                    <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                                    {isSubmitting ? 'Sending...' : 'Send Question'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
