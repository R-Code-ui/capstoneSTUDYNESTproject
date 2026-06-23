import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ReportsIndex({
    assigned_grades,
    subjects,
    trimesters,
    grade_levels,
    report_history,
    filters,
}) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        grade_level: filters?.grade_level || '',
        subject: filters?.subject || '',
        trimester: filters?.trimester || '',
        export_format: 'csv',
    });

    // Report types
    const reportTypes = [
        {
            value: 'assignment_completion',
            label: 'Assignment Completion Report',
            icon: '📝',
            description: 'Track student assignment submission rates',
        },
        {
            value: 'quiz_performance',
            label: 'Quiz Performance Report',
            icon: '📊',
            description: 'Review quiz scores and class performance',
        },
        {
            value: 'student_progress',
            label: 'Student Progress Report',
            icon: '📈',
            description: 'View overall student academic progress',
        },
        {
            value: 'lesson_completion',
            label: 'Lesson Completion Report',
            icon: '📚',
            description: 'Monitor lesson participation rates',
        },
        {
            value: 'game_participation',
            label: 'Game Participation Report',
            icon: '🎮',
            description: 'Track educational game engagement',
        },
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...assigned_grades.map((grade) => ({ value: grade, label: grade })),
    ];

    const subjectOptions = [
        { value: '', label: 'All Subjects' },
        ...subjects.map((subject) => ({ value: subject, label: subject })),
    ];

    const trimesterOptions = [
        { value: '', label: 'All Trimesters' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    const exportOptions = [
        { value: 'csv', label: 'CSV' },
        { value: 'excel', label: 'Excel' },
    ];

    const handleGenerate = () => {
        if (!formData.report_type) {
            alert('Please select a report type.');
            return;
        }

        setIsLoading(true);
        setShowResults(false);

        router.post(route('teacher.reports.generate'), formData, {
            preserveState: true,
            onSuccess: (page) => {
                setIsLoading(false);
                setReportData(page.props.report_data);
                setShowResults(true);
            },
            onError: () => {
                setIsLoading(false);
                alert('Failed to generate report. Please try again.');
            },
        });
    };

    const handleReset = () => {
        setFormData({
            ...formData,
            grade_level: '',
            subject: '',
            trimester: '',
        });
        setReportData(null);
        setShowResults(false);
    };

    const handleExport = (format) => {
        // The export will be handled by the generate endpoint
        // For now, we'll use the selected format
        alert(`Exporting as ${format.toUpperCase()}... (Feature coming soon)`);
    };

    const renderReportResults = () => {
        if (!reportData) return null;

        const { data, summary } = reportData;

        return (
            <div className="mt-6">
                <Card title="Report Results">
                    {/* Summary */}
                    {summary && (
                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(summary).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center"
                                >
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {typeof value === 'number' ? value : value}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Data Table */}
                    {data && data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        {Object.keys(data[0]).map((key) => (
                                            <th key={key} className="px-6 py-3">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            {Object.values(row).map((value, i) => (
                                                <td key={i} className="px-6 py-4">
                                                    {typeof value === 'number' ? value : value || '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No data available for this report.
                        </p>
                    )}

                    {/* Export Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <SecondaryButton onClick={() => handleExport('print')}>
                            🖨️ Print
                        </SecondaryButton>
                        <SecondaryButton onClick={() => handleExport('excel')}>
                            📊 Excel
                        </SecondaryButton>
                        <SecondaryButton onClick={() => handleExport('csv')}>
                            📑 CSV
                        </SecondaryButton>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Reports
                    </h2>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Report Types ===== */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map((type) => (
                            <Card
                                key={type.value}
                                className={`
                                    cursor-pointer transition-all duration-200
                                    hover:shadow-lg hover:-translate-y-1
                                    ${selectedReport === type.value ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                                `}
                                onClick={() => {
                                    setSelectedReport(type.value);
                                    setFormData({ ...formData, report_type: type.value });
                                    setShowResults(false);
                                    setReportData(null);
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{type.icon}</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {type.label}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {type.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* ===== Filter Panel ===== */}
                    <div className="mt-6">
                        <Card title="Report Filters">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={formData.grade_level}
                                    onChange={(val) => setFormData({ ...formData, grade_level: val })}
                                    placeholder="Grade Level"
                                    label="Grade Level"
                                    size="md"
                                />
                                <FilterDropdown
                                    options={subjectOptions}
                                    value={formData.subject}
                                    onChange={(val) => setFormData({ ...formData, subject: val })}
                                    placeholder="Subject"
                                    label="Subject"
                                    size="md"
                                />
                                <FilterDropdown
                                    options={trimesterOptions}
                                    value={formData.trimester}
                                    onChange={(val) => setFormData({ ...formData, trimester: val })}
                                    placeholder="Trimester"
                                    label="Trimester"
                                    size="md"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Export Format
                                    </label>
                                    <FilterDropdown
                                        options={exportOptions}
                                        value={formData.export_format}
                                        onChange={(val) => setFormData({ ...formData, export_format: val })}
                                        placeholder="Format"
                                        size="md"
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton
                                    type="button"
                                    onClick={handleReset}
                                >
                                    Reset Filters
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={handleGenerate}
                                    disabled={!formData.report_type || isLoading}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Report'}
                                </PrimaryButton>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Loading Spinner ===== */}
                    {isLoading && <LoadingSpinner overlay size="lg" text="Generating report..." />}

                    {/* ===== Report Results ===== */}
                    {showResults && renderReportResults()}

                    {/* ===== Report History ===== */}
                    {report_history && report_history.length > 0 && (
                        <div className="mt-6">
                            <Card title="Report History">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Report</th>
                                                <th className="px-6 py-3">Grade Level</th>
                                                <th className="px-6 py-3">Generated Date</th>
                                                <th className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report_history.map((report) => (
                                                <tr
                                                    key={report.id}
                                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {report.report_type}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {report.grade_level || 'All Grades'}
                                                    </td>
                                                    <td className="px-6 py-4">{report.generated_at}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => {
                                                                // View report history
                                                                alert(`Viewing ${report.report_type}... (Feature coming soon)`);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
