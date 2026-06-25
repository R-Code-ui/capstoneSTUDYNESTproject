export default function StudentEngagement({ stats }) {
    const engagementMetrics = [
        { label: 'Total Students', value: stats.total_students, color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Lesson Completion Rate', value: `${stats.lesson_completion_rate}%`, color: 'text-green-600 dark:text-green-400' },
        { label: 'Assignment Completion Rate', value: `${stats.assignment_completion_rate}%`, color: 'text-purple-600 dark:text-purple-400' },
        { label: 'Quiz Participation Rate', value: `${stats.quiz_participation_rate}%`, color: 'text-orange-600 dark:text-orange-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {engagementMetrics.map((metric) => (
                <div key={metric.label} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
                </div>
            ))}
        </div>
    );
}
