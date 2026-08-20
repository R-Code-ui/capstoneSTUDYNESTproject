import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import {
    MapPinIcon,
    StarIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    UserIcon,
    CalendarIcon,
    ArrowLeftIcon,
    MegaphoneIcon,
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

    const getPriorityIcon = (priority) => {
        const icons = {
            normal: <MapPinIcon className="w-3.5 h-3.5" />,
            important: <StarIcon className="w-3.5 h-3.5" />,
            urgent: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
        };
        return icons[priority] || icons.normal;
    };

    const getPriorityLabel = (priority) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const getRoleBadge = (role) => {
        return role === 'principal'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800';
    };

    const getRoleLabel = (role) => {
        return role === 'principal' ? 'Principal' : 'Teacher';
    };

    const getRoleIcon = (role) => {
        return role === 'principal'
            ? <BuildingOfficeIcon className="w-3.5 h-3.5" />
            : <UserIcon className="w-3.5 h-3.5" />;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <h2 className="min-w-0 max-w-full truncate text-xl font-semibold leading-tight text-gray-800" title={announcement.title}>
                        {announcement.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.announcements.index'))}>
                        <ArrowLeftIcon className="w-4 h-4 mr-1" />
                        Back to Announcements
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={announcement.title} />

            <div className="student-announcement-show-page py-12">
                <style>{`
                    .studynest-layout.theme-dark .student-announcement-show-page > div > .bg-white { background-image: linear-gradient(135deg, rgb(255 251 235), rgb(254 243 199)) !important; background-color: rgb(255 251 235) !important; border-color: rgb(245 158 11) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-700 { color: rgb(30 41 59) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-500 { color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-blue-100"] { background-color: rgb(219 234 254) !important; color: rgb(30 64 175) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-purple-100"] { background-color: rgb(243 232 255) !important; color: rgb(107 33 168) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-yellow-100"] { background-color: rgb(254 249 195) !important; color: rgb(146 64 14) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-red-100"] { background-color: rgb(254 226 226) !important; color: rgb(185 28 28) !important; }
                    .student-announcement-show-page .break-words { overflow-wrap: anywhere; word-break: break-word; }
                    @media (max-width: 640px) { .student-announcement-show-page .p-6 { padding: 1rem; } }
                `}</style>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* ===== Announcement Details ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                                            {getPriorityIcon(announcement.priority)}
                                            {getPriorityLabel(announcement.priority)}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(announcement.role)}`}>
                                            {getRoleIcon(announcement.role)}
                                            {getRoleLabel(announcement.role)}
                                        </span>
                                        {announcement.is_pinned && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <MapPinIcon className="w-3.5 h-3.5" />
                                                Pinned
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {announcement.category}
                                        </span>
                                    </div>

                                    <h3 className="mt-3 max-w-full truncate text-2xl font-bold text-gray-800" title={announcement.title}>
                                        {announcement.title}
                                    </h3>

                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                        <span>Posted by {announcement.posted_by}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            {announcement.created_at}
                                        </span>
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
                            <div className="pt-6 border-t border-gray-200">
                                <div className="prose prose-blue max-w-none">
                                    <div className="text-gray-700 whitespace-pre-wrap break-words line-clamp-6" title={announcement.content}>
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
