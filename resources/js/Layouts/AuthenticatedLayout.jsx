import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Toast from '@/Components/Toast';
import NotificationBell from '@/Components/NotificationBell';
import { Link, usePage } from '@inertiajs/react';
import {
    AcademicCapIcon, Bars3Icon, BellAlertIcon, BookOpenIcon, ChartBarIcon,
    ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, DocumentChartBarIcon,
    EllipsisVerticalIcon, MoonIcon, PencilSquareIcon, PresentationChartLineIcon,
    PuzzlePieceIcon, RectangleStackIcon, SunIcon, UserCircleIcon, UsersIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

// ============================================================
// HELPER: Safely get route – returns null if route doesn't exist
// ============================================================
function safeRoute(name, params = {}) {
    try {
        return route(name, params);
    } catch (e) {
        return null;
    }
}

const navIcons = {
    dashboard: ChartBarIcon, users: UsersIcon, teachers: AcademicCapIcon,
    lessons: BookOpenIcon, assignments: ClipboardDocumentListIcon,
    quizzes: ClipboardDocumentCheckIcon, games: PuzzlePieceIcon,
    announcements: BellAlertIcon, messages: PencilSquareIcon,
    progress: PresentationChartLineIcon, reports: DocumentChartBarIcon,
    logs: RectangleStackIcon,
};

function Avatar({ user, small = false }) {
    return (
        <div className={`${small ? 'h-9 w-9 text-sm' : 'h-10 w-10 text-base'} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-sm`}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
        </div>
    );
}

function ThemeToggle({ dark, toggle }) {
    return (
        <button type="button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300">
            {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showToast, setShowToast] = useState(!!flash?.message);
    const [darkMode, setDarkMode] = useState(() =>
        typeof window !== 'undefined' && localStorage.getItem('studynest-theme') === 'dark'
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('studynest-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Determine user role for navigation
    const userRole = user?.roles?.[0]?.name || null;

    // Role-based navigation links – only add if route exists
    const getNavLinks = () => {
        const links = [];

        if (userRole === 'principal') {
            const dashboard = safeRoute('principal.dashboard');
            const users = safeRoute('principal.users.index');
            const teachers = safeRoute('principal.teachers.index');
            const announcements = safeRoute('principal.announcements.index');
            const reports = safeRoute('principal.reports.index');
            const logs = safeRoute('principal.logs.index');

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard', icon: navIcons.dashboard, routeName: 'principal.dashboard' });
            if (users) links.push({ href: users, label: 'User Management', icon: navIcons.users, routeName: 'principal.users.*' });
            if (teachers) links.push({ href: teachers, label: 'Teacher Monitoring', icon: navIcons.teachers, routeName: 'principal.teachers.*' });
            if (announcements) links.push({ href: announcements, label: 'Announcements', icon: navIcons.announcements, routeName: 'principal.announcements.*' });
            if (reports) links.push({ href: reports, label: 'Reports', icon: navIcons.reports, routeName: 'principal.reports.*' });
            if (logs) links.push({ href: logs, label: 'Activity Logs', icon: navIcons.logs, routeName: 'principal.logs.*' });
        } else if (userRole === 'teacher') {
            const dashboard = safeRoute('teacher.dashboard');
            const students = safeRoute('teacher.students.index');
            const lessons = safeRoute('teacher.lessons.index');
            const assignments = safeRoute('teacher.assignments.index');
            const quizzes = safeRoute('teacher.quizzes.index');
            const games = safeRoute('teacher.games.index');
            const announcements = safeRoute('teacher.announcements.index');
            const messages = safeRoute('teacher.messages.index');
            const progress = safeRoute('teacher.progress.index');
            const reports = safeRoute('teacher.reports.index');
            const activityLogs = safeRoute('teacher.activity-logs.index');

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard', icon: navIcons.dashboard, routeName: 'teacher.dashboard' });
            if (students) links.push({ href: students, label: 'User Management', icon: navIcons.users, routeName: 'teacher.students.*' });
            if (lessons) links.push({ href: lessons, label: 'Lessons', icon: navIcons.lessons, routeName: 'teacher.lessons.*' });
            if (assignments) links.push({ href: assignments, label: 'Assignments', icon: navIcons.assignments, routeName: 'teacher.assignments.*' });
            if (quizzes) links.push({ href: quizzes, label: 'Quizzes', icon: navIcons.quizzes, routeName: 'teacher.quizzes.*' });
            if (games) links.push({ href: games, label: 'Games', icon: navIcons.games, routeName: 'teacher.games.*' });
            if (announcements) links.push({ href: announcements, label: 'Announcements', icon: navIcons.announcements, routeName: 'teacher.announcements.*' });
            if (messages) links.push({ href: messages, label: 'Messages', icon: navIcons.messages, routeName: 'teacher.messages.*' });
            if (progress) links.push({ href: progress, label: 'Progress', icon: navIcons.progress, routeName: 'teacher.progress.*' });
            if (reports) links.push({ href: reports, label: 'Reports', icon: navIcons.reports, routeName: 'teacher.reports.*' });
            if (activityLogs) links.push({ href: activityLogs, label: 'Activity Logs', icon: navIcons.logs, routeName: 'teacher.activity-logs.*' });
        } else if (userRole === 'student') {
            const dashboard = safeRoute('student.dashboard');
            const lessons = safeRoute('student.lessons.index');
            const assignments = safeRoute('student.assignments.index');
            const quizzes = safeRoute('student.quizzes.index');
            const games = safeRoute('student.games.index');
            const announcements = safeRoute('student.announcements.index');
            const messages = safeRoute('student.messages.index');
            const progress = safeRoute('student.progress.index');

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard', icon: navIcons.dashboard, routeName: 'student.dashboard' });
            if (lessons) links.push({ href: lessons, label: 'Lessons', icon: navIcons.lessons, routeName: 'student.lessons.*' });
            if (assignments) links.push({ href: assignments, label: 'Assignments', icon: navIcons.assignments, routeName: 'student.assignments.*' });
            if (quizzes) links.push({ href: quizzes, label: 'Quizzes', icon: navIcons.quizzes, routeName: 'student.quizzes.*' });
            if (games) links.push({ href: games, label: 'Games', icon: navIcons.games, routeName: 'student.games.*' });
            if (announcements) links.push({ href: announcements, label: 'Announcements', icon: navIcons.announcements, routeName: 'student.announcements.*' });
            if (messages) links.push({ href: messages, label: 'Messages', icon: navIcons.messages, routeName: 'student.messages.*' });
            if (progress) links.push({ href: progress, label: 'Progress', icon: navIcons.progress, routeName: 'student.progress.*' });
        }

        return links;
    };

    const navLinks = getNavLinks();

    return (
        <>
            <style>{`
                /* Keep this layout's toggle independent from the OS theme preference. */
                .studynest-layout.theme-light { color-scheme: light; }
                .studynest-layout.theme-dark { color-scheme: dark; background-color: rgb(2 6 23) !important; color: rgb(241 245 249) !important; }
                .studynest-layout.theme-dark .bg-white { background-color: rgb(15 23 42) !important; }
                .studynest-layout.theme-dark .bg-slate-50 { background-color: rgb(2 6 23) !important; }
                .studynest-layout.theme-dark .bg-slate-100 { background-color: rgb(30 41 59) !important; }
                .studynest-layout.theme-dark .border-slate-200,
                .studynest-layout.theme-dark .border-slate-100 { border-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .text-slate-900,
                .studynest-layout.theme-dark .text-slate-800,
                .studynest-layout.theme-dark .text-slate-700 { color: rgb(241 245 249) !important; }
                .studynest-layout.theme-dark .text-slate-600,
                .studynest-layout.theme-dark .text-slate-500 { color: rgb(148 163 184) !important; }
                .studynest-layout.theme-dark .text-gray-900,
                .studynest-layout.theme-dark .text-gray-800,
                .studynest-layout.theme-dark .text-gray-700 { color: rgb(226 232 240) !important; }
                .studynest-layout.theme-dark .text-gray-600,
                .studynest-layout.theme-dark .text-gray-500 { color: rgb(148 163 184) !important; }
                .studynest-layout.theme-dark .bg-slate-100 { background-color: rgb(30 41 59) !important; }
                .studynest-layout.theme-dark .bg-indigo-50\\/50 { background-color: rgb(30 41 59) !important; }
                .studynest-layout.theme-dark .dark\\:hover\\:bg-slate-800:hover,
                .studynest-layout.theme-dark .hover\\:bg-slate-50:hover,
                .studynest-layout.theme-dark .hover\\:bg-slate-100:hover,
                .studynest-layout.theme-dark .hover\\:bg-gray-100:hover { background-color: rgb(30 41 59) !important; }
                .studynest-layout.theme-dark .dark\\:hover\\:text-slate-100:hover,
                .studynest-layout.theme-dark .hover\\:text-slate-800:hover,
                .studynest-layout.theme-dark .hover\\:text-gray-900:hover { color: rgb(226 232 240) !important; }
                .studynest-layout.theme-dark .border-slate-100,
                .studynest-layout.theme-dark .border-gray-200 { border-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .border-gray-100 { border-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .dark\\:text-indigo-300 { color: rgb(199 210 254) !important; }
                .studynest-layout.theme-dark .dark\\:bg-indigo-500\\/15 { background-color: rgb(30 41 59) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:bg-slate-800:hover { background-color: rgb(241 245 249) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:bg-slate-800\\/70:hover { background-color: rgb(241 245 249 / 0.7) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:text-slate-100:hover { color: rgb(51 65 85) !important; }
                .studynest-layout.theme-light .dark\\:bg-gray-800,
                .studynest-layout.theme-light .dark\\:bg-gray-900 { background-color: rgb(255 255 255) !important; }
                .studynest-layout.theme-light .dark\\:border-gray-700,
                .studynest-layout.theme-light .dark\\:border-gray-600 { border-color: rgb(226 232 240) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:bg-slate-800:hover { background-color: rgb(241 245 249) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:text-slate-100:hover { color: rgb(51 65 85) !important; }
                .studynest-layout.theme-light .dark\\:bg-indigo-500\\/15 { background-color: rgb(238 242 255) !important; }
                .studynest-layout.theme-light .dark\\:text-indigo-300 { color: rgb(67 56 202) !important; }
                .studynest-layout.theme-light .dark\\:text-indigo-400 { color: rgb(79 70 229) !important; }
                /* Prevent dashboard dark utilities from leaking into light mode when the OS is dark. */
                .studynest-layout.theme-light .dark\\:bg-gray-800\\/70 { background-color: rgb(248 250 252) !important; }
                .studynest-layout.theme-light .dark\\:bg-gray-700\\/60 { background-color: rgb(248 250 252) !important; }
                .studynest-layout.theme-light .dark\\:bg-gray-700\\/40 { background-color: rgb(248 250 252 / 0.7) !important; }
                .studynest-layout.theme-light .dark\\:border-gray-700,
                .studynest-layout.theme-light .dark\\:border-gray-600 { border-color: rgb(226 232 240) !important; }
                .studynest-layout.theme-light .dark\\:divide-gray-700 > :not([hidden]) ~ :not([hidden]) { border-color: rgb(226 232 240) !important; }
                .studynest-layout.theme-light .dark\\:text-gray-100 { color: rgb(30 41 59) !important; }
                .studynest-layout.theme-light .dark\\:text-gray-200 { color: rgb(51 65 85) !important; }
                .studynest-layout.theme-light .dark\\:text-gray-300 { color: rgb(71 85 105) !important; }
                .studynest-layout.theme-light .dark\\:text-gray-400 { color: rgb(100 116 139) !important; }
                .studynest-layout.theme-light .dark\\:text-white { color: rgb(15 23 42) !important; }
                .studynest-layout.theme-light .dark\\:bg-amber-400\\/10 { background-color: rgb(255 251 235) !important; }
                .studynest-layout.theme-light .dark\\:bg-rose-400\\/10 { background-color: rgb(255 241 242) !important; }
                .studynest-layout.theme-light .dark\\:text-amber-300 { color: rgb(180 83 9) !important; }
                .studynest-layout.theme-light .dark\\:text-amber-100 { color: rgb(120 53 15) !important; }
                .studynest-layout.theme-light .dark\\:text-rose-300 { color: rgb(190 24 93) !important; }
                .studynest-layout.theme-light .dark\\:text-rose-100 { color: rgb(159 18 57) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-800\\/60 { background-color: rgb(248 250 252 / 0.9) !important; }
                .studynest-layout.theme-light .dark\\:border-slate-700 { border-color: rgb(203 213 225) !important; }
                .studynest-layout.theme-light .dark\\:text-slate-300 { color: rgb(71 85 105) !important; }
                .studynest-layout.theme-light .dark\\:text-slate-500 { color: rgb(148 163 184) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:bg-slate-700:hover { background-color: rgb(241 245 249) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:text-white:hover { color: rgb(15 23 42) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:text-indigo-300:hover { color: rgb(79 70 229) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-800\\/40 { background-color: rgb(248 250 252 / 0.5) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-900\\/30 { background-color: rgb(255 255 255 / 0.7) !important; }
                .studynest-layout.theme-light .dark\\:hover\\:bg-slate-700\\/50:hover { background-color: rgb(241 245 249) !important; }
                .studynest-layout.theme-light .dark\\:border-slate-700 { border-color: rgb(226 232 240) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-900\\/40 { background-color: rgb(248 250 252 / 0.7) !important; }
                /* Keep dashboard cards as soft slate surfaces in explicit dark mode. */
                .studynest-layout.theme-dark .bg-gray-50 { background-color: rgb(15 23 42) !important; }
                .studynest-layout.theme-dark .bg-gray-50\\/50 { background-color: rgb(30 41 59 / 0.4) !important; }
                .studynest-layout.theme-dark .hover\\:bg-gray-50:hover { background-color: rgb(51 65 85 / 0.5) !important; }
                .studynest-layout.theme-dark .dark\\:hover\\:bg-slate-700\\/50:hover { background-color: rgb(51 65 85 / 0.5) !important; }
                .studynest-layout.theme-dark .dark\\:bg-gray-800\\/70 { background-color: rgb(30 41 59 / 0.7) !important; }
                .studynest-layout.theme-dark .dark\\:bg-gray-700\\/60 { background-color: rgb(51 65 85 / 0.6) !important; }
                .studynest-layout.theme-dark .dark\\:bg-gray-700\\/40 { background-color: rgb(51 65 85 / 0.4) !important; }
                .studynest-layout.theme-dark .bg-gray-100 { background-color: rgb(51 65 85) !important; }
                .studynest-layout.theme-dark .bg-amber-50 { background-color: rgb(120 53 15 / 0.25) !important; }
                .studynest-layout.theme-dark .bg-sky-50 { background-color: rgb(7 89 133 / 0.25) !important; }
                .studynest-layout.theme-dark .bg-emerald-50 { background-color: rgb(6 95 70 / 0.25) !important; }
                .studynest-layout.theme-dark .bg-yellow-50 { background-color: rgb(113 63 18 / 0.25) !important; }
                .studynest-layout.theme-dark .bg-purple-50 { background-color: rgb(107 33 168 / 0.22) !important; }
                .studynest-layout.theme-dark .bg-rose-50 { background-color: rgb(159 18 57 / 0.22) !important; }
                .studynest-layout.theme-dark .text-amber-700 { color: rgb(253 186 116) !important; }
                .studynest-layout.theme-dark .text-sky-700 { color: rgb(125 211 252) !important; }
                .studynest-layout.theme-dark .text-emerald-700 { color: rgb(110 231 183) !important; }
                .studynest-layout.theme-dark .studynest-status-muted {
                    background-color: rgb(226 232 240) !important;
                    color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .notification-priority-badge {
                    background-color: rgb(51 65 85) !important;
                    color: rgb(203 213 225) !important;
                }
                .studynest-layout.theme-dark .notification-priority-badge.bg-rose-100 {
                    background-color: rgb(127 29 29) !important;
                    color: rgb(254 202 202) !important;
                }
                .studynest-layout.theme-dark .notification-priority-badge.bg-amber-100 {
                    background-color: rgb(120 53 15) !important;
                    color: rgb(253 230 138) !important;
                }
                .studynest-layout.theme-dark .notification-priority-badge.bg-sky-100 {
                    background-color: rgb(7 89 133) !important;
                    color: rgb(186 230 253) !important;
                }
                .studynest-layout.theme-dark .notification-new-badge {
                    background-color: rgb(49 46 129) !important;
                    color: rgb(199 210 254) !important;
                }
                .studynest-layout.theme-dark .notification-center-list {
                    background-color: rgb(15 23 42) !important;
                    border-color: rgb(51 65 85) !important;
                }
                .studynest-layout.theme-dark .notification-center-page .bg-indigo-50\/40,
                .studynest-layout.theme-dark .notification-dropdown .bg-indigo-50\/50 {
                    background-color: rgb(30 41 59 / 0.7) !important;
                }
                .studynest-layout.theme-dark .notification-action {
                    color: rgb(165 180 252) !important;
                }
                .studynest-layout.theme-dark .notification-action:hover {
                    color: rgb(199 210 254) !important;
                }
                @media (prefers-color-scheme: dark) {
                .studynest-layout.theme-light .dark\\:bg-slate-950 { background-color: rgb(248 250 252) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-900 { background-color: rgb(255 255 255) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-900\\/95 { background-color: rgb(255 255 255 / 0.95) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-800 { background-color: rgb(241 245 249) !important; }
                .studynest-layout.theme-light .dark\\:bg-slate-700 { background-color: rgb(255 255 255) !important; }
                    .studynest-layout.theme-light .dark\\:border-slate-800 { border-color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-light .dark\\:text-white,
                    .studynest-layout.theme-light .dark\\:text-slate-100,
                    .studynest-layout.theme-light .dark\\:text-slate-200 { color: rgb(15 23 42) !important; }
                    .studynest-layout.theme-light .dark\\:text-slate-300,
                    .studynest-layout.theme-light .dark\\:text-slate-400 { color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-light .dark\\:text-slate-200 { color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-light .dark\\:border-slate-600 { border-color: rgb(203 213 225) !important; }
                    .studynest-layout.theme-light .dark\\:hover\\:bg-slate-600:hover { background-color: rgb(248 250 252) !important; }
                }
            `}</style>
            {/* Toast Notification */}
            {flash?.message && showToast && (
                <Toast
                    message={flash.message}
                    type={flash.type || 'success'}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className={`studynest-layout ${darkMode ? 'theme-dark' : 'theme-light'} min-h-screen bg-slate-50 font-sans antialiased text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row`}>

                {/* ===== DESKTOP SIDEBAR (Clean White) ===== */}
                <aside className="hidden md:flex md:w-72 md:flex-shrink-0 flex-col bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 z-20">
                    {/* Brand Logo Header */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-8 w-auto object-contain"
                            />
                            <span className="font-extrabold text-base tracking-[0.16em] text-slate-800 dark:text-white">STUDYNEST</span>
                        </Link>
                    </div>

                    {/* Sidebar Navigation */}
                    <div className="flex-1 flex flex-col overflow-y-auto p-4 py-6">
                        <nav className="space-y-1">
                            <div className="mb-3 flex items-center justify-between px-3"><span className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">Workspace</span><span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}</span></div>
                            {navLinks.map((link) => { const Icon = link.icon; const active = route().current(link.routeName); return <Link key={link.href} href={link.href} className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}><Icon className="h-[18px] w-[18px]" /></span><span className="truncate">{link.label}</span>{active && <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}</Link>; })}
                        </nav>
                    </div>
                </aside>

                {/* ===== MOBILE TOPBAR ===== */}
                <div className="md:hidden sticky top-0 flex h-16 items-center justify-between px-4 bg-white/95 border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 shadow-sm z-30 backdrop-blur">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/storage/images/studynestLogo.png"
                            alt="StudyNest Logo"
                            className="h-7 w-auto object-contain"
                        />
                        <span className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-white">STUDYNEST</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle dark={darkMode} toggle={() => setDarkMode((value) => !value)} />
                        <NotificationBell />
                        <button
                            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path
                                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ===== MOBILE NAVIGATION DRAWER ===== */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden sticky top-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 shadow-lg'}>
                    <div className="space-y-1 px-3 pb-3 pt-2">
                            {navLinks.map((link) => { const Icon = link.icon; const active = route().current(link.routeName); return <Link key={link.href} href={link.href} onClick={() => setShowingNavigationDropdown(false)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Icon className="h-5 w-5" />{link.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}</Link>; })}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pb-3 pt-4 px-4 bg-slate-50 dark:bg-slate-950">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar user={user} small />
                            <div>
                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {/* Profile Settings visible for all users */}
                            <ResponsiveNavLink className="hover:bg-slate-100/70 dark:hover:bg-slate-800/70" href={route('profile.edit')}>
                                Profile Settings
                            </ResponsiveNavLink>
                            <ResponsiveNavLink className="hover:bg-slate-100/70 dark:hover:bg-slate-800/70" method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT AREA ===== */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950">
                    {/* ===== TOP HEADER BAR (Clean, Light) ===== */}
                    <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-lg font-bold text-slate-800">
                            {/* Empty - no header text displayed */}
                        </div>

                        <div className="flex items-center gap-3">
                            <ThemeToggle dark={darkMode} toggle={() => setDarkMode((value) => !value)} />
                            <NotificationBell />
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                                    >
                                        <Avatar user={user} small />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                                        <svg
                                            className="h-4 w-4 text-slate-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content align="right" width="48">
                                    {/* Profile Settings visible for all users */}
                                    <Dropdown.Link className="text-slate-700 hover:bg-slate-100/70 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100" href={route('profile.edit')}>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link className="text-slate-700 hover:bg-slate-100/70 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100" href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>

                    {/* ===== PAGE HEADER (Supports JSX) ===== */}
                    {header && typeof header !== 'string' && (
                        <div className="px-4 pt-5 pb-2 sm:px-6 md:px-8 md:pt-7">
                            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-900 dark:text-white">
                                {header}
                            </div>
                        </div>
                    )}

                    {/* ===== MAIN BODY ===== */}
                    <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
