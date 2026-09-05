import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';
import { toast } from 'sonner';
import { EyeIcon } from '@heroicons/react/24/outline';

export default function Index({ logs, summary, activity_types = [], grade_levels = [], filters = {}, pagination }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [grade, setGrade] = useState(filters.grade_level || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [historyScope, setHistoryScope] = useState(filters.history_scope || 'recent');
    const [selectedLog, setSelectedLog] = useState(null);
    const [loading, setLoading] = useState(false);

    const applyFilters = (additional = {}) => {
        setLoading(true);
        router.visit(route('teacher.activity-logs.index'), {
            data: { search, activity_type: activityType, grade_level: grade, date_from: dateFrom, date_to: dateTo, history_scope: historyScope, ...additional },
            preserveState: true,
            replace: true,
            onError: () => toast.error('Unable to load student activity logs. Please try again.'),
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
    const historyOptions = [{ value: 'recent', label: 'Recent 30 Days' }, { value: 'all', label: 'All History' }];
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
            render: (row) => <div className="activity-log-description whitespace-normal break-words leading-5" title={row.activity}>{row.activity}</div>,
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

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800">Student Activity Logs</h2>}>
            <Head title="Student Activity Logs" />
            <div onFocusCapture={keepFocusedFieldVisible} className="teacher-activity-logs-page py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <style>{`
                    .teacher-activity-logs-page input,
                    .teacher-activity-logs-page select { scroll-margin-block: 7rem; }
                    @media (max-width: 639px) {
                        .teacher-activity-logs-page input,
                        .teacher-activity-logs-page select { font-size: 16px; }
                    }
                    @media (min-width: 1280px) {
                        .teacher-activity-logs-page .activity-logs-table { table-layout: fixed; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(1), .teacher-activity-logs-page .activity-logs-table td:nth-child(1) { width: 15%; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(2), .teacher-activity-logs-page .activity-logs-table td:nth-child(2) { width: 15%; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(3), .teacher-activity-logs-page .activity-logs-table td:nth-child(3) { width: 34%; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(4), .teacher-activity-logs-page .activity-logs-table td:nth-child(4) { width: 10%; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(5), .teacher-activity-logs-page .activity-logs-table td:nth-child(5) { width: 17%; }
                        .teacher-activity-logs-page .activity-logs-table th:nth-child(6), .teacher-activity-logs-page .activity-logs-table td:nth-child(6) { width: 9%; }
                        .teacher-activity-logs-page .activity-logs-table td:nth-child(3) { overflow-wrap: anywhere; white-space: normal; }
                    }
                `}</style>
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Today&apos;s academic activity summary</h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Only lesson, assignment, quiz, and game activity from your assigned grades is shown.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            ['lesson_activities', 'Lesson Activities'],
                            ['assignment_activities', 'Assignment Activities'],
                            ['quiz_activities', 'Quiz Activities'],
                            ['game_activities', 'Game Activities'],
                        ].map(([key, label]) => (
                            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">{summary?.[key] ?? 0}</div>
                                <div className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6">
                            <div className="space-y-3">
                                <div className="flex-1">
                                    <SearchBar value={search} onChange={(value) => { setSearch(value); applyFilters({ search: value }); }} placeholder="Search by student or activity..." size="md" />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                    <FilterDropdown options={activityOptions} value={activityType} onChange={(value) => changeFilter('activity_type', value)} placeholder="Activity Type" size="md" className="w-full" />
                                    <FilterDropdown options={gradeOptions} value={grade} onChange={(value) => changeFilter('grade_level', value)} placeholder="Grade Level" size="md" className="w-full" />
                                    <FilterDropdown options={historyOptions} value={historyScope} onChange={(value) => { setHistoryScope(value); applyFilters({ history_scope: value }); }} placeholder="Record range" size="md" className="w-full sm:col-span-2 xl:col-auto" />
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 xl:hidden">From date<input type="date" value={dateFrom} onChange={(event) => changeFilter('date_from', event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" /></label>
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 xl:hidden">To date<input type="date" value={dateTo} onChange={(event) => changeFilter('date_to', event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" /></label>
                                    <input aria-label="From date" type="date" value={dateFrom} onChange={(event) => changeFilter('date_from', event.target.value)} className="hidden w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 xl:block" />
                                    <input aria-label="To date" type="date" value={dateTo} onChange={(event) => changeFilter('date_to', event.target.value)} className="hidden w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 xl:block" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="p-4 sm:p-6">
                            {loading && <LoadingSpinner overlay size="lg" />}
                            <Table columns={columns} rows={logs} actions={actions} emptyMessage="No student academic activities found." hoverable striped compact responsive responsiveAt="tablet" tableClassName="activity-logs-table" actionsClassName="justify-center" pagination={pagination} />
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
                        <div className="sm:col-span-2"><div className="text-sm text-gray-500">Academic Activity</div><div className="mt-1 break-words rounded-lg bg-gray-50 p-3 font-medium text-gray-800">{selectedLog.activity}</div></div>
                    </div>
                </div>}
            </Modal>
        </AuthenticatedLayout>
    );
}
