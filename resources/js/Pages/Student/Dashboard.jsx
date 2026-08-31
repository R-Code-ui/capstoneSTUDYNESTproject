import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import StatusBadge from '@/Components/StatusBadge';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Heroicons
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    PuzzlePieceIcon,
    MegaphoneIcon,
    ChartBarIcon,
    EnvelopeIcon,
    UserIcon,
    CalendarIcon,
    SparklesIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline';

export default function StudentDashboard({
    grade_level,
    recent_announcements,
    recent_lessons,
    upcoming_assignments,
    available_quizzes,
    assigned_games,
    progress_summary,
    unread_messages,
}) {
    const handleNavigationError = () => toast.error('Unable to load that module. Please try again.');

    // Array of gentle falling emoji background particles
    const particles = [
        { emoji: '🍃', left: '5%', duration: '12s', delay: '0s', size: '14px' },
        { emoji: '✏️', left: '15%', duration: '15s', delay: '2s', size: '16px' },
        { emoji: '🍂', left: '28%', duration: '11s', delay: '4s', size: '14px' },
        { emoji: '📏', left: '42%', duration: '14s', delay: '1s', size: '15px' },
        { emoji: '🍃', left: '55%', duration: '13s', delay: '5s', size: '14px' },
        { emoji: '📚', left: '68%', duration: '16s', delay: '3s', size: '15px' },
        { emoji: '🎒', left: '80%', duration: '12s', delay: '0.5s', size: '16px' },
        { emoji: '🎨', left: '92%', duration: '14s', delay: '2.5s', size: '16px' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'submitted':
            case 'graded':
            case 'reviewed':
            case 'late_submission':
            case 'completed':
                return <StatusBadge status="completed" label="Completed" />;
            case 'pending':
            case 'started':
                return <StatusBadge status="in_progress" label="In Progress" />;
            case 'returned_for_revision':
                return <StatusBadge status="warning" label="Needs Revision" />;
            case 'failed':
                return <StatusBadge status="warning" label="Retry" />;
            case 'not_submitted':
            case 'assigned':
            default:
                return <StatusBadge status="not_started" label="Not Started" />;
        }
    };

    const quickLinkStyles = {
        blue: { bg: 'bg-blue-100', hover: 'hover:bg-blue-200', text: 'text-blue-600', border: 'hover:border-blue-300' },
        emerald: { bg: 'bg-emerald-100', hover: 'hover:bg-emerald-200', text: 'text-emerald-600', border: 'hover:border-emerald-300' },
        purple: { bg: 'bg-purple-100', hover: 'hover:bg-purple-200', text: 'text-purple-600', border: 'hover:border-purple-300' },
        amber: { bg: 'bg-amber-100', hover: 'hover:bg-amber-200', text: 'text-amber-600', border: 'hover:border-amber-300' },
        rose: { bg: 'bg-rose-100', hover: 'hover:bg-rose-200', text: 'text-rose-600', border: 'hover:border-rose-300' },
        indigo: { bg: 'bg-indigo-100', hover: 'hover:bg-indigo-200', text: 'text-indigo-600', border: 'hover:border-indigo-300' },
    };

    const progressChartData = [
        { name: 'Lessons', value: progress_summary?.lessons?.total ? Math.round((progress_summary.lessons.completed / progress_summary.lessons.total) * 100) : 0, fill: '#60a5fa' },
        { name: 'Assignments', value: progress_summary?.assignments?.total ? Math.round((progress_summary.assignments.submitted / progress_summary.assignments.total) * 100) : 0, fill: '#34d399' },
        { name: 'Quizzes', value: Number(progress_summary?.quizzes?.average) || 0, fill: '#c084fc' },
        { name: 'Games', value: progress_summary?.games?.total ? Math.round((progress_summary.games.completed / progress_summary.games.total) * 100) : 0, fill: '#fbbf24' },
    ];

    return (
        <>
            {/* ========================================================= */}
            {/* FALLING PARTICLES (Leaves & School Supplies)               */}
            {/* ========================================================= */}
            <style>{`
                .student-dashboard-page {
                    background:
                        radial-gradient(circle at 8% 5%, rgb(224 231 255 / 0.72), transparent 22rem),
                        radial-gradient(circle at 94% 14%, rgb(207 250 254 / 0.72), transparent 24rem),
                        linear-gradient(180deg, rgb(248 250 252) 0%, rgb(255 255 255) 42%, rgb(248 250 252) 100%);
                }
                .student-dashboard-hero {
                    position: relative;
                    isolation: isolate;
                    overflow: hidden;
                    background: linear-gradient(118deg, rgb(37 99 235), rgb(99 102 241) 54%, rgb(168 85 247));
                    box-shadow: 0 18px 38px rgb(79 70 229 / 0.2);
                }
                .student-dashboard-hero::before,
                .student-dashboard-hero::after {
                    content: '';
                    position: absolute;
                    z-index: -1;
                    border-radius: 999px;
                    background: rgb(255 255 255 / 0.14);
                }
                .student-dashboard-hero::before { width: 15rem; height: 15rem; right: -5rem; top: -9rem; }
                .student-dashboard-hero::after { width: 9rem; height: 9rem; right: 27%; bottom: -6rem; }
                .student-dashboard-section {
                    overflow: hidden;
                    border-color: rgb(226 232 240);
                    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
                }
                .student-dashboard-section:hover {
                    transform: translateY(-3px);
                    border-color: rgb(191 219 254);
                    box-shadow: 0 16px 32px rgb(15 23 42 / 0.08);
                }
                .student-dashboard-item {
                    position: relative;
                    overflow: hidden;
                    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
                }
                .student-dashboard-item::after {
                    content: '';
                    position: absolute;
                    inset: 0 auto 0 0;
                    width: 3px;
                    background: currentColor;
                    opacity: 0;
                    transition: opacity 160ms ease;
                }
                .student-dashboard-item:hover {
                    transform: translateX(4px);
                    box-shadow: 0 8px 18px rgb(15 23 42 / 0.06);
                }
                .student-dashboard-item:hover::after { opacity: 1; }
                .student-dashboard-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    border-radius: 9999px;
                    padding: 0.45rem 0.8rem;
                    transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
                }
                .student-dashboard-link:hover { transform: translateX(2px); }
                .studynest-layout.theme-dark .student-dashboard-page {
                    background: radial-gradient(circle at 8% 5%, rgb(30 27 75 / 0.4), transparent 24rem), rgb(2 6 23);
                }
                .studynest-layout.theme-dark .student-dashboard-hero {
                    background: linear-gradient(118deg, rgb(30 64 175), rgb(67 56 202) 54%, rgb(107 33 168));
                }
                .studynest-layout.theme-dark .student-dashboard-section {
                    background-color: rgb(15 23 42) !important;
                    border-color: rgb(51 65 85) !important;
                    box-shadow: 0 16px 32px rgb(0 0 0 / 0.18);
                }
                .studynest-layout.theme-dark .student-dashboard-section > div:first-child {
                    background: linear-gradient(100deg, rgb(30 41 59), rgb(15 23 42)) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-section > div:first-child .text-gray-800,
                .studynest-layout.theme-dark .student-dashboard-section > div:first-child .text-gray-700 {
                    color: rgb(241 245 249) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-section:hover {
                    border-color: rgb(99 102 241) !important;
                    box-shadow: 0 20px 40px rgb(0 0 0 / 0.28);
                }
                .studynest-layout.theme-dark .student-dashboard-page .student-dashboard-item {
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page .student-dashboard-link {
                    color: rgb(165 180 252) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page .student-dashboard-link:hover {
                    background-color: rgb(49 46 129 / 0.35) !important;
                    color: rgb(224 231 255) !important;
                }
                @media (hover: none) {
                    .student-dashboard-section:hover,
                    .student-dashboard-item:hover { transform: none; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .student-dashboard-page *,
                    .student-dashboard-page *::before,
                    .student-dashboard-page *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
                @keyframes fallAndRotate {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.6;
                    }
                    90% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-falling-particle {
                    position: fixed;
                    top: -30px;
                    animation-name: fallAndRotate;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    pointer-events: none;
                    user-select: none;
                    z-index: 0;
                }
                .studynest-layout.theme-dark .student-dashboard-page .bg-white {
                    background-color: rgb(15 23 42) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="from-blue-50/80"] {
                    background-image: none !important;
                    background-color: rgb(30 41 59) !important;
                    border-color: rgb(71 85 105) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-blue-50"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-blue-50/80"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-blue-50/50"] {
                    background-color: rgb(23 37 84 / 0.75) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-emerald-50"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-emerald-50/50"] {
                    background-color: rgb(6 78 59 / 0.55) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-purple-50/50"] {
                    background-color: rgb(59 7 100 / 0.5) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-amber-50/50"] {
                    background-color: rgb(120 53 15 / 0.45) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-rose-50/50"] {
                    background-color: rgb(136 19 55 / 0.4) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="bg-indigo-50"] {
                    background-color: rgb(30 27 75 / 0.75) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page .text-gray-800,
                .studynest-layout.theme-dark .student-dashboard-page .text-gray-700 {
                    color: rgb(226 232 240) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page .text-gray-600,
                .studynest-layout.theme-dark .student-dashboard-page .text-gray-500,
                .studynest-layout.theme-dark .student-dashboard-page .text-gray-400 {
                    color: rgb(148 163 184) !important;
                }
                .studynest-layout.theme-dark .student-dashboard-page [class~="border-gray-100"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="border-blue-100"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="border-emerald-100"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="border-purple-100"],
                .studynest-layout.theme-dark .student-dashboard-page [class~="border-amber-100"] {
                    border-color: rgb(51 65 85) !important;
                }
            `}</style>

            <div className="hidden" aria-hidden="true">
                {particles.map((p, idx) => (
                    <span
                        key={idx}
                        className="animate-falling-particle opacity-50"
                        style={{
                            left: p.left,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            fontSize: p.size,
                        }}
                    >
                        {p.emoji}
                    </span>
                ))}
            </div>

            <AuthenticatedLayout
                header={
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full relative z-10">
                        <span className="text-xl font-semibold leading-tight text-gray-800">
                            Student Dashboard
                        </span>
                        {unread_messages > 0 && (
                            <Link
                                href={route('student.messages.index')}
                                onError={handleNavigationError}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-800"
                            >
                                <EnvelopeIcon className="w-5 h-5" />
                                <span>Messages</span>
                                <span className="inline-flex min-w-5 items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                                    {unread_messages}
                                </span>
                            </Link>
                        )}
                    </div>
                }
            >
                <Head title="Student Dashboard" />

                <div className="student-dashboard-page py-4 relative z-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        {/* ===== Welcome Section ===== */}
                        <div className="student-dashboard-hero mb-6 rounded-3xl border border-indigo-300/40 p-5 text-white sm:p-7 sm:pr-[20rem]">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-50 ring-1 ring-white/20">
                                    <SparklesIcon className="h-4 w-4" />
                                    Learning space
                                </div>
                                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                    Welcome back! 👋
                                </h2>
                                {/* 🔧 FIX: Changed "Grade {grade_level}" to "{grade_level} Student" */}
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-indigo-100">
                                    <UserIcon className="inline-block w-4 h-4" />
                                    {grade_level} Student
                                </p>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:absolute sm:right-7 sm:top-1/2 sm:mt-0 sm:min-w-[17rem] sm:-translate-y-1/2">
                                <div className="rounded-2xl bg-white/14 px-3 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                                    <div className="text-xl font-extrabold">{progress_summary?.lessons?.completed || 0}</div>
                                    <div className="text-[11px] font-semibold text-indigo-100">Lessons done</div>
                                </div>
                                <div className="rounded-2xl bg-white/14 px-3 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                                    <div className="flex items-center gap-1 text-xl font-extrabold"><TrophyIcon className="h-5 w-5 text-amber-200" />{progress_summary?.quizzes?.average || 0}%</div>
                                    <div className="text-[11px] font-semibold text-indigo-100">Quiz average</div>
                                </div>
                            </div>
                        </div>

                        {/* ===== Recent Announcements ===== */}
                        <Card
                            className="student-dashboard-section"
                            headerClassName="bg-gradient-to-r from-rose-50 to-white"
                            bodyClassName="p-4 sm:p-5"
                            title={
                                <div className="flex items-center gap-2 text-base">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100"><MegaphoneIcon className="w-4 h-4 text-rose-600" /></span>
                                    Recent Announcements
                                </div>
                            }
                        >
                            {recent_announcements && recent_announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {recent_announcements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="student-dashboard-item p-3.5 text-rose-500 bg-rose-50/50 rounded-xl border border-rose-100 hover:bg-rose-50"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start sm:items-center">
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-800 truncate" title={announcement.title}>
                                                        {announcement.title}
                                                    </div>
                                                    <div className="text-sm text-gray-600 line-clamp-2 break-words">
                                                        {announcement.content}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-xs text-rose-600 font-medium">
                                                        {announcement.posted_by}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {announcement.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center pt-2">
                                        <Link
                                            href={route('student.announcements.index')}
                                            onError={handleNavigationError}
                                            className="student-dashboard-link text-sm text-rose-700 hover:bg-rose-100 hover:text-rose-900 font-bold"
                                        >
                                            View All Announcements →
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    No recent announcements.
                                </p>
                            )}
                        </Card>

                        {/* ===== Recent Lessons & Upcoming Assignments ===== */}
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            {/* Recent Lessons */}
                            <Card
                                className="student-dashboard-section"
                                headerClassName="bg-gradient-to-r from-blue-50 to-white"
                                bodyClassName="p-4 sm:p-5"
                                title={
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100"><BookOpenIcon className="w-4 h-4 text-blue-600" /></span>
                                        Recent Lessons
                                    </div>
                                }
                            >
                                {recent_lessons && recent_lessons.length > 0 ? (
                                    <div className="space-y-3">
                                        {recent_lessons.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="student-dashboard-item p-3.5 text-blue-500 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start sm:items-center">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-800 truncate" title={lesson.title}>
                                                            {lesson.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 break-words">
                                                            {lesson.subject}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-xs text-gray-400">
                                                            {lesson.date}
                                                        </span>
                                                        <Link
                                                            href={route('student.lessons.show', lesson.id)}
                                                            onError={handleNavigationError}
                                                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <Link
                                                href={route('student.lessons.index')}
                                                onError={handleNavigationError}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View All Lessons →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No lessons available.
                                    </p>
                                )}
                            </Card>

                            {/* Upcoming Assignments */}
                            <Card
                                className="student-dashboard-section"
                                headerClassName="bg-gradient-to-r from-emerald-50 to-white"
                                bodyClassName="p-4 sm:p-5"
                                title={
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100"><ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" /></span>
                                        Upcoming Assignments
                                    </div>
                                }
                            >
                                {upcoming_assignments && upcoming_assignments.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcoming_assignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="student-dashboard-item p-3.5 text-emerald-500 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start sm:items-center">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-800 truncate" title={assignment.title}>
                                                            {assignment.title}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm break-words">
                                                            <span className="text-gray-500">
                                                                {assignment.subject}
                                                            </span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="flex items-center gap-1 text-gray-400">
                                                                <CalendarIcon className="w-3 h-3" />
                                                                {assignment.due_date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        {getStatusBadge(assignment.status)}
                                                        <Link
                                                            href={route('student.assignments.show', assignment.id)}
                                                            onError={handleNavigationError}
                                                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            View →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <Link
                                                href={route('student.assignments.index')}
                                                onError={handleNavigationError}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View All Assignments →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No upcoming assignments.
                                    </p>
                                )}
                            </Card>
                        </div>

                        {/* ===== Available Quizzes & Assigned Games ===== */}
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            {/* Available Quizzes */}
                            <Card
                                className="student-dashboard-section"
                                headerClassName="bg-gradient-to-r from-purple-50 to-white"
                                bodyClassName="p-4 sm:p-5"
                                title={
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100"><DocumentTextIcon className="w-4 h-4 text-purple-600" /></span>
                                        Available Quizzes
                                    </div>
                                }
                            >
                                {available_quizzes && available_quizzes.length > 0 ? (
                                    <div className="space-y-3">
                                        {available_quizzes.map((quiz) => (
                                            <div
                                                key={quiz.id}
                                                className="student-dashboard-item p-3.5 text-purple-500 bg-purple-50/50 rounded-xl border border-purple-100 hover:bg-purple-50"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start sm:items-center">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-800 truncate" title={quiz.title}>
                                                            {quiz.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 break-words">
                                                            {quiz.subject} • {quiz.questions} questions
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        {quiz.status === 'completed' ? (
                                                            <>
                                                                <span className="text-sm font-medium text-emerald-600">
                                                                    {quiz.score}%
                                                                </span>
                                                                <Link
                                                                    href={route('student.quizzes.show', quiz.id)}
                                                                    onError={handleNavigationError}
                                                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    View Results →
                                                                </Link>
                                                            </>
                                                        ) : (
                                                            <Link
                                                                href={route('student.quizzes.show', quiz.id)}
                                                                onError={handleNavigationError}
                                                                className="mt-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                                                            >
                                                                Start Quiz →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <Link
                                                href={route('student.quizzes.index')}
                                                onError={handleNavigationError}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View All Quizzes →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No quizzes available.
                                    </p>
                                )}
                            </Card>

                            {/* Assigned Games */}
                            <Card
                                className="student-dashboard-section"
                                headerClassName="bg-gradient-to-r from-amber-50 to-white"
                                bodyClassName="p-4 sm:p-5"
                                title={
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100"><PuzzlePieceIcon className="w-4 h-4 text-amber-600" /></span>
                                        Assigned Games
                                    </div>
                                }
                            >
                                {assigned_games && assigned_games.length > 0 ? (
                                    <div className="space-y-3">
                                        {assigned_games.map((game) => (
                                            <div
                                                key={game.id}
                                                className="student-dashboard-item p-3.5 text-amber-500 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-amber-50"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start sm:items-center">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-800 truncate" title={game.title}>
                                                            {game.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 capitalize break-words">
                                                            {game.game_type}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end shrink-0">
                                                        {game.status === 'completed' ? (
                                                            <>
                                                                <span className="text-sm font-medium text-emerald-600">
                                                                    {game.score}%
                                                                </span>
                                                                <Link
                                                                    href={route('student.games.show', game.id)}
                                                                    onError={handleNavigationError}
                                                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                                >
                                                                    Play Again →
                                                                </Link>
                                                            </>
                                                        ) : (
                                                            <Link
                                                                href={route('student.games.show', game.id)}
                                                                onError={handleNavigationError}
                                                                className="mt-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                                                            >
                                                                Play Game →
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-2">
                                            <Link
                                                href={route('student.games.index')}
                                                onError={handleNavigationError}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View All Games →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        No games assigned.
                                    </p>
                                )}
                            </Card>
                        </div>

                        {/* ===== Learning Progress Summary ===== */}
                        <div className="mt-6">
                            <Card
                                className="student-dashboard-section"
                                headerClassName="bg-gradient-to-r from-indigo-50 to-white"
                                bodyClassName="p-4 sm:p-6"
                                title={
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100"><ChartBarIcon className="w-4 h-4 text-indigo-600" /></span>
                                        Learning Progress Summary
                                    </div>
                                }
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {progress_summary?.lessons?.completed || 0}/{progress_summary?.lessons?.total || 0}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">Lessons Completed</div>
                                    </div>
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {progress_summary?.assignments?.submitted || 0}/{progress_summary?.assignments?.total || 0}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">Assignments Submitted</div>
                                    </div>
                                    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {progress_summary?.quizzes?.average || 0}%
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">Quiz Average</div>
                                    </div>
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-sm">
                                        <div className="text-2xl font-bold text-amber-600">
                                            {progress_summary?.games?.completed || 0}/{progress_summary?.games?.total || 0}
                                        </div>
                                        <div className="text-xs font-medium text-gray-500">Games Completed</div>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-gray-200 pt-5">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Progress at a glance</h3>
                                    <div className="h-56 w-full sm:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={progressChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    formatter={(value) => [`${value}%`, 'Progress']}
                                                    cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#e2e8f0' }}
                                                    labelStyle={{ color: '#f8fafc' }}
                                                    itemStyle={{ color: '#a5b4fc' }}
                                                />
                                                <Bar
                                                    dataKey="value"
                                                    fill="#818cf8"
                                                    activeBar={{ fill: '#6366f1', stroke: '#a5b4fc', strokeWidth: 1 }}
                                                    radius={[6, 6, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* ===== Quick Access Buttons ===== */}
                        <div className="mt-6">
                            <Card className="student-dashboard-section" headerClassName="bg-gradient-to-r from-slate-50 to-white" bodyClassName="p-4 sm:p-5" title={<span className="font-semibold text-gray-700">Quick Access</span>}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                    {[
                                        { icon: BookOpenIcon, color: 'blue', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', label: 'Lessons', route: 'student.lessons.index' },
                                        { icon: ClipboardDocumentListIcon, color: 'emerald', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-600', label: 'Assignments', route: 'student.assignments.index' },
                                        { icon: DocumentTextIcon, color: 'purple', bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', label: 'Quizzes', route: 'student.quizzes.index' },
                                        { icon: PuzzlePieceIcon, color: 'amber', bg: 'bg-amber-50', hover: 'hover:bg-amber-100', text: 'text-amber-600', label: 'Games', route: 'student.games.index' },
                                        { icon: MegaphoneIcon, color: 'rose', bg: 'bg-rose-50', hover: 'hover:bg-rose-100', text: 'text-rose-600', label: 'Announcements', route: 'student.announcements.index' },
                                        { icon: ChartBarIcon, color: 'indigo', bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-600', label: 'Progress', route: 'student.progress.index' },
                                    ].map((item, idx) => (
                                        <Link
                                            key={idx}
                                            href={route(item.route)}
                                            onError={handleNavigationError}
                                            className={`group flex flex-col items-center justify-center rounded-2xl border border-gray-100 p-4 ${item.bg} ${item.hover} ${quickLinkStyles[item.color].border} transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg`}
                                        >
                                            <span className="rounded-2xl bg-white/70 p-2.5 shadow-sm transition duration-200 group-hover:scale-110 group-hover:rotate-3"><item.icon className={`h-7 w-7 ${item.text}`} /></span>
                                            <span className="text-xs font-medium text-gray-700 text-center mt-2">
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
