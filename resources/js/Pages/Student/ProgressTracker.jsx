import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    ListBulletIcon,
    CheckCircleIcon,
    SparklesIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    HeartIcon,
    ArrowRightIcon,
    AcademicCapIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Soft gradient combinations for cards
const GRADIENT_COLORS = [
    { from: 'from-blue-100', to: 'to-pink-100' },
    { from: 'from-orange-100', to: 'to-yellow-100' },
    { from: 'from-purple-100', to: 'to-pink-100' },
    { from: 'from-emerald-100', to: 'to-blue-100' },
    { from: 'from-yellow-100', to: 'to-rose-100' },
    { from: 'from-indigo-100', to: 'to-purple-100' },
    { from: 'from-teal-100', to: 'to-emerald-100' },
    { from: 'from-rose-100', to: 'to-orange-100' },
    { from: 'from-cyan-100', to: 'to-blue-100' },
    { from: 'from-amber-100', to: 'to-yellow-100' },
];

export default function ProgressTracker({
    grade_level,
    summary,
    pending_activities,
    participation_rate,
    pending_count,
}) {
    const getStatusColor = (progress) => {
        if (progress >= 80) return 'text-emerald-600';
        if (progress >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getStatusLabel = (progress) => {
        if (progress >= 80) return 'Excellent';
        if (progress >= 60) return 'Needs Monitoring';
        return 'Needs Support';
    };

    const getStatusBadge = (progress) => {
        if (progress >= 80) return 'bg-emerald-100 text-emerald-800';
        if (progress >= 60) return 'bg-amber-100 text-amber-800';
        return 'bg-red-100 text-red-800';
    };

    const getActivityIcon = (type) => {
        const icons = {
            lesson: <BookOpenIcon className="w-6 h-6 text-blue-500" />,
            assignment: <ClipboardDocumentListIcon className="w-6 h-6 text-purple-500" />,
            quiz: <ChartBarIcon className="w-6 h-6 text-emerald-500" />,
            game: <RocketLaunchIcon className="w-6 h-6 text-amber-500" />,
        };
        return icons[type] || <ListBulletIcon className="w-6 h-6 text-gray-500" />;
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

    const getOverallIcon = () => {
        if (overallProgress >= 80) {
            return <StarIcon className="w-12 h-12 text-yellow-400" />;
        } else if (overallProgress >= 60) {
            return <ArrowTrendingUpIcon className="w-12 h-12 text-blue-400" />;
        } else {
            return <HeartIcon className="w-12 h-12 text-red-400" />;
        }
    };

    const getActivityTypeLabel = (type) => {
        const labels = {
            lesson: 'Lesson',
            assignment: 'Assignment',
            quiz: 'Quiz',
            game: 'Game',
        };
        return labels[type] || type;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Progress</h2>}
        >
            <Head title="My Progress" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Grade Level ===== */}
                    {/* 🔧 FIX: Removed "Grade:" label, just show the grade, reduced margin */}
                    <div className="mb-3">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-700">{grade_level}</span>
                        </div>
                    </div>

                    {/* ===== Overall Progress Card ===== */}
                    {/* 🔧 FIX: Reduced margin from mb-6 to mb-4 */}
                    <div className="mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">Overall Progress</div>
                                    <div className="text-4xl font-bold text-gray-800">{overallProgress}%</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                        Status: <span className={`font-semibold ${
                                            overallProgress >= 80 ? 'text-emerald-600' :
                                            overallProgress >= 60 ? 'text-amber-600' :
                                            'text-red-600'
                                        }`}>
                                            {getStatusLabel(overallProgress)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    {getOverallIcon()}
                                </div>
                            </div>

                            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                        overallProgress >= 80 ? 'bg-emerald-500' :
                                        overallProgress >= 60 ? 'bg-amber-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>

                            <div className="mt-2 flex flex-wrap justify-between text-xs text-gray-600">
                                <span>Participation Rate: {participation_rate}%</span>
                                <span>{pending_count} pending activities</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== Progress Summary Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                title: 'Lessons',
                                icon: <BookOpenIcon className="w-6 h-6" />,
                                iconBg: 'bg-blue-50',
                                iconColor: 'text-blue-600',
                                completed: summary.lessons.completed,
                                total: summary.lessons.total,
                                progress: lessonProgress,
                                color: 'blue',
                            },
                            {
                                title: 'Assignments',
                                icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
                                iconBg: 'bg-purple-50',
                                iconColor: 'text-purple-600',
                                completed: summary.assignments.submitted,
                                total: summary.assignments.total,
                                progress: assignmentProgress,
                                color: 'purple',
                            },
                            {
                                title: 'Quizzes',
                                icon: <ChartBarIcon className="w-6 h-6" />,
                                iconBg: 'bg-emerald-50',
                                iconColor: 'text-emerald-600',
                                completed: summary.quizzes.completed,
                                total: summary.quizzes.total,
                                progress: quizProgress,
                                color: 'emerald',
                                extra: `Avg Score: ${summary.quizzes.average}%`,
                            },
                            {
                                title: 'Games',
                                icon: <RocketLaunchIcon className="w-6 h-6" />,
                                iconBg: 'bg-amber-50',
                                iconColor: 'text-amber-600',
                                completed: summary.games.completed,
                                total: summary.games.total,
                                progress: gameProgress,
                                color: 'amber',
                            },
                        ].map((item, index) => {
                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                            return (
                                <div
                                    key={item.title}
                                    className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-xl border border-gray-200/60 shadow-sm p-6`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm ${item.iconColor}`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.title}</div>
                                            <div className="text-2xl font-bold text-gray-800">
                                                {item.completed} / {item.total}
                                            </div>
                                            <div className={`text-sm font-medium ${getStatusColor(item.progress)}`}>
                                                {item.progress}%
                                            </div>
                                            {item.extra && (
                                                <div className="text-xs text-gray-500">{item.extra}</div>
                                            )}
                                            <div className="mt-1 w-full bg-gray-200/70 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        item.progress >= 80 ? 'bg-emerald-500' :
                                                        item.progress >= 60 ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ===== Pending Activities ===== */}
                    <div className="mt-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <ListBulletIcon className="w-5 h-5 text-gray-700" />
                                    <span className="text-sm font-semibold text-gray-700">Pending Activities</span>
                                    {pending_count > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            {pending_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                {pending_activities.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="flex justify-center mb-4">
                                            <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-800">
                                            All caught up!
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            You have no pending activities. Great job!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pending_activities.map((activity, index) => {
                                            const gradient = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
                                            return (
                                                <Link
                                                    key={index}
                                                    href={getActivityRoute(activity.type, activity.id)}
                                                    className="block"
                                                >
                                                    <div className={`bg-gradient-to-br ${gradient.from} ${gradient.to} rounded-lg border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden`}>
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm shadow-sm flex-shrink-0">
                                                                    {getActivityIcon(activity.type)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-medium text-gray-800 truncate max-w-full" title={activity.title}>
                                                                        {activity.title}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 truncate max-w-full">
                                                                        {activity.subject ? `${activity.subject} • ` : ''}
                                                                        {getActivityTypeLabel(activity.type)}
                                                                        {activity.due_date && ` • Due: ${activity.due_date}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    activity.status === 'Not Started' || activity.status === 'Not Submitted' || activity.status === 'Not Taken'
                                                                        ? 'bg-gray-200 text-gray-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {activity.status}
                                                                </span>
                                                                <ArrowRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
