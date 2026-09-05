import { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import Modal, { ConfirmModal } from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';

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
    const [confirmation, setConfirmation] = useState(null);
    const [pendingSubmission, setPendingSubmission] = useState(null);
    const [announcementViewportHeight, setAnnouncementViewportHeight] = useState(null);

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

    const submitAnnouncement = ({ data, isCreating, announcementId }) => {
        const successMessage = data.status === 'scheduled'
            ? (isCreating ? 'Announcement scheduled successfully.' : 'Announcement schedule updated successfully.')
            : data.status === 'published' && (isCreating || selectedAnnouncement?.status !== 'published')
                ? 'Announcement published successfully.'
                : isCreating
                    ? 'Announcement saved as draft.'
                    : 'Announcement updated successfully.';

        const options = {
            preserveState: true,
            onSuccess: () => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedAnnouncement(null);
                toast.success(successMessage);
            },
            onError: () => toast.error('Please correct the highlighted fields and try again.'),
        };

        if (isCreating) {
            router.post(route('principal.announcements.store'), data, options);
            return;
        }

        router.put(route('principal.announcements.update', announcementId), data, options);
    };

    const handleAnnouncementSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        const isCreating = showCreateModal;
        data.status = publicationMode;

        if (publicationMode !== 'scheduled') {
            delete data.publish_date;
        }

        const submission = {
            data,
            isCreating,
            announcementId: selectedAnnouncement?.id,
        };
        const isPublishingNow = publicationMode === 'published'
            && (isCreating || selectedAnnouncement?.status !== 'published');

        if (isPublishingNow) {
            setPendingSubmission(submission);
            setConfirmation({ type: 'publish' });
            return;
        }

        submitAnnouncement(submission);
    };

    const executeConfirmedAction = () => {
        if (!confirmation) return;

        if (confirmation.type === 'publish' && pendingSubmission) {
            const submission = pendingSubmission;
            setConfirmation(null);
            setPendingSubmission(null);
            submitAnnouncement(submission);
            return;
        }

        if (confirmation.type === 'delete') {
            const announcement = confirmation.announcement;
            setConfirmation(null);
            router.delete(route('principal.announcements.destroy', announcement.id), {
                preserveState: true,
                onSuccess: () => toast.success('Announcement deleted successfully.'),
                onError: () => toast.error('Unable to delete this announcement. Please try again.'),
            });
        }
    };

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...(categories || []).map((cat) => ({ value: cat, label: cat })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'expired', label: 'Expired' },
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
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={row.status} />
                    {row.is_expired && <StatusBadge status="expired" />}
                </div>
            ),
        },
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
            onClick: () => setConfirmation({ type: 'delete', announcement: row })
        },
    ];

    const priorityOptions = ['normal', 'important', 'urgent'];

    const isAnnouncementFormOpen = showCreateModal || showEditModal;

    useEffect(() => {
        if (!isAnnouncementFormOpen || !window.visualViewport) {
            setAnnouncementViewportHeight(null);
            return undefined;
        }

        const syncViewportHeight = () => setAnnouncementViewportHeight(window.visualViewport.height);
        syncViewportHeight();

        window.visualViewport.addEventListener('resize', syncViewportHeight);
        window.visualViewport.addEventListener('scroll', syncViewportHeight);

        return () => {
            window.visualViewport.removeEventListener('resize', syncViewportHeight);
            window.visualViewport.removeEventListener('scroll', syncViewportHeight);
        };
    }, [isAnnouncementFormOpen]);

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => {
            const modalPanel = event.target.closest('.principal-announcement-modal');

            if (modalPanel) {
                const fieldTop = event.target.getBoundingClientRect().top
                    - modalPanel.getBoundingClientRect().top
                    + modalPanel.scrollTop;

                modalPanel.scrollTo({
                    top: Math.max(0, fieldTop - (modalPanel.clientHeight * 0.32)),
                    behavior: 'smooth',
                });
                return;
            }

            event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">Announcements</h2>}
        >
            <Head title="Announcements" />

            <style>{`
                .principal-announcements-page input,
                .principal-announcements-page select,
                .principal-announcements-page textarea,
                .principal-announcement-form input,
                .principal-announcement-form select,
                .principal-announcement-form textarea { scroll-margin-block: 8rem; }
                .principal-announcement-modal {
                    max-height: calc(${announcementViewportHeight ? `${announcementViewportHeight}px` : '100dvh'} - 1rem) !important;
                }
                @media (max-width: 639px) {
                    .principal-announcements-page input,
                    .principal-announcements-page select,
                    .principal-announcements-page textarea,
                    .principal-announcement-form input,
                    .principal-announcement-form select,
                    .principal-announcement-form textarea { font-size: 16px; }
                }
            `}</style>

            <div className="principal-announcements-page py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6">
                            {/* Filters */}
                            <div className="relative z-20 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-4" onFocusCapture={keepFocusedFieldVisible}>
                                <div className="min-w-0">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search announcements..."
                                        size="md"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[12rem_12rem_auto] xl:items-center">
                                    <FilterDropdown
                                        options={categoryOptions}
                                        value={categoryFilter}
                                        onChange={(val) => handleFilterChange('category', val)}
                                        placeholder="Category"
                                        size="md"
                                        className="w-full xl:w-48"
                                    />
                                    <FilterDropdown
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(val) => handleFilterChange('status', val)}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full xl:w-48"
                                    />
                                    {/* 🔧 FIX: Button now matches filter height with py-2 and whitespace-nowrap */}
                                    <PrimaryButton
                                        onClick={() => {
                                            setSelectedAnnouncement(null);
                                            setPublicationMode('draft');
                                            setScheduledAt('');
                                            setShowCreateModal(true);
                                        }}
                                        className="min-h-11 w-full justify-center whitespace-nowrap sm:col-span-2 xl:col-span-1 xl:w-auto"
                                    >
                                        + Create Announcement
                                    </PrimaryButton>
                                </div>
                            </div>

                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="relative z-0 mt-6">
                                <Table
                                    columns={columns}
                                    rows={announcements}
                                    actions={actions}
                                    emptyMessage="No announcements found."
                                    hoverable
                                    striped
                                    responsive
                                    responsiveAt="tablet"
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
                size="3xl"
                className="principal-announcement-modal"
                bodyClassName="py-3 pb-0 sm:py-4"
            >
                <form
                    onSubmit={handleAnnouncementSubmit}
                    className="principal-announcement-form space-y-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pb-4"
                    onFocusCapture={keepFocusedFieldVisible}
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            required
                        />
                        <InputError message={errors?.content} className="mt-2" />
                    </div>

                    {/* Two columns: Priority + Pin */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Publishing option">
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
                                        className={`rounded-lg border px-3 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-900 ${publicationMode === option.value
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    <div className="sticky bottom-0 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_16px_-16px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 sm:-mx-6 sm:px-6 sm:pb-3">
                        <SecondaryButton className="w-full justify-center" type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton className="w-full justify-center" type="submit">
                            {publicationMode === 'scheduled'
                                ? (showCreateModal ? 'Schedule Announcement' : 'Update Schedule')
                                : publicationMode === 'draft'
                                    ? (showCreateModal ? 'Save Draft' : 'Update Draft')
                                    : (showCreateModal ? 'Publish Now' : 'Update Announcement')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {confirmation && (
                <ConfirmModal
                    show
                    onClose={() => {
                        setConfirmation(null);
                        setPendingSubmission(null);
                    }}
                    onConfirm={executeConfirmedAction}
                    title={confirmation.type === 'delete' ? 'Delete announcement?' : 'Publish announcement now?'}
                    message={confirmation.type === 'delete'
                        ? `“${confirmation.announcement.title}” will be permanently deleted. This action cannot be undone.`
                        : 'This announcement will become visible to its selected audience immediately.'}
                    confirmText={confirmation.type === 'delete' ? 'Delete permanently' : 'Publish now'}
                    confirmColor={confirmation.type === 'delete' ? 'red' : 'blue'}
                    danger={confirmation.type === 'delete'}
                />
            )}

            {/* ===== VIEW ANNOUNCEMENT MODAL ===== */}
            <Modal
                show={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedAnnouncement(null); }}
                title="Announcement Details"
                size="xl"
            >
                {selectedAnnouncement && (
                    <div className="space-y-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">Announcement</p>
                                <h3 className="mt-1 break-words text-xl font-bold text-gray-800" title={selectedAnnouncement.title || ''}>
                                    {selectedAnnouncement.title}
                                </h3>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                    <span>Category: {selectedAnnouncement.category}</span>
                                    <span>•</span>
                                    <span>Audience: {selectedAnnouncement.audience === 'all_grades'
                                        ? 'All Students'
                                        : selectedAnnouncement.audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        Status: <StatusBadge status={selectedAnnouncement.status} />
                                        {selectedAnnouncement.is_expired && <StatusBadge status="expired" />}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 sm:w-auto sm:min-w-[190px] sm:text-right dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                                <div className="font-medium text-gray-700 dark:text-slate-200">
                                    {selectedAnnouncement.status === 'scheduled'
                                        ? `Scheduled: ${selectedAnnouncement.publish_date_label}`
                                        : selectedAnnouncement.publish_date_label
                                            ? `Published: ${selectedAnnouncement.publish_date_label}`
                                            : `Created: ${selectedAnnouncement.created_at}`}
                                </div>
                                <div className="mt-1 text-xs">Views: {selectedAnnouncement.view_count}</div>
                                {selectedAnnouncement.expiration_date && (
                                    <div className="mt-1 text-xs">Expires: {selectedAnnouncement.expiration_date_label}</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Message</div>
                            <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-slate-200" title={selectedAnnouncement.content || ''}>
                                {selectedAnnouncement.content}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
