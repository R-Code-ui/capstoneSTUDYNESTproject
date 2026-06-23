import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';

export default function TeacherDashboard({
    assigned_grades,
    stats,
    participation,
    students_requiring_attention,
    upcoming_deadlines,
    recent_activity,
    messages,
}) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Teacher Dashboard</h2>}
        >
            <Head title="Teacher Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Assigned Grades Badge ===== */}
                    <div className="mb-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Grades:</span>
                            {assigned_grades.length > 0 ? (
                                assigned_grades.map((grade) => (
                                    <span
                                        key={grade}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                        {grade}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">No grades assigned</span>
                            )}
                        </div>
                    </div>

                    {/* ===== Section 1: Classroom Overview Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_students}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Students</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total_lessons}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total_assignments}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Assignments</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.total_quizzes}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Quizzes</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_games}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Games</div>
                        </Card>
                    </div>

                    {/* ===== Section 2: Participation Summary ===== */}
                    <div className="mt-6">
                        <Card title="Student Participation Summary">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{participation.lesson_completion_rate}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Lesson Completion</div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${participation.lesson_completion_rate}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{participation.assignment_completion_rate}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Assignment Completion</div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${participation.assignment_completion_rate}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{participation.average_quiz_score}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Average Quiz Score</div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-purple-600 h-2.5 rounded-full"
                                            style={{ width: `${participation.average_quiz_score}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{participation.game_participation_rate}%</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Game Participation</div>
                                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-orange-600 h-2.5 rounded-full"
                                            style={{ width: `${participation.game_participation_rate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 3: Students Requiring Attention + Upcoming Deadlines ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Students Requiring Attention */}
                        <Card title="Students Requiring Attention">
                            {students_requiring_attention.length === 0 ? (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    ✅ All students are on track!
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {students_requiring_attention.map((student, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                                                <span className="text-xs text-red-500 dark:text-red-400 block">{student.concern}</span>
                                            </div>
                                            <Link
                                                href={route('teacher.progress.show', student.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Upcoming Deadlines */}
                        <Card title="Upcoming Deadlines">
                            {upcoming_deadlines.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines.</p>
                            ) : (
                                <div className="space-y-2">
                                    {upcoming_deadlines.map((deadline, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        >
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{deadline.title}</span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Due: {deadline.due_date}
                                                    {deadline.days_left <= 0 ? (
                                                        <span className="ml-1 text-red-500 dark:text-red-400">(Overdue!)</span>
                                                    ) : deadline.days_left <= 2 ? (
                                                        <span className="ml-1 text-orange-500 dark:text-orange-400">({deadline.days_left} day{deadline.days_left > 1 ? 's' : ''} left)</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <Link
                                                href={route('teacher.assignments.show', deadline.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 4: Recent Activity ===== */}
                    <div className="mt-6">
                        <Card title="Recent Activity">
                            {recent_activity.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {recent_activity.map((activity, index) => {
                                        const icons = {
                                            lesson: '📚',
                                            assignment: '📝',
                                            quiz: '📊',
                                            game: '🎮',
                                        };
                                        const colors = {
                                            lesson: 'text-purple-600 dark:text-purple-400',
                                            assignment: 'text-orange-600 dark:text-orange-400',
                                            quiz: 'text-red-600 dark:text-red-400',
                                            game: 'text-green-600 dark:text-green-400',
                                        };

                                        return (
                                            <div
                                                key={index}
                                                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center"
                                            >
                                                <div className={`text-3xl ${colors[activity.type] || 'text-gray-500'}`}>
                                                    {icons[activity.type] || '📌'}
                                                </div>
                                                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activity.date}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 5: Recent Messages ===== */}
                    <div className="mt-6">
                        <Card title="Recent Messages">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Unread Messages</span>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{messages.unread_count}</div>
                                </div>
                                {messages.latest && (
                                    <div className="flex-1 ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {messages.latest.from}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                            {messages.latest.message}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {messages.latest.date}
                                        </div>
                                    </div>
                                )}
                                <Link
                                    href={route('teacher.messages.index')}
                                    className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                                >
                                    View Inbox
                                </Link>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 6: Quick Actions ===== */}
                    <div className="mt-6">
                        <Card title="Quick Actions">
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={route('teacher.lessons.create')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    ➕ Create Lesson
                                </Link>
                                <Link
                                    href={route('teacher.assignments.create')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    ➕ Create Assignment
                                </Link>
                                <Link
                                    href={route('teacher.quizzes.create')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    ➕ Create Quiz
                                </Link>
                                <Link
                                    href={route('teacher.games.create')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    ➕ Assign Game
                                </Link>
                                <Link
                                    href={route('teacher.reports.index')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    📊 View Reports
                                </Link>
                                <Link
                                    href={route('teacher.messages.index')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors"
                                >
                                    📨 Open Inbox
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
