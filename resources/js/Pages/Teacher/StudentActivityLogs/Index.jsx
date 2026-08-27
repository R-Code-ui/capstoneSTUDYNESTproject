import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';
import { EyeIcon } from '@heroicons/react/24/outline';

export default function Index({ logs, summary, activity_types = [], grade_levels = [], filters = {}, pagination }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [grade, setGrade] = useState(filters.grade_level || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const [loading, setLoading] = useState(false);

    const applyFilters = (additional = {}) => {
        setLoading(true);
        router.visit(route('teacher.activity-logs.index'), {
            data: { search, activity_type: activityType, grade_level: grade, date_from: dateFrom, date_to: dateTo, ...additional },
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const changeFilter = (name, value) => {
        if (name === 'activity_type') setActivityType(value);
        if (name === 'grade_level') setGrade(value);
        if (name === 'date_from') setDateFrom(value);
        if (name === 'date_to') setDateTo(value);
        applyFilters({ [name]: value });
    };

    const activityOptions = [{ value: '', label: 'All Activities' }, ...activity_types.filter((type) => type !== 'All Activities').map((type) => ({ value: type, label: type }))];
    const gradeOptions = [{ value: '', label: 'All Assigned Grades' }, ...grade_levels.map((value) => ({ value, label: value }))];
    const columns = [
        {
            key: 'date_time',
            label: 'Date & Time',
            render: (row) => <div className="max-w-[120px] truncate" title={row.date_time}>{row.date_time}</div>,
        },
        {
            key: 'student',
            label: 'Student',
            render: (row) => <div className="max-w-[140px] truncate" title={row.student}>{row.student}</div>,
        },
        {
            key: 'activity',
            label: 'Activity',
            render: (row) => <div className="max-w-[320px] truncate" title={row.activity}>{row.activity}</div>,
        },
        {
            key: 'grade_level',
            label: 'Grade',
            render: (row) => <div className="max-w-[100px] truncate" title={row.grade_level}>{row.grade_level}</div>,
        },
        {
            key: 'module',
            label: 'Module',
            render: (row) => <div className="max-w-[140px] truncate" title={row.module || 'N/A'}>{row.module || 'N/A'}</div>,
        },
    ];
    const actions = (row) => [{
        label: 'View',
        icon: <EyeIcon className="h-4 w-4" />,
        color: 'primary',
        onClick: () => setSelectedLog(row),
    }];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800">Student Activity Logs</h2>}>
            <Head title="Student Activity Logs" />
            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700">Today&apos;s academic activity summary</h3>
                        <p className="mt-1 text-xs text-gray-500">Only lesson, assignment, quiz, and game activity from your assigned grades is shown.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            ['lesson_activities', 'Lesson Activities'],
                            ['assignment_activities', 'Assignment Activities'],
                            ['quiz_activities', 'Quiz Activities'],
                            ['game_activities', 'Game Activities'],
                        ].map(([key, label]) => (
                            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-gray-800">{summary?.[key] ?? 0}</div>
                                <div className="text-xs font-medium text-gray-500">{label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <SearchBar value={search} onChange={(value) => { setSearch(value); applyFilters({ search: value }); }} placeholder="Search by student or activity..." size="md" />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <FilterDropdown options={activityOptions} value={activityType} onChange={(value) => changeFilter('activity_type', value)} placeholder="Activity Type" size="md" className="w-48" />
                                    <FilterDropdown options={gradeOptions} value={grade} onChange={(value) => changeFilter('grade_level', value)} placeholder="Grade Level" size="md" className="w-44" />
                                    <input type="date" value={dateFrom} onChange={(event) => changeFilter('date_from', event.target.value)} className="w-36 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                    <input type="date" value={dateTo} onChange={(event) => changeFilter('date_to', event.target.value)} className="w-36 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-6">
                            {loading && <LoadingSpinner overlay size="lg" />}
                            <Table columns={columns} rows={logs} actions={actions} emptyMessage="No student academic activities found." hoverable striped pagination={pagination} />
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={!!selectedLog} onClose={() => setSelectedLog(null)} title="Activity Details" size="md">
                {selectedLog && <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div><div className="text-sm text-gray-500">Student</div><div className="font-medium text-gray-800">{selectedLog.student}</div></div>
                        <div><div className="text-sm text-gray-500">Grade Level</div><div className="font-medium text-gray-800">{selectedLog.grade_level}</div></div>
                        <div><div className="text-sm text-gray-500">Date &amp; Time</div><div className="font-medium text-gray-800">{selectedLog.date_time}</div></div>
                        <div><div className="text-sm text-gray-500">Module</div><div className="font-medium text-gray-800">{selectedLog.module || 'N/A'}</div></div>
                        <div className="sm:col-span-2"><div className="text-sm text-gray-500">Academic Activity</div><div className="mt-1 truncate rounded-lg bg-gray-50 p-3 font-medium text-gray-800" title={selectedLog.activity}>{selectedLog.activity}</div></div>
                    </div>
                </div>}
            </Modal>
        </AuthenticatedLayout>
    );
}
