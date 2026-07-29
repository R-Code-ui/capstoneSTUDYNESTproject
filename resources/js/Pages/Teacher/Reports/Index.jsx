import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import FilterDropdown from '@/Components/FilterDropdown';
import LoadingSpinner from '@/Components/LoadingSpinner';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    DocumentTextIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    BookOpenIcon,
    PuzzlePieceIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function ReportsIndex({
    assigned_grades,
    subjects,
    terms,                // ✅ renamed from trimesters
    filters,
}) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        grade_level: filters?.grade_level || '',
        subject:     filters?.subject || '',
        term:        filters?.term || '',      // ✅ renamed
    });

    const reportTypes = [
        {
            value: 'assignment_completion',
            label: 'Assignment Completion Report',
            icon: <DocumentTextIcon className="w-10 h-10 text-blue-500" />,
            description: 'Track student assignment submission rates',
        },
        {
            value: 'quiz_performance',
            label: 'Quiz Performance Report',
            icon: <ChartBarIcon className="w-10 h-10 text-purple-500" />,
            description: 'Review quiz scores and class performance',
        },
        {
            value: 'student_progress',
            label: 'Student Progress Report',
            icon: <ArrowTrendingUpIcon className="w-10 h-10 text-emerald-500" />,
            description: 'View overall student academic progress',
        },
        {
            value: 'lesson_completion',
            label: 'Lesson Completion Report',
            icon: <BookOpenIcon className="w-10 h-10 text-amber-500" />,
            description: 'Monitor lesson participation rates',
        },
        {
            value: 'game_participation',
            label: 'Game Participation Report',
            icon: <PuzzlePieceIcon className="w-10 h-10 text-indigo-500" />,
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

    const termOptions = [               // ✅ renamed
        { value: '', label: 'All Terms' },
        ...terms.map((t) => ({ value: t, label: t })),
    ];

    const handleGeneratePdf = () => {
        if (!formData.report_type) {
            alert('Please select a report type.');
            return;
        }

        setIsLoading(true);

        const params = new URLSearchParams({
            report_type: formData.report_type,
            ...(formData.grade_level && { grade_level: formData.grade_level }),
            ...(formData.subject && { subject: formData.subject }),
            ...(formData.term && { term: formData.term }),   // ✅
        });

        window.open(route('teacher.reports.pdf') + '?' + params.toString(), '_blank');
        setIsLoading(false);
    };

    const handleReset = () => {
        setFormData({
            report_type: selectedReport || '',
            grade_level: '',
            subject: '',
            term: '',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        Reports
                    </span>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Report Types */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reportTypes.map((type) => (
                            <div
                                key={type.value}
                                className={`
                                    bg-white rounded-xl border shadow-sm overflow-hidden
                                    cursor-pointer transition-all duration-200
                                    hover:shadow-lg hover:-translate-y-1
                                    ${selectedReport === type.value ? 'ring-2 ring-blue-600 border-blue-600' : 'border-gray-200'}
                                `}
                                onClick={() => {
                                    setSelectedReport(type.value);
                                    setFormData({ ...formData, report_type: type.value });
                                }}
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl">{type.icon}</div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800">
                                                {type.label}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {type.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters + Generate Button */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Report Filters</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        options={termOptions}                // ✅ renamed
                                        value={formData.term}               // ✅
                                        onChange={(val) => setFormData({ ...formData, term: val })}
                                        placeholder="Term"
                                        label="Term"
                                        size="md"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                    <SecondaryButton onClick={handleReset}>
                                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                                        Reset Filters
                                    </SecondaryButton>
                                    <PrimaryButton
                                        onClick={handleGeneratePdf}
                                        disabled={!formData.report_type || isLoading}
                                    >
                                        {isLoading ? 'Generating...' : 'Generate Report (PDF)'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isLoading && <LoadingSpinner overlay size="lg" text="Generating PDF..." />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
