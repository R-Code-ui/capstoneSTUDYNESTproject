import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import { toast } from 'sonner';
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

export default function ProgressTracker({
    grade_level,
    summary,
    pending_activities,
    participation_rate,
    pending_count,
    pagination,
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

    const changePendingPage = (page) => {
        if (page < 1 || page > (pagination?.last_page || 1)) return;

        router.visit(route('student.progress.index'), {
            data: { page },
            preserveState: true,
            preserveScroll: true,
            onError: () => toast.error('Unable to load that progress page. Please try again.'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Progress</h2>}
        >
            <Head title="My Progress" />

            <div className="student-progress-page py-12">
                <style>{`
                    .student-progress-page .progress-overall-card,
                    .student-progress-page .progress-pending-panel {
                        color: #1e293b;
                    }
                    .student-progress-page .progress-color-card,
                    .student-progress-page .progress-pending-card {
                        color: #1e293b;
                    }
                    .student-progress-page .progress-color-card .text-gray-800,
                    .student-progress-page .progress-color-card .text-gray-700,
                    .student-progress-page .progress-color-card .text-gray-600,
                    .student-progress-page .progress-pending-card .text-gray-800,
                    .student-progress-page .progress-pending-card .text-gray-700,
                    .student-progress-page .progress-pending-card .text-gray-600 {
                        color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-panel {
                        background: #0f172a !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card .text-gray-800,
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card .text-gray-600,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-panel .text-gray-800,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-panel .text-gray-700,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-panel .text-gray-500 {
                        color: #cbd5e1 !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="0"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="0"] {
                        background: linear-gradient(135deg, #1e3a5f, #4a2946) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="1"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="1"] {
                        background: linear-gradient(135deg, #5b391f, #4b461b) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="2"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="2"] {
                        background: linear-gradient(135deg, #432d64, #532b48) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="3"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="3"] {
                        background: linear-gradient(135deg, #195246, #1e3a5f) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="4"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="4"] {
                        background: linear-gradient(135deg, #574619, #5b2a32) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="5"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="5"] {
                        background: linear-gradient(135deg, #263467, #432d64) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="6"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="6"] {
                        background: linear-gradient(135deg, #154b4c, #195246) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="7"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="7"] {
                        background: linear-gradient(135deg, #5b2a32, #5b391f) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="8"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="8"] {
                        background: linear-gradient(135deg, #144a5f, #1e3a5f) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="9"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="9"] {
                        background: linear-gradient(135deg, #574619, #4b461b) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .text-gray-800,
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .text-gray-500,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card .text-gray-800,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card .text-gray-600 {
                        color: #f1f5f9 !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .bg-gray-200\/70,
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card .bg-gray-200 {
                        background-color: rgb(148 163 184 / 0.35) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card [class~="bg-white/70"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card [class~="bg-white/70"],
                    .studynest-layout.theme-dark .student-progress-page .progress-grade-badge {
                        background-color: rgb(15 23 42 / 0.58) !important;
                        border-color: rgb(71 85 105) !important;
                        color: rgb(191 219 254) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card [class~="bg-amber-100"] {
                        background-color: rgb(146 64 14 / 0.4) !important;
                        color: rgb(253 230 138) !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card [class~="bg-gray-200"] {
                        background-color: rgb(15 23 42 / 0.62) !important;
                        color: rgb(226 232 240) !important;
                    }
                    /* Calm, accessible colour system for progress content. */
                    .student-progress-page .progress-overall-card {
                        background: linear-gradient(135deg, #f8fbff, #eef4ff) !important;
                        border-color: #dbeafe !important;
                    }
                    .student-progress-page .progress-color-card,
                    .student-progress-page .progress-pending-card {
                        background-image: none !important;
                        border-color: #dbe4f0 !important;
                    }
                    .student-progress-page .progress-color-card[data-progress-tone="0"],
                    .student-progress-page .progress-pending-card[data-progress-tone="0"] { background-color: #eff6ff !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="1"],
                    .student-progress-page .progress-pending-card[data-progress-tone="1"] { background-color: #fffbeb !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="2"],
                    .student-progress-page .progress-pending-card[data-progress-tone="2"] { background-color: #f5f3ff !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="3"],
                    .student-progress-page .progress-pending-card[data-progress-tone="3"] { background-color: #f0fdfa !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="4"],
                    .student-progress-page .progress-pending-card[data-progress-tone="4"] { background-color: #fff1f2 !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="5"],
                    .student-progress-page .progress-pending-card[data-progress-tone="5"] { background-color: #eef2ff !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="6"],
                    .student-progress-page .progress-pending-card[data-progress-tone="6"] { background-color: #ecfeff !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="7"],
                    .student-progress-page .progress-pending-card[data-progress-tone="7"] { background-color: #fff7ed !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="8"],
                    .student-progress-page .progress-pending-card[data-progress-tone="8"] { background-color: #f0f9ff !important; }
                    .student-progress-page .progress-color-card[data-progress-tone="9"],
                    .student-progress-page .progress-pending-card[data-progress-tone="9"] { background-color: #fefce8 !important; }
                    .student-progress-page .progress-color-card .bg-gray-200\/70,
                    .student-progress-page .progress-overall-card .bg-gray-200 { background-color: #dbe4f0 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card {
                        background: linear-gradient(135deg, #111c33, #172554) !important;
                        border-color: #334155 !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card,
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card {
                        background-image: none !important;
                        border-color: #475569 !important;
                        box-shadow: none !important;
                    }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="0"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="0"] { background-color: #172b4d !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="1"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="1"] { background-color: #3b2e16 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="2"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="2"] { background-color: #2e2148 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="3"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="3"] { background-color: #123b3b !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="4"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="4"] { background-color: #421f31 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="5"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="5"] { background-color: #252d58 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="6"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="6"] { background-color: #123b47 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="7"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="7"] { background-color: #432b1d !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="8"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="8"] { background-color: #173651 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card[data-progress-tone="9"],
                    .studynest-layout.theme-dark .student-progress-page .progress-pending-card[data-progress-tone="9"] { background-color: #363318 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .bg-gray-200\/70,
                    .studynest-layout.theme-dark .student-progress-page .progress-overall-card .bg-gray-200 { background-color: #334155 !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .text-red-600 { color: #fda4af !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .text-amber-600 { color: #fcd34d !important; }
                    .studynest-layout.theme-dark .student-progress-page .progress-color-card .text-emerald-600 { color: #6ee7b7 !important; }
                    @media (max-width: 640px) {
                        .student-progress-page { padding-top: 1.25rem; padding-bottom: 1.25rem; }
                        .student-progress-page .progress-overall-card { padding: 1rem; }
                        .student-progress-page .progress-pending-panel > div { padding-left: 1rem; padding-right: 1rem; }
                        .student-progress-page .progress-pending-card .flex.items-center { align-items: flex-start; }
                    }
                `}</style>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Grade Level ===== */}
                    {/* 🔧 FIX: Removed "Grade:" label, just show the grade, reduced margin */}
                    <div className="mb-3">
                        <div className="progress-grade-badge inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-700">{grade_level}</span>
                        </div>
                    </div>

                    {/* ===== Overall Progress Card ===== */}
                    {/* 🔧 FIX: Reduced margin from mb-6 to mb-4 */}
                    <div className="mb-4">
                        <div className="progress-overall-card bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm p-6">
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
                            return (
                                <div
                                    key={item.title}
                                    data-progress-tone={index}
                                    className="progress-color-card rounded-xl border shadow-sm p-6"
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
                        <div className="progress-pending-panel bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                            return (
                                                <Link
                                                    key={index}
                                                    href={getActivityRoute(activity.type, activity.id)}
                                                    onError={() => toast.error('Unable to open this activity. Please try again.')}
                                                    className="block"
                                                >
                                                    <div data-progress-tone={index % 10} className="progress-pending-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden">
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
                                {pagination?.total > 0 && (
                                    <div className="mt-5 flex flex-col gap-4 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-gray-500">
                                            Showing <span className="font-semibold text-gray-800">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to <span className="font-semibold text-gray-800">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="font-semibold text-gray-800">{pagination.total}</span> activities
                                        </p>
                                        <nav aria-label="Pending activities pagination" className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                                            <button type="button" onClick={() => changePendingPage(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400">Previous</button>
                                            <span className="min-w-[36px] rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm">{pagination.current_page}</span>
                                            <button type="button" onClick={() => changePendingPage(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400">Next</button>
                                        </nav>
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
