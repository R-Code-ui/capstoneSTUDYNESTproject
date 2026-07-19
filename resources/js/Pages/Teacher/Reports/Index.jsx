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
    trimesters,
    filters,
}) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        report_type: '',
        grade_level: filters?.grade_level || '',
        subject: filters?.subject || '',
        trimester: filters?.trimester || '',
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
            icon: <ArrowTrendingUpIcon className="w-10 h-10 text-green-500" />,
            description: 'View overall student academic progress',
        },
        {
            value: 'lesson_completion',
            label: 'Lesson Completion Report',
            icon: <BookOpenIcon className="w-10 h-10 text-orange-500" />,
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

    // ✅ CHANGED: 'All Trimesters' → 'All Terms', 'Trimester' → 'Term'
    const trimesterOptions = [
        { value: '', label: 'All Terms' },
        ...trimesters.map((t) => ({ value: t, label: t })),
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
            ...(formData.trimester && { trimester: formData.trimester }),
        });

        window.open(route('teacher.reports.pdf') + '?' + params.toString(), '_blank');
        setIsLoading(false);
    };

    const handleReset = () => {
        setFormData({
            report_type: selectedReport || '',
            grade_level: '',
            subject: '',
            trimester: '',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
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

                    {/* Filters + Generate Button */}
                    <div className="mt-6">
                        <Card title="Report Filters">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {/* ✅ CHANGED: 'Trimester' → 'Term' */}
                                <FilterDropdown
                                    options={trimesterOptions}
                                    value={formData.trimester}
                                    onChange={(val) => setFormData({ ...formData, trimester: val })}
                                    placeholder="Term"
                                    label="Term"
                                    size="md"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        </Card>
                    </div>

                    {isLoading && <LoadingSpinner overlay size="lg" text="Generating PDF..." />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
