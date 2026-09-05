import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { toast } from 'sonner';

// Heroicons
import {
    EyeIcon,
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
            onError: () => toast.error('Unable to load student progress. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
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
            onError: () => toast.error('Unable to load students requiring support. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    const viewStudentProgress = (studentId) => {
        router.visit(route('teacher.progress.show', studentId), {
            onError: () => toast.error('Unable to load this student’s progress. Please try again.'),
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
            onClick: () => viewStudentProgress(row.student_id),
        },
    ];

    const keepFocusedFieldVisible = (event) => {
        if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
        window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">Progress Tracking</span>
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
                    background-color: rgb(69 10 10 / 0.28) !important;
                    border-color: rgb(127 29 29 / 0.58) !important;
                    box-shadow: none !important;
                }
                .studynest-layout.theme-dark .progress-page .support-student-card .bg-red-600 {
                    background-color: rgb(185 28 28) !important;
                }
                .studynest-layout.theme-dark .progress-page .support-student-card .bg-red-600:hover {
                    background-color: rgb(153 27 27) !important;
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

            <div className="progress-page py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Statistics Cards ===== */}
                    <div className="grid gap-4 min-[480px]:grid-cols-2 xl:grid-cols-5">
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
                                <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                        Students Requiring Support
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
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
                                                    onClick={() => viewStudentProgress(student.student_id)}
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
                                            <nav aria-label="Students requiring support pagination" className="support-pagination flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-1 sm:w-auto">
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
                            <div className="p-4 sm:p-6">
                                {/* Filters */}
                                <div onFocusCapture={keepFocusedFieldVisible} className="space-y-3">
                                    <div className="min-w-0">
                                        <SearchBar
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search by student name or Student ID..."
                                            size="md"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 xl:grid-cols-3">
                                        <FilterDropdown
                                            options={gradeOptions}
                                            value={gradeFilter}
                                            onChange={(val) => handleFilterChange('grade', val)}
                                            placeholder="Grade"
                                            size="md"
                                            className="w-full"
                                        />
                                        <FilterDropdown
                                            options={subjectOptions}
                                            value={subjectFilter}
                                            onChange={(val) => handleFilterChange('subject', val)}
                                            placeholder="Subject"
                                            size="md"
                                            className="w-full"
                                        />
                                        <FilterDropdown
                                            options={trimesterOptions}
                                            value={trimesterFilter}
                                            onChange={(val) => handleFilterChange('trimester', val)}
                                            placeholder="Term"
                                            size="md"
                                            className="w-full"
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
                                        responsive
                                        responsiveAt="tablet"
                                        actionsClassName="flex-nowrap"
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
