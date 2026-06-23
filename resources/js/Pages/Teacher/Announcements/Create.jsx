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

export default function AnnouncementsCreate({
    assigned_grades,
    categories,
    priorities,
    statuses,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, errors, post } = useForm({
        title: '',
        category: '',
        content: '',
        target_audience: '',
        priority: 'normal',
        is_pinned: false,
        status: 'draft',
        publish_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('teacher.announcements.store'), {
            data: {
                ...data,
                is_pinned: data.is_pinned ? 1 : 0,
            },
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const audienceOptions = [
        { value: '', label: 'Select Audience' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
        { value: 'all_assigned_students', label: 'All Assigned Students' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Create Announcement</h2>}
        >
            <Head title="Create Announcement" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ===== Section 1: Announcement Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Announcement Information</h3>

                                <div>
                                    <InputLabel htmlFor="title" value="Announcement Title" required />
                                    <TextInput
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        placeholder="Enter announcement title..."
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="category" value="Category" required />
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="content" value="Announcement Content" required />
                                    <textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        required
                                        placeholder="Write your announcement content here..."
                                    />
                                    <InputError message={errors.content} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 2: Target Audience ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Target Audience</h3>
                                <div>
                                    <InputLabel htmlFor="target_audience" value="Target Audience" required />
                                    <select
                                        id="target_audience"
                                        value={data.target_audience}
                                        onChange={(e) => setData('target_audience', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        required
                                    >
                                        {audienceOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.target_audience} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 3: Visibility Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visibility Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="priority" value="Priority" required />
                                        <select
                                            id="priority"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {priorities.map((priority) => (
                                                <option key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.priority} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="is_pinned" value="Pin Announcement" />
                                        <select
                                            id="is_pinned"
                                            value={data.is_pinned ? '1' : '0'}
                                            onChange={(e) => setData('is_pinned', e.target.value === '1')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>
                                        </select>
                                        <InputError message={errors.is_pinned} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 4: Publication Settings ===== */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publication Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="status" value="Status" required />
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                            required
                                        >
                                            {statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="publish_date" value="Publish Date" required />
                                        <TextInput
                                            id="publish_date"
                                            type="date"
                                            value={data.publish_date}
                                            onChange={(e) => setData('publish_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                        />
                                        <InputError message={errors.publish_date} className="mt-2" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="expiration_date" value="Expiration Date (Optional)" />
                                        <TextInput
                                            id="expiration_date"
                                            type="date"
                                            value={data.expiration_date}
                                            onChange={(e) => setData('expiration_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            min={data.publish_date}
                                        />
                                        <InputError message={errors.expiration_date} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.announcements.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Announcement'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
