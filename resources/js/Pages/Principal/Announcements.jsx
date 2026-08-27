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

const manilaDateTimeInput = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
}).format(date).replace(' ', 'T');

export default function PrincipalAnnouncements({
    announcements = [],
    categories = [],
    statuses = [],
    audience_options = [],
    filters = {},
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [publicationMode, setPublicationMode] = useState('draft');
    const [scheduledAt, setScheduledAt] = useState('');

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

    const handleDelete = (announcement) => {
        if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
            router.delete(route('principal.announcements.destroy', announcement.id), { preserveState: true });
        }
    };

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
        label: aud === 'all_grades'
            ? 'All Students'
            : aud.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    // SVG ICONS
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

    const DeleteIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const columns = [
        {
            key: 'title',
            label: 'Title',
            render: (row) => (
                <span className="block max-w-[260px] truncate" title={row.title || ''}>
                    {row.title || '—'}
                </span>
            ),
        },
        {
            key: 'audience',
            label: 'Audience',
            render: (row) => {
                const audience = row.audience === 'all_grades'
                    ? 'All Students'
                    : row.audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—';
                return <span className="block max-w-[170px] truncate" title={audience}>{audience}</span>;
            },
        },
        { key: 'category', label: 'Category' },
        {
            key: 'publish_date',
            label: 'Publication',
            render: (row) => {
                if (row.status === 'scheduled') return `Scheduled ${row.publish_date_short}`;
                if (row.status === 'published') return `Published ${row.publish_date_short}`;
                if (row.status === 'archived' && row.publish_date_short) return `Published ${row.publish_date_short}`;
                return 'Not published';
            },
        },
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
                setPublicationMode(row.status);
                setScheduledAt(row.status === 'scheduled' ? (row.publish_date || '') : '');
                setShowEditModal(true);
            }
        },
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
            header={<h2 className="text-xl font-bold text-gray-800">Announcements</h2>}
        >
            <Head title="Announcements" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
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
                                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                                    <FilterDropdown
                                        options={categoryOptions}
                                        value={categoryFilter}
                                        onChange={(val) => handleFilterChange('category', val)}
                                        placeholder="Category"
                                        size="md"
                                        className="w-full sm:w-48"
                                    />
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full sm:w-48"
                                    />
                                    {/* 🔧 FIX: Button now matches filter height with py-2 and whitespace-nowrap */}
                                    <PrimaryButton
                                        onClick={() => {
                                            setSelectedAnnouncement(null);
                                            setPublicationMode('draft');
                                            setScheduledAt('');
                                            setShowCreateModal(true);
                                        }}
                                        className="w-full justify-center py-2 whitespace-nowrap sm:w-auto"
                                    >
                                        + Create Announcement
                                    </PrimaryButton>
                                </div>
                            </div>

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
                                    pagination={pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== CREATE/EDIT ANNOUNCEMENT MODAL (Compact Grid Layout) ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}
                title={showCreateModal ? 'Create Announcement' : 'Edit Announcement'}
                size="2xl"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        data.status = publicationMode;

                        if (publicationMode !== 'scheduled') {
                            delete data.publish_date;
                        }

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
                    {/* Title – full width */}
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

                    {/* Two columns: Category + Target Audience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="category" value="Category" />
                            <select
                                id="category"
                                name="category"
                                defaultValue={selectedAnnouncement?.category || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <InputError message={errors?.category} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="target_audience" value="Target Audience" />
                            <select
                                id="target_audience"
                                name="target_audience"
                                defaultValue={selectedAnnouncement?.audience || ''}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                required
                            >
                                <option value="">Select Audience</option>
                                {audienceOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <InputError message={errors?.target_audience} className="mt-2" />
                        </div>
                    </div>

                    {/* Content – full width, but fewer rows */}
                    <div>
                        <InputLabel htmlFor="content" value="Announcement Content" />
                        <textarea
                            id="content"
                            name="content"
                            defaultValue={selectedAnnouncement?.content || ''}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            required
                        />
                        <InputError message={errors?.content} className="mt-2" />
                    </div>

                    {/* Two columns: Priority + Pin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="priority" value="Priority" />
                            <select
                                id="priority"
                                name="priority"
                                defaultValue={selectedAnnouncement?.priority || 'normal'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                                required
                            >
                                {priorityOptions.map((p) => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                            <InputError message={errors?.priority} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="is_pinned" value="Pin Announcement" />
                            <select
                                id="is_pinned"
                                name="is_pinned"
                                defaultValue={selectedAnnouncement?.is_pinned ? '1' : '0'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            >
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                            <InputError message={errors?.is_pinned} className="mt-2" />
                        </div>

                    </div>

                    <div>
                        <InputLabel value="Publishing Option" />
                        {['published', 'archived'].includes(selectedAnnouncement?.status) ? (
                            <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                {selectedAnnouncement.status === 'published'
                                    ? `Published ${selectedAnnouncement.publish_date_label || ''}`
                                    : 'Archived'}
                            </div>
                        ) : (
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Publishing option">
                                {[
                                    { value: 'draft', label: 'Save as draft', help: 'Only you can see it' },
                                    { value: 'published', label: 'Publish now', help: 'Visible immediately' },
                                    { value: 'scheduled', label: 'Schedule', help: 'Publish automatically' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setPublicationMode(option.value)}
                                        aria-pressed={publicationMode === option.value}
                                        className={`rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-900 ${publicationMode === option.value
                                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-500/20 dark:ring-blue-400'
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-900/40 dark:hover:border-slate-500 dark:hover:bg-slate-800'}`}
                                    >
                                        <span className={`block text-sm font-semibold ${publicationMode === option.value
                                            ? 'text-blue-900 dark:text-blue-100'
                                            : 'text-gray-800 dark:text-slate-100'}`}>{option.label}</span>
                                        <span className={`block text-xs ${publicationMode === option.value
                                            ? 'text-blue-700 dark:text-blue-200'
                                            : 'text-gray-500 dark:text-slate-400'}`}>{option.help}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <InputError message={errors?.status} className="mt-2" />
                    </div>

                    {/* Schedule Date & Time + Expiration Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {publicationMode === 'scheduled' && (
                            <div>
                                <InputLabel htmlFor="publish_date" value="Schedule Date & Time" />
                                <TextInput
                                    id="publish_date"
                                    name="publish_date"
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(event) => setScheduledAt(event.target.value)}
                                    min={manilaDateTimeInput()}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Asia/Manila (PHT)</p>
                                <InputError message={errors?.publish_date} className="mt-2" />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="expiration_date" value="Expiration Date & Time (Optional)" />
                            <TextInput
                                id="expiration_date"
                                name="expiration_date"
                                type="datetime-local"
                                defaultValue={selectedAnnouncement?.expiration_date || ''}
                                min={publicationMode === 'scheduled' && scheduledAt ? scheduledAt : manilaDateTimeInput()}
                                className="mt-1 block w-full"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Must be after publication · Asia/Manila (PHT)</p>
                            <InputError message={errors?.expiration_date} className="mt-2" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-slate-700">
                        <SecondaryButton type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">
                            {publicationMode === 'scheduled'
                                ? (showCreateModal ? 'Schedule Announcement' : 'Update Schedule')
                                : publicationMode === 'draft'
                                    ? (showCreateModal ? 'Save Draft' : 'Update Draft')
                                    : (showCreateModal ? 'Publish Now' : 'Update Announcement')}
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
                            <div className="min-w-0 flex-1">
                                <h3 className="max-w-[320px] truncate text-xl font-bold text-gray-800" title={selectedAnnouncement.title || ''}>
                                    {selectedAnnouncement.title}
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                                    <span>Category: {selectedAnnouncement.category}</span>
                                    <span>•</span>
                                    <span>Audience: {selectedAnnouncement.audience === 'all_grades'
                                        ? 'All Students'
                                        : selectedAnnouncement.audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span>•</span>
                                    <span>Status: <StatusBadge status={selectedAnnouncement.status} /></span>
                                </div>
                            </div>
                            <div className="shrink-0 text-right text-sm text-gray-500">
                                <div>
                                    {selectedAnnouncement.status === 'scheduled'
                                        ? `Scheduled: ${selectedAnnouncement.publish_date_label}`
                                        : selectedAnnouncement.publish_date_label
                                            ? `Published: ${selectedAnnouncement.publish_date_label}`
                                            : `Created: ${selectedAnnouncement.created_at}`}
                                </div>
                                <div>Views: {selectedAnnouncement.view_count}</div>
                                {selectedAnnouncement.expiration_date && (
                                    <div>Expires: {selectedAnnouncement.expiration_date_label}</div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-gray-700" title={selectedAnnouncement.content || ''}>
                                {selectedAnnouncement.content}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
