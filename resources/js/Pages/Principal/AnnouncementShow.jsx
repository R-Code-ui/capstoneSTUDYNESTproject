import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function AnnouncementShow({ announcement }) {
    const getAudienceLabel = (audience) => {
        return audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Announcement Details
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={() => router.visit(route('principal.announcements.index'))}>
                            Back to List
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Announcement: ${announcement.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Card>
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {announcement.title}
                                        </h3>
                                        {announcement.is_pinned && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                📌 Pinned
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Category: {announcement.category}</span>
                                        <span>•</span>
                                        <span>Audience: {getAudienceLabel(announcement.audience)}</span>
                                        <span>•</span>
                                        <span>Posted by {announcement.posted_by}</span>
                                        <span>•</span>
                                        <span>{announcement.created_at}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <PriorityBadge priority={announcement.priority} size="md" />
                                    <StatusBadge status={announcement.status} size="md" />
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Views: {announcement.view_count}
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Publish Date</div>
                                    <div className="font-medium text-gray-900 dark:text-white">{announcement.publish_date}</div>
                                </div>
                                {announcement.expiration_date && (
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Expiration Date</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{announcement.expiration_date}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Priority</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {announcement.priority?.charAt(0).toUpperCase() + announcement.priority?.slice(1)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Pinned</div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {announcement.is_pinned ? 'Yes' : 'No'}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Content</h4>
                                <div className="prose prose-blue dark:prose-invert max-w-none">
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton onClick={() => router.visit(route('principal.announcements.edit', announcement.id))}>
                                    Edit
                                </SecondaryButton>
                                <PrimaryButton onClick={() => router.visit(route('principal.announcements.index'))}>
                                    Back to List
                                </PrimaryButton>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
