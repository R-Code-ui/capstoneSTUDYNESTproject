import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
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

export default function UserManagement({ teachers, students, grade_levels, filters }) {
    const [activeTab, setActiveTab] = useState('teachers');
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { errors } = usePage().props;

    // Handle search with debounce
    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search: value, grade_level: gradeFilter, role: activeTab },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle filter change
    const handleFilterChange = (value) => {
        setGradeFilter(value);
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search, grade_level: value, role: activeTab },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsLoading(true);
        router.visit(route('principal.users.index'), {
            data: { search, grade_level: gradeFilter, role: tab },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle delete/archive
    const handleArchive = (user) => {
        if (confirm(`Are you sure you want to archive ${user.name}?`)) {
            router.delete(route('principal.users.archive', user.id), {
                preserveState: true,
            });
        }
    };

    // Handle restore
    const handleRestore = (user) => {
        router.post(route('principal.users.restore', user.id), {}, {
            preserveState: true,
        });
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    // Teacher table columns
    const teacherColumns = [
        { key: 'name', label: 'Name' },
        { key: 'teacher_id', label: 'Teacher ID' },
        { key: 'grade_assignments', label: 'Assigned Grades', render: (row) => row.grade_assignments?.join(', ') || 'None' },
        { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
        { key: 'created_at', label: 'Date Created' },
    ];

    const studentColumns = [
        { key: 'name', label: 'Name' },
        { key: 'lrn', label: 'LRN' },
        { key: 'grade_level', label: 'Grade Level' },
        { key: 'is_active', label: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
        { key: 'created_at', label: 'Date Created' },
    ];

    const teacherActions = (row) => [
        { label: 'Edit', icon: '✏️', color: 'primary', onClick: () => { setSelectedUser(row); setShowEditModal(true); } },
        { label: 'Reset Password', icon: '🔑', color: 'warning', onClick: () => { setSelectedUser(row); setShowResetModal(true); } },
        ...(row.is_active
            ? [{ label: 'Archive', icon: '📦', color: 'danger', onClick: () => handleArchive(row) }]
            : [{ label: 'Restore', icon: '↩️', color: 'success', onClick: () => handleRestore(row) }]
        ),
    ];

    const studentActions = (row) => [
        { label: 'Edit', icon: '✏️', color: 'primary', onClick: () => { setSelectedUser(row); setShowEditModal(true); } },
        { label: 'Reset Password', icon: '🔑', color: 'warning', onClick: () => { setSelectedUser(row); setShowResetModal(true); } },
        ...(row.is_active
            ? [{ label: 'Archive', icon: '📦', color: 'danger', onClick: () => handleArchive(row) }]
            : [{ label: 'Restore', icon: '↩️', color: 'success', onClick: () => handleRestore(row) }]
        ),
    ];

    const currentData = activeTab === 'teachers' ? teachers : students;
    const currentColumns = activeTab === 'teachers' ? teacherColumns : studentColumns;
    const currentActions = activeTab === 'teachers' ? teacherActions : studentActions;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">User Management</h2>}
        >
            <Head title="User Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => handleTabChange('teachers')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                                        activeTab === 'teachers'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Teachers ({teachers.length})
                                </button>
                                <button
                                    onClick={() => handleTabChange('students')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                                        activeTab === 'students'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Students ({students.length})
                                </button>
                            </nav>
                        </div>

                        {/* Filters & Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder={`Search ${activeTab}...`}
                                    size="md"
                                />
                            </div>
                            <div className="flex gap-3">
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={gradeFilter}
                                    onChange={handleFilterChange}
                                    placeholder="Grade Level"
                                    size="md"
                                    className="w-48"
                                />
                                <PrimaryButton onClick={() => { setSelectedUser(null); setShowCreateModal(true); }}>
                                    + Add {activeTab === 'teachers' ? 'Teacher' : 'Student'}
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={currentColumns}
                                rows={currentData}
                                actions={currentActions}
                                emptyMessage={`No ${activeTab} found.`}
                                hoverable
                                striped
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* ===== CREATE/EDIT MODAL ===== */}
            <Modal
                show={showCreateModal || showEditModal}
                onClose={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedUser(null); }}
                title={showCreateModal ? `Add ${activeTab === 'teachers' ? 'Teacher' : 'Student'}` : `Edit ${activeTab === 'teachers' ? 'Teacher' : 'Student'}`}
                size="lg"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());

                        if (activeTab === 'teachers') {
                            const url = showCreateModal
                                ? route('principal.users.store.teacher')
                                : route('principal.users.update.teacher', selectedUser?.id);
                            const method = showCreateModal ? 'post' : 'put';
                            router[method](url, data, { preserveState: true });
                        } else {
                            const url = showCreateModal
                                ? route('principal.users.store.student')
                                : route('principal.users.update.student', selectedUser?.id);
                            const method = showCreateModal ? 'post' : 'put';
                            router[method](url, data, { preserveState: true });
                        }
                    }}
                    className="space-y-4"
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

                    {activeTab === 'teachers' ? (
                        <>
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
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{grade}</span>
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors?.grade_levels} className="mt-2" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <InputLabel htmlFor="lrn" value="LRN" />
                                <TextInput
                                    id="lrn"
                                    name="lrn"
                                    defaultValue={selectedUser?.lrn || ''}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors?.lrn} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="grade_level" value="Grade Level" />
                                <select
                                    id="grade_level"
                                    name="grade_level"
                                    defaultValue={selectedUser?.grade_level || ''}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    required
                                >
                                    <option value="">Select Grade Level</option>
                                    {grade_levels.map((grade) => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                                <InputError message={errors?.grade_level} className="mt-2" />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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

                        router.put(route('principal.users.reset-password', selectedUser?.id), data, {
                            preserveState: true,
                            onSuccess: () => {
                                setShowResetModal(false);
                                setSelectedUser(null);
                            }
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <InputLabel htmlFor="new_password" value="New Password" />
                        <TextInput
                            id="new_password"
                            name="new_password"
                            type="password"
                            className="mt-1 block w-full"
                            required
                            minLength={8}
                        />
                        <InputError message={errors?.new_password} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <SecondaryButton type="button" onClick={() => { setShowResetModal(false); setSelectedUser(null); }}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">Reset Password</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
