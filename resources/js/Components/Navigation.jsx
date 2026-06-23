import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

export default function Navigation({ user }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const userRole = user?.roles?.[0]?.name || null;

    // Get role-based navigation links
    const getNavLinks = () => {
        const links = [];

        if (userRole === 'principal') {
            links.push(
                { href: route('principal.dashboard'), label: 'Dashboard' },
                { href: '#', label: 'User Management' },
                { href: '#', label: 'Teacher Monitoring' },
                { href: '#', label: 'Announcements' },
                { href: '#', label: 'Reports' },
                { href: '#', label: 'Activity Logs' },
            );
        } else if (userRole === 'teacher') {
            links.push(
                { href: route('teacher.dashboard'), label: 'Dashboard' },
                { href: route('teacher.lessons.index'), label: 'Lessons' },
                { href: route('teacher.assignments.index'), label: 'Assignments' },
                { href: route('teacher.quizzes.index'), label: 'Quizzes' },
                { href: route('teacher.games.index'), label: 'Games' },
                { href: route('teacher.announcements.index'), label: 'Announcements' },
                { href: route('teacher.messages.index'), label: 'Messages' },
                { href: route('teacher.progress.index'), label: 'Progress' },
                { href: route('teacher.reports.index'), label: 'Reports' },
            );
        } else if (userRole === 'student') {
            links.push(
                { href: route('student.dashboard'), label: 'Dashboard' },
                { href: route('student.lessons.index'), label: 'Lessons' },
                { href: route('student.assignments.index'), label: 'Assignments' },
                { href: route('student.quizzes.index'), label: 'Quizzes' },
                { href: route('student.games.index'), label: 'Games' },
                { href: route('student.announcements.index'), label: 'Announcements' },
                { href: route('student.messages.index'), label: 'Messages' },
                { href: route('student.progress.index'), label: 'Progress' },
            );
        }

        return links;
    };

    const navLinks = getNavLinks();

    return (
        <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    {/* Logo */}
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
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
                        </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="hidden sm:ms-6 sm:flex sm:items-center">
                        <div className="relative ms-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            {user.name}
                                            <svg
                                                className="-me-0.5 ms-2 h-4 w-4"
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
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="-me-2 flex items-center sm:hidden">
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    (previousState) => !previousState,
                                )
                            }
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                <div className="space-y-1 pb-3 pt-2">
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

                <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-700">
                    <div className="px-4">
                        <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                            {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {user.email}
                        </div>
                    </div>
                    <div className="mt-3 space-y-1">
                        <ResponsiveNavLink href={route('profile.edit')}>
                            Profile
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            method="post"
                            href={route('logout')}
                            as="button"
                        >
                            Log Out
                        </ResponsiveNavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
}
