import { useEffect, useState } from 'react';
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

export default function StudentManagement({
    students,
    assigned_grades,
    school_years = [],
    status_options = [],
    sort_options = [],
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [schoolYearFilter, setSchoolYearFilter] = useState(filters?.school_year || '');
    const [genderFilter, setGenderFilter] = useState(filters?.gender || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [sort, setSort] = useState(filters?.sort || 'created_at_desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [gender, setGender] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const { errors } = usePage().props;

    useEffect(() => {
        if (showEditModal && selectedUser) {
            setGender(String(selectedUser.gender || '').toLowerCase());
        } else if (showCreateModal) {
            setGender('');
        }
    }, [showEditModal, showCreateModal, selectedUser]);

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.students.index'), {
            data: {
                search,
                grade_level: gradeFilter,
                school_year: schoolYearFilter,
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

    const handleSchoolYearFilterChange = (value) => {
        setSchoolYearFilter(value);
        applyFilters({ school_year: value });
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

    const handleExport = () => {
        if (isExporting) return;

        const params = new URLSearchParams({ search: search || '', grade_level: gradeFilter || '', school_year: schoolYearFilter || '', gender: genderFilter || '', status: statusFilter || '' });
        setIsExporting(true);
        const toastId = toast.loading('Preparing your student export download...');
        const exportWindow = window.open(`${route('teacher.students.export')}?${params.toString()}`, '_blank');

        if (!exportWindow) {
            toast.dismiss(toastId);
            toast.error('Your browser blocked the export download. Please allow pop-ups and try again.');
            setIsExporting(false);
            return;
        }

        exportWindow.opener = null;
        toast.success('Your student export download has started.', { id: toastId });
        setIsExporting(false);
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
            title: 'Archive student?',
            message: (user) => `${user.name} will no longer be able to access their account. You can restore the account later.`,
            confirmText: 'Archive',
            danger: true,
        },
        restore: {
            title: 'Restore student?',
            message: (user) => `${user.name} will be able to access their account again.`,
            confirmText: 'Restore',
            confirmColor: 'green',
        },
        delete: {
            title: 'Permanently delete student?',
            message: (user) => `${user.name} will be permanently deleted. This action cannot be undone.`,
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
            archive: { method: 'delete', url: route('teacher.students.archive', user.id), success: 'Student archived successfully.' },
            restore: { method: 'post', url: route('teacher.students.restore', user.id), success: 'Student restored successfully.' },
            delete: { method: 'delete', url: route('teacher.students.destroy', user.id), success: 'Student deleted successfully.' },
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
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const schoolYearOptions = [
        { value: '', label: 'All School Years' },
        ...school_years.map((year) => ({ value: year, label: year })),
    ];

    const genderOptions = [
        { value: '', label: 'All Genders' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const studentColumns = [
        { key: 'lrn', label: 'Student ID' },
        {
            key: 'student_name',
            label: 'Student Name',
            render: (row) => [row.first_name, row.middle_name, row.last_name]
                .filter(Boolean)
                .join(' ') || 'â€”',
        },
        { key: 'grade_level', label: 'Grade Level' },
        {
            key: 'gender',
            label: 'Gender',
            render: (row) => row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : '—'
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (row) => row.is_active ? (
                <StatusBadge status="active" size="sm" showIcon={false} className="teacher-status-badge teacher-status-badge-active" />
            ) : (
                <span className="teacher-status-badge teacher-status-badge-inactive inline-flex items-center rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                    INACTIVE
                </span>
            ),
        },
    ];

    const ViewIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

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
        { label: 'View', icon: <ViewIcon />, color: 'secondary', onClick: () => { setSelectedUser(row); setShowViewModal(true); } },
        { label: 'Edit', icon: <EditIcon />, color: 'primary', onClick: () => { setSelectedUser(row); setGender((row.gender || '').toLowerCase()); setShowEditModal(true); } },
        { label: 'Reset', icon: <KeyIcon />, color: 'warning', onClick: () => openConfirmation('reset', row) },
        ...(row.is_active
            ? [{ label: 'Archive', icon: <ArchiveIcon />, color: 'danger', onClick: () => openConfirmation('archive', row) }]
            : [{ label: 'Restore', icon: <RestoreIcon />, color: 'success', onClick: () => openConfirmation('restore', row) }]
        ),
        { label: 'Delete', icon: <DeleteIcon />, color: 'danger', onClick: () => openConfirmation('delete', row) },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Student Management</h2>
                    <PrimaryButton onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-2 whitespace-nowrap">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
                        </svg>
                        {isExporting ? 'Preparing Export...' : 'Export CSV'}
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Student Management" />

            <style>{`
                .teacher-status-badge {
                    display: inline-flex !important;
                    width: 72px !important;
                    box-sizing: border-box !important;
                    height: 22px !important;
                    min-height: 22px !important;
                    padding: 0 6px !important;
                    font-size: 11px !important;
                    line-height: 1 !important;
                    justify-content: center !important;
                    white-space: nowrap !important;
                }
                .studynest-layout.theme-dark .teacher-status-badge-active {
                    background-color: rgb(167 243 208) !important;
                    color: rgb(6 78 59) !important;
                }
                .studynest-layout.theme-dark .teacher-status-badge-inactive {
                    background-color: rgb(203 213 225) !important;
                    color: rgb(30 41 59) !important;
                }
                .student-gender-radio {
                    accent-color: rgb(37 99 235) !important;
                }
                .studynest-layout.theme-dark .student-gender-radio {
                    accent-color: rgb(96 165 250) !important;
                }
                .student-gender-radio {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    margin: 0;
                    border: 2px solid rgb(148 163 184);
                    border-radius: 9999px;
                    background: rgb(255 255 255);
                    cursor: pointer;
                }
                .student-gender-radio:checked {
                    border-color: rgb(37 99 235);
                    background: radial-gradient(circle, rgb(255 255 255) 0 34%, rgb(37 99 235) 38% 100%);
                }
                .studynest-layout.theme-dark .student-gender-radio {
                    border-color: rgb(100 116 139);
                    background: rgb(15 23 42);
                }
                .studynest-layout.theme-dark .student-gender-radio:checked {
                    border-color: rgb(96 165 250);
                    background: radial-gradient(circle, rgb(15 23 42) 0 34%, rgb(96 165 250) 38% 100%);
                }
                .student-gender-radio:focus-visible {
                    outline: 2px solid rgb(37 99 235);
                    outline-offset: 2px;
                }
            `}</style>

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
                            {/* Filters & Actions */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={handleGradeFilterChange}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={schoolYearOptions}
                                        value={schoolYearFilter}
                                        onChange={handleSchoolYearFilterChange}
                                        placeholder="School Year"
                                        size="md"
                                        className="w-full"
                                    />
                                    <FilterDropdown
                                        options={genderOptions}
                                        value={genderFilter}
                                        onChange={handleGenderFilterChange}
                                        placeholder="Gender"
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
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="min-w-0 flex-1">
                                        <SearchBar
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search by student ID or name..."
                                            size="md"
                                        />
                                    </div>
                                    <PrimaryButton
                                        onClick={() => { setSelectedUser(null); setGender(''); setShowCreateModal(true); }}
                                        className="justify-center whitespace-nowrap sm:min-w-[152px]"
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
                                    bordered
                                    tableClassName="min-w-[720px]"
                                    headerClassName="border-b border-slate-200 bg-transparent text-slate-600"
                                    rowClassName="border-slate-100"
                                    pagination={pagination}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== VIEW STUDENT MODAL ===== */}
            <Modal
                show={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedUser(null); }}
                title="Student Information"
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[
                                ['Student ID', selectedUser.lrn],
                                ['First Name', selectedUser.first_name],
                                ['Middle Name', selectedUser.middle_name || '—'],
                                ['Last Name', selectedUser.last_name],
                                ['Grade Level', selectedUser.grade_level],
                                ['School Year', selectedUser.school_year || '—'],
                                ['Gender', selectedUser.gender ? selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1) : '—'],
                                ['Status', selectedUser.is_active ? 'Active' : 'Archived'],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
                                    <div className="mt-1 break-words font-medium text-gray-800">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* ===== CREATE/EDIT MODAL ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); setGender(''); }}
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
                            if (showCreateModal) {
                                setSearch('');
                                setGradeFilter('');
                                setSchoolYearFilter('');
                                setGenderFilter('');
                                setStatusFilter('');
                                setSort('created_at_desc');
                            }
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            setSelectedUser(null);
                            setGender('');
                        };

                        const url = showCreateModal
                            ? route('teacher.students.store')
                            : route('teacher.students.update', selectedUser?.id);
                        const method = showCreateModal ? 'post' : 'put';
                        router[method](url, data, {
                            preserveState: true,
                            onSuccess: () => {
                                handleSuccess();
                                toast.success(showCreateModal ? 'Student created successfully.' : 'Student updated successfully.');
                            },
                            onError: () => toast.error('Please correct the highlighted fields and try again.'),
                        });
                    }}
                    className="space-y-4"
                >
                    <input type="hidden" name="_method" value={showCreateModal ? 'POST' : 'PUT'} />

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

                    {/* First Name */}
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

                    {/* Last Name */}
                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            name="last_name"
                            defaultValue={selectedUser?.last_name || ''}
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
                            defaultValue={selectedUser?.middle_name || ''}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors?.middle_name} className="mt-2" />
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

                    {/* School Year */}
                    <div>
                        <InputLabel htmlFor="school_year" value="School Year" />
                        <select
                            id="school_year"
                            name="school_year"
                            defaultValue={selectedUser?.school_year || school_years[0] || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                            required
                        >
                            <option value="">Select School Year</option>
                            {school_years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <InputError message={errors?.school_year} className="mt-2" />
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
                                    checked={gender === 'male'}
                                    onChange={() => setGender('male')}
                                    required
                                    className="student-gender-radio"
                                />
                                <span className="text-sm text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={() => setGender('female')}
                                    className="student-gender-radio"
                                />
                                <span className="text-sm text-gray-700">Female</span>
                            </label>
                        </div>
                        <InputError message={errors?.gender} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <SecondaryButton type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); setGender(''); }}>
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
                                toast.success('Password reset successfully.');
                            },
                            onError: () => toast.error('Please correct the highlighted fields and try again.'),
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
