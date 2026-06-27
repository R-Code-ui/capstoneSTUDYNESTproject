import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline'; // ✅ ADD THIS

export default function ActivityLogs({ logs, summary, activity_types, grade_levels, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [activityTypeFilter, setActivityTypeFilter] = useState(filters?.activity_type || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogDetail, setShowLogDetail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'activity_type') setActivityTypeFilter(value);
        if (type === 'grade') setGradeFilter(value);
        if (type === 'date_from') setDateFrom(value);
        if (type === 'date_to') setDateTo(value);

        applyFilters({
            ...(type === 'activity_type' ? { activity_type: value } : {}),
            ...(type === 'grade' ? { grade_level: value } : {}),
            ...(type === 'date_from' ? { date_from: value } : {}),
            ...(type === 'date_to' ? { date_to: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('principal.logs.index'), {
            data: {
                search: search,
                activity_type: activityTypeFilter,
                grade_level: gradeFilter,
                date_from: dateFrom,
                date_to: dateTo,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const viewLogDetail = (log) => {
        setSelectedLog(log);
        setShowLogDetail(true);
    };

    const activityTypeOptions = [
        { value: '', label: 'All Activities' },
        ...activity_types.map((type) => ({ value: type, label: type })),
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const columns = [
        { key: 'date_time', label: 'Date & Time' },
        { key: 'user', label: 'User' },
        { key: 'role', label: 'Role' },
        { key: 'activity', label: 'Activity' },
        { key: 'module', label: 'Module' },
    ];

    const actions = (row) => [
        {
            label: 'View Details',
            icon: <EyeIcon className="w-4 h-4" />, // ✅ REPLACED EMOJI WITH HEROICON
            color: 'primary',
            onClick: () => viewLogDetail(row)
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Activity Logs</h2>}
        >
            <Head title="Activity Logs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Activity Summary Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.teacher_logins}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Teacher Logins</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.lesson_uploads}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Lesson Uploads</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.assignments_created}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Assignments Created</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.quiz_attempts}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Quiz Attempts</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.student_submissions}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Student Submissions</div>
                        </Card>
                    </div>

                    {/* ===== Filters ===== */}
                    <div className="mt-6">
                        <Card>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search by user or activity..."
                                        size="md"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <FilterDropdown
                                        options={activityTypeOptions}
                                        value={activityTypeFilter}
                                        onChange={(val) => handleFilterChange('activity_type', val)}
                                        placeholder="Activity Type"
                                        size="md"
                                        className="w-48"
                                    />
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={(val) => handleFilterChange('grade', val)}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-40"
                                    />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-200 w-36"
                                        placeholder="From"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-200 w-36"
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Log Table ===== */}
                    <div className="mt-6">
                        <Card>
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            <Table
                                columns={columns}
                                rows={logs}
                                actions={actions}
                                emptyMessage="No activity logs found."
                                hoverable
                                striped
                            />
                        </Card>
                    </div>
                </div>
            </div>

            {/* ===== Log Detail Modal ===== */}
            <Modal
                show={showLogDetail}
                onClose={() => { setShowLogDetail(false); setSelectedLog(null); }}
                title="Activity Details"
                size="md"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">User</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedLog.user}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Role</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedLog.role}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Date & Time</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedLog.date_time}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Module</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedLog.module || 'N/A'}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Activity Description</div>
                                <div className="font-medium text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1">
                                    {selectedLog.activity}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-500 dark:text-gray-400">User ID</div>
                                <div className="font-medium text-gray-900 dark:text-white">{selectedLog.user_id}</div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => { setShowLogDetail(false); setSelectedLog(null); }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" /> {/* ✅ REPLACED "Close" text with icon */}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
