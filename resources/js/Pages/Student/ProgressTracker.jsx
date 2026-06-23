import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';

export default function ProgressTracker({
    grade_level,
    summary,
    pending_activities,
    participation_rate,
    pending_count,
}) {
    const getStatusColor = (progress) => {
        if (progress >= 80) return 'text-green-600 dark:text-green-400';
        if (progress >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getStatusLabel = (progress) => {
        if (progress >= 80) return 'Excellent';
        if (progress >= 60) return 'Needs Monitoring';
        return 'Needs Support';
    };

    const getStatusBadge = (progress) => {
        if (progress >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        if (progress >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    };

    const getActivityIcon = (type) => {
        const icons = {
            lesson: '📚',
            assignment: '📝',
            quiz: '📊',
            game: '🎮',
        };
        return icons[type] || '📌';
    };

    const getActivityRoute = (type, id) => {
        const routes = {
            lesson: route('student.lessons.show', id),
            assignment: route('student.assignments.show', id),
            quiz: route('student.quizzes.show', id),
            game: route('student.games.show', id),
        };
        return routes[type] || '#';
    };

    // Calculate overall progress
    const lessonProgress = summary.lessons.percentage;
    const assignmentProgress = summary.assignments.percentage;
    const quizProgress = summary.quizzes.percentage;
    const gameProgress = summary.games.percentage;

    const overallProgress = Math.round(
        (lessonProgress * 0.3) +
        (assignmentProgress * 0.3) +
        (quizProgress * 0.3) +
        (gameProgress * 0.1)
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My Progress</h2>}
        >
            <Head title="My Progress" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Grade Level ===== */}
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📚 Grade:</span>
                            <span className="font-semibold text-blue-700 dark:text-blue-300">{grade_level}</span>
                        </div>
                    </div>

                    {/* ===== Overall Progress Card ===== */}
                    <div className="mb-6">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900">
                            <div className="text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-blue-100">Overall Progress</div>
                                        <div className="text-4xl font-bold">{overallProgress}%</div>
                                        <div className="mt-1 text-sm text-blue-100">
                                            Status: <span className={`font-semibold ${overallProgress >= 80 ? 'text-green-300' : overallProgress >= 60 ? 'text-yellow-300' : 'text-red-300'}`}>
                                                {getStatusLabel(overallProgress)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-6xl">
                                        {overallProgress >= 80 ? '🌟' : overallProgress >= 60 ? '📈' : '💪'}
                                    </div>
                                </div>
                                <div className="mt-4 w-full bg-white/20 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                            overallProgress >= 80 ? 'bg-green-400' :
                                            overallProgress >= 60 ? 'bg-yellow-400' :
                                            'bg-red-400'
                                        }`}
                                        style={{ width: `${overallProgress}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-blue-100">
                                    <span>Participation Rate: {participation_rate}%</span>
                                    <span>{pending_count} pending activities</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Progress Summary Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Lessons */}
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📚</div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Lessons</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.lessons.completed} / {summary.lessons.total}
                                    </div>
                                    <div className={`text-sm font-medium ${getStatusColor(lessonProgress)}`}>
                                        {lessonProgress}%
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                        <div
                                            className={`h-1.5 rounded-full ${
                                                lessonProgress >= 80 ? 'bg-green-500' :
                                                lessonProgress >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${lessonProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Assignments */}
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📝</div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Assignments</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.assignments.submitted} / {summary.assignments.total}
                                    </div>
                                    <div className={`text-sm font-medium ${getStatusColor(assignmentProgress)}`}>
                                        {assignmentProgress}%
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                        <div
                                            className={`h-1.5 rounded-full ${
                                                assignmentProgress >= 80 ? 'bg-green-500' :
                                                assignmentProgress >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${assignmentProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Quizzes */}
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">📊</div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Quizzes</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.quizzes.completed} / {summary.quizzes.total}
                                    </div>
                                    <div className={`text-sm font-medium ${getStatusColor(quizProgress)}`}>
                                        {quizProgress}%
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Avg Score: {summary.quizzes.average}%
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                        <div
                                            className={`h-1.5 rounded-full ${
                                                quizProgress >= 80 ? 'bg-green-500' :
                                                quizProgress >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${quizProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Games */}
                        <Card>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">🎮</div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Games</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {summary.games.completed} / {summary.games.total}
                                    </div>
                                    <div className={`text-sm font-medium ${getStatusColor(gameProgress)}`}>
                                        {gameProgress}%
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                        <div
                                            className={`h-1.5 rounded-full ${
                                                gameProgress >= 80 ? 'bg-green-500' :
                                                gameProgress >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${gameProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Pending Activities ===== */}
                    <div className="mt-6">
                        <Card title="📋 Pending Activities">
                            {pending_activities.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        All caught up!
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        You have no pending activities. Great job!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pending_activities.map((activity, index) => (
                                        <Link
                                            key={index}
                                            href={getActivityRoute(activity.type, activity.id)}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {activity.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {activity.subject ? `${activity.subject} • ` : ''}
                                                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                                            {activity.due_date && ` • Due: ${activity.due_date}`}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        activity.status === 'Not Started' || activity.status === 'Not Submitted' || activity.status === 'Not Taken'
                                                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                        {activity.status}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
