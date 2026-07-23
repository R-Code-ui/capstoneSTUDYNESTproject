import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';

// Heroicons
import {
    UserGroupIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    MegaphoneIcon,
    UsersIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    CalendarIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function PrincipalDashboard({
    stats,
    teacher_activity,
    student_participation,
    most_active_teacher,
    inactive_teachers_count,
    recent_activities,
    recent_announcements,
    academic_summary
}) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-gray-800">Principal Dashboard</h2>}
        >
            <Head title="Principal Dashboard" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ===== Section 1: School Overview Cards ===== */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <UserGroupIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_teachers}</div>
                                    <div className="text-xs font-medium text-gray-500">Teachers</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_students}</div>
                                    <div className="text-xs font-medium text-gray-500">Students</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_lessons}</div>
                                    <div className="text-xs font-medium text-gray-500">Lessons</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-50 rounded-lg">
                                    <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_assignments}</div>
                                    <div className="text-xs font-medium text-gray-500">Assignments</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-rose-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_quizzes}</div>
                                    <div className="text-xs font-medium text-gray-500">Quizzes</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <MegaphoneIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800">{stats.total_announcements}</div>
                                    <div className="text-xs font-medium text-gray-500">Announcements</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 2: Teacher Activity Summary ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Teacher Activity Summary</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Most Active Teacher</span>
                                    <div className="text-base font-bold text-amber-900 mt-0.5">
                                        {most_active_teacher ? most_active_teacher.name : 'N/A'}
                                    </div>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Teachers Without Activity</span>
                                    <div className="text-base font-bold text-rose-600 mt-0.5">
                                        {inactive_teachers_count}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Teacher</th>
                                            <th className="px-4 py-3 text-center">Lessons</th>
                                            <th className="px-4 py-3 text-center">Assignments</th>
                                            <th className="px-4 py-3 text-center">Quizzes</th>
                                            <th className="px-4 py-3">Last Activity</th>
                                            <th className="px-4 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teacher_activity.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                    No teacher activity data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            teacher_activity.slice(0, 5).map((teacher, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{teacher.name}</td>
                                                    <td className="px-4 py-3 text-center">{teacher.lessons_count}</td>
                                                    <td className="px-4 py-3 text-center">{teacher.assignments_count}</td>
                                                    <td className="px-4 py-3 text-center">{teacher.quizzes_count}</td>
                                                    <td className="px-4 py-3 text-gray-500">{teacher.last_activity}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <StatusBadge status={teacher.is_active ? 'active' : 'inactive'} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 3: Student Participation & Summary ===== */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Student Participation */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700">Student Participation</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                {student_participation.map((grade) => (
                                    <div key={grade.grade_level} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700">{grade.grade_level}</span>
                                            <span className="text-gray-500">{grade.active_students} / {grade.total_students} ({grade.participation_rate}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${grade.participation_rate}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Academic Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700">Academic Summary</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Average Quiz Score</span>
                                        <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-md">{academic_summary.average_quiz_score}%</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Assignment Completion Rate</span>
                                        <span className="text-sm font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-md">{academic_summary.assignment_completion_rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Lesson Completion Rate</span>
                                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">{academic_summary.lesson_completion_rate}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Announcements */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-700">Recent Announcements</h3>
                                    <Link href={route('principal.announcements.index')} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                        View All <ArrowRightIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className="p-6 space-y-3">
                                    {recent_announcements.length === 0 ? (
                                        <p className="text-sm text-gray-500">No recent announcements.</p>
                                    ) : (
                                        recent_announcements.map((announcement, index) => (
                                            <div key={index} className="pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                                <div className="font-medium text-sm text-gray-800">{announcement.title}</div>
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>By {announcement.posted_by}</span>
                                                    <span>{announcement.date}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Section 4: Recent Activities ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Recent Teacher Activities</h3>
                        </div>
                        <div className="p-6 space-y-2">
                            {recent_activities.length === 0 ? (
                                <p className="text-sm text-gray-500">No recent activities.</p>
                            ) : (
                                recent_activities.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                                        <div className="text-gray-600">
                                            <span className="font-medium text-gray-800">{activity.teacher}</span>
                                            <span className="text-gray-500"> {activity.action}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0 ml-2">{activity.date}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ===== Section 5: Quick Navigation ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700">Quick Navigation</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                <Link
                                    href={route('principal.users.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-200 rounded-xl transition-all text-gray-700 hover:text-amber-700"
                                >
                                    <UserGroupIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-amber-600" />
                                    <span className="text-xs font-medium text-center">Manage Users</span>
                                </Link>

                                <Link
                                    href={route('principal.teachers.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-xl transition-all text-gray-700 hover:text-emerald-700"
                                >
                                    <UsersIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-emerald-600" />
                                    <span className="text-xs font-medium text-center">Teacher Monitoring</span>
                                </Link>

                                <Link
                                    href={route('principal.announcements.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl transition-all text-gray-700 hover:text-purple-700"
                                >
                                    <MegaphoneIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-purple-600" />
                                    <span className="text-xs font-medium text-center">Announcements</span>
                                </Link>

                                <Link
                                    href={route('principal.reports.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-sky-50 border border-gray-200 hover:border-sky-200 rounded-xl transition-all text-gray-700 hover:text-sky-700"
                                >
                                    <DocumentDuplicateIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-sky-600" />
                                    <span className="text-xs font-medium text-center">View Reports</span>
                                </Link>

                                <Link
                                    href={route('principal.logs.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-all text-gray-700 hover:text-rose-700"
                                >
                                    <EyeIcon className="w-6 h-6 mb-2 text-gray-500 group-hover:text-rose-600" />
                                    <span className="text-xs font-medium text-center">Activity Logs</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
