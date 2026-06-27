import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PrincipalReports({
    school_years,
    grade_levels,
    teachers,
    trimesters,
    filters,
    report_title = null,
    report_data = null,
    report_id = null,
    show_results = false,
}) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        school_year: filters?.school_year || 'SY 2026-2027',
        grade_level: filters?.grade_level || '',
        teacher_id: filters?.teacher_id || '',
        trimester: filters?.trimester || '',
        // date_from and date_to removed
    });

    const { flash } = usePage().props;
    const hasReportData = report_data && show_results;

    // Safely extract data and summary
    const resultData = hasReportData ? (report_data.data || []) : [];
    const resultSummary = hasReportData ? (report_data.summary || null) : null;

    // ===== SVG ICONS =====
    const ReportIcons = {
        teacher_activity: () => (
            <svg className="w-10 h-10 mb-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        student_participation: () => (
            <svg className="w-10 h-10 mb-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        school_summary: () => (
            <svg className="w-10 h-10 mb-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    };

    const PdfIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const reportTypes = [
        { value: 'teacher_activity', label: 'Teacher Activity Report', icon: 'teacher_activity' },
        { value: 'student_participation', label: 'Student Participation Report', icon: 'student_participation' },
        { value: 'school_summary', label: 'School Activity Summary Report', icon: 'school_summary' },
    ];

    const gradeOptions = [
        { value: '', label: 'All Grades' },
        ...(grade_levels || []).filter(g => g !== 'All Grades').map((grade) => ({ value: grade, label: grade })),
    ];

    const teacherOptions = [
        { value: '', label: 'All Teachers' },
        ...(teachers || []).map((teacher) => ({ value: teacher.id, label: teacher.name })),
    ];

    const trimesterOptions = [
        { value: '', label: 'All Trimesters' },
        ...(trimesters || []).filter(t => t !== 'All Trimesters').map((t) => ({ value: t, label: t })),
    ];

    const schoolYearOptions = (school_years || []).map((year) => ({ value: year, label: year }));

    const handleGenerate = () => {
        if (!formData.report_type) {
            alert('Please select a report type.');
            return;
        }

        setIsLoading(true);
        router.post(route('principal.reports.generate'), formData, {
            preserveState: true,
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    const handleReset = () => {
        setFormData({
            ...formData,
            grade_level: '',
            teacher_id: '',
            trimester: '',
            // no date fields to reset
        });
        router.visit(route('principal.reports.index'), { preserveState: true });
    };

    const handleExportPdf = () => {
        if (!report_id) {
            alert('No report to export. Please generate a report first.');
            return;
        }

        setIsExporting(true);
        const url = route('principal.reports.export.pdf', report_id);
        window.open(url, '_blank');
        setTimeout(() => setIsExporting(false), 1000);
    };

    const renderReportResults = () => {
        if (!hasReportData) return null;

        return (
            <div className="mt-6 space-y-4">
                {resultSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(resultSummary).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {resultData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {Object.keys(resultData[0]).map((key) => (
                                        <th key={key} className="px-6 py-3">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {resultData.map((row, index) => (
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
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No detailed rows found for this report.
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <SecondaryButton onClick={handleExportPdf} disabled={isExporting}>
                        <span className="flex items-center gap-1">
                            <PdfIcon /> Download PDF
                        </span>
                    </SecondaryButton>
                </div>
            </div>
        );
    };

    const resultsTitle = report_title || 'Report Results';

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Reports</h2>}
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Report Selection Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map((type) => {
                            const IconComponent = ReportIcons[type.icon] || ReportIcons.school_summary;
                            return (
                                <Card
                                    key={type.value}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                                        selectedReport === type.value ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedReport(type.value);
                                        setFormData({ ...formData, report_type: type.value });
                                    }}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <IconComponent />
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {type.label}
                                        </h4>
                                    </div>
                                </Card>
                            );
                        })}
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

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton type="button" onClick={handleReset}>
                                    Reset Filters
                                </SecondaryButton>
                                <PrimaryButton
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={!formData.report_type || isLoading}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Report'}
                                </PrimaryButton>
                            </div>
                        </Card>
                    </div>

                    {isLoading && <LoadingSpinner overlay size="lg" text="Generating report..." />}

                    {hasReportData && (
                        <div className="mt-6">
                            <Card title={resultsTitle}>
                                {renderReportResults()}
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
