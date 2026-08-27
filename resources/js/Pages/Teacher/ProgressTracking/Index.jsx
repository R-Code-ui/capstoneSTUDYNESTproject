import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

// Heroicons
import {
    EyeIcon,
    ArrowDownTrayIcon,
    UserIcon,
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PuzzlePieceIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function ProgressIndex({
    stats,
    student_progress,
    at_risk_students,
    at_risk_pagination,
    grade_levels,
    subjects,
    trimesters,
    filters,
    pagination,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [gradeFilter, setGradeFilter] = useState(filters?.grade_level || '');
    const [subjectFilter, setSubjectFilter] = useState(filters?.subject || '');
    const [trimesterFilter, setTrimesterFilter] = useState(filters?.trimester || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
        applyFilters({ search: value });
    };

    const handleFilterChange = (type, value) => {
        const updates = {};
        if (type === 'grade') setGradeFilter(value);
        if (type === 'subject') setSubjectFilter(value);
        if (type === 'trimester') setTrimesterFilter(value);

        applyFilters({
            ...(type === 'grade' ? { grade_level: value } : {}),
            ...(type === 'subject' ? { subject: value } : {}),
            ...(type === 'trimester' ? { trimester: value } : {}),
        });
    };

    const applyFilters = (additional = {}) => {
        setIsLoading(true);
        router.visit(route('teacher.progress.index'), {
            data: {
                search,
                grade_level: gradeFilter,
                subject: subjectFilter,
                trimester: trimesterFilter,
                ...additional,
            },
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleExport = () => {
        const query = new URLSearchParams({
            search: search || '',
            grade_level: gradeFilter || '',
            subject: subjectFilter || '',
            trimester: trimesterFilter || '',
        });
        window.open(`${route('teacher.progress.export')}?${query.toString()}`, '_blank');
    };

    const changeAtRiskPage = (page) => {
        if (page < 1 || page > (at_risk_pagination?.last_page || 1)) return;

        setIsLoading(true);
        router.visit(route('teacher.progress.index'), {
            data: {
                search,
                grade_level: gradeFilter,
                subject: subjectFilter,
                trimester: trimesterFilter,
                at_risk_page: page,
            },
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...subjects.map((subject) => ({ value: subject, label: subject })),
    ];

    const trimesterOptions = [
        { value: '', label: 'All Terms' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    // 🔧 FIX: Added truncation to columns that may overflow
    const columns = [
        {
            key: 'name',
            label: 'Student',
            render: (row) => (
                <div className="max-w-[120px] truncate" title={row.name}>
                    {row.name}
                </div>
            ),
        },
        {
            key: 'lrn',
            label: 'Student ID',
            render: (row) => (
                <div className="max-w-[100px] truncate" title={row.lrn}>
                    {row.lrn}
                </div>
            ),
        },
        {
            key: 'grade_level',
            label: 'Grade',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.grade_level}>
                    {row.grade_level}
                </div>
            ),
        },
        {
            key: 'lessons',
            label: 'Lessons',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.lessons}>
                    {row.lessons}
                </div>
            ),
        },
        {
            key: 'assignments',
            label: 'Assignments',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.assignments}>
                    {row.assignments}
                </div>
            ),
        },
        {
            key: 'quiz_average',
            label: 'Quiz Avg',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.quiz_average}>
                    {row.quiz_average}
                </div>
            ),
        },
        {
            key: 'games',
            label: 'Games',
            render: (row) => (
                <div className="max-w-[60px] truncate" title={row.games}>
                    {row.games}
                </div>
            ),
        },
        {
            key: 'overall_progress',
            label: 'Overall Progress',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full ${
                                row.overall_progress >= 80 ? 'bg-emerald-500' :
                                row.overall_progress >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                            style={{ width: `${row.overall_progress}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium">{row.overall_progress}%</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const statusMap = {
                    'Excellent': 'excellent',
                    'Needs Monitoring': 'needs_monitoring',
                    'Needs Support': 'needs_support',
                };
                return <StatusBadge status={statusMap[row.status] || 'needs_monitoring'} />;
            },
        },
    ];

    const actions = (row) => [
        {
            label: 'View',
            icon: <EyeIcon className="w-4 h-4" />,
            color: 'primary',
            onClick: () => router.visit(route('teacher.progress.show', row.student_id)),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">Progress Tracking</span>
                    <PrimaryButton onClick={handleExport}>
                        <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                        Export CSV
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Progress Tracking" />

            <style>{`
                .studynest-layout.theme-dark .progress-page .bg-white {
                    background-color: rgb(15 23 42) !important;
                }
                .studynest-layout.theme-dark .progress-page .bg-gray-50 {
                    background-color: rgb(30 41 59) !important;
                }
                .studynest-layout.theme-dark .progress-page .bg-gray-200 {
                    background-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .progress-page .bg-red-50 {
                    background-color: rgb(69 10 10 / 0.45) !important;
                }
                .studynest-layout.theme-dark .progress-page .border-gray-100,
                .studynest-layout.theme-dark .progress-page .border-gray-200 {
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-800 {
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-700 {
                    color: rgb(203 213 225) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-gray-600,
                .studynest-layout.theme-dark .progress-page .text-gray-500,
                .studynest-layout.theme-dark .progress-page .text-gray-400 {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-red-600 {
                    color: rgb(253 164 175) !important;
                }
                .studynest-layout.theme-dark .progress-page .text-red-500 {
                    color: rgb(248 113 113) !important;
                }
                .studynest-layout.theme-dark .progress-page .support-student-card {
                    border-color: transparent !important;
                    box-shadow: none !important;
                }
                .studynest-layout.theme-dark .progress-page .support-pagination {
                    background-color: rgb(15 23 42) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .progress-page .support-pagination-button {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .progress-page .support-pagination-button:hover:not(:disabled) {
                    background-color: rgb(30 41 59) !important;
                    color: rgb(241 245 249) !important;
                }
            `}</style>

            <div className="progress-page py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Statistics Cards ===== */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.total_students}</div>
                            <div className="text-sm font-medium text-gray-500">Total Students</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-emerald-600">{stats.lesson_completion_rate}%</div>
                            <div className="text-sm font-medium text-gray-500">Lesson Completion</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.assignment_completion_rate}%</div>
                            <div className="text-sm font-medium text-gray-500">Assignment Completion</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{stats.average_quiz_score}%</div>
                            <div className="text-sm font-medium text-gray-500">Avg Quiz Score</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                            <div className="text-2xl font-bold text-amber-600">{stats.game_participation}%</div>
                            <div className="text-sm font-medium text-gray-500">Game Participation</div>
                        </div>
                    </div>

                    {/* ===== At-Risk Students ===== */}
                    {at_risk_students.length > 0 && (
                        <div className="mt-6">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                        Students Requiring Support
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {at_risk_students.map((student) => (
                                            <div
                                                key={student.student_id}
                                                className="support-student-card flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-800">{student.name}</div>
                                                    <div className="text-sm text-red-600">
                                                        Progress: {student.overall_progress}%
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.visit(route('teacher.progress.show', student.student_id))}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {at_risk_pagination?.total > 0 && (
                                        <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-slate-500">
                                                Showing <span className="font-semibold text-slate-800">{(at_risk_pagination.current_page - 1) * at_risk_pagination.per_page + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(at_risk_pagination.current_page * at_risk_pagination.per_page, at_risk_pagination.total)}</span> of <span className="font-semibold text-slate-800">{at_risk_pagination.total}</span> results
                                            </p>
                                            <nav aria-label="Students requiring support pagination" className="support-pagination flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => changeAtRiskPage(at_risk_pagination.current_page - 1)}
                                                    disabled={at_risk_pagination.current_page === 1}
                                                    className="support-pagination-button rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                                >
                                                    Previous
                                                </button>
                                                <span className="min-w-[36px] rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm">
                                                    {at_risk_pagination.current_page}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => changeAtRiskPage(at_risk_pagination.current_page + 1)}
                                                    disabled={at_risk_pagination.current_page === at_risk_pagination.last_page}
                                                    className="support-pagination-button rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                                >
                                                    Next
                                                </button>
                                            </nav>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== Student Progress Table ===== */}
                    <div className="mt-6">
                        {/* 🔧 FIX: Removed overflow-hidden from Card container */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="p-6">
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <SearchBar
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search by student name or Student ID..."
                                            size="md"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <FilterDropdown
                                            options={gradeOptions}
                                            value={gradeFilter}
                                            onChange={(val) => handleFilterChange('grade', val)}
                                            placeholder="Grade"
                                            size="md"
                                            className="w-36"
                                        />
                                        <FilterDropdown
                                            options={subjectOptions}
                                            value={subjectFilter}
                                            onChange={(val) => handleFilterChange('subject', val)}
                                            placeholder="Subject"
                                            size="md"
                                            className="w-40"
                                        />
                                        <FilterDropdown
                                            options={trimesterOptions}
                                            value={trimesterFilter}
                                            onChange={(val) => handleFilterChange('trimester', val)}
                                            placeholder="Term"
                                            size="md"
                                            className="w-40"
                                        />
                                    </div>
                                </div>

                                {/* Loading Spinner */}
                                {isLoading && <LoadingSpinner overlay size="lg" />}

                                {/* Table */}
                                <div className="mt-6">
                                    <Table
                                        columns={columns}
                                        rows={student_progress}
                                        actions={actions}
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
            </div>
        </AuthenticatedLayout>
    );
}
