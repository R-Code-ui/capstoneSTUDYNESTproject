import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatsCard from '@/Components/StatsCard';
import StatusBadge from '@/Components/StatusBadge';

// Heroicons
import {
    UsersIcon,
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PuzzlePieceIcon,
    EnvelopeIcon,
    PlusCircleIcon,
    ChartBarIcon,
    InboxIcon,
    ClockIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ============================================================
// HELPER: Safely get route with fallback
// ============================================================
function safeRoute(name, params = {}) {
    try {
        return route(name, params);
    } catch (e) {
        return '#';
    }
}

export default function TeacherDashboard({
    stats = {
        total_students: 0,
        total_lessons: 0,
        total_assignments: 0,
        total_quizzes: 0,
        total_games: 0,
    },
    participation = {
        lesson_completion_rate: 0,
        assignment_completion_rate: 0,
        average_quiz_score: 0,
        game_participation_rate: 0,
    },
    students_requiring_attention = [],
    upcoming_deadlines = [],
    recent_activity = [],
    messages = {
        unread_count: 0,
        latest: null,
    },
    assigned_grades = [],
}) {
    // Activity type icons mapping
    const getActivityIcon = (type) => {
        switch (type) {
            case 'lesson':
                return <BookOpenIcon className="w-5 h-5 text-blue-500" />;
            case 'assignment':
                return <ClipboardDocumentListIcon className="w-5 h-5 text-green-500" />;
            case 'quiz':
                return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
            case 'game':
                return <PuzzlePieceIcon className="w-5 h-5 text-orange-500" />;
            default:
                return <BookOpenIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    // Safe route helper for messages link
    const messagesRoute = safeRoute('teacher.messages.index');

    return (
        <AuthenticatedLayout
            // ✅ FIXED: Changed h2 to span to avoid invalid DOM nesting
            header={<span className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Teacher Dashboard</span>}
        >
            <Head title="Teacher Dashboard" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl">
                    {/* ===== Assigned Grades Badge ===== */}
                    {assigned_grades && assigned_grades.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-400 mr-2">Assigned Grades:</span>
                            {assigned_grades.map((grade) => (
                                <span
                                    key={grade}
                                    className="px-3 py-1 text-xs font-medium text-white bg-[#5EC4D2]/20 border border-[#5EC4D2]/30 rounded-full"
                                >
                                    {grade}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ===== Section 1: Classroom Overview ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatsCard
                            title="Students"
                            value={stats.total_students}
                            icon={<UsersIcon className="w-6 h-6" />}
                            color="blue"
                        />
                        <StatsCard
                            title="Lessons"
                            value={stats.total_lessons}
                            icon={<BookOpenIcon className="w-6 h-6" />}
                            color="green"
                        />
                        <StatsCard
                            title="Assignments"
                            value={stats.total_assignments}
                            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                            color="purple"
                        />
                        <StatsCard
                            title="Quizzes"
                            value={stats.total_quizzes}
                            icon={<DocumentTextIcon className="w-6 h-6" />}
                            color="orange"
                        />
                        <StatsCard
                            title="Games"
                            value={stats.total_games}
                            icon={<PuzzlePieceIcon className="w-6 h-6" />}
                            color="pink"
                        />
                    </div>

                    {/* ===== Section 2: Student Participation Summary ===== */}
                    <div className="mt-6">
                        <Card title="Participation Summary">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {participation.lesson_completion_rate}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Lesson Completion</div>
                                    <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.lesson_completion_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {participation.assignment_completion_rate}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Assignment Completion</div>
                                    <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.assignment_completion_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {participation.average_quiz_score}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Average Quiz Score</div>
                                    <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.average_quiz_score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                        {participation.game_participation_rate}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Game Participation</div>
                                    <div className="w-full mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.game_participation_rate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 3: Students Requiring Attention ===== */}
                    <div className="mt-6">
                        <Card title="Students Requiring Attention">
                            {students_requiring_attention.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ✅ All students are on track. No concerns detected.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3">Student</th>
                                                <th className="px-4 py-3">Concern</th>
                                                <th className="px-4 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students_requiring_attention.map((student) => (
                                                <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                        {student.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            {student.concern}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status="warning" label="Needs Attention" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 4: Upcoming Deadlines & Recent Activity ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <Card title="Upcoming Deadlines">
                            {upcoming_deadlines.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines.</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming_deadlines.map((deadline) => (
                                        <div
                                            key={deadline.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ClockIcon className="w-5 h-5 text-orange-500" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {deadline.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Due: {deadline.due_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                                {deadline.days_left} day{deadline.days_left > 1 ? 's' : ''} left
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card title="Recent Activity">
                            {recent_activity.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_activity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getActivityIcon(activity.type)}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {activity.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {activity.type}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 5: Recent Messages ===== */}
                    <div className="mt-6">
                        <Card title="Recent Messages">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="w-5 h-5 text-[#5EC4D2]" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Unread Messages:
                                        </span>
                                        <span className="font-bold text-lg text-[#5EC4D2]">
                                            {messages.unread_count}
                                        </span>
                                    </div>

                                    {messages.latest && (
                                        <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {messages.latest.from}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                "{messages.latest.message}"
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {messages.latest.date}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={messagesRoute}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#5EC4D2] rounded-lg hover:bg-[#4DB8C6] transition-colors"
                                >
                                    <InboxIcon className="w-4 h-4" />
                                    View Inbox
                                </Link>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 6: Quick Actions ===== */}
                    <div className="mt-6">
                        <Card title="Quick Actions">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {/* Create Lesson */}
                                <Link
                                    href={safeRoute('teacher.lessons.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        Create Lesson
                                    </span>
                                </Link>

                                {/* Create Assignment */}
                                <Link
                                    href={safeRoute('teacher.assignments.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        Create Assignment
                                    </span>
                                </Link>

                                {/* Create Quiz */}
                                <Link
                                    href={safeRoute('teacher.quizzes.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        Create Quiz
                                    </span>
                                </Link>

                                {/* Assign Game */}
                                <Link
                                    href={safeRoute('teacher.games.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        Assign Game
                                    </span>
                                </Link>

                                {/* View Reports */}
                                <Link
                                    href={safeRoute('teacher.reports.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        View Reports
                                    </span>
                                </Link>

                                {/* Open Inbox */}
                                <Link
                                    href={messagesRoute}
                                    className="flex flex-col items-center justify-center p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <InboxIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
                                        Open Inbox
                                    </span>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
