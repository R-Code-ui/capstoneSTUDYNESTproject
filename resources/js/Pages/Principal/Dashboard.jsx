import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';

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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Principal Dashboard</h2>}
        >
            <Head title="Principal Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* ===== Section 1: School Overview Cards ===== */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_teachers}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Teachers</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_students}</div>
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
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.total_announcements}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Announcements</div>
                        </Card>
                    </div>

                    {/* ===== Section 2: Teacher Activity Summary ===== */}
                    <div className="mt-6">
                        <Card title="Teacher Activity Summary">
                            <div className="mb-4 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Most Active Teacher</span>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {most_active_teacher ? most_active_teacher.name : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Teachers Without Activity</span>
                                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">{inactive_teachers_count}</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Teacher</th>
                                            <th className="px-6 py-3">Lessons</th>
                                            <th className="px-6 py-3">Assignments</th>
                                            <th className="px-6 py-3">Quizzes</th>
                                            <th className="px-6 py-3">Last Activity</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teacher_activity.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No teacher activity data available.</td>
                                            </tr>
                                        ) : (
                                            teacher_activity.slice(0, 5).map((teacher, index) => (
                                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{teacher.name}</td>
                                                    <td className="px-6 py-4">{teacher.lessons_count}</td>
                                                    <td className="px-6 py-4">{teacher.assignments_count}</td>
                                                    <td className="px-6 py-4">{teacher.quizzes_count}</td>
                                                    <td className="px-6 py-4">{teacher.last_activity}</td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={teacher.is_active ? 'active' : 'inactive'} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 3: Student Participation ===== */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <Card title="Student Participation">
                            <div className="space-y-4">
                                {student_participation.map((grade) => (
                                    <div key={grade.grade_level}>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{grade.grade_level}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{grade.active_students} / {grade.total_students}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${grade.participation_rate}%` }}
                                            />
                                        </div>
                                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">{grade.participation_rate}%</div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <div className="space-y-6">
                            {/* Academic Summary */}
                            <Card title="Academic Summary">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Quiz Score</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{academic_summary.average_quiz_score}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Assignment Completion Rate</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{academic_summary.assignment_completion_rate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Lesson Completion Rate</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{academic_summary.lesson_completion_rate}%</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Recent Announcements */}
                            <Card title="Recent Announcements">
                                <div className="space-y-3">
                                    {recent_announcements.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent announcements.</p>
                                    ) : (
                                        recent_announcements.map((announcement, index) => (
                                            <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                                                <div className="font-medium text-gray-900 dark:text-white">{announcement.title}</div>
                                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                    <span>By {announcement.posted_by}</span>
                                                    <span>{announcement.date}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* ===== Section 4: Recent Activities ===== */}
                    <div className="mt-6">
                        <Card title="Recent Teacher Activities">
                            <div className="space-y-2">
                                {recent_activities.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activities.</p>
                                ) : (
                                    recent_activities.map((activity, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white">{activity.teacher}</span>
                                                <span className="text-gray-600 dark:text-gray-300"> {activity.action}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* ===== Section 5: Quick Navigation Buttons ===== */}
                    <div className="mt-6">
                        <Card title="Quick Navigation">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {/* Manage Teachers */}
                                <Link
                                    href={route('principal.users.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <svg className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Manage Teachers</span>
                                </Link>

                                {/* Teacher Monitoring */}
                                <Link
                                    href={route('principal.teachers.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <svg className="w-8 h-8 mb-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Teacher Monitoring</span>
                                </Link>

                                {/* Announcements */}
                                <Link
                                    href={route('principal.announcements.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <svg className="w-8 h-8 mb-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-1.76 1.76v0a1.76 1.76 0 01-1.76-1.76V5.882a1.76 1.76 0 011.76-1.76v0a1.76 1.76 0 011.76 1.76z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5.882V19.24a1.76 1.76 0 01-1.76 1.76v0a1.76 1.76 0 01-1.76-1.76V5.882a1.76 1.76 0 011.76-1.76v0a1.76 1.76 0 011.76 1.76z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Announcements</span>
                                </Link>

                                {/* Reports */}
                                <Link
                                    href={route('principal.reports.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <svg className="w-8 h-8 mb-2 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">View Reports</span>
                                </Link>

                                {/* Activity Logs */}
                                <Link
                                    href={route('principal.logs.index')}
                                    className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <svg className="w-8 h-8 mb-2 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Activity Logs</span>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
