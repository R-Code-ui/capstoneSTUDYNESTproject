import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import {
    UserIcon,
    PaperAirplaneIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_OPTIONS = [
    { value: 'lesson', label: 'Lesson', emoji: '📘' },
    { value: 'assignment', label: 'Assignment', emoji: '📝' },
    { value: 'quiz', label: 'Quiz', emoji: '🧠' },
    { value: 'educational_game', label: 'Game', emoji: '🎮' },
    { value: 'general_academic_concern', label: 'Concern', emoji: '💬' },
];

export default function MessagesCompose({ teachers }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, errors, post } = useForm({
        receiver_id: '',
        subject: '',
        category: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('student.messages.store'), {
            preserveState: true,
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

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                    {CATEGORY_OPTIONS.map((cat) => (
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
                                            <span>{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* ===== Subject (optional) ===== */}
                            <div>
                                <InputLabel htmlFor="subject" value="Subject (optional)" />
                                <TextInput
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="What is your question about?"
                                />
                                <InputError message={errors.subject} className="mt-2" />
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
                                <SecondaryButton type="button" onClick={() => router.visit(route('student.messages.index'))}>
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
