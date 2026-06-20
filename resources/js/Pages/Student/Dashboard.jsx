import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function StudentDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Student Dashboard</h2>}
        >
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome, {auth.user.name}!
                            </h3>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                You are logged in as Student.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    📚 Grade: {auth.user.grade_level || 'Not assigned'}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                    🆔 LRN: {auth.user.lrn || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Completed</div>
                                <div className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Assignments</div>
                                <div className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">0</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Quiz Average</div>
                                <div className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">0%</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Games</div>
                                <div className="mt-1 text-3xl font-bold text-orange-600 dark:text-orange-400">0</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - Mobile Friendly Large Buttons */}
                    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                My Activities
                            </h4>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-blue-50 p-4 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                                >
                                    <span className="text-3xl">📚</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Lessons</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-green-50 p-4 transition hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                                >
                                    <span className="text-3xl">📝</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Assignments</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-purple-50 p-4 transition hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
                                >
                                    <span className="text-3xl">📊</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Quizzes</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-orange-50 p-4 transition hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
                                >
                                    <span className="text-3xl">🎮</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Games</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-red-50 p-4 transition hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                                >
                                    <span className="text-3xl">📢</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Announcements</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="flex flex-col items-center rounded-xl bg-indigo-50 p-4 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
                                >
                                    <span className="text-3xl">📈</span>
                                    <span className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No recent activities yet. Start exploring your lessons and assignments!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
