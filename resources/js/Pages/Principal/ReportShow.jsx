import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicon
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function ReportShow({ report, data, summary, headers }) {
    const handleBack = () => {
        router.visit(route('principal.reports.index'));
    };

    const handleExportPdf = () => {
        const url = route('principal.reports.export.pdf', report.id);
        window.open(url, '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold text-gray-800">
                        {report.report_type}
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handleExportPdf}>
                            <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                            Download PDF
                        </SecondaryButton>
                        <SecondaryButton onClick={handleBack}>
                            Back to Reports
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={report.report_type} />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Meta Information */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-500">Report Type</div>
                                    <div className="font-medium text-gray-800">{report.report_type}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Generated At</div>
                                    <div className="font-medium text-gray-800">{report.generated_at}</div>
                                </div>
                                {report.grade_level && (
                                    <div>
                                        <div className="text-sm text-gray-500">Grade Level</div>
                                        <div className="font-medium text-gray-800">{report.grade_level}</div>
                                    </div>
                                )}
                                {report.trimester && (
                                    <div>
                                        <div className="text-sm text-gray-500">Term</div>
                                        <div className="font-medium text-gray-800">{report.trimester}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && Object.keys(summary).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(summary).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 p-4 rounded-lg text-center">
                                            <div className="text-xl font-bold text-gray-800">
                                                {typeof value === 'number' ? value : value}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Data</h3>
                        </div>
                        <div className="p-6">
                            {data && data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-600">
                                        <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                {headers.map((header) => (
                                                    <th key={header} className="px-6 py-3">
                                                        {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.map((row, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    {headers.map((header) => (
                                                        <td key={header} className="px-6 py-4">
                                                            {typeof row[header] === 'number' ? row[header] : row[header] || '—'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No data available for this report.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
