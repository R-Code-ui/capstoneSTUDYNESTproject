import SecondaryButton from '@/Components/SecondaryButton';

export default function ReportResult({
    data = [],
    summary = null,
    title = 'Report Results',
    className = '',
    showExport = true,
    onExport,
}) {
    const PdfIcon = () => (
        <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const handleExport = () => {
        if (onExport) {
            onExport('pdf');
        }
    };

    const hasData = data && data.length > 0;
    const hasSummary = summary && Object.keys(summary).length > 0;

    return (
        <div className={className}>
            {hasSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            )}

            {hasData ? (
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
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No data available for this report.</p>
                </div>
            )}

            {showExport && hasData && (
                <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <SecondaryButton onClick={handleExport}>
                        <span className="flex items-center gap-1">
                            <PdfIcon /> Download PDF
                        </span>
                    </SecondaryButton>
                </div>
            )}
        </div>
    );
}
