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
            if (dashboard) links.push({ href: dashboard, label: 'Dashboard' });
            // Add other student routes when they exist
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

            {/* Main Premium Layout Wrapper */}
            <div className="min-h-screen bg-[#1E2530] font-sans antialiased text-gray-100 flex flex-col md:flex-row">

                {/* DESKTOP SIDEBAR (Hidden on mobile) */}
                <aside className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col bg-[#22486A] border-r border-white/5 shadow-2xl z-20">
                    {/* Sidebar Brand Logo Wrapper */}
                    <div className="h-20 flex items-center px-6 bg-[#1A3752] border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(94,196,210,0.3)] transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-wider text-white group-hover:text-[#5EC4D2] transition-colors duration-200">STUDYNEST</span>
                                <span className="text-[10px] font-semibold text-[#7DD3E1]/70 tracking-widest uppercase">{userRole || 'Academic'} Portal</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Container */}
                    <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 space-y-8">
                        <nav className="space-y-1.5">
                            <div className="px-3 mb-2 text-[11px] font-bold tracking-widest text-[#7DD3E1]/50 uppercase">
                                Core Navigation
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

                        {/* Footer Profile Control Block */}
                        <div className="pt-4 border-t border-[#1A3752]">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1A3752]/60 hover:bg-[#1A3752] border border-white/5 transition-all duration-200 group text-left"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded-lg bg-[#5EC4D2] text-[#22486A] flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="truncate flex flex-col">
                                                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                                                <span className="text-[10px] text-[#7DD3E1]/70 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                        <svg
                                            className="h-4 w-4 text-[#7DD3E1]/60 group-hover:text-[#5EC4D2] transition-colors ml-2 shrink-0"
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

                                <Dropdown.Content align="left" width="48" contentClasses="py-1 bg-[#22486A] border border-white/5 shadow-xl rounded-xl">
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </aside>

                {/* MOBILE HEADER RESPONSIVE TOGGLES */}
                <div className="md:hidden flex h-16 items-center justify-between px-4 bg-[#22486A] border-b border-white/5 shadow-md z-30">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/storage/images/studynestLogo.png"
                            alt="StudyNest Logo"
                            className="h-8 w-auto object-contain"
                        />
                        <span className="font-bold text-sm tracking-wider text-white">STUDYNEST</span>
                    </Link>

                    <button
                        onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-[#7DD3E1] hover:bg-[#1A3752] hover:text-[#5EC4D2] focus:outline-none transition-all duration-200"
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

                {/* MOBILE EXPANDED DROPDOWN DRAWER */}
                <div className={(showingNavigationDropdown ? 'block animate-fadeIn' : 'hidden') + ' md:hidden bg-[#1A3752] border-b border-white/5 z-30'}>
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

                    <div className="border-t border-[#22486A] pb-3 pt-4 px-4 bg-[#142B41]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-lg bg-[#5EC4D2] text-[#22486A] flex items-center justify-center font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">{user.name}</div>
                                <div className="text-xs text-[#7DD3E1]/70">{user.email}</div>
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

                {/* RIGHT SIDE MAIN DASHBOARD PORTAL SCROLLBOX */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
                    {header && (
                        <header className="sticky top-0 z-10 px-6 pt-6 pb-2">
                            <div className="mx-auto max-w-7xl">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                                    {header}
                                </h1>
                            </div>
                        </header>
                    )}

                    <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
