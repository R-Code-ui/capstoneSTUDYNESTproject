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
import PublishingOptions from '@/Components/PublishingOptions';

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
        publish_date: '',
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
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Create Announcement</span>}
        >
            <Head title="Create Announcement" />

            <style>{`
                .studynest-layout.theme-dark .announcement-form-shell input:not([type="file"]),
                .studynest-layout.theme-dark .announcement-form-shell select,
                .studynest-layout.theme-dark .announcement-form-shell textarea {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(226 232 240) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .announcement-form-shell input::placeholder,
                .studynest-layout.theme-dark .announcement-form-shell textarea::placeholder {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .announcement-form-shell option {
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
            `}</style>

            <div className="py-12">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="announcement-form-shell bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isSubmitting && <LoadingSpinner overlay size="lg" />}

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* ===== Section 1: Announcement Information ===== */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Announcement Information</h3>
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        required
                                        placeholder="Write your announcement content here..."
                                    />
                                    <InputError message={errors.content} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Section 2: Target Audience ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Target Audience</h3>
                                <div>
                                    <InputLabel htmlFor="target_audience" value="Target Audience" required />
                                    <select
                                        id="target_audience"
                                        value={data.target_audience}
                                        onChange={(e) => setData('target_audience', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Visibility Settings</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="priority" value="Priority" required />
                                        <select
                                            id="priority"
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
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
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 text-gray-800"
                                        >
                                            <option value="0">No</option>
                                            <option value="1">Yes</option>
                                        </select>
                                        <InputError message={errors.is_pinned} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* ===== Section 4: Publication Settings ===== */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Publication Settings</h3>
                                <PublishingOptions data={data} setData={setData} errors={errors} />
                                <div className="mt-4">
                                        <InputLabel htmlFor="expiration_date" value="Expiration Date (Optional)" />
                                        <TextInput
                                            id="expiration_date"
                                            type="datetime-local"
                                            value={data.expiration_date}
                                            onChange={(e) => setData('expiration_date', e.target.value)}
                                            className="mt-1 block w-full"
                                            min={data.status === 'scheduled' ? data.publish_date : undefined}
                                        />
                                        <InputError message={errors.expiration_date} className="mt-2" />
                                </div>
                            </div>

                            {/* ===== Actions ===== */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <SecondaryButton type="button" onClick={() => router.visit(route('teacher.announcements.index'))}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Announcement'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
