import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Table, { StatusBadge } from '@/Components/Table';
import SearchBar from '@/Components/SearchBar';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ProgressIndex({
    stats,
    student_progress,
    at_risk_students,
    grade_levels,
    subjects,
    trimesters,
    filters,
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
        window.open(route('teacher.progress.export'), '_blank');
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
        { value: '', label: 'All Trimesters' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    const columns = [
        { key: 'name', label: 'Student' },
        { key: 'lrn', label: 'LRN' },
        { key: 'grade_level', label: 'Grade' },
        { key: 'lessons', label: 'Lessons' },
        { key: 'assignments', label: 'Assignments' },
        { key: 'quiz_average', label: 'Quiz Avg' },
        { key: 'games', label: 'Games' },
        {
            key: 'overall_progress',
            label: 'Overall Progress',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className={`h-2.5 rounded-full ${
                                row.overall_progress >= 80 ? 'bg-green-500' :
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
            label: 'View Details',
            icon: '👁️',
            color: 'primary',
            onClick: () => router.visit(route('teacher.progress.show', row.student_id)),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Progress Tracking</h2>
                    <PrimaryButton onClick={handleExport}>📥 Export CSV</PrimaryButton>
                </div>
            }
        >
            <Head title="Progress Tracking" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Statistics Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_students}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.lesson_completion_rate}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Lesson Completion</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.assignment_completion_rate}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Assignment Completion</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.average_quiz_score}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Quiz Score</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.game_participation}%</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Game Participation</div>
                        </Card>
                    </div>

                    {/* ===== At-Risk Students ===== */}
                    {at_risk_students.length > 0 && (
                        <div className="mt-6">
                            <Card title="⚠️ Students Requiring Support">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {at_risk_students.map((student) => (
                                        <div
                                            key={student.student_id}
                                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-sm text-red-600 dark:text-red-400">
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
                            </Card>
                        </div>
                    )}

                    {/* ===== Student Progress Table ===== */}
                    <div className="mt-6">
                        <Card>
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchBar
                                        value={search}
                                        onChange={handleSearch}
                                        placeholder="Search by student name or LRN..."
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
                                        placeholder="Trimester"
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
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
