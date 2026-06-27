import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SecondaryButton from '@/Components/SecondaryButton';

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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {report.report_type}
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handleExportPdf}>
                            📄 Download PDF
                        </SecondaryButton>
                        <SecondaryButton onClick={handleBack}>
                            ← Back to Reports
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={report.report_type} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Meta Information */}
                    <Card className="mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Report Type</div>
                                <div className="font-medium text-gray-900 dark:text-white">{report.report_type}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Generated At</div>
                                <div className="font-medium text-gray-900 dark:text-white">{report.generated_at}</div>
                            </div>
                            {report.grade_level && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Grade Level</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{report.grade_level}</div>
                                </div>
                            )}
                            {report.trimester && (
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Trimester</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{report.trimester}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Summary Cards */}
                    {summary && Object.keys(summary).length > 0 && (
                        <Card title="Summary" className="mb-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(summary).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {typeof value === 'number' ? value : value}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Data Table */}
                    <Card title="Data">
                        {data && data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            {headers.map((header) => (
                                                <th key={header} className="px-6 py-3">
                                                    {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
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
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No data available for this report.
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
