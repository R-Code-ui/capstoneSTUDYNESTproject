import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {announcement.title}
                    </h2>
                    <div className="flex gap-2">
                        <Link href={route('teacher.announcements.edit', announcement.id)}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                        <Link href={route('teacher.announcements.index')}>
                            <PrimaryButton>Back to List</PrimaryButton>
                        </Link>
                    </div>
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
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {announcement.title}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Posted by {announcement.posted_by}
                                        </span>
                                        <span className="text-sm text-gray-400 dark:text-gray-500">•</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {announcement.created_at}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={announcement.status} />
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{announcement.category}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Target Audience</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {announcement.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Publish Date</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{announcement.publish_date}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Views</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{announcement.view_count}</div>
                                </div>
                                {announcement.expiration_date && (
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Expiration Date</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{announcement.expiration_date}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Pinned</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{announcement.is_pinned ? 'Yes' : 'No'}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="prose prose-blue dark:prose-invert max-w-none">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
