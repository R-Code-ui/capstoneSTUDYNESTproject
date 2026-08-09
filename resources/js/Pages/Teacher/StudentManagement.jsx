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

export default function StudentManagement({
    students,
    assigned_grades,
    status_options = [],
    sort_options = [],
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [genderFilter, setGenderFilter] = useState(filters?.gender || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [sort, setSort] = useState(filters?.sort || 'name_asc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');

    const { errors } = usePage().props;

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.students.index'), {
            data: {
                search,
                grade_level: gradeFilter,
                gender: genderFilter,
                status: statusFilter,
                sort,
                ...additional,
            },
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

    const handleGenderFilterChange = (value) => {
        setGenderFilter(value);
        applyFilters({ gender: value });
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        applyFilters({ status: value });
    };

    const handleSortChange = (value) => {
        setSort(value);
        applyFilters({ sort: value });
    };

    const handleArchive = (user) => {
        if (confirm(`Are you sure you want to archive ${user.name}?`)) {
            router.delete(route('teacher.students.archive', user.id), {
                preserveState: true,
            });
        }
    };

    const handleRestore = (user) => {
        router.post(route('teacher.students.restore', user.id), {}, {
            preserveState: true,
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            router.delete(route('teacher.students.destroy', user.id), {
                preserveState: true,
            });
        }
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const genderOptions = [
        { value: '', label: 'All Genders' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const studentColumns = [
        { key: 'name', label: 'Name' },
        { key: 'lrn', label: 'Student ID' },
        { key: 'grade_level', label: 'Grade Level' },
        {
            key: 'gender',
            label: 'Gender',
            render: (row) => row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : '—'
        },
        { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
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

    const studentActions = (row) => [
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
            header={<h2 className="text-xl font-bold text-gray-800">Student Management</h2>}
        >
            <Head title="Student Management" />

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
                                        placeholder="Search students..."
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
                                        className="w-36"
                                    />
                                    <FilterDropdown
                                        options={genderOptions}
                                        value={genderFilter}
                                        onChange={handleGenderFilterChange}
                                        placeholder="Gender"
                                        size="md"
                                        className="w-36"
                                    />
                                    <FilterDropdown
                                        options={status_options}
                                        value={statusFilter}
                                        onChange={handleStatusFilterChange}
                                        placeholder="Status"
                                        size="md"
                                        className="w-36"
                                    />
                                    <FilterDropdown
                                        options={sort_options}
                                        value={sort}
                                        onChange={handleSortChange}
                                        placeholder="Sort by"
                                        size="md"
                                        className="w-40"
                                    />
                                    <PrimaryButton
                                        onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}
                                        className="py-2 whitespace-nowrap"
                                    >
                                        + Add Student
                                    </PrimaryButton>
                                </div>
                            </div>

                            {/* Loading Spinner */}
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            {/* Table */}
                            <div className="mt-6">
                                <Table
                                    columns={studentColumns}
                                    rows={students}
                                    actions={studentActions}
                                    emptyMessage="No students found."
                                    hoverable
                                    striped
                                    pagination={pagination}
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
                title={showCreateModal ? 'Add Student' : 'Edit Student'}
                size="lg"
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
                            setSelectedUser(null);
                        };

                        const url = showCreateModal
                            ? route('teacher.students.store')
                            : route('teacher.students.update', selectedUser?.id);
                        const method = showCreateModal ? 'post' : 'put';
                        router[method](url, data, {
                            preserveState: true,
                            onSuccess: handleSuccess,
                        });
                    }}
                    className="space-y-4"
                >
                    <input type="hidden" name="_method" value={showCreateModal ? 'POST' : 'PUT'} />

                    {/* First Name */}
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            name="first_name"
                            defaultValue={selectedUser?.name ? selectedUser.name.split(' ')[0] : ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.first_name} className="mt-2" />
                    </div>

                    {/* Last Name */}
                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            name="last_name"
                            defaultValue={selectedUser?.name ? selectedUser.name.split(' ').slice(-1)[0] : ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.last_name} className="mt-2" />
                    </div>

                    {/* Middle Name */}
                    <div>
                        <InputLabel htmlFor="middle_name" value="Middle Name (Optional)" />
                        <TextInput
                            id="middle_name"
                            name="middle_name"
                            defaultValue={selectedUser?.name && selectedUser.name.split(' ').length > 2 ? selectedUser.name.split(' ').slice(1, -1).join(' ') : ''}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors?.middle_name} className="mt-2" />
                    </div>

                    {/* Student ID */}
                    <div>
                        <InputLabel htmlFor="lrn" value="Student ID" />
                        <TextInput
                            id="lrn"
                            name="lrn"
                            defaultValue={selectedUser?.lrn || ''}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors?.lrn} className="mt-2" />
                    </div>

                    {/* Grade Level */}
                    <div>
                        <InputLabel htmlFor="grade_level" value="Grade Level" />
                        <select
                            id="grade_level"
                            name="grade_level"
                            defaultValue={selectedUser?.grade_level || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            required
                        >
                            <option value="">Select Grade Level</option>
                            {assigned_grades.map((grade) => (
                                <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                        <InputError message={errors?.grade_level} className="mt-2" />
                    </div>

                    {/* Gender */}
                    <div>
                        <InputLabel value="Gender" required />
                        <div className="mt-2 flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    defaultChecked={selectedUser?.gender === 'male'}
                                    className="rounded border-gray-300 text-gray-600 shadow-sm focus:ring-blue-600"
                                />
                                <span className="text-sm text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    defaultChecked={selectedUser?.gender === 'female'}
                                    className="rounded border-gray-300 text-gray-600 shadow-sm focus:ring-blue-600"
                                />
                                <span className="text-sm text-gray-700">Female</span>
                            </label>
                        </div>
                        <InputError message={errors?.gender} className="mt-2" />
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

                        router.put(route('teacher.students.reset-password', selectedUser?.id), data, {
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
                            className="!bg-white"
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
