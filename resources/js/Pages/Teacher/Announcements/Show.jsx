import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'sonner';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    UserIcon,
    CalendarIcon,
    TagIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function AnnouncementsShow({ announcement }) {
    const handleNavigationError = () => toast.error('Unable to load that page. Please try again.');

    const getPriorityBadge = (priority) => {
        const classes = {
            normal: 'bg-blue-100 text-blue-800',
            important: 'bg-yellow-100 text-yellow-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return classes[priority] || classes.normal;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                        <Link
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                            href={route('teacher.announcements.index')}
                            onError={handleNavigationError}
                            aria-label="Back to Announcements"
                            title="Back to Announcements"
                        >
                            <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Link>
                        <span className="announcement-show-title min-w-0 flex-1 text-xl font-semibold leading-tight text-gray-800" title={announcement.title}>
                            {announcement.title}
                        </span>
                    </div>
                    <div className="flex w-full flex-col items-end gap-2 xl:ml-auto xl:w-auto xl:flex-row xl:shrink-0">
                        {announcement.can_modify && (
                            <Link className="w-auto" href={route('teacher.announcements.edit', announcement.id)} onError={handleNavigationError}>
                                <PrimaryButton className="min-h-11 w-auto justify-center">
                                    <PencilSquareIcon className="mr-1 h-4 w-4" />
                                    Edit Announcement
                                </PrimaryButton>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={announcement.title} />

            <style>{`
                .announcement-show-title,
                .announcement-show-content {
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .announcement-show-title {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .announcement-show-content {
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 8;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>

            <div className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Announcement Details ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="space-y-6 p-4 sm:p-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div>
                                    <h3 className="announcement-show-title max-w-full text-2xl font-bold text-gray-800" title={announcement.title}>
                                        {announcement.title}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <UserIcon className="w-4 h-4" />
                                            Posted by {announcement.posted_by}
                                        </span>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            {announcement.created_at}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={announcement.status} />
                                    {announcement.is_expired && <StatusBadge status="expired" />}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</div>
                                    <div className="font-medium text-gray-800">{announcement.category}</div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Target Audience</div>
                                    <div className="font-medium text-gray-800">
                                        {announcement.target_audience === 'all_grades'
                                            ? 'All Students'
                                            : announcement.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{announcement.publish_date}</div>
                                </div>
                                {announcement.expiration_date && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expiration Date</div>
                                        <div className="font-medium text-gray-800">{announcement.expiration_date}</div>
                                    </div>
                                )}
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pinned</div>
                                    <div className="font-medium text-gray-800">{announcement.is_pinned ? 'Yes' : 'No'}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-4 border-t border-gray-200">
                                <div className="prose prose-blue max-w-none">
                                    <div className="announcement-show-content text-gray-700 whitespace-pre-wrap" title={announcement.content}>
                                        {announcement.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
