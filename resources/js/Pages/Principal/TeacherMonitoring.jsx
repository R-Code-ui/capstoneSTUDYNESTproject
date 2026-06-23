import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';

export default function TeacherMonitoring({ teachers, grade_levels, status_options, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle search
    const handleSearch = (value) => {
        setSearch(value);
        setIsLoading(true);
        router.visit(route('principal.teachers.index'), {
            data: { search: value, grade_level: gradeFilter, status: statusFilter },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // Handle filter change
    const handleFilterChange = (type, value) => {
        if (type === 'grade') setGradeFilter(value);
        if (type === 'status') setStatusFilter(value);

        setIsLoading(true);
        router.visit(route('principal.teachers.index'), {
            data: {
                search,
                grade_level: type === 'grade' ? value : gradeFilter,
                status: type === 'status' ? value : statusFilter,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    // View teacher profile
    const handleViewProfile = (teacher) => {
        setSelectedTeacher(teacher);
        setShowProfileModal(true);
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        ...status_options.map((status) => ({ value: status, label: status })),
    ];

    const columns = [
        { key: 'name', label: 'Teacher' },
        { key: 'grades', label: 'Grade Handled', render: (row) => row.grades?.join(', ') || 'None' },
        { key: 'lessons_count', label: 'Lessons' },
        { key: 'assignments_count', label: 'Assignments' },
        { key: 'quizzes_count', label: 'Quizzes' },
        { key: 'last_activity', label: 'Last Activity' },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status?.toLowerCase().replace(' ', '_') || 'inactive'} /> },
    ];

    const actions = (row) => [
        { label: 'View Profile', icon: '👤', color: 'primary', onClick: () => handleViewProfile(row) },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Teacher Monitoring</h2>}
        >
            <Head title="Teacher Monitoring" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <SearchBar
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search by name or teacher ID..."
                                    size="md"
                                />
                            </div>
                            <div className="flex gap-3">
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={gradeFilter}
                                    onChange={(val) => handleFilterChange('grade', val)}
                                    placeholder="Grade Level"
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
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        {isLoading && <LoadingSpinner overlay size="lg" />}

                        {/* Table */}
                        <div className="mt-6">
                            <Table
                                columns={columns}
                                rows={teachers}
                                actions={actions}
                                emptyMessage="No teachers found."
                                hoverable
                                striped
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* ===== TEACHER PROFILE MODAL ===== */}
            <Modal
                show={showProfileModal}
                onClose={() => { setShowProfileModal(false); setSelectedTeacher(null); }}
                title={`Teacher Profile: ${selectedTeacher?.name || ''}`}
                size="xl"
            >
                {selectedTeacher && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Teacher ID</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedTeacher.teacher_id}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                                <StatusBadge status={selectedTeacher.is_active ? 'active' : 'inactive'} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Assigned Grades</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedTeacher.grades?.join(', ') || 'None'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Last Activity</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedTeacher.last_activity}</div>
                            </div>
                        </div>

                        {/* Classroom Stats */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Classroom Statistics</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedTeacher.classroom_stats?.total_students || 0}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedTeacher.classroom_stats?.lesson_completion_rate || 0}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Lesson Completion</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedTeacher.classroom_stats?.assignment_completion_rate || 0}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Assignment Completion</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedTeacher.classroom_stats?.quiz_participation_rate || 0}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Quiz Participation</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activities</h4>
                            <div className="space-y-2">
                                {selectedTeacher.recent_activities?.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities.</p>
                                ) : (
                                    selectedTeacher.recent_activities?.map((activity, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {activity.type === 'lesson' && '📚 '}
                                                    {activity.type === 'assignment' && '📝 '}
                                                    {activity.type === 'quiz' && '📊 '}
                                                    {activity.title}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => { setShowProfileModal(false); setSelectedTeacher(null); }}
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
