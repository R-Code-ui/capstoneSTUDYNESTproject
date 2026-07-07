import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';

// Heroicons
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PuzzlePieceIcon,
    MegaphoneIcon,
    ChartBarIcon,
    EnvelopeIcon,
    UserIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

export default function StudentDashboard({
    grade_level,
    recent_announcements,
    recent_lessons,
    upcoming_assignments,
    available_quizzes,
    assigned_games,
    progress_summary,
    unread_messages,
}) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'submitted':
            case 'graded':
            case 'completed':
                return <StatusBadge status="completed" label="Completed" />;
            case 'pending':
            case 'started':
                return <StatusBadge status="in_progress" label="In Progress" />;
            case 'not_submitted':
            case 'assigned':
            default:
                return <StatusBadge status="not_started" label="Not Started" />;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Student Dashboard
                    </span>
                    {unread_messages > 0 && (
                        <Link
                            href={route('student.messages.index')}
                            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800"
                        >
                            <EnvelopeIcon className="w-5 h-5" />
                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                {unread_messages}
                            </span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Student Dashboard" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl">
                    {/* ===== Welcome Section ===== */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Welcome back! 👋
                            </h2>
                            <p className="text-sm text-gray-300">
                                <UserIcon className="inline-block w-4 h-4 mr-1" />
                                Grade {grade_level}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span className="text-sm text-gray-300">Quick Links:</span>
                            <div className="flex gap-1">
                                {[
                                    { icon: BookOpenIcon, color: 'blue', label: 'Lessons', route: 'student.lessons.index' },
                                    { icon: ClipboardDocumentListIcon, color: 'green', label: 'Assignments', route: 'student.assignments.index' },
                                    { icon: DocumentTextIcon, color: 'purple', label: 'Quizzes', route: 'student.quizzes.index' },
                                    { icon: PuzzlePieceIcon, color: 'orange', label: 'Games', route: 'student.games.index' },
                                    { icon: MegaphoneIcon, color: 'red', label: 'Announcements', route: 'student.announcements.index' },
                                    { icon: ChartBarIcon, color: 'indigo', label: 'Progress', route: 'student.progress.index' },
                                ].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={route(item.route)}
                                        className={`p-1.5 bg-${item.color}-500/20 rounded-lg hover:bg-${item.color}-500/30 transition-colors`}
                                        title={item.label}
                                    >
                                        <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== Recent Announcements ===== */}
                    <Card title={
                        <div className="flex items-center gap-2">
                            <MegaphoneIcon className="w-5 h-5 text-red-500" />
                            Recent Announcements
                        </div>
                    }>
                        {recent_announcements && recent_announcements.length > 0 ? (
                            <div className="space-y-3">
                                {recent_announcements.map((announcement) => (
                                    <div
                                        key={announcement.id}
                                        className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {announcement.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {announcement.content}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {announcement.posted_by}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {announcement.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center">
                                    <Link
                                        href={route('student.announcements.index')}
                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Announcements →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                No recent announcements.
                            </p>
                        )}
                    </Card>

                    {/* ===== Recent Lessons & Upcoming Assignments ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Recent Lessons */}
                        <Card title={
                            <div className="flex items-center gap-2">
                                <BookOpenIcon className="w-5 h-5 text-blue-500" />
                                Recent Lessons
                            </div>
                        }>
                            {recent_lessons && recent_lessons.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {lesson.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {lesson.subject}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {lesson.date}
                                                </span>
                                                <Link
                                                    href={route('student.lessons.show', lesson.id)}
                                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <Link
                                            href={route('student.lessons.index')}
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            View All Lessons →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No lessons available.
                                </p>
                            )}
                        </Card>

                        {/* Upcoming Assignments */}
                        <Card title={
                            <div className="flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-green-500" />
                                Upcoming Assignments
                            </div>
                        }>
                            {upcoming_assignments && upcoming_assignments.length > 0 ? (
                                <div className="space-y-3">
                                    {upcoming_assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {assignment.title}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {assignment.subject}
                                                    </span>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {assignment.due_date}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                {getStatusBadge(assignment.status)}
                                                <Link
                                                    href={route('student.assignments.show', assignment.id)}
                                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <Link
                                            href={route('student.assignments.index')}
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            View All Assignments →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No upcoming assignments.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* ===== Available Quizzes & Assigned Games ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Available Quizzes */}
                        <Card title={
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-purple-500" />
                                Available Quizzes
                            </div>
                        }>
                            {available_quizzes && available_quizzes.length > 0 ? (
                                <div className="space-y-3">
                                    {available_quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {quiz.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {quiz.subject} • {quiz.questions} questions
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                {quiz.status === 'completed' ? (
                                                    <>
                                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            {quiz.score}%
                                                        </span>
                                                        <Link
                                                            href={route('student.quizzes.show', quiz.id)}
                                                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            View Results →
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={route('student.quizzes.show', quiz.id)}
                                                        className="mt-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    >
                                                        Start Quiz →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <Link
                                            href={route('student.quizzes.index')}
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            View All Quizzes →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No quizzes available.
                                </p>
                            )}
                        </Card>

                        {/* Assigned Games */}
                        <Card title={
                            <div className="flex items-center gap-2">
                                <PuzzlePieceIcon className="w-5 h-5 text-orange-500" />
                                Assigned Games
                            </div>
                        }>
                            {assigned_games && assigned_games.length > 0 ? (
                                <div className="space-y-3">
                                    {assigned_games.map((game) => (
                                        <div
                                            key={game.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {game.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                    {game.game_type}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                {game.status === 'completed' ? (
                                                    <>
                                                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                            {game.score}%
                                                        </span>
                                                        <Link
                                                            href={route('student.games.show', game.id)}
                                                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Play Again →
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={route('student.games.show', game.id)}
                                                        className="mt-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                    >
                                                        Play Game →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <Link
                                            href={route('student.games.index')}
                                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            View All Games →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No games assigned.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* ===== Learning Progress Summary ===== */}
                    <div className="mt-6">
                        <Card title={
                            <div className="flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                                Learning Progress Summary
                            </div>
                        }>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {progress_summary?.lessons?.completed || 0}/{progress_summary?.lessons?.total || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Lessons Completed</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {progress_summary?.assignments?.submitted || 0}/{progress_summary?.assignments?.total || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Assignments Submitted</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {progress_summary?.quizzes?.average || 0}%
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Quiz Average</div>
                                </div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {progress_summary?.games?.completed || 0}/{progress_summary?.games?.total || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Games Completed</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Quick Access Buttons (now functional) ===== */}
                    <div className="mt-6">
                        <Card title={<div className="flex items-center gap-2">Quick Access</div>}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                {[
                                    { icon: BookOpenIcon, color: 'blue', label: 'Lessons', route: 'student.lessons.index' },
                                    { icon: ClipboardDocumentListIcon, color: 'green', label: 'Assignments', route: 'student.assignments.index' },
                                    { icon: DocumentTextIcon, color: 'purple', label: 'Quizzes', route: 'student.quizzes.index' },
                                    { icon: PuzzlePieceIcon, color: 'orange', label: 'Games', route: 'student.games.index' },
                                    { icon: MegaphoneIcon, color: 'red', label: 'Announcements', route: 'student.announcements.index' },
                                    { icon: ChartBarIcon, color: 'indigo', label: 'Progress', route: 'student.progress.index' },
                                ].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={route(item.route)}
                                        className={`flex flex-col items-center justify-center p-4 bg-${item.color}-50 dark:bg-${item.color}-900/30 rounded-xl hover:bg-${item.color}-100 dark:hover:bg-${item.color}-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md`}
                                    >
                                        <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
