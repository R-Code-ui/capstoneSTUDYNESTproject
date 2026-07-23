import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { MapPinIcon } from '@heroicons/react/24/outline';

export default function AnnouncementShow({ announcement }) {
    const getAudienceLabel = (audience) => {
        return audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold text-gray-800">
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

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-2xl font-bold text-gray-800">
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
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <PriorityBadge priority={announcement.priority} size="md" />
                                    <StatusBadge status={announcement.status} size="md" />
                                    <div className="text-sm text-gray-500">
                                        Views: {announcement.view_count}
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Content</h4>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                    {announcement.content}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <SecondaryButton onClick={() => router.visit(route('principal.announcements.edit', announcement.id))}>
                                    Edit
                                </SecondaryButton>
                                <PrimaryButton onClick={() => router.visit(route('principal.announcements.index'))}>
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
