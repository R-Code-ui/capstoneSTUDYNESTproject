import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import Modal, { ConfirmModal } from '@/Components/Modal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import { toast } from 'sonner';

export default function UserManagement({
    teachers,
    grade_levels,
    status_options = [],
    sort_options = [],
    filters,
    teachers_pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [sort, setSort] = useState(filters?.sort || 'created_at_desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState(null);

    const { errors } = usePage().props;

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search, grade_level: gradeFilter, status: statusFilter, sort, ...additional },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleGradeFilterChange = (value) => {
        setGradeFilter(value);
        applyFilters({ grade_level: value });
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        applyFilters({ status: value });
    };

    const handleSortChange = (value) => {
        setSort(value);
        applyFilters({ sort: value });
    };

    const openConfirmation = (action, user) => setConfirmation({ action, user });

    const confirmationDetails = {
        reset: {
            title: 'Reset password?',
            message: (user) => `You are about to set a new password for ${user.name}.`,
            confirmText: 'Continue',
            confirmColor: 'yellow',
        },
        archive: {
            title: 'Archive teacher?',
            message: (user) => `${user.name} will no longer be able to access their account. You can restore the account later.`,
            confirmText: 'Archive',
            danger: true,
        },
        restore: {
            title: 'Restore teacher?',
            message: (user) => `${user.name} will be able to access their account again.`,
            confirmText: 'Restore',
            confirmColor: 'green',
        },
        delete: {
            title: 'Permanently delete teacher?',
            message: (user) => `${user.name} and their grade assignments will be permanently deleted. This cannot be undone.`,
            confirmText: 'Delete permanently',
            danger: true,
        },
    };

    const executeConfirmedAction = () => {
        if (!confirmation) return;

        const { action, user } = confirmation;
        setConfirmation(null);

        if (action === 'reset') {
            setSelectedUser(user);
            setShowResetModal(true);
            return;
        }

        const requests = {
            archive: {
                method: 'delete',
                url: route('principal.users.archive', user.id),
                success: 'Teacher archived successfully.',
            },
            restore: {
                method: 'post',
                url: route('principal.users.restore', user.id),
                success: 'Teacher restored successfully.',
            },
            delete: {
                method: 'delete',
                url: route('principal.users.destroy', user.id),
                success: 'Teacher deleted successfully.',
            },
        };
        const request = requests[action];

        const options = {
            preserveState: true,
            onSuccess: () => toast.success(request.success),
            onError: () => toast.error('Unable to complete this action. Please try again.'),
        };

        if (request.method === 'post') {
            router.post(request.url, {}, options);
            return;
        }

        router.delete(request.url, options);
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const teacherColumns = [
        {
            key: 'name',
            label: 'Name',
            render: (row) => (
                <span
                    className="principal-user-name block max-w-[180px] truncate"
                    title={row.name || ''}
                >
                    {row.name || '—'}
                </span>
            ),
        },
        { key: 'teacher_id', label: 'Teacher ID' },
        {
            key: 'grade_assignments',
            label: 'Assigned Grades',
            render: (row) => (
                <span
                    className="block max-w-[130px] truncate"
                    title={row.grade_assignments?.join(', ') || 'None'}
                >
                    {row.grade_assignments?.join(', ') || 'None'}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (row) => (
                <StatusBadge
                    status={row.is_active ? 'active' : 'inactive'}
                    className={`principal-user-status ${row.is_active ? 'principal-user-status-active' : 'principal-user-status-inactive'}`}
                />
            ),
        },
        { key: 'created_at', label: 'Date Created' },
    ];

    const EditIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    const ViewIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const KeyIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    );

    const ArchiveIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );

    const RestoreIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    );

    const DeleteIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const teacherActions = (row) => [
        { label: 'View', icon: <ViewIcon />, color: 'secondary', onClick: () => { setSelectedUser(row); setShowViewModal(true); } },
        { label: 'Edit', icon: <EditIcon />, color: 'primary', onClick: () => { setSelectedUser(row); setShowEditModal(true); } },
        { label: 'Reset', icon: <KeyIcon />, color: 'warning', onClick: () => openConfirmation('reset', row) },
        ...(row.is_active
            ? [{ label: 'Archive', icon: <ArchiveIcon />, color: 'danger', onClick: () => openConfirmation('archive', row) }]
            : [{ label: 'Restore', icon: <RestoreIcon />, color: 'success', onClick: () => openConfirmation('restore', row) }]
        ),
        { label: 'Delete', icon: <DeleteIcon />, color: 'danger', onClick: () => openConfirmation('delete', row) },
    ];

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => {
            event.target.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
            });
        }, 150);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">User Management</h2>}
        >
            <Head title="User Management" />

            <style>{`
                .studynest-layout.theme-dark .principal-user-status-inactive {
                    background-color: rgb(71 85 105) !important;
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .principal-user-status-active {
                    background-color: rgb(167 243 208) !important;
                    color: rgb(6 78 59) !important;
                }
                .principal-grade-checkbox {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    flex: 0 0 20px;
                    margin: 0;
                    cursor: pointer;
                    border: 2px solid rgb(71 85 105);
                    border-radius: 4px;
                    background-color: #fff;
                    transition: background-color 150ms, border-color 150ms;
                }
                html.dark .principal-grade-option {
                    border-color: rgb(71 85 105);
                    background-color: rgb(30 41 59);
                    color: rgb(226 232 240);
                }
                html.dark .principal-grade-option:hover {
                    border-color: rgb(96 165 250);
                    background-color: rgb(30 41 59);
                }
                html.dark .principal-grade-checkbox {
                    border-color: rgb(100 116 139);
                    background-color: rgb(15 23 42);
                }
                .principal-grade-checkbox:checked {
                    border-color: rgb(37 99 235);
                    background-color: rgb(37 99 235);
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m4 10 4 4 8-8'/%3E%3C/svg%3E");
                }
                .principal-grade-checkbox:focus-visible {
                    outline: 3px solid rgb(147 197 253);
                    outline-offset: 2px;
                }
                .principal-user-management-page input,
                .principal-user-management-page select,
                .principal-user-management-page textarea {
                    scroll-margin-block: 7rem;
                }
                .principal-teacher-form {
                    scroll-padding-block: 5rem 8rem;
                }
                .principal-teacher-form input,
                .principal-teacher-form select {
                    scroll-margin-block: 5rem 8rem;
                }
                @media (max-width: 639px) {
                    .principal-user-management-page input:not([type="checkbox"]),
                    .principal-user-management-page select,
                    .principal-user-management-page textarea {
                        font-size: 16px;
                    }
                }
            `}</style>

            <div className="principal-user-management-page py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6">
                            {/* Filters & Actions */}
                            <div className="space-y-3" onFocusCapture={keepFocusedFieldVisible}>
                                <div className="min-w-0">
                                    <div className="min-w-0">
                                        <SearchBar
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search teachers..."
                                            size="md"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={handleGradeFilterChange}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={status_options}
                                        value={statusFilter}
                                        onChange={handleStatusFilterChange}
                                        placeholder="Status"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={sort_options}
                                        value={sort}
                                        onChange={handleSortChange}
                                        placeholder="Sort by"
                                        size="md"
                                        className="w-full"
                                    />
                                <PrimaryButton
                                    onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}
                                    className="min-h-11 w-full justify-center whitespace-nowrap xl:w-auto"
                                >
                                    + Add Teacher
                                </PrimaryButton>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={teacherColumns}
                                    rows={teachers}
                                    actions={teacherActions}
                                    emptyMessage="No teachers found."
                                    hoverable
                                    striped
                                    responsive
                                    responsiveAt="tablet"
                                    pagination={teachers_pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== VIEW TEACHER MODAL ===== */}
            <Modal
                show={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedUser(null); }}
                title="Teacher Information"
                size="lg"
            >
                {selectedUser && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[
                            ['Teacher ID', selectedUser.teacher_id || '—'],
                            ['First Name', selectedUser.first_name || '—'],
                            ['Middle Name', selectedUser.middle_name || '—'],
                            ['Last Name', selectedUser.last_name || '—'],
                            ['Assigned Grades', selectedUser.grade_assignments?.join(', ') || '—'],
                            ['Status', selectedUser.is_active ? 'Active' : 'Inactive'],
                            ['Date Created', selectedUser.created_at || '—'],
                            ['Account Role', 'Teacher'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                                <div className="mt-1 break-words font-medium text-gray-800">{value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* ===== CREATE/EDIT MODAL ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); }}
                title={showCreateModal ? 'Add Teacher' : 'Edit Teacher'}
                size="2xl"
                className="max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]"
                bodyClassName="py-3 sm:py-4"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        const gradeLevels = formData.getAll('grade_levels[]');
                        data.grade_levels = gradeLevels.length ? gradeLevels : [];

                        const handleSuccess = () => {
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            setSelectedUser(null);
                        };

                        const url = showCreateModal
                            ? route('principal.users.store.teacher')
                            : route('principal.users.update.teacher', selectedUser?.id);
                        const method = showCreateModal ? 'post' : 'put';
                        router[method](url, data, {
                            preserveState: true,
                            onSuccess: () => {
                                handleSuccess();
                                toast.success(showCreateModal ? 'Teacher created successfully.' : 'Teacher updated successfully.');
                            },
                            onError: () => toast.error('Please correct the highlighted fields and try again.'),
                        });
                    }}
                    className="principal-teacher-form grid grid-cols-1 gap-x-5 gap-y-3 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:grid-cols-2 sm:gap-y-4"
                    onFocusCapture={keepFocusedFieldVisible}
                >
                    <input type="hidden" name="_method" value={showCreateModal ? 'POST' : 'PUT'} />

                    <div>
                        <InputLabel htmlFor="teacher_id" value="Teacher ID" />
                        <TextInput
                            id="teacher_id"
                            name="teacher_id"
                            defaultValue={selectedUser?.teacher_id || ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.teacher_id} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            name="first_name"
                            defaultValue={selectedUser?.first_name || ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.first_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput id="last_name" name="last_name" defaultValue={selectedUser?.last_name || ''} className="mt-1 block w-full" required />
                        <InputError message={errors?.last_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" />
                        <TextInput id="middle_name" name="middle_name" defaultValue={selectedUser?.middle_name || ''} className="mt-1 block w-full" />
                        <InputError message={errors?.middle_name} className="mt-2" />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="grade_levels" value="Assigned Grades" />
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {grade_levels.map((grade) => (
                                <label key={grade} className="principal-grade-option flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50">
                                    <input
                                        type="checkbox"
                                        name="grade_levels[]"
                                        value={grade}
                                        defaultChecked={selectedUser?.grade_assignments?.includes(grade)}
                                        className="principal-grade-checkbox"
                                    />
                                    <span className="text-sm font-medium">{grade}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors?.grade_levels} className="mt-2" />
                    </div>

                    <div className="sticky bottom-0 z-10 col-span-full -mx-4 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:-mx-6 sm:px-6 sm:pb-1">
                        <SecondaryButton className="w-full justify-center" type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton className="w-full justify-center" type="submit">
                            {showCreateModal ? 'Create' : 'Update'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ===== RESET PASSWORD MODAL ===== */}
            <Modal
                show={showResetModal}
                onClose={() => { setShowResetModal(false); setSelectedUser(null); }}
                title="Reset Password"
                size="sm"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        data.new_password = password;

                        router.put(route('principal.users.reset-password', selectedUser?.id), data, {
                            preserveState: true,
                            onSuccess: () => {
                                setShowResetModal(false);
                                setSelectedUser(null);
                                setPassword('');
                                toast.success('Password reset successfully.');
                            },
                            onError: () => toast.error('Please correct the highlighted fields and try again.'),
                        });
                    }}
                    className="space-y-4"
                    onFocusCapture={keepFocusedFieldVisible}
                >
                    <div>
                        <PasswordInput
                            id="new_password"
                            name="new_password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="New Password"
                            required
                            minLength={8}
                            placeholder="Enter new password"
                            error={errors?.new_password}
                        />
                    </div>

                    <div className="sticky bottom-0 z-10 -mx-4 grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] dark:border-slate-700 dark:bg-slate-900 sm:-mx-6 sm:px-6 sm:pb-1">
                        <SecondaryButton className="w-full justify-center" type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); setPassword(''); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton className="w-full justify-center" type="submit">Reset Password</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {confirmation && (
                <ConfirmModal
                    show
                    onClose={() => setConfirmation(null)}
                    onConfirm={executeConfirmedAction}
                    title={confirmationDetails[confirmation.action].title}
                    message={confirmationDetails[confirmation.action].message(confirmation.user)}
                    confirmText={confirmationDetails[confirmation.action].confirmText}
                    confirmColor={confirmationDetails[confirmation.action].confirmColor}
                    danger={confirmationDetails[confirmation.action].danger}
                />
            )}
        </AuthenticatedLayout>
    );
}
