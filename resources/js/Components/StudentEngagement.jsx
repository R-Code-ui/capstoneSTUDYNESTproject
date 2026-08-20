export default function StudentEngagement({ stats }) {
    // Helper: Ensure numeric values show 0 if null/undefined
    const safeNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        return value;
    };

    const engagementMetrics = [
        {
            label: 'Total Students',
            value: safeNumber(stats.total_students),
            color: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Lesson Completion Rate',
            value: `${safeNumber(stats.lesson_completion_rate)}%`,
            color: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            label: 'Assignment Completion Rate',
            value: `${safeNumber(stats.assignment_completion_rate)}%`,
            color: 'text-purple-600 dark:text-purple-400'
        },
        {
            label: 'Quiz Participation Rate',
            value: `${safeNumber(stats.quiz_participation_rate)}%`,
            color: 'text-amber-600 dark:text-amber-400'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {engagementMetrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-slate-400">{metric.label}</div>
                </div>
            ))}
        </div>
    );
}
