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

export default function MessagesCompose({ students, categories }) {
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

        post(route('teacher.messages.store'), {
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const studentOptions = [
        { value: '', label: 'Select Student' },
        ...students.map((student) => ({ value: student.id, label: `${student.name} (${student.lrn})` })),
    ];

    const categoryOptions = [
        { value: '', label: 'Select Category' },
        ...categories.map((cat) => ({ value: cat, label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Compose Message</h2>}
        >
            <Head title="Compose Message" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Recipient ===== */}
                            <div>
                                <InputLabel htmlFor="receiver_id" value="Recipient" required />
                                <select
                                    id="receiver_id"
                                    value={data.receiver_id}
                                    onChange={(e) => setData('receiver_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                >
                                    {studentOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.receiver_id} className="mt-2" />
                            </div>

                            {/* ===== Subject ===== */}
                            <div>
                                <InputLabel htmlFor="subject" value="Subject" required />
                                <TextInput
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                    placeholder="Enter message subject..."
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>

                            {/* ===== Category ===== */}
                            <div>
                                <InputLabel htmlFor="category" value="Category" required />
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                >
                                    {categoryOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* ===== Message ===== */}
                            <div>
                                <InputLabel htmlFor="message" value="Message" required />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={8}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                    placeholder="Type your message here..."
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.messages.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
