import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function AnnouncementShow({ announcement }) {
    const handleBackToList = () => {
        router.visit(route('principal.announcements.index'), {
            onError: () => toast.error('Unable to return to the announcements list. Please try again.'),
        });
    };

    const handleEdit = () => {
        router.visit(route('principal.announcements.edit', announcement.id), {
            onError: () => toast.error('Unable to open this announcement for editing. Please try again.'),
        });
    };

    const getAudienceLabel = (audience) => {
        return audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Announcement Details
                    </h2>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <SecondaryButton className="w-full justify-center sm:w-auto" onClick={handleBackToList}>
                            Back to List
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Announcement: ${announcement.title}`} />

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="break-words text-2xl font-bold text-gray-800 dark:text-white">
                                            {announcement.title}
                                        </h3>
                                        {announcement.is_pinned && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <MapPinIcon className="w-3 h-3" />
                                                Pinned
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span>Category: {announcement.category}</span>
                                        <span>•</span>
                                        <span>Audience: {getAudienceLabel(announcement.audience)}</span>
                                        <span>•</span>
                                        <span>Posted by {announcement.posted_by}</span>
                                        <span>•</span>
                                        <span>{announcement.created_at}</span>
                                    </div>
                                </div>
                                <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
                                    <PriorityBadge priority={announcement.priority} size="md" />
                                    <StatusBadge status={announcement.status} size="md" />
                                    <div className="text-sm text-gray-500">
                                        Views: {announcement.view_count}
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-slate-700 dark:bg-slate-800/70">
                                <div>
                                    <div className="text-xs text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{announcement.publish_date}</div>
                                </div>
                                {announcement.expiration_date && (
                                    <div>
                                        <div className="text-xs text-gray-500">Expiration Date</div>
                                        <div className="font-medium text-gray-800">{announcement.expiration_date}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs text-gray-500">Priority</div>
                                    <div className="font-medium text-gray-800">
                                        {announcement.priority?.charAt(0).toUpperCase() + announcement.priority?.slice(1)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Pinned</div>
                                    <div className="font-medium text-gray-800">
                                        {announcement.is_pinned ? 'Yes' : 'No'}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="border-t border-gray-200 pt-4 dark:border-slate-700">
                                <h4 className="mb-3 font-semibold text-gray-800 dark:text-white">Content</h4>
                                <div className="whitespace-pre-wrap break-words text-gray-700 dark:text-slate-200">
                                    {announcement.content}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2 dark:border-slate-700 sm:flex sm:justify-end">
                                <SecondaryButton className="w-full justify-center sm:w-auto" onClick={handleEdit}>
                                    Edit
                                </SecondaryButton>
                                <PrimaryButton className="w-full justify-center sm:w-auto" onClick={handleBackToList}>
                                    Back to List
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
