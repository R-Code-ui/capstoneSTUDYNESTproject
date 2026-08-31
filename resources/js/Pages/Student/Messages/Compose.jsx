import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
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

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Ask Teacher</span>}
        >
            <Head title="Ask Teacher" />

            <div className="student-message-compose py-12">
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
                    .student-message-compose textarea { overflow-wrap: anywhere; }
                    @media (max-width: 640px) {
                        .student-message-compose { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                        .student-message-compose form { padding: 1rem; }
                    }
                `}</style>
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="student-message-form bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* ===== Recipient ===== */}
                            <div>
                                <InputLabel htmlFor="receiver_id" value="Select Teacher" required />
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        id="receiver_id"
                                        value={data.receiver_id}
                                        onChange={(e) => setData('receiver_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800 pl-10"
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
                                                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition ${
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                    required
                                    placeholder="Write your question or message here..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('student.messages.index'), {
                                    onError: () => toast.error('Unable to return to messages. Please try again.'),
                                })}>
                                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton
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
