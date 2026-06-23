import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import SecondaryButton from '@/Components/SecondaryButton';

export default function AnnouncementsShow({ announcement }) {
    const getPriorityBadge = (priority) => {
        const classes = {
            normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            important: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return classes[priority] || classes.normal;
    };

    const getPriorityIcon = (priority) => {
        const icons = {
            normal: '📌',
            important: '⭐',
            urgent: '🚨',
        };
        return icons[priority] || '📌';
    };

    const getRoleBadge = (role) => {
        return role === 'principal'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    };

    const getRoleLabel = (role) => {
        return role === 'principal' ? 'Principal' : 'Teacher';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {announcement.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.announcements.index'))}>
                        Back to Announcements
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={announcement.title} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* ===== Announcement Details ===== */}
                    <Card>
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                            {getPriorityIcon(announcement.priority)} {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                            {announcement.role === 'principal' ? '🏫' : '👨‍🏫'} {getRoleLabel(announcement.role)}
                                        </span>
                                        {announcement.is_pinned && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                📌 Pinned
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {announcement.category}
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                                        {announcement.title}
                                    </h3>

                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Posted by {announcement.posted_by}</span>
                                        <span>•</span>
                                        <span>{announcement.created_at}</span>
                                        {announcement.expiration_date && (
                                            <>
                                                <span>•</span>
                                                <span>Expires: {announcement.expiration_date}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="prose prose-blue dark:prose-invert max-w-none">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <SecondaryButton onClick={() => router.visit(route('student.announcements.index'))}>
                                    ← Back to Announcements
                                </SecondaryButton>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
