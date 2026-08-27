import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    AcademicCapIcon,
    ChartBarIcon,
    DocumentTextIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';

const reports = [
    { key: 'student_directory', title: 'Student Directory Report', description: 'A complete student list by grade level and account status.', icon: UsersIcon },
    { key: 'teacher_activity', title: 'Teacher Activity Report', description: 'Published lessons, assignments, quizzes, and games per teacher.', icon: AcademicCapIcon },
    { key: 'student_progress', title: 'Student Learning Progress Report', description: 'Completion of learning activities for each student.', icon: ChartBarIcon },
    { key: 'school_summary', title: 'School Activity Summary', description: 'A concise overview of active users and published school content.', icon: DocumentTextIcon },
];

export default function PrincipalReports({ grade_levels = [], school_years = [] }) {
    const [reportType, setReportType] = useState('student_directory');
    const [gradeLevel, setGradeLevel] = useState('all');
    const [status, setStatus] = useState('active');
    const [schoolYear, setSchoolYear] = useState(school_years[0] || '');
    const selectedReport = reports.find((report) => report.key === reportType);
    const needsSchoolYear = reportType !== 'student_directory';
    const needsStudentStatus = reportType !== 'teacher_activity';

    const generatePdf = () => {
        const params = new URLSearchParams({ report_type: reportType, grade_level: gradeLevel });
        if (needsStudentStatus) params.set('status', status);
        if (needsSchoolYear && schoolYear) params.set('school_year', schoolYear);
        window.open(`${route('principal.reports.pdf')}?${params.toString()}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-gray-800">Reports</h2>}>
            <Head title="Reports" />

            <div className="principal-reports-page py-6 sm:py-10">
                <style>{`
                    .studynest-layout.theme-dark .principal-reports-page .report-hero { background: linear-gradient(110deg, rgb(30 41 59), rgb(15 23 42)) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .principal-reports-page .report-choice { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .principal-reports-page .report-choice-selected { background-color: rgb(30 41 59) !important; border-color: rgb(59 130 246) !important; }
                    .studynest-layout.theme-dark .principal-reports-page .report-filters { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .principal-reports-page h1, .studynest-layout.theme-dark .principal-reports-page h3, .studynest-layout.theme-dark .principal-reports-page h4 { color: rgb(241 245 249) !important; }
                    .studynest-layout.theme-dark .principal-reports-page p, .studynest-layout.theme-dark .principal-reports-page label { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .principal-reports-page select { background-color: rgb(30 41 59) !important; border-color: rgb(71 85 105) !important; color: rgb(241 245 249) !important; }
                    .studynest-layout.theme-dark .principal-reports-page option { background-color: rgb(30 41 59); color: rgb(241 245 249); }
                    .studynest-layout.theme-dark .principal-reports-page .border-slate-200 { border-color: rgb(51 65 85) !important; }
                `}</style>
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="report-hero rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 sm:p-7">
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Principal reports</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">Generate clear school reports</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose a report, set its scope, then download a professional PDF for school records or presentation.</p>
                    </section>

                    <section>
                        <h3 className="mb-3 text-base font-semibold text-slate-800">Choose a report</h3>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {reports.map((report) => {
                                const Icon = report.icon;
                                const isSelected = report.key === reportType;
                                return <button key={report.key} type="button" onClick={() => setReportType(report.key)} className={`report-choice rounded-xl border p-5 text-left transition-all ${isSelected ? 'report-choice-selected border-blue-600 bg-blue-50 ring-2 ring-blue-600/20' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                                    <span className={`mb-4 inline-flex rounded-lg p-2.5 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-6 w-6" /></span>
                                    <h4 className="font-semibold text-slate-900">{report.title}</h4>
                                    <p className="mt-2 text-sm leading-5 text-slate-600">{report.description}</p>
                                </button>;
                            })}
                        </div>
                    </section>

                    <section className="report-filters rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div><h3 className="font-semibold text-slate-900">Report filters</h3><p className="mt-1 text-sm text-slate-600">{selectedReport?.title}</p></div>
                            <span className="mt-2 inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:mt-0">PDF download</span>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <label className="block text-sm font-medium text-slate-700">Grade Level<select value={gradeLevel} onChange={(event) => setGradeLevel(event.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"><option value="all">All Grades</option>{grade_levels.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></label>
                            {needsStudentStatus && <label className="block text-sm font-medium text-slate-700">Student Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600"><option value="active">Active Students</option><option value="inactive">Inactive Students</option><option value="all">All Students</option></select></label>}
                            {needsSchoolYear && <label className="block text-sm font-medium text-slate-700">School Year<select value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-600 focus:ring-blue-600">{school_years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>}
                        </div>
                        <div className="mt-6 flex justify-end border-t border-slate-200 pt-5"><PrimaryButton onClick={generatePdf} className="inline-flex items-center gap-2"><DocumentTextIcon className="h-5 w-5" />Generate PDF</PrimaryButton></div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
