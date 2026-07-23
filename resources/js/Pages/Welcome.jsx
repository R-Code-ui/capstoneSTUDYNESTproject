import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    // Array of gentle falling emoji background particles
    const particles = [
        { emoji: '🍃', left: '5%', duration: '12s', delay: '0s', size: '14px' },
        { emoji: '✏️', left: '15%', duration: '15s', delay: '2s', size: '16px' },
        { emoji: '🍂', left: '28%', duration: '11s', delay: '4s', size: '14px' },
        { emoji: '📏', left: '42%', duration: '14s', delay: '1s', size: '15px' },
        { emoji: '🍃', left: '55%', duration: '13s', delay: '5s', size: '14px' },
        { emoji: '🎨', left: '68%', duration: '16s', delay: '3s', size: '16px' },
        { emoji: '🎒', left: '80%', duration: '12s', delay: '0.5s', size: '16px' },
        { emoji: '📚', left: '92%', duration: '14s', delay: '2.5s', size: '15px' },
    ];

    return (
        <>
            <Head title="Welcome to StudyNest" />

            {/* Custom Animations: Floating Elements & Falling Leaves/Supplies */}
            <style>{`
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(10px); }
                }
                @keyframes fallAndRotate {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.7;
                    }
                    90% {
                        opacity: 0.7;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                .animate-float-1 {
                    animation: floatSlow 4s ease-in-out infinite;
                }
                .animate-float-2 {
                    animation: floatReverse 4.5s ease-in-out infinite;
                }
                .animate-float-3 {
                    animation: floatSlow 5s ease-in-out infinite;
                }
                .animate-falling-particle {
                    position: absolute;
                    top: -30px;
                    animation-name: fallAndRotate;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    pointer-events: none;
                    user-select: none;
                }
            `}</style>

            <div className="min-h-screen bg-[#FFFDF9] text-[#2D3748] font-sans selection:bg-[#FFD166] selection:text-[#1E293B] relative overflow-x-hidden">

                {/* ========================================================= */}
                {/* BACKGROUND FALLING LEAVES & SCHOOL SUPPLIES (EMOJIS)      */}
                {/* ========================================================= */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                    {particles.map((p, idx) => (
                        <span
                            key={idx}
                            className="animate-falling-particle opacity-60"
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

                {/* ========================================================= */}
                {/* FLOATING SIDE DECORATIONS (Responsive & Animated)         */}
                {/* ========================================================= */}

                {/* Top-Left: Boy Jumping */}
                <div className="absolute top-24 left-2 sm:left-4 md:left-8 lg:left-12 z-20 pointer-events-none animate-float-1">
                    <img
                        src="/storage/images/boyJumping.png"
                        alt="Boy Jumping"
                        className="w-14 sm:w-20 md:w-32 lg:w-44 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* Mid-Right: Phone */}
                <div className="absolute top-80 right-2 sm:right-4 md:right-8 lg:right-12 z-20 pointer-events-none animate-float-2">
                    <img
                        src="/storage/images/phone.png"
                        alt="Phone"
                        className="w-12 sm:w-18 md:w-28 lg:w-36 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* Lower-Left: School Supplies */}
                <div className="absolute top-[46rem] sm:top-[40rem] lg:top-[36rem] left-2 sm:left-4 md:left-8 lg:left-10 z-20 pointer-events-none animate-float-3">
                    <img
                        src="/storage/images/schoolMaterial.png"
                        alt="School Material"
                        className="w-12 sm:w-18 md:w-28 lg:w-36 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* ========================================================= */}
                {/* HERO SECTION WITH BRIGHT BACKGROUND & NAVIGATION          */}
                {/* ========================================================= */}
                <div className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden z-10">

                    {/* Bright Background Image Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/storage/images/studynestBG.png"
                            alt="StudyNest Background"
                            className="w-full h-full object-cover object-bottom opacity-80"
                        />
                        {/* Soft white top & bottom gradient masks for supreme readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-[#FFFDF9]"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                        {/* ===== HEADER / NAVBAR ===== */}
                        <header className="flex items-center justify-between py-4 sm:py-6 border-b border-slate-200/60 backdrop-blur-md rounded-b-2xl bg-white/60 px-4 shadow-xs">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                    src="/storage/images/studynestLogo.png"
                                    alt="StudyNest Logo"
                                    className="h-10 sm:h-14 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                                />
                                <div>
                                    <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-800 drop-shadow-xs">
                                        StudyNest
                                    </h1>
                                    <p className="-mt-1 text-[9px] sm:text-xs font-black text-[#FF6B6B] tracking-wider uppercase">
                                        Learning Management System
                                    </p>
                                </div>
                            </div>

                            <nav className="flex items-center gap-2 sm:gap-3">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-[#FF6B6B] hover:bg-[#FF5252] px-4 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/40 active:scale-95"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="rounded-full bg-[#4ECDC4] hover:bg-[#3DB2A9] px-4 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/40 active:scale-95"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </nav>
                        </header>

                        {/* ===== HERO MAIN CONTENT ===== */}
                        <main className="mt-8 sm:mt-12 lg:mt-16 pb-12 sm:pb-20">
                            <div className="text-center lg:text-left">
                                <div className="lg:flex lg:items-center lg:gap-10">

                                    {/* Left Text Box (Colorful White Glass Card) */}
                                    <div className="lg:w-7/12 space-y-4 sm:space-y-6 bg-white/95 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-3xl shadow-xl border-4 border-amber-100 relative z-10">

                                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE66D]/90 px-3.5 py-1 text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider border border-[#FFD166]">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6B6B] opacity-75"></span>
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6B6B]"></span>
                                            </span>
                                            Key Stage 2 (Grades 4-6)
                                        </div>

                                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight uppercase text-slate-800">
                                            <span className="block text-[#FF6B6B] font-black mb-1">
                                                STUDYNEST:
                                            </span>
                                            <span className="block text-slate-800 text-sm sm:text-xl lg:text-2xl font-bold tracking-normal normal-case leading-snug">
                                                A Simplified Learning Management System for Key Stage 2 Learners of Ilijan Sur Elementary School
                                            </span>
                                        </h1>

                                        <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-medium">
                                            Empowering teachers and elementary students with intuitive tools to manage lessons, track academic milestones, complete assignments, and engage in modern digital learning.
                                        </p>

                                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
                                            {!auth?.user && (
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-full bg-[#FF6B6B] hover:bg-[#FF5252] px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg transition duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/30"
                                                >
                                                    Get Started
                                                </Link>
                                            )}
                                            <a
                                                href="#features"
                                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 transition duration-200 group border border-slate-200 active:scale-95"
                                            >
                                                Learn More
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition duration-200 text-[#4ECDC4]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right Side Showcase Display */}
                                    <div className="mt-8 lg:mt-0 lg:w-5/12 flex justify-center items-center">
                                        <div className="relative w-full max-w-xs sm:max-w-sm px-4">
                                            {/* Vibrant Background Glow Accent */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-[#4ECDC4]/30 rounded-full blur-2xl -z-10"></div>

                                            {/* Showcase Frame */}
                                            <div className="rounded-3xl bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md border-4 border-[#FFD166] flex items-center justify-center transition duration-300 hover:scale-105 group">
                                                <img
                                                    src="/storage/images/studynestLogo.png"
                                                    alt="StudyNest Main Logo"
                                                    className="w-full max-w-[170px] sm:max-w-[220px] h-auto object-contain drop-shadow-md transform transition duration-300 group-hover:rotate-2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </main>
                    </div>

                    {/* Decorative Wave Divider Bottom */}
                    <div className="w-full overflow-hidden leading-none z-10">
                        <svg className="relative block w-full h-10 sm:h-16 text-[#FFFDF9]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* FEATURES SECTION (Colorful Pastel Cards)                  */}
                {/* ========================================================= */}
                <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#FFE66D] text-xs font-black text-slate-800 uppercase tracking-widest border border-[#FFD166]">
                            Core Features
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                            System Capabilities
                        </h2>
                        <div className="h-1.5 w-14 bg-[#4ECDC4] mx-auto rounded-full"></div>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            Tailored feature sets ensuring a focused and responsive workflow environment.
                        </p>
                    </div>

                    <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {/* Feature 1 - Pastel Orange */}
                        <div className="group rounded-3xl bg-[#FFF3E0] p-6 sm:p-7 border-2 border-[#FFE0B2] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#FF9800] shadow-sm border border-[#FFE0B2] group-hover:bg-[#FF9800] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-6 4h3" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                For Teachers
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Create lessons, assignments, quizzes, and games. Monitor student progress and participation flags seamlessly.
                            </p>
                        </div>

                        {/* Feature 2 - Pastel Teal */}
                        <div className="group rounded-3xl bg-[#E0F2F1] p-6 sm:p-7 border-2 border-[#B2DFDB] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#009688] shadow-sm border border-[#B2DFDB] group-hover:bg-[#009688] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6L3 9m9 5l9-5M9 20l-3-3m0 0l-3 3m3-3V8" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                For Students
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Access lessons, submit assignments, take interactive quizzes, play educational games, and track custom badges.
                            </p>
                        </div>

                        {/* Feature 3 - Pastel Purple */}
                        <div className="group rounded-3xl bg-[#F3E5F5] p-6 sm:p-7 border-2 border-[#E1BEE7] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#9C27B0] shadow-sm border border-[#E1BEE7] group-hover:bg-[#9C27B0] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                For Principals
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Manage administrative users, audit teacher operational timelines, inspect generated metrics, and target global system bulletins.
                            </p>
                        </div>

                        {/* Feature 4 - Pastel Blue */}
                        <div className="group rounded-3xl bg-[#E3F2FD] p-6 sm:p-7 border-2 border-[#BBDEFB] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#2196F3] shadow-sm border border-[#BBDEFB] group-hover:bg-[#2196F3] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                Role-Based Access
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Secure, high-integrity gateways filtering explicit parameters for LRN credentials, Teacher IDs, or Principal keys.
                            </p>
                        </div>

                        {/* Feature 5 - Pastel Pink */}
                        <div className="group rounded-3xl bg-[#FCE4EC] p-6 sm:p-7 border-2 border-[#F8BBD0] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#E91E63] shadow-sm border border-[#F8BBD0] group-hover:bg-[#E91E63] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                Mobile Friendly
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Fluid, responsive client views adaptable down to mid-tier mobile displays, tablets, or classic lab workstations.
                            </p>
                        </div>

                        {/* Feature 6 - Pastel Yellow */}
                        <div className="group rounded-3xl bg-[#FFFDE7] p-6 sm:p-7 border-2 border-[#FFF59D] transition duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">
                            <div className="mb-4 flex h-11 sm:h-13 w-11 sm:w-13 items-center justify-center rounded-2xl bg-white text-[#FBC02D] shadow-sm border border-[#FFF59D] group-hover:bg-[#FBC02D] group-hover:text-white transition duration-300">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                Progress Tracking
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Calculates mathematical aggregates instantly for continuous evaluation modules and performance distributions.
                            </p>
                        </div>

                    </div>
                </div>

                {/* ========================================================= */}
                {/* FOOTER                                                    */}
                {/* ========================================================= */}
                <footer className="relative z-10 mt-12 sm:mt-20 border-t border-slate-200/80 bg-white py-8 text-center text-slate-500">
                    <div className="max-w-7xl mx-auto px-4">
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                            © {new Date().getFullYear()} StudyNest — Learning Management System
                        </p>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-medium">
                            Ilijan Sur Elementary School • Key Stage 2 Learners
                        </p>
                        <div className="mt-4 inline-flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200/80 text-[11px] font-mono text-slate-500">
                            <span>Laravel v{laravelVersion}</span>
                            <span className="text-slate-300">•</span>
                            <span>PHP v{phpVersion}</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
