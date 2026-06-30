import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome to StudyNest" />
            <div className="min-h-screen bg-white text-[#434343] font-sans selection:bg-[#5EC4D2] selection:text-[#22486A]">

                {/* --- HERO BRAND GRADIENT BANNER --- */}
                <div className="bg-gradient-to-br from-[#22486A] via-[#1a344d] to-[#3A3A3B] text-white rounded-b-[40px] px-6 lg:px-16 pb-24 relative overflow-hidden">

                    {/* Abstract Decorative Palette Vector Rings */}
                    <div className="absolute inset-0 -z-0 opacity-10 pointer-events-none">
                        <svg className="absolute -left-20 top-0 max-w-[877px]" viewBox="0 0 877 877" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="438.5" cy="438.5" r="438.5" fill="#5EC4D2" stroke="#5EC4D2" strokeWidth="2" />
                        </svg>
                        <svg className="absolute -bottom-40 -right-40 max-w-[600px]" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="300" cy="300" r="300" fill="#7DD3E1" stroke="#7DD3E1" strokeWidth="1" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto">
                        {/* ===== HEADER ===== */}
                        <header className="flex items-center justify-between py-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/storage/images/studynestLogo.png"
                                    alt="StudyNest Logo"
                                    className="h-12 w-auto object-contain drop-shadow"
                                />
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#5EC4D2] to-white bg-clip-text text-transparent">
                                        StudyNest
                                    </h1>
                                    <p className="-mt-0.5 text-xs font-semibold text-[#7DD3E1] tracking-wide uppercase">
                                        Learning Management System
                                    </p>
                                </div>
                            </div>

                            <nav className="flex items-center gap-4">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-[#5EC4D2] px-6 py-2.5 text-sm font-bold text-[#22486A] shadow-lg shadow-cyan-950/20 transition duration-200 hover:bg-[#7DD3E1] focus:outline-none focus:ring-2 focus:ring-[#5EC4D2] focus:ring-offset-2 focus:ring-offset-[#22486A]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-full bg-[#5EC4D2] px-6 py-2.5 text-sm font-bold text-[#22486A] shadow-lg shadow-cyan-950/20 transition duration-200 hover:bg-[#7DD3E1] focus:outline-none focus:ring-2 focus:ring-[#5EC4D2] focus:ring-offset-2 focus:ring-offset-[#22486A]"
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
                                    {/* Left Side: Specific Capstone Title & Info */}
                                    <div className="lg:w-1/2 space-y-6">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-[#1C56A6]/30 px-4 py-1.5 text-xs font-bold text-[#7DD3E1] uppercase tracking-wider border border-[#1C56A6]/50">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5EC4D2] opacity-75"></span>
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5EC4D2]"></span>
                                            </span>
                                            Key Stage 2 (Grades 4-6)
                                        </div>

                                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight uppercase">
                                            <span className="block bg-gradient-to-r from-[#5EC4D2] via-white to-[#7DD3E1] bg-clip-text text-transparent font-black mb-2">
                                                STUDYNEST:
                                            </span>
                                            <span className="block text-neutral-100 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-normal normal-case leading-relaxed">
                                                A Simplified Learning Management System for Key Stage 2 Learners of Ilijan Sur Elementary School
                                            </span>
                                        </h1>

                                        <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
                                            Empowering teachers and elementary students with intuitive tools to manage lessons, track academic milestones, complete assignments, and engage in modern digital learning.
                                        </p>

                                        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                                            {!auth?.user && (
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-full bg-[#5EC4D2] px-8 py-3.5 text-base font-bold text-[#22486A] shadow-xl shadow-cyan-950/40 transition duration-200 hover:bg-[#7DD3E1]"
                                                >
                                                    Get Started
                                                </Link>
                                            )}
                                            <a
                                                href="#features"
                                                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white transition duration-200 hover:text-[#5EC4D2] group"
                                            >
                                                Learn More
                                                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right Side: Enhanced, Large Logo Display */}
                                    <div className="mt-14 lg:mt-0 lg:w-1/2 flex justify-center items-center">
                                        <div className="relative w-full max-w-md px-4">
                                            {/* Glowing Background Blur Effect behind the logo */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#5EC4D2]/20 rounded-full blur-3xl -z-10"></div>

                                            {/* Clean Frame holding the big showcase logo */}
                                            <div className="rounded-[2.5rem] bg-gradient-to-b from-[#3A3A3B]/40 to-transparent p-12 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center justify-center transition duration-500 hover:border-[#5EC4D2]/30 group">
                                                <img
                                                    src="/storage/images/studynestLogo.png"
                                                    alt="StudyNest Main Logo"
                                                    className="w-full max-w-[280px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(94,196,210,0.25)] transform transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            {/* Elegant layout depth accent */}
                                            <div className="absolute -bottom-4 -right-2 -z-10 h-full w-full rounded-[2.5rem] bg-[#22486A]/30 blur-md"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== FEATURES SECTION ===== */}
                            <div id="features" className="mt-32 pt-12">
                                <div className="text-center max-w-xl mx-auto space-y-2">
                                    <span className="text-xs font-bold text-[#1C56A6] uppercase tracking-widest">Core Features</span>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                                        System Capabilities
                                    </h2>
                                    <div className="h-1 w-12 bg-[#5EC4D2] mx-auto rounded-full mt-3"></div>
                                    <p className="text-neutral-500 text-sm">
                                        Tailored feature sets ensuring a focused and responsive workflow environment.
                                    </p>
                                </div>

                                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Feature 1 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-6 4h3" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            For Teachers
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Create lessons, assignments, quizzes, and games. Monitor student progress and participation flags seamlessly.
                                        </p>
                                    </div>

                                    {/* Feature 2 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m9 5l9-5M9 20l-3-3m0 0l-3 3m3-3V8" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            For Students
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Access lessons, submit assignments, take interactive quizzes, play educational games, and track custom badges.
                                        </p>
                                    </div>

                                    {/* Feature 3 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            For Principals
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Manage administrative users, audit teacher operational timelines, inspect generated metrics, and target global system bulletins.
                                        </p>
                                    </div>

                                    {/* Feature 4 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            Role-Based Access
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Secure, high-integrity gateways filtering explicit parameters for LRN credentials, Teacher IDs, or Principal keys.
                                        </p>
                                    </div>

                                    {/* Feature 5 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            Mobile Friendly
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Fluid, responsive client views adaptable down to mid-tier mobile displays, tablets, or classic lab workstations.
                                        </p>
                                    </div>

                                    {/* Feature 6 */}
                                    <div className="group rounded-3xl bg-neutral-50 p-8 border border-neutral-100 transition duration-300 hover:bg-white hover:shadow-xl hover:border-transparent">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1C56A6] shadow-sm border border-neutral-100 group-hover:bg-[#1C56A6] group-hover:text-white transition duration-300">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">
                                            Progress Tracking
                                        </h3>
                                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                                            Calculates mathematical aggregates instantly for continuous evaluation modules and performance distributions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* ===== FOOTER ===== */}
                        <footer className="mt-32 border-t border-neutral-200 py-12 text-center text-neutral-500">
                            <p className="text-sm font-semibold text-neutral-700">
                                © {new Date().getFullYear()} StudyNest — Learning Management System
                            </p>
                            <p className="mt-1 text-xs text-neutral-400">
                                Ilijan Sur Elementary School • Key Stage 2 Learners
                            </p>
                            <div className="mt-6 inline-flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100 text-[11px] font-mono text-neutral-400">
                                <span>Laravel v{laravelVersion}</span>
                                <span className="text-neutral-200">•</span>
                                <span>PHP v{phpVersion}</span>
                            </div>
                        </footer>
                    </div>
                </div>

            </div>
        </>
    );
}
