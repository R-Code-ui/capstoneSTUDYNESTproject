import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function AnnouncementForm({
    initialData = {},
    categories = [],
    audienceOptions = [],
    priorityOptions = ['normal', 'important', 'urgent'],
    statusOptions = ['draft', 'published', 'archived'],
    onSubmit,
    onCancel,
    isLoading = false,
    errors = {},
    submitLabel = 'Create Announcement',
    cancelLabel = 'Cancel',
    title = '',
}) {
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        category: initialData.category || '',
        content: initialData.content || '',
        target_audience: initialData.audience || '',
        priority: initialData.priority || 'normal',
        is_pinned: initialData.is_pinned || false,
        status: initialData.status || 'draft',
        publish_date: initialData.publish_date || new Date().toISOString().split('T')[0],
        expiration_date: initialData.expiration_date || '',
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isLoading && <LoadingSpinner overlay size="lg" />}

            {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            )}

            {/* Title */}
            <div>
                <InputLabel htmlFor="title" value="Announcement Title" required />
                <TextInput
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="mt-1 block w-full"
                    required
                />
                <InputError message={errors?.title} className="mt-2" />
            </div>

            {/* Category */}
            <div>
                <InputLabel htmlFor="category" value="Category" required />
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <InputError message={errors?.category} className="mt-2" />
            </div>

            {/* Content */}
            <div>
                <InputLabel htmlFor="content" value="Announcement Content" required />
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    required
                />
                <InputError message={errors?.content} className="mt-2" />
            </div>

            {/* Target Audience */}
            <div>
                <InputLabel htmlFor="target_audience" value="Target Audience" required />
                <select
                    id="target_audience"
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => handleChange('target_audience', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    required
                >
                    <option value="">Select Audience</option>
                    {audienceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <InputError message={errors?.target_audience} className="mt-2" />
            </div>

            {/* Priority */}
            <div>
                <InputLabel htmlFor="priority" value="Priority" required />
                <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    required
                >
                    {priorityOptions.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                </select>
                <InputError message={errors?.priority} className="mt-2" />
            </div>

            {/* Pin & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="is_pinned" value="Pin Announcement" />
                    <select
                        id="is_pinned"
                        name="is_pinned"
                        value={formData.is_pinned ? '1' : '0'}
                        onChange={(e) => handleChange('is_pinned', e.target.value === '1')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                    </select>
                </div>
                <div>
                    <InputLabel htmlFor="status" value="Status" required />
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        required
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="publish_date" value="Publish Date" required />
                    <TextInput
                        id="publish_date"
                        name="publish_date"
                        type="date"
                        value={formData.publish_date}
                        onChange={(e) => handleChange('publish_date', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors?.publish_date} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="expiration_date" value="Expiration Date (Optional)" />
                    <TextInput
                        id="expiration_date"
                        name="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => handleChange('expiration_date', e.target.value)}
                        className="mt-1 block w-full"
                        min={formData.publish_date}
                    />
                    <InputError message={errors?.expiration_date} className="mt-2" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {onCancel && (
                    <SecondaryButton type="button" onClick={onCancel}>
                        {cancelLabel}
                    </SecondaryButton>
                )}
                <PrimaryButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
