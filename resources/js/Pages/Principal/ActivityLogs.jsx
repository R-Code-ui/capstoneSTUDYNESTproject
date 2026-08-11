import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';
import { EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ActivityLogs({
    logs,
    summary,
    activity_types,
    grade_levels,
    filters,
    pagination,
}) {
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
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => viewLogDetail(row)
        },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>}
        >
            <Head title="Activity Logs" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* ===== Activity Summary Cards ===== */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{summary.teacher_logins}</div>
                            <div className="text-xs font-medium text-gray-500">Teacher Logins</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{summary.lesson_activities}</div>
                            <div className="text-xs font-medium text-gray-500">Lesson Activities</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{summary.assignment_activities}</div>
                            <div className="text-xs font-medium text-gray-500">Assignment Activities</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{summary.quiz_activities}</div>
                            <div className="text-xs font-medium text-gray-500">Quiz Activities</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800">{summary.other_teacher_activities}</div>
                            <div className="text-xs font-medium text-gray-500">Other Teacher Activities</div>
                        </div>
                    </div>

                    {/* ===== Filters ===== */}
                    {/* 🔧 FIX: Removed overflow-hidden to prevent dropdown clipping */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-6">
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
                                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                                        placeholder="From"
                                    />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                                        placeholder="To"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Log Table ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            <Table
                                columns={columns}
                                rows={logs}
                                actions={actions}
                                emptyMessage="No activity logs found."
                                hoverable
                                striped
                                pagination={pagination}
                            />
                        </div>
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
                                <div className="text-sm text-gray-500">User</div>
                                <div className="font-medium text-gray-800">{selectedLog.user}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Role</div>
                                <div className="font-medium text-gray-800">{selectedLog.role}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Date & Time</div>
                                <div className="font-medium text-gray-800">{selectedLog.date_time}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Module</div>
                                <div className="font-medium text-gray-800">{selectedLog.module || 'N/A'}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-500">Activity Description</div>
                                <div className="font-medium text-gray-800 p-3 bg-gray-50 rounded-lg mt-1">
                                    {selectedLog.activity}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-500">User ID</div>
                                <div className="font-medium text-gray-800">{selectedLog.user_id}</div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <button
                                onClick={() => { setShowLogDetail(false); setSelectedLog(null); }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
