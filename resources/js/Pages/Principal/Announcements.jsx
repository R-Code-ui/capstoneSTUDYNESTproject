import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { formatDate } from '@/Utils/dateHelpers'; // ✅ Import date helper

export default function PrincipalAnnouncements({
    announcements = [],
    categories = [],
    statuses = [],
    audience_options = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { errors } = usePage().props;

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.announcements.index'), {
            data: { search: value, category: categoryFilter, status: statusFilter },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleFilterChange = (type, value) => {
        if (type === 'category') setCategoryFilter(value);
        if (type === 'status') setStatusFilter(value);

        setIsLoading(true);
        router.visit(route('principal.announcements.index'), {
            data: {
                search,
                category: type === 'category' ? value : categoryFilter,
                status: type === 'status' ? value : statusFilter,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleArchive = (announcement) => {
        if (confirm(`Are you sure you want to archive "${announcement.title}"?`)) {
            router.post(route('principal.announcements.archive', announcement.id), {}, { preserveState: true });
        }
    };

    const handlePublish = (announcement) => {
        router.post(route('principal.announcements.publish', announcement.id), {}, { preserveState: true });
    };

    const handleDelete = (announcement) => {
        if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
            router.delete(route('principal.announcements.destroy', announcement.id), { preserveState: true });
        }
    };

    // ✅ SAFE: Use fallback empty arrays if props are undefined
    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...(categories || []).map((cat) => ({ value: cat, label: cat })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...(statuses || []).map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) })),
    ];

    const audienceOptions = (audience_options || []).map((aud) => ({
        value: aud,
        label: aud.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    // ===== SVG ICONS =====
    const ViewIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const EditIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    const PublishIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
    );

    const ArchiveIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );

    const DeleteIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'audience', label: 'Audience', render: (row) => row.audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        { key: 'category', label: 'Category' },
        { key: 'created_at', label: 'Date Posted' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: <ViewIcon />,
            color: 'primary',
            onClick: () => {
                setSelectedAnnouncement(row);
                setShowViewModal(true);
            }
        },
        {
            label: 'Edit',
            icon: <EditIcon />,
            color: 'primary',
            onClick: () => {
                setSelectedAnnouncement(row);
                setShowEditModal(true);
            }
        },
        ...(row.status === 'draft' ? [{
            label: 'Publish',
            icon: <PublishIcon />,
            color: 'success',
            onClick: () => handlePublish(row)
        }] : []),
        ...(row.status !== 'archived' ? [{
            label: 'Archive',
            icon: <ArchiveIcon />,
            color: 'warning',
            onClick: () => handleArchive(row)
        }] : []),
        {
            label: 'Delete',
            icon: <DeleteIcon />,
            color: 'danger',
            onClick: () => handleDelete(row)
        },
    ];

    const priorityOptions = ['normal', 'important', 'urgent'];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Announcements</h2>}
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search announcements..."
                                    size="md"
                                />
                            </div>
                            <div className="flex gap-3">
                                <FilterDropdown
                                    options={categoryOptions}
                                    value={categoryFilter}
                                    onChange={(val) => handleFilterChange('category', val)}
                                    placeholder="Category"
                                    size="md"
                                    className="w-48"
                                />
                                <FilterDropdown
                                    options={statusOptions}
                                    value={statusFilter}
                                    onChange={(val) => handleFilterChange('status', val)}
                                    placeholder="Status"
                                    size="md"
                                    className="w-48"
                                />
                                <PrimaryButton onClick={() => { setSelectedAnnouncement(null); setShowCreateModal(true); }}>
                                    + Create Announcement
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={announcements}
                                actions={actions}
                                emptyMessage="No announcements found."
                                hoverable
                                striped
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* ===== CREATE/EDIT ANNOUNCEMENT MODAL ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}
                title={showCreateModal ? 'Create Announcement' : 'Edit Announcement'}
                size="xl"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());

                        const handleSuccess = () => {
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            setSelectedAnnouncement(null);
                        };

                        if (showCreateModal) {
                            router.post(route('principal.announcements.store'), data, {
                                preserveState: true,
                                onSuccess: handleSuccess,
                            });
                        } else {
                            router.put(route('principal.announcements.update', selectedAnnouncement?.id), data, {
                                preserveState: true,
                                onSuccess: handleSuccess,
                            });
                        }
                    }}
                    className="space-y-4"
                >
                    {/* Title */}
                    <div>
                        <InputLabel htmlFor="title" value="Announcement Title" />
                        <TextInput
                            id="title"
                            name="title"
                            defaultValue={selectedAnnouncement?.title || ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.title} className="mt-2" />
                    </div>

                    {/* Category */}
                    <div>
                        <InputLabel htmlFor="category" value="Category" />
                        <select
                            id="category"
                            name="category"
                            defaultValue={selectedAnnouncement?.category || ''}
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
                        <InputLabel htmlFor="content" value="Announcement Content" />
                        <textarea
                            id="content"
                            name="content"
                            defaultValue={selectedAnnouncement?.content || ''}
                            rows={6}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                            required
                        />
                        <InputError message={errors?.content} className="mt-2" />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <InputLabel htmlFor="target_audience" value="Target Audience" />
                        <select
                            id="target_audience"
                            name="target_audience"
                            defaultValue={selectedAnnouncement?.audience || ''}
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
                        <InputLabel htmlFor="priority" value="Priority" />
                        <select
                            id="priority"
                            name="priority"
                            defaultValue={selectedAnnouncement?.priority || 'normal'}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="is_pinned" value="Pin Announcement" />
                            <select
                                id="is_pinned"
                                name="is_pinned"
                                defaultValue={selectedAnnouncement?.is_pinned ? '1' : '0'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                            >
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                name="status"
                                defaultValue={selectedAnnouncement?.status || 'draft'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                required
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="publish_date" value="Publish Date" />
                            <TextInput
                                id="publish_date"
                                name="publish_date"
                                type="date"
                                defaultValue={selectedAnnouncement?.publish_date || ''}
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
                                defaultValue={selectedAnnouncement?.expiration_date || ''}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors?.expiration_date} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <SecondaryButton type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">
                            {showCreateModal ? 'Create Announcement' : 'Update Announcement'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ===== VIEW ANNOUNCEMENT MODAL ===== */}
            <Modal
                show={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedAnnouncement(null); }}
                title="Announcement Details"
                size="lg"
            >
                {selectedAnnouncement && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedAnnouncement.title}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>Category: {selectedAnnouncement.category}</span>
                                    <span>•</span>
                                    <span>Audience: {selectedAnnouncement.audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span>•</span>
                                    <span>Status: <StatusBadge status={selectedAnnouncement.status} /></span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                <div>Posted: {selectedAnnouncement.created_at}</div>
                                <div>Views: {selectedAnnouncement.view_count}</div>
                                {selectedAnnouncement.expiration_date && (
                                    // ✅ FIX: Format expiration date using the helper
                                    <div>Expires: {formatDate(selectedAnnouncement.expiration_date)}</div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => { setShowViewModal(false); setSelectedAnnouncement(null); }}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
