import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome to StudyNest" />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <svg
                        className="absolute -left-20 top-0 max-w-[877px] opacity-30"
                        viewBox="0 0 877 877"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="438.5" cy="438.5" r="438.5" fill="#3B82F6" opacity="0.05" />
                    </svg>
                    <svg
                        className="absolute -bottom-40 -right-40 max-w-[600px] opacity-20"
                        viewBox="0 0 600 600"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="300" cy="300" r="300" fill="#10B981" opacity="0.05" />
                    </svg>
                </div>

                <div className="relative flex min-h-screen flex-col items-center">
                    <div className="relative w-full max-w-7xl px-6 py-6">
                        {/* ===== HEADER ===== */}
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                                    <svg
                                        className="h-7 w-7"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        StudyNest
                                    </h1>
                                    <p className="-mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        Learning Management System
                                    </p>
                                </div>
                            </div>

                            <nav className="flex items-center gap-4">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </nav>
                        </header>

                        {/* ===== MAIN CONTENT ===== */}
                        <main className="mt-12 lg:mt-20">
                            {/* Hero Section */}
                            <div className="text-center lg:text-left">
                                <div className="lg:flex lg:items-center lg:gap-16">
                                    <div className="lg:w-1/2">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                            </span>
                                            Grades 4 - 6
                                        </div>

                                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                                            <span className="block">Welcome to</span>
                                            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                                StudyNest
                                            </span>
                                        </h1>

                                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                                            A Learning Management and Academic Monitoring System
                                            for Elementary Education.
                                        </p>

                                        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                                            Manage lessons, assignments, quizzes, games,
                                            announcements, and academic progress — all in one place.
                                        </p>

                                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                                            {!auth?.user && (
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
                                                >
                                                    Get Started
                                                </Link>
                                            )}
                                            <a
                                                href="#features"
                                                className="rounded-lg px-6 py-3 text-base font-medium text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                                            >
                                                Learn More →
                                            </a>
                                        </div>
                                    </div>

                                    <div className="mt-12 lg:mt-0 lg:w-1/2">
                                        <div className="relative">
                                            <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                                                        <div className="text-3xl font-bold text-blue-600">📚</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Lessons</p>
                                                    </div>
                                                    <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                                                        <div className="text-3xl font-bold text-green-600">📝</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Assignments</p>
                                                    </div>
                                                    <div className="rounded-xl bg-purple-50 p-4 text-center dark:bg-purple-900/20">
                                                        <div className="text-3xl font-bold text-purple-600">📊</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Quizzes</p>
                                                    </div>
                                                    <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-900/20">
                                                        <div className="text-3xl font-bold text-orange-600">🎮</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Games</p>
                                                    </div>
                                                    <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
                                                        <div className="text-3xl font-bold text-red-600">📢</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Announcements</p>
                                                    </div>
                                                    <div className="rounded-xl bg-indigo-50 p-4 text-center dark:bg-indigo-900/20">
                                                        <div className="text-3xl font-bold text-indigo-600">📈</div>
                                                        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-blue-100/50 dark:bg-blue-900/20"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== FEATURES SECTION ===== */}
                            <div id="features" className="mt-20">
                                <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                                    Why StudyNest?
                                </h2>
                                <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                                    Everything you need for a digital classroom experience.
                                </p>

                                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Feature 1 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">👨‍🏫</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            For Teachers
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Create lessons, assignments, quizzes, and games.
                                            Monitor student progress and participation.
                                        </p>
                                    </div>

                                    {/* Feature 2 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">🧑‍🎓</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            For Students
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Access lessons, submit assignments, take quizzes,
                                            play educational games, and track your progress.
                                        </p>
                                    </div>

                                    {/* Feature 3 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">🏫</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            For Principals
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Manage users, monitor teacher activities,
                                            view reports, and publish school announcements.
                                        </p>
                                    </div>

                                    {/* Feature 4 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">🔐</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Role-Based Access
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Secure login with LRN, Teacher ID, or Principal ID.
                                            Access only what you need.
                                        </p>
                                    </div>

                                    {/* Feature 5 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">📱</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Mobile Friendly
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Access StudyNest from smartphones, tablets,
                                            laptops, and desktop computers.
                                        </p>
                                    </div>

                                    {/* Feature 6 */}
                                    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-4 text-4xl">📊</div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Progress Tracking
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Monitor student performance with automatic
                                            progress calculations and reports.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* ===== FOOTER ===== */}
                        <footer className="mt-20 border-t border-gray-200 py-8 text-center dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                © {new Date().getFullYear()} StudyNest — Learning Management System
                            </p>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                For Elementary Education • Grades 4, 5, and 6
                            </p>
                            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                Laravel v{laravelVersion} • PHP v{phpVersion}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
