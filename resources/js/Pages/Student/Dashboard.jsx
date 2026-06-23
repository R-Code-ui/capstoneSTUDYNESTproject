import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';

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
    const getStatusColor = (status) => {
        const colors = {
            not_submitted: 'text-gray-500 dark:text-gray-400',
            submitted: 'text-blue-600 dark:text-blue-400',
            late_submission: 'text-yellow-600 dark:text-yellow-400',
            reviewed: 'text-purple-600 dark:text-purple-400',
            graded: 'text-green-600 dark:text-green-400',
            returned_for_revision: 'text-red-600 dark:text-red-400',
        };
        return colors[status] || colors.not_submitted;
    };

    const getStatusLabel = (status) => {
        const labels = {
            not_submitted: 'Not Submitted',
            submitted: 'Submitted',
            late_submission: 'Late Submission',
            reviewed: 'Reviewed',
            graded: 'Graded',
            returned_for_revision: 'Returned for Revision',
        };
        return labels[status] || status;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Student Dashboard</h2>}
        >
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Welcome Section ===== */}
                    <div className="mb-6">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900">
                            <div className="text-white">
                                <h3 className="text-2xl font-bold">
                                    Welcome back! 👋
                                </h3>
                                <p className="mt-1 text-blue-100">
                                    Grade: <span className="font-semibold">{grade_level}</span>
                                </p>
                                {unread_messages > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                                        <span className="font-semibold">{unread_messages}</span>
                                        <span>unread message{unread_messages > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ===== Quick Stats ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {progress_summary.lessons.completed} / {progress_summary.lessons.total}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">📚 Lessons</div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${progress_summary.lessons.total > 0 ? (progress_summary.lessons.completed / progress_summary.lessons.total) * 100 : 0}%` }}
                                />
                            </div>
                        </Card>

                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {progress_summary.assignments.submitted} / {progress_summary.assignments.total}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">📝 Assignments</div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${progress_summary.assignments.total > 0 ? (progress_summary.assignments.submitted / progress_summary.assignments.total) * 100 : 0}%` }}
                                />
                            </div>
                        </Card>

                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {progress_summary.quizzes.completed} / {progress_summary.quizzes.total}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">📊 Quizzes</div>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Avg Score: {progress_summary.quizzes.average}%
                            </div>
                        </Card>

                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {progress_summary.games.completed} / {progress_summary.games.total}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">🎮 Games</div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-orange-600 h-2 rounded-full"
                                    style={{ width: `${progress_summary.games.total > 0 ? (progress_summary.games.completed / progress_summary.games.total) * 100 : 0}%` }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* ===== Recent Announcements & Lessons ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Recent Announcements */}
                        <Card title="📢 Recent Announcements">
                            {recent_announcements.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No recent announcements.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_announcements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {announcement.title}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                {announcement.content}
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span>By {announcement.posted_by}</span>
                                                <span>{announcement.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {recent_announcements.length > 0 && (
                                <div className="mt-3 text-center">
                                    <Link
                                        href={route('student.announcements.index')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Announcements →
                                    </Link>
                                </div>
                            )}
                        </Card>

                        {/* Recent Lessons */}
                        <Card title="📚 Recent Lessons">
                            {recent_lessons.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No recent lessons.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {lesson.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {lesson.subject}
                                                </div>
                                            </div>
                                            <Link
                                                href={route('student.lessons.show', lesson.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {recent_lessons.length > 0 && (
                                <div className="mt-3 text-center">
                                    <Link
                                        href={route('student.lessons.index')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Lessons →
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Upcoming Assignments & Available Quizzes ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Upcoming Assignments */}
                        <Card title="📝 Upcoming Assignments">
                            {upcoming_assignments.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming assignments.</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming_assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {assignment.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {assignment.subject} • Due: {assignment.due_date}
                                                </div>
                                                <span className={`text-xs ${getStatusColor(assignment.status)}`}>
                                                    {getStatusLabel(assignment.status)}
                                                </span>
                                            </div>
                                            <Link
                                                href={route('student.assignments.show', assignment.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {upcoming_assignments.length > 0 && (
                                <div className="mt-3 text-center">
                                    <Link
                                        href={route('student.assignments.index')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Assignments →
                                    </Link>
                                </div>
                            )}
                        </Card>

                        {/* Available Quizzes */}
                        <Card title="📊 Available Quizzes">
                            {available_quizzes.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No quizzes available.</p>
                            ) : (
                                <div className="space-y-3">
                                    {available_quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {quiz.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {quiz.subject} • {quiz.questions} questions
                                                </div>
                                                {quiz.status === 'completed' ? (
                                                    <span className="text-xs text-green-600 dark:text-green-400">
                                                        ✅ Score: {quiz.score}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                                        ⏳ Not Taken
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={route('student.quizzes.show', quiz.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {quiz.status === 'completed' ? 'View' : 'Take'} →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {available_quizzes.length > 0 && (
                                <div className="mt-3 text-center">
                                    <Link
                                        href={route('student.quizzes.index')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Quizzes →
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Assigned Games ===== */}
                    <div className="mt-6">
                        <Card title="🎮 Assigned Games">
                            {assigned_games.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No games assigned.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {assigned_games.map((game) => (
                                        <div
                                            key={game.id}
                                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center"
                                        >
                                            <div className="text-3xl mb-2">
                                                {game.game_type === 'literacy' ? '📖' : '🧮'}
                                            </div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {game.title}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {game.game_type?.charAt(0).toUpperCase() + game.game_type?.slice(1)}
                                            </div>
                                            {game.status === 'completed' ? (
                                                <div className="mt-2 text-green-600 dark:text-green-400">
                                                    ✅ Score: {game.score}
                                                </div>
                                            ) : game.status === 'started' ? (
                                                <div className="mt-2 text-yellow-600 dark:text-yellow-400">
                                                    ⏳ In Progress
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-gray-500 dark:text-gray-400">
                                                    📌 Not Started
                                                </div>
                                            )}
                                            <Link
                                                href={route('student.games.show', game.id)}
                                                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                {game.status === 'completed' ? 'View Results' : game.status === 'started' ? 'Continue' : 'Play'} →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {assigned_games.length > 0 && (
                                <div className="mt-4 text-center">
                                    <Link
                                        href={route('student.games.index')}
                                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View All Games →
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Quick Access Buttons (Mobile-Friendly) ===== */}
                    <div className="mt-6">
                        <Card title="Quick Access">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <Link
                                    href={route('student.lessons.index')}
                                    className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <span className="text-3xl">📚</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Lessons</span>
                                </Link>
                                <Link
                                    href={route('student.assignments.index')}
                                    className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                                >
                                    <span className="text-3xl">📝</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Assignments</span>
                                </Link>
                                <Link
                                    href={route('student.quizzes.index')}
                                    className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                >
                                    <span className="text-3xl">📊</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Quizzes</span>
                                </Link>
                                <Link
                                    href={route('student.games.index')}
                                    className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                                >
                                    <span className="text-3xl">🎮</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Games</span>
                                </Link>
                                <Link
                                    href={route('student.announcements.index')}
                                    className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    <span className="text-3xl">📢</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Announcements</span>
                                </Link>
                                <Link
                                    href={route('student.progress.index')}
                                    className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                    <span className="text-3xl">📈</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                </Link>
                                <Link
                                    href={route('student.messages.index')}
                                    className="flex flex-col items-center p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
                                >
                                    <span className="text-3xl">💬</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Messages</span>
                                    {unread_messages > 0 && (
                                        <span className="mt-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                            {unread_messages}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
