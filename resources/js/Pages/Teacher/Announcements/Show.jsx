import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

// Heroicons
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    UserIcon,
    CalendarIcon,
    EyeIcon,
    TagIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function AnnouncementsShow({ announcement }) {
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
                // 🔧 FIX: Added w-full to push buttons to the right
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <span className="text-xl font-semibold leading-tight text-gray-800">
                        {announcement.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {announcement.can_modify && (
                            <Link href={route('teacher.announcements.edit', announcement.id)}>
                                <SecondaryButton>
                                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                                    Edit
                                </SecondaryButton>
                            </Link>
                        )}
                        <Link href={route('teacher.announcements.index')}>
                            <PrimaryButton>
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to List
                            </PrimaryButton>
                        </Link>
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

            <div className="py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Announcement Details ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
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
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Category</div>
                                    <div className="font-medium text-gray-800">{announcement.category}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Target Audience</div>
                                    <div className="font-medium text-gray-800">
                                        {announcement.target_audience === 'all_grades'
                                            ? 'All Students'
                                            : announcement.target_audience?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Publish Date</div>
                                    <div className="font-medium text-gray-800">{announcement.publish_date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                        <EyeIcon className="w-4 h-4" />
                                        Views
                                    </div>
                                    <div className="font-medium text-gray-800">{announcement.view_count}</div>
                                </div>
                                {announcement.expiration_date && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expiration Date</div>
                                        <div className="font-medium text-gray-800">{announcement.expiration_date}</div>
                                    </div>
                                )}
                                <div>
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
