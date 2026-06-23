import { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function MessagesShow({ message }) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, errors, post } = useForm({
        reply: '',
    });

    const handleReplySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('teacher.messages.reply', message.id), {
            preserveState: true,
            onFinish: () => {
                setIsSubmitting(false);
                setShowReplyForm(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Message
                    </h2>
                    <div className="flex gap-2">
                        {!message.is_sender && message.status !== 'replied' && (
                            <PrimaryButton onClick={() => setShowReplyForm(!showReplyForm)}>
                                💬 Reply
                            </PrimaryButton>
                        )}
                        <SecondaryButton onClick={() => router.visit(route('teacher.messages.index'))}>
                            Back to Inbox
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Message" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* ===== Message Details ===== */}
                    <Card>
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {message.subject}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {message.is_sender ? 'To: ' : 'From: '}
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {message.is_sender ? message.to : message.from}
                                            </span>
                                        </span>
                                        <span className="text-sm text-gray-400 dark:text-gray-500">•</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {message.created_at}
                                        </span>
                                    </div>
                                </div>
                                <StatusBadge status={message.status} />
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {message.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {message.status?.charAt(0).toUpperCase() + message.status?.slice(1)}
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {message.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ===== Reply Form ===== */}
                    {showReplyForm && !message.is_sender && (
                        <div className="mt-6">
                            <Card title="Reply to Message">
                                {isSubmitting && <LoadingSpinner overlay size="lg" />}

                                <form onSubmit={handleReplySubmit} className="space-y-4">
                                    <div>
                                        <InputLabel htmlFor="reply" value="Your Reply" required />
                                        <textarea
                                            id="reply"
                                            value={data.reply}
                                            onChange={(e) => setData('reply', e.target.value)}
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                            placeholder="Type your reply here..."
                                        />
                                        <InputError message={errors.reply} className="mt-2" />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => setShowReplyForm(false)}
                                        >
                                            Cancel
                                        </SecondaryButton>
                                        <PrimaryButton type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : 'Send Reply'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}

                    {/* ===== Reply Summary ===== */}
                    {!showReplyForm && !message.is_sender && message.status === 'replied' && (
                        <div className="mt-6">
                            <Card title="Reply Status">
                                <div className="text-center py-4">
                                    <div className="text-green-600 dark:text-green-400 text-lg">✅ You have replied to this message</div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Status: Replied
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
