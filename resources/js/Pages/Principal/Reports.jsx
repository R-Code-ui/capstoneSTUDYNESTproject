import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PrincipalReports({ school_years, grade_levels, teachers, trimesters, report_history, filters }) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        school_year: filters?.school_year || 'SY 2026-2027',
        grade_level: filters?.grade_level || '',
        teacher_id: filters?.teacher_id || '',
        trimester: filters?.trimester || '',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    const reportTypes = [
        { value: 'teacher_activity', label: '📘 Teacher Activity Report' },
        { value: 'student_participation', label: '📗 Student Participation Report' },
        { value: 'assignment_completion', label: '📙 Assignment Completion Report' },
        { value: 'quiz_performance', label: '📕 Quiz Performance Report' },
        { value: 'school_summary', label: '📓 School Activity Summary Report' },
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...grade_levels.map((grade) => ({ value: grade, label: grade })),
    ];

    const teacherOptions = [
        { value: '', label: 'All Teachers' },
        ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })),
    ];

    const trimesterOptions = [
        { value: '', label: 'All Trimesters' },
        ...trimesters.map((t) => ({ value: t, label: t })),
    ];

    const schoolYearOptions = school_years.map((year) => ({ value: year, label: year }));

    const handleGenerate = () => {
        if (!formData.report_type) {
            alert('Please select a report type.');
            return;
        }

        setIsLoading(true);
        router.post(route('principal.reports.generate'), formData, {
            preserveState: true,
            onSuccess: (page) => {
                setIsLoading(false);
                setReportData(page.props.report_data);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleExport = (format) => {
        // Handle export logic
        alert(`Exporting as ${format.toUpperCase()}... (Feature coming soon)`);
    };

    const renderReportResults = () => {
        if (!reportData) return null;

        const { data, summary } = reportData;

        return (
            <div className="mt-6 space-y-4">
                {/* Summary */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(summary).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Data Table */}
                {data && data.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {Object.keys(data[0]).map((key) => (
                                        <th key={key} className="px-6 py-3">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
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
                )}

                {/* Export Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <SecondaryButton onClick={() => handleExport('print')}>🖨️ Print</SecondaryButton>
                    <SecondaryButton onClick={() => handleExport('excel')}>📊 Excel</SecondaryButton>
                    <SecondaryButton onClick={() => handleExport('csv')}>📑 CSV</SecondaryButton>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Reports</h2>}
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Report Selection */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {reportTypes.map((type) => (
                            <Card
                                key={type.value}
                                className={`cursor-pointer transition hover:shadow-lg ${selectedReport === type.value ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => {
                                    setSelectedReport(type.value);
                                    setFormData({ ...formData, report_type: type.value });
                                    setReportData(null);
                                }}
                            >
                                <div className="text-3xl mb-2">{type.label.split(' ')[0]}</div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {type.label.split(' ').slice(1).join(' ')}
                                </h4>
                            </Card>
                        ))}
                    </div>

                    {/* Filter Panel */}
                    <div className="mt-6">
                        <Card title="Report Filters">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <FilterDropdown
                                    options={schoolYearOptions}
                                    value={formData.school_year}
                                    onChange={(val) => setFormData({ ...formData, school_year: val })}
                                    placeholder="School Year"
                                    label="School Year"
                                    size="md"
                                />
                                <FilterDropdown
                                    options={gradeOptions}
                                    value={formData.grade_level}
                                    onChange={(val) => setFormData({ ...formData, grade_level: val })}
                                    placeholder="Grade Level"
                                    label="Grade Level"
                                    size="md"
                                />
                                <FilterDropdown
                                    options={teacherOptions}
                                    value={formData.teacher_id}
                                    onChange={(val) => setFormData({ ...formData, teacher_id: val })}
                                    placeholder="Teacher"
                                    label="Teacher"
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date From</label>
                                    <input
                                        type="date"
                                        value={formData.date_from}
                                        onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date To</label>
                                    <input
                                        type="date"
                                        value={formData.date_to}
                                        onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            grade_level: '',
                                            teacher_id: '',
                                            trimester: '',
                                            date_from: '',
                                            date_to: '',
                                        });
                                        setReportData(null);
                                    }}
                                >
                                    Reset Filters
                                </SecondaryButton>
                                <PrimaryButton onClick={handleGenerate} disabled={!formData.report_type || isLoading}>
                                    {isLoading ? 'Generating...' : 'Generate Report'}
                                </PrimaryButton>
                            </div>
                        </Card>
                    </div>

                    {/* Loading */}
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* Report Results */}
                    {reportData && (
                        <div className="mt-6">
                            <Card title="Report Results">
                                {renderReportResults()}
                            </Card>
                        </div>
                    )}

                    {/* Report History */}
                    {report_history.length > 0 && (
                        <div className="mt-6">
                            <Card title="Report History">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Report</th>
                                                <th className="px-6 py-3">Generated Date</th>
                                                <th className="px-6 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report_history.map((report) => (
                                                <tr key={report.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{report.report_type}</td>
                                                    <td className="px-6 py-4">{report.generated_at}</td>
                                                    <td className="px-6 py-4">
                                                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
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
