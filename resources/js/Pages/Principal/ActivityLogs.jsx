import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import Modal from '@/Components/Modal';
import { EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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
    const [historyScope, setHistoryScope] = useState(filters?.history_scope || 'recent');
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
                history_scope: historyScope,
                ...additional,
            },
            preserveState: true,
            onError: () => toast.error('Unable to load activity logs. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const viewLogDetail = (log) => {
        setSelectedLog(log);
        setShowLogDetail(true);
    };

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;

        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    const activityTypeOptions = [
        { value: '', label: 'All Activities' },
        ...activity_types.map((type) => ({ value: type, label: type })),
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];
    const historyOptions = [
        { value: 'recent', label: 'Recent 30 Days' },
        { value: 'all', label: 'All History' },
    ];

    const columns = [
        {
            key: 'date_time',
            label: 'Date & Time',
            render: (row) => <span className="block max-w-[110px] truncate" title={row.date_time || ''}>{row.date_time || '—'}</span>,
        },
        {
            key: 'user',
            label: 'User',
            render: (row) => <span className="block max-w-[120px] truncate" title={row.user || ''}>{row.user || '—'}</span>,
        },
        { key: 'role', label: 'Role' },
        {
            key: 'activity',
            label: 'Activity',
            render: (row) => <span className="block max-w-[320px] truncate" title={row.activity || ''}>{row.activity || '—'}</span>,
        },
        {
            key: 'module',
            label: 'Module',
            render: (row) => <span className="block max-w-[120px] truncate" title={row.module || 'N/A'}>{row.module || 'N/A'}</span>,
        },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => viewLogDetail(row)
        },
    ];

    const summaryCards = [
        { label: 'Sign-in Events', value: summary.sign_in_events, tone: 'text-blue-600 dark:text-blue-400' },
        { label: 'Lesson Activities', value: summary.lesson_activities, tone: 'text-violet-600 dark:text-violet-400' },
        { label: 'Assignment Activities', value: summary.assignment_activities, tone: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Quiz Activities', value: summary.quiz_activities, tone: 'text-amber-600 dark:text-amber-400' },
        { label: 'Game Activities', value: summary.game_activities, tone: 'text-pink-600 dark:text-pink-400' },
        { label: 'Announcement Activities', value: summary.announcement_activities, tone: 'text-cyan-600 dark:text-cyan-400' },
        { label: 'Message Activities', value: summary.message_activities, tone: 'text-indigo-600 dark:text-indigo-400' },
        { label: 'Other Activities', value: summary.other_activities, tone: 'text-slate-600 dark:text-slate-300' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">Activity Logs</h2>}
        >
            <Head title="Activity Logs" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-1 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">Activity overview</h3>
                                <p className="mt-1 text-sm text-gray-500">Today&apos;s recorded activity, grouped by module.</p>
                            </div>
                            <span className="mt-2 inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:mt-0">Today</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/40">
                                    <div className={`text-2xl font-bold ${card.tone}`}>{card.value ?? 0}</div>
                                    <div className="mt-1 text-sm font-medium text-gray-600 dark:text-slate-300">{card.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ===== Filters ===== */}
                    {/* 🔧 FIX: Removed overflow-hidden to prevent dropdown clipping */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h3 className="font-semibold text-gray-800">Filter activity logs</h3>
                                <p className="mt-1 text-sm text-gray-500">Search by user or activity, then narrow results by type, grade, or date.</p>
                            </div>
                            <div className="mt-4 space-y-3" onFocusCapture={keepFocusedFieldVisible}>
                                <div className="min-w-0">
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Search logs</div>
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search by user or activity..."
                                        size="md"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Activity type</div>
                                    <FilterDropdown
                                        options={activityTypeOptions}
                                        value={activityTypeFilter}
                                        onChange={(val) => handleFilterChange('activity_type', val)}
                                        placeholder="Activity Type"
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Record range</div>
                                    <FilterDropdown
                                        options={historyOptions}
                                        value={historyScope}
                                        onChange={(value) => { setHistoryScope(value); applyFilters({ history_scope: value }); }}
                                        placeholder="Record range"
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Grade level</div>
                                    <FilterDropdown
                                        options={gradeOptions}
                                        value={gradeFilter}
                                        onChange={(val) => handleFilterChange('grade', val)}
                                        placeholder="Grade Level"
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">From date
                                    <input type="date" value={dateFrom} onChange={(e) => handleFilterChange('date_from', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:text-sm" />
                                </label>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">To date
                                    <input type="date" value={dateTo} onChange={(e) => handleFilterChange('date_to', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:text-sm" />
                                </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===== Log Table ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6">
                            {isLoading && <LoadingSpinner overlay size="lg" />}

                            <Table
                                columns={columns}
                                rows={logs}
                                actions={actions}
                                emptyMessage="No activity logs found."
                                hoverable
                                striped
                                responsive
                                responsiveAt="tablet"
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
                size="lg"
            >
                {selectedLog && (
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">Activity record</p>
                            <h3 className="mt-1 break-words text-lg font-bold text-gray-800">Log details</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-sm text-gray-500">User</div>
                                <div className="max-w-[180px] truncate font-medium text-gray-800" title={selectedLog.user || ''}>{selectedLog.user || '—'}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-sm text-gray-500">Role</div>
                                <div className="font-medium text-gray-800">{selectedLog.role}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-sm text-gray-500">Date & Time</div>
                                <div className="font-medium text-gray-800">{selectedLog.date_time}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-sm text-gray-500">Module</div>
                                <div className="max-w-[180px] truncate font-medium text-gray-800" title={selectedLog.module || 'N/A'}>{selectedLog.module || 'N/A'}</div>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Activity Description</div>
                                <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 font-medium text-gray-800 dark:text-slate-100" title={selectedLog.activity || ''}>
                                    {selectedLog.activity}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:col-span-2 dark:border-slate-700 dark:bg-slate-800/70">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">User ID</div>
                                <div className="font-medium text-gray-800">{selectedLog.user_id}</div>
                            </div>
                        </div>

                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
