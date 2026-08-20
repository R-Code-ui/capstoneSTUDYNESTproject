import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    DocumentDuplicateIcon,
    AcademicCapIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';

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
    pagination,
}) {
    const availableSchoolYears = school_years || [];
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        school_year: filters?.school_year || availableSchoolYears[0] || '',
        grade_level: filters?.grade_level || '',
        teacher_id: filters?.teacher_id || '',
        trimester: filters?.trimester || '',
    });

    const { flash } = usePage().props;
    const hasReportData = report_data && show_results;

    const resultData = hasReportData ? (report_data.data || []) : [];
    const resultSummary = hasReportData ? (report_data.summary || null) : null;

    const ReportIcons = {
        teacher_activity: () => (
            <UsersIcon className="w-10 h-10 mb-2 text-gray-600" />
        ),
        student_participation: () => (
            <AcademicCapIcon className="w-10 h-10 mb-2 text-gray-600" />
        ),
        school_summary: () => (
            <DocumentDuplicateIcon className="w-10 h-10 mb-2 text-gray-600" />
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
        { value: '', label: 'All Terms' },
        ...(trimesters || []).filter(t => t !== 'All Trimesters' && t !== 'All Terms').map((t) => ({ value: t, label: t })),
    ];

    const schoolYearOptions = availableSchoolYears.map((year) => ({ value: year, label: year }));

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
                            <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-xl font-bold text-gray-800">{value}</div>
                                <div className="text-xs text-gray-500">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {resultData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    {Object.keys(resultData[0]).map((key) => (
                                        <th key={key} className="px-6 py-3">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {resultData.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
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
                    <p className="text-center text-gray-500 py-8">
                        No detailed rows found for this report.
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
            header={<h2 className="text-xl font-bold text-gray-800">Reports</h2>}
        >
            <Head title="Reports" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Report Selection Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map((type) => {
                            const IconComponent = ReportIcons[type.icon] || ReportIcons.school_summary;
                            return (
                                <div
                                    key={type.value}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white rounded-xl border ${
                                        selectedReport === type.value
                                            ? 'border-blue-600 ring-2 ring-blue-600'
                                            : 'border-gray-200'
                                    } shadow-sm overflow-hidden`}
                                    onClick={() => {
                                        setSelectedReport(type.value);
                                        setFormData({ ...formData, report_type: type.value });
                                    }}
                                >
                                    <div className="p-6 flex flex-col items-center text-center">
                                        <IconComponent />
                                        <h4 className="font-semibold text-gray-800">
                                            {type.label}
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filter Panel - FIX: removed overflow-hidden */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Report Filters</h3>
                        </div>
                        <div className="p-6">
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
                                    placeholder="Term"
                                    label="Term"
                                    size="md"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
                        </div>
                    </div>

                    {isLoading && <LoadingSpinner overlay size="lg" text="Generating report..." />}

                    {hasReportData && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">{resultsTitle}</h3>
                            </div>
                            <div className="p-6">
                                {renderReportResults()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
