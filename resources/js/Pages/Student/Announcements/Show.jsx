import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';
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

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
};

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
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                    <Link
                        href={route('student.announcements.index')}
                        onError={() => toast.error('Unable to return to announcements. Please try again.')}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                        aria-label="Back to Announcements"
                        title="Back to Announcements"
                    >
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                    </Link>
                    <h2 className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800" title={announcement.title}>{announcement.title}</h2>
                </div>
            }
        >
            <Head title={announcement.title} />

            <div className="student-announcement-show-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6" onFocusCapture={keepFocusedFieldVisible}>
                <style>{`
                    .studynest-layout.theme-dark .student-announcement-show-page > div > .bg-white { background-image: linear-gradient(135deg, rgb(30 41 59), rgb(15 23 42)) !important; background-color: rgb(30 41 59) !important; border-color: rgb(100 116 139) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-700 { color: rgb(241 245 249) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-announcement-show-page .text-gray-500 { color: rgb(203 213 225) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page .border-gray-200 { border-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-blue-100"] { background-color: rgb(30 58 138 / 0.55) !important; color: rgb(191 219 254) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-purple-100"] { background-color: rgb(88 28 135 / 0.45) !important; color: rgb(233 213 255) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-yellow-100"] { background-color: rgb(120 53 15 / 0.45) !important; color: rgb(253 230 138) !important; }
                    .studynest-layout.theme-dark .student-announcement-show-page [class~="bg-red-100"] { background-color: rgb(127 29 29 / 0.45) !important; color: rgb(254 202 202) !important; }
                    .student-announcement-show-page .break-words { overflow-wrap: anywhere; word-break: break-word; }
                    .student-announcement-show-page input,
                    .student-announcement-show-page select,
                    .student-announcement-show-page textarea { scroll-margin-block: 8rem; }
                    .student-announcement-detail-card { transition: transform 180ms ease, box-shadow 180ms ease; }
                    @media (max-width: 639px) {
                        .student-announcement-show-page input:not([type="checkbox"]):not([type="radio"]),
                        .student-announcement-show-page select,
                        .student-announcement-show-page textarea { font-size: 16px; }
                    }
                    @media (hover: hover) and (pointer: fine) { .student-announcement-detail-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / .08); } }
                    @media (hover: none), (prefers-reduced-motion: reduce) { .student-announcement-detail-card { transform: none !important; transition-duration: .01ms !important; } }
                `}</style>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 xl:px-8">
                    {/* ===== Announcement Details ===== */}
                    <div className="student-announcement-detail-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="space-y-5 p-4 sm:p-6">
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

                                    <h1 className="mt-3 max-w-full break-words text-xl font-bold text-gray-800 sm:text-2xl xl:hidden" title={announcement.title}>
                                        {announcement.title}
                                    </h1>

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
                                    <div className="text-gray-700 whitespace-pre-wrap break-words" title={announcement.content}>
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
