import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showToast, setShowToast] = useState(!!flash?.message);

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

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard' });
            if (users) links.push({ href: users, label: 'User Management' });
            if (teachers) links.push({ href: teachers, label: 'Teacher Monitoring' });
            if (announcements) links.push({ href: announcements, label: 'Announcements' });
            if (reports) links.push({ href: reports, label: 'Reports' });
            if (logs) links.push({ href: logs, label: 'Activity Logs' });
        } else if (userRole === 'teacher') {
            const dashboard = safeRoute('teacher.dashboard');
            const lessons = safeRoute('teacher.lessons.index');
            const assignments = safeRoute('teacher.assignments.index');
            const quizzes = safeRoute('teacher.quizzes.index');
            const games = safeRoute('teacher.games.index');
            const announcements = safeRoute('teacher.announcements.index');
            const messages = safeRoute('teacher.messages.index');
            const progress = safeRoute('teacher.progress.index');
            const reports = safeRoute('teacher.reports.index');

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard' });
            if (lessons) links.push({ href: lessons, label: 'Lessons' });
            if (assignments) links.push({ href: assignments, label: 'Assignments' });
            if (quizzes) links.push({ href: quizzes, label: 'Quizzes' });
            if (games) links.push({ href: games, label: 'Games' });
            if (announcements) links.push({ href: announcements, label: 'Announcements' });
            if (messages) links.push({ href: messages, label: 'Messages' });
            if (progress) links.push({ href: progress, label: 'Progress' });
            if (reports) links.push({ href: reports, label: 'Reports' });
        } else if (userRole === 'student') {
            const dashboard = safeRoute('student.dashboard');
            const lessons = safeRoute('student.lessons.index');
            const assignments = safeRoute('student.assignments.index');
            const quizzes = safeRoute('student.quizzes.index');
            const games = safeRoute('student.games.index');
            const announcements = safeRoute('student.announcements.index');
            const messages = safeRoute('student.messages.index');
            const progress = safeRoute('student.progress.index');

            if (dashboard) links.push({ href: dashboard, label: 'Dashboard' });
            if (lessons) links.push({ href: lessons, label: 'Lessons' });
            if (assignments) links.push({ href: assignments, label: 'Assignments' });
            if (quizzes) links.push({ href: quizzes, label: 'Quizzes' });
            if (games) links.push({ href: games, label: 'Games' });
            if (announcements) links.push({ href: announcements, label: 'Announcements' });
            if (messages) links.push({ href: messages, label: 'Messages' });
            if (progress) links.push({ href: progress, label: 'Progress' });
        }

        return links;
    };

    const navLinks = getNavLinks();

    return (
        <>
            {/* Toast Notification */}
            {flash?.message && showToast && (
                <Toast
                    message={flash.message}
                    type={flash.type || 'success'}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col md:flex-row">

                {/* ===== DESKTOP SIDEBAR (Clean White) ===== */}
                <aside className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col bg-white border-r border-slate-200 shadow-sm z-20">
                    {/* Brand Logo Header */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-200">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-8 w-auto object-contain"
                            />
                            <span className="font-bold text-base tracking-wide text-slate-800">STUDYNEST</span>
                        </Link>
                    </div>

                    {/* Sidebar Navigation */}
                    <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4">
                        <nav className="space-y-1">
                            <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                Menu
                            </div>
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.href}
                                    href={link.href}
                                    active={route().current(
                                        link.href
                                            .replace(/^.*\/[a-z]+\//, '')
                                            .split('/')[0] || ''
                                    )}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* ===== MOBILE TOPBAR ===== */}
                <div className="md:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-slate-200 shadow-sm z-30">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/storage/images/studynestLogo.png"
                            alt="StudyNest Logo"
                            className="h-7 w-auto object-contain"
                        />
                        <span className="font-bold text-sm tracking-wide text-slate-800">STUDYNEST</span>
                    </Link>

                    <button
                        onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
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

                {/* ===== MOBILE NAVIGATION DRAWER ===== */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden bg-white border-b border-slate-200 z-30'}>
                    <div className="space-y-1 px-3 pb-3 pt-2">
                        {navLinks.map((link) => (
                            <ResponsiveNavLink
                                key={link.href}
                                href={link.href}
                                active={route().current(
                                    link.href
                                        .replace(/^.*\/[a-z]+\//, '')
                                        .split('/')[0] || ''
                                )}
                            >
                                {link.label}
                            </ResponsiveNavLink>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 pb-3 pt-4 px-4 bg-slate-50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile Settings
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {/* ===== MAIN CONTENT AREA ===== */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden bg-slate-50">
                    {/* ===== TOP HEADER BAR (Clean, Light) ===== */}
                    <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm">
                        {/* 🔧 FIX: Removed the header text entirely - no "Dashboard" text here */}
                        <div className="text-lg font-bold text-slate-800">
                            {/* Empty - no header text displayed */}
                        </div>

                        <div className="flex items-center gap-4">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{user.name}</span>
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
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>

                    {/* ===== PAGE HEADER (Supports JSX) ===== */}
                    {header && typeof header !== 'string' && (
                        <div className="px-6 pt-6 pb-2">
                            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-800">
                                {header}
                            </div>
                        </div>
                    )}

                    {/* ===== MAIN BODY ===== */}
                    <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
