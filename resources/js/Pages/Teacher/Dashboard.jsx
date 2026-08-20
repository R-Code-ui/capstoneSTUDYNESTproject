import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

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
    MegaphoneIcon,
    BuildingOfficeIcon,
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
        recent: [],   // ✅ new array for recent messages list
    },
    assigned_grades = [],
    recent_announcements = [],
}) {
    // Activity type icons mapping
    const getActivityIcon = (type) => {
        switch (type) {
            case 'lesson':
                return <BookOpenIcon className="w-5 h-5 text-blue-500" />;
            case 'assignment':
                return <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-500" />;
            case 'quiz':
                return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
            case 'game':
                return <PuzzlePieceIcon className="w-5 h-5 text-amber-500" />;
            default:
                return <BookOpenIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const messagesRoute = safeRoute('teacher.messages.index');
    const participationChartData = [
        { name: 'Lessons', value: Number(participation.lesson_completion_rate) || 0, color: '#3b82f6' },
        { name: 'Assignments', value: Number(participation.assignment_completion_rate) || 0, color: '#10b981' },
        { name: 'Quizzes', value: Number(participation.average_quiz_score) || 0, color: '#8b5cf6' },
        { name: 'Games', value: Number(participation.game_participation_rate) || 0, color: '#f59e0b' },
    ];

    return (
        <AuthenticatedLayout
            header={<span className="text-xl font-semibold leading-tight text-gray-800">Teacher Dashboard</span>}
        >
            <Head title="Teacher Dashboard" />

            <div className="py-4">
                <style>{`
                    .teacher-dashboard-chart { --teacher-chart-text: #475569; --teacher-chart-grid: #e2e8f0; --teacher-tooltip-bg: #ffffff; }
                    .studynest-layout.theme-dark .teacher-dashboard-chart { --teacher-chart-text: #94a3b8; --teacher-chart-grid: #334155; --teacher-tooltip-bg: #1e293b; }
                    .studynest-layout.theme-dark .teacher-lesson-card { background-color: rgb(30 41 59) !important; border-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .teacher-lesson-card .teacher-progress-track { background-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .teacher-chart-tooltip { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .teacher-announcement-item { background-color: rgb(30 41 59) !important; border-color: rgb(59 130 246) !important; }
                    .studynest-layout.theme-dark .teacher-announcement-item:hover { background-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .teacher-announcement-title { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .teacher-announcement-content { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .teacher-announcement-date { color: rgb(148 163 184) !important; }
                    .teacher-dashboard-clamp {
                        min-width: 0;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }
                `}</style>
                <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Assigned Grades Badge ===== */}
                    {assigned_grades && assigned_grades.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-500 mr-1">Assigned Grades:</span>
                            {assigned_grades.map((grade) => (
                                <span
                                    key={grade}
                                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full"
                                >
                                    {grade}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ===== Section 1: Classroom Overview ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Students */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <UsersIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_students}</div>
                                    <div className="text-xs font-medium text-gray-500">Students</div>
                                </div>
                            </div>
                        </div>

                        {/* Lessons */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <BookOpenIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_lessons}</div>
                                    <div className="text-xs font-medium text-gray-500">Lessons</div>
                                </div>
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_assignments}</div>
                                    <div className="text-xs font-medium text-gray-500">Assignments</div>
                                </div>
                            </div>
                        </div>

                        {/* Quizzes */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_quizzes}</div>
                                    <div className="text-xs font-medium text-gray-500">Quizzes</div>
                                </div>
                            </div>
                        </div>

                        {/* Games */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 rounded-lg">
                                    <PuzzlePieceIcon className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_games}</div>
                                    <div className="text-xs font-medium text-gray-500">Games</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 2: Student Participation Summary ===== */}
                    <div className="mt-6">
                        <Card title="Participation Summary">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="teacher-lesson-card text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {participation.lesson_completion_rate}%
                                    </div>
                                    <div className="text-sm text-gray-600">Lesson Completion</div>
                                    <div className="teacher-progress-track w-full mt-2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.lesson_completion_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {participation.assignment_completion_rate}%
                                    </div>
                                    <div className="text-sm text-gray-600">Assignment Completion</div>
                                    <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.assignment_completion_rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {participation.average_quiz_score}%
                                    </div>
                                    <div className="text-sm text-gray-600">Average Quiz Score</div>
                                    <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.average_quiz_score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                                    <div className="text-2xl font-bold text-amber-600">
                                        {participation.game_participation_rate}%
                                    </div>
                                    <div className="text-sm text-gray-600">Game Participation</div>
                                    <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${participation.game_participation_rate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 2b: Participation Chart ===== */}
                    <div className="mt-6">
                        <Card title="Participation Overview">
                            <div className="teacher-dashboard-chart h-64 w-full sm:h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={participationChartData}
                                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                                    >
                                        <CartesianGrid stroke="var(--teacher-chart-grid)" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: 'var(--teacher-chart-text)', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            tick={{ fill: 'var(--teacher-chart-text)', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, 'Completion']}
                                            contentStyle={{
                                                backgroundColor: 'var(--teacher-tooltip-bg, #ffffff)',
                                                border: '1px solid var(--teacher-chart-grid)',
                                                borderRadius: '10px',
                                            }}
                                            labelStyle={{ color: 'var(--teacher-chart-text)', marginBottom: '4px' }}
                                            itemStyle={{ color: 'var(--teacher-chart-text)' }}
                                            cursor={false}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {participationChartData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 3: Students Requiring Attention ===== */}
                    <div className="mt-6">
                        <Card title="Students Requiring Attention">
                            {students_requiring_attention.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    ✅ All students are on track. No concerns detected.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed text-left text-xs text-gray-600 sm:text-sm">
                                        <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="w-1/4 px-2 py-3 sm:px-4">Student</th>
                                                <th className="w-1/2 px-2 py-3 sm:px-4">Concern</th>
                                                <th className="w-1/4 px-2 py-3 sm:px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {students_requiring_attention.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="break-words px-2 py-3 font-medium text-gray-800 sm:px-4">
                                                        {student.name}
                                                    </td>
                                                    <td className="break-words px-2 py-3 sm:px-4">
                                                        <span className="inline-flex items-center gap-1 text-amber-600">
                                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                                            {student.concern}
                                                        </span>
                                                    </td>
                                                    <td className="break-words px-2 py-3 sm:px-4">
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
                    <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2">
                        <Card title="Upcoming Deadlines" className="min-w-0 overflow-hidden">
                            {upcoming_deadlines.length === 0 ? (
                                <p className="text-sm text-gray-500">No upcoming deadlines.</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcoming_deadlines.map((deadline) => (
                                        <div
                                            key={deadline.id}
                                            className="flex min-w-0 max-w-full items-center justify-between overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-3"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <ClockIcon className="w-5 h-5 text-amber-500" />
                                                <div className="min-w-0">
                                                    <div className="teacher-dashboard-clamp font-medium text-gray-800" title={deadline.title}>
                                                        {deadline.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Due: {deadline.due_date}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                                {deadline.days_left === 0
                                                    ? 'Today'
                                                    : `${deadline.days_left} day${deadline.days_left > 1 ? 's' : ''} left`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card title="Recent Activity" className="min-w-0 overflow-hidden">
                            {recent_activity.length === 0 ? (
                                <p className="text-sm text-gray-500">No recent activity.</p>
                            ) : (
                                <div className="space-y-3">
                                    {recent_activity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex min-w-0 max-w-full items-center justify-between overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-3"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                {getActivityIcon(activity.type)}
                                                <div className="min-w-0">
                                                    <div className="teacher-dashboard-clamp font-medium text-gray-800" title={activity.title}>
                                                        {activity.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">
                                                        {activity.type}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-xs text-gray-500">
                                                {activity.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 5: Recent Announcements ===== */}
                    <div className="mt-6">
                        <Card
                            className="min-w-0 overflow-hidden"
                            title={
                                <div className="flex items-center gap-2">
                                    <MegaphoneIcon className="w-5 h-5 text-blue-500" />
                                    Recent Announcements
                                </div>
                            }
                        >
                            {recent_announcements && recent_announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_announcements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="teacher-announcement-item min-w-0 max-w-full overflow-hidden rounded-lg border-l-4 border-blue-500 bg-blue-50/50 p-3 transition-colors hover:bg-blue-50"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="teacher-announcement-title flex min-w-0 items-center gap-2 font-medium text-gray-800">
                                                        <BuildingOfficeIcon className="w-4 h-4 text-blue-500" />
                                                        <span className="min-w-0 flex-1 truncate" title={announcement.title}>{announcement.title}</span>
                                                    </div>
                                                    <div className="teacher-announcement-content teacher-dashboard-clamp text-sm text-gray-600">
                                                        {announcement.content}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        {announcement.posted_by}
                                                    </span>
                                                    <span className="teacher-announcement-date text-xs text-gray-400">
                                                        {announcement.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center pt-2">
                                        <Link
                                            href={route('teacher.announcements.index')}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View All Announcements →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No recent announcements.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* ===== Section 6: Recent Messages ===== */}
                    <div className="mt-6">
                        <Card title="Recent Messages">
                            <div className="space-y-3">
                                {/* Unread count */}
                                <div className="flex items-center gap-2 mb-3">
                                    <EnvelopeIcon className="w-5 h-5 text-[#4ECDC4]" />
                                    <span className="text-sm text-gray-600">
                                        Unread Messages:
                                    </span>
                                    <span className="font-bold text-lg text-[#4ECDC4]">
                                        {messages.unread_count}
                                    </span>
                                </div>

                                {/* List of recent messages */}
                                {messages.recent && messages.recent.length > 0 ? (
                                    messages.recent.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 bg-gray-50 rounded-lg border ${
                                                msg.unread ? 'border-[#4ECDC4]' : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">
                                                        {msg.from}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {msg.subject}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        "{msg.message}"
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">{msg.date}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No messages yet.</p>
                                )}

                                <div className="text-center pt-2">
                                    <Link
                                        href={messagesRoute}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <InboxIcon className="w-4 h-4" />
                                        View Inbox
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 7: Quick Actions ===== */}
                    <div className="mt-6">
                        <Card title="Quick Actions">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {/* Create Lesson */}
                                <Link
                                    href={safeRoute('teacher.lessons.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-blue-700"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-blue-600" />
                                    <span className="text-xs font-medium text-center mt-2">
                                        Create Lesson
                                    </span>
                                </Link>

                                {/* Create Assignment */}
                                <Link
                                    href={safeRoute('teacher.assignments.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-emerald-700"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-emerald-600" />
                                    <span className="text-xs font-medium text-center mt-2">
                                        Create Assignment
                                    </span>
                                </Link>

                                {/* Create Quiz */}
                                <Link
                                    href={safeRoute('teacher.quizzes.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-purple-700"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-purple-600" />
                                    <span className="text-xs font-medium text-center mt-2">
                                        Create Quiz
                                    </span>
                                </Link>

                                {/* Assign Game */}
                                <Link
                                    href={safeRoute('teacher.games.create')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-amber-700"
                                >
                                    <PlusCircleIcon className="w-8 h-8 text-gray-500 group-hover:text-amber-600" />
                                    <span className="text-xs font-medium text-center mt-2">
                                        Assign Game
                                    </span>
                                </Link>

                                {/* View Reports */}
                                <Link
                                    href={safeRoute('teacher.reports.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-rose-700"
                                >
                                    <ChartBarIcon className="w-8 h-8 text-gray-500 group-hover:text-rose-600" />
                                    <span className="text-xs font-medium text-center mt-2">
                                        View Reports
                                    </span>
                                </Link>

                                {/* Open Inbox */}
                                <Link
                                    href={messagesRoute}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 rounded-xl transition-all duration-200 text-gray-700 hover:text-teal-700"
                                >
                                    <InboxIcon className="w-8 h-8 text-gray-500 group-hover:text-teal-600" />
                                    <span className="text-xs font-medium text-center mt-2">
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
