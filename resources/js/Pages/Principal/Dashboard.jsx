import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PrincipalDashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Principal Dashboard</h2>}
        >
            <Head title="Principal Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome, {auth.user.name}!
                            </h3>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                You are logged in as Principal.
                            </p>
                            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                Principal ID: {auth.user.principal_id}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Teachers</div>
                                <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">0</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</div>
                                <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">0</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons</div>
                                <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">0</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Announcements</div>
                                <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">0</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <div className="p-6">
                            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="#"
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Manage Teachers
                                </Link>
                                <Link
                                    href="#"
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                                >
                                    Manage Students
                                </Link>
                                <Link
                                    href="#"
                                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                                >
                                    View Reports
                                </Link>
                                <Link
                                    href="#"
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
                                >
                                    Post Announcement
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
