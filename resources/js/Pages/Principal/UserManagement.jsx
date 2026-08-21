import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import Modal from '@/Components/Modal';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';

export default function UserManagement({
    teachers,
    grade_levels,
    filters,
    teachers_pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');

    const { errors } = usePage().props;

    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search: value, grade_level: gradeFilter },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleGradeFilterChange = (value) => {
        setGradeFilter(value);
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search, grade_level: value },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleArchive = (user) => {
        if (confirm(`Are you sure you want to archive ${user.name}?`)) {
            router.delete(route('principal.users.archive', user.id), {
                preserveState: true,
            });
        }
    };

    const handleRestore = (user) => {
        router.post(route('principal.users.restore', user.id), {}, {
            preserveState: true,
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            router.delete(route('principal.users.destroy', user.id), {
                preserveState: true,
            });
        }
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
        { label: 'Edit', icon: <EditIcon />, color: 'primary', onClick: () => { setSelectedUser(row); setShowEditModal(true); } },
        { label: 'Reset', icon: <KeyIcon />, color: 'warning', onClick: () => { setSelectedUser(row); setShowResetModal(true); } },
        ...(row.is_active
            ? [{ label: 'Archive', icon: <ArchiveIcon />, color: 'danger', onClick: () => handleArchive(row) }]
            : [{ label: 'Restore', icon: <RestoreIcon />, color: 'success', onClick: () => handleRestore(row) }]
        ),
        { label: 'Delete', icon: <DeleteIcon />, color: 'danger', onClick: () => handleDelete(row) },
    ];

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
            `}</style>

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters & Actions */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search teachers..."
                                        size="md"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={handleGradeFilterChange}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-full sm:w-36"
                                    />
                                    <PrimaryButton
                                        onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}
                                        className="w-full justify-center py-2 whitespace-nowrap sm:w-auto"
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
                                    pagination={teachers_pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== CREATE/EDIT MODAL ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); }}
                title={showCreateModal ? 'Add Teacher' : 'Edit Teacher'}
                size="lg"
                bodyClassName="py-3"
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
                            onSuccess: handleSuccess,
                        });
                    }}
                    className="space-y-3"
                >
                    <input type="hidden" name="_method" value={showCreateModal ? 'POST' : 'PUT'} />

                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            name="name"
                            defaultValue={selectedUser?.name || ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.name} className="mt-2" />
                    </div>

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
                        <InputLabel htmlFor="grade_levels" value="Assigned Grades" />
                        <div className="mt-2 space-y-2">
                            {grade_levels.map((grade) => (
                                <label key={grade} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="grade_levels[]"
                                        value={grade}
                                        defaultChecked={selectedUser?.grade_assignments?.includes(grade)}
                                    />
                                    <span className="text-sm text-gray-700">{grade}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors?.grade_levels} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">
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
                            }
                        });
                    }}
                    className="space-y-4"
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

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); setPassword(''); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">Reset Password</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
