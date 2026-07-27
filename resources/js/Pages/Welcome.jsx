import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [activeRoleTab, setActiveRoleTab] = useState('student');
    const [openFaq, setOpenFaq] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Enhanced Array of falling emoji particles across all screen width bands
    const particles = [
        { emoji: '🍃', left: '3%', duration: '12s', delay: '0s', size: '16px' },
        { emoji: '🛸', left: '8%', duration: '18s', delay: '3s', size: '20px' },
        { emoji: '✏️', left: '14%', duration: '15s', delay: '2s', size: '18px' },
        { emoji: '👾', left: '20%', duration: '14s', delay: '5s', size: '22px' },
        { emoji: '🍂', left: '26%', duration: '11s', delay: '4s', size: '16px' },
        { emoji: '🏀', left: '32%', duration: '16s', delay: '1s', size: '22px' },
        { emoji: '📏', left: '38%', duration: '13s', delay: '6s', size: '18px' },
        { emoji: '🎮', left: '44%', duration: '17s', delay: '2s', size: '20px' },
        { emoji: '🍃', left: '50%', duration: '12s', delay: '0.5s', size: '16px' },
        { emoji: '⚽', left: '56%', duration: '15s', delay: '7s', size: '22px' },
        { emoji: '🎨', left: '62%', duration: '16s', delay: '3s', size: '18px' },
        { emoji: '👾', left: '68%', duration: '13s', delay: '1.5s', size: '20px' },
        { emoji: '🎒', left: '74%', duration: '14s', delay: '4.5s', size: '20px' },
        { emoji: '🛸', left: '80%', duration: '19s', delay: '2s', size: '22px' },
        { emoji: '📚', left: '86%', duration: '15s', delay: '0s', size: '18px' },
        { emoji: '🎮', left: '91%', duration: '12s', delay: '5s', size: '20px' },
        { emoji: '⚽', left: '96%', duration: '16s', delay: '3.5s', size: '22px' },
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <>
            <Head title="Welcome to StudyNest" />

            {/* Custom Animations: Floating Elements & Falling Leaves/Supplies */}
            <style>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    scroll-behavior: smooth;
                }
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
                        transform: translateY(-50px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(105vh) rotate(360deg);
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
                    position: fixed;
                    top: -40px;
                    animation-name: fallAndRotate;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                }
            `}</style>

            <div className="min-h-screen bg-[#FFFDF9] text-[#2D3748] font-sans selection:bg-[#FFD166] selection:text-[#1E293B] relative">

                {/* ========================================================= */}
                {/* 100% STICKY TOP NAVIGATION BAR                            */}
                {/* ========================================================= */}
                <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

                        {/* Brand Logo & Name */}
                        <a href="#home" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-9 sm:h-12 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                            />
                            <div>
                                <span className="text-base sm:text-xl font-black tracking-tight text-slate-800 block">
                                    StudyNest
                                </span>
                                <span className="-mt-1 block text-[8px] sm:text-[10px] font-black text-[#FF6B6B] tracking-wider uppercase">
                                    Key Stage 2 LMS
                                </span>
                            </div>
                        </a>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8 font-bold text-xs sm:text-sm text-slate-600">
                            <a href="#home" className="hover:text-[#FF6B6B] transition duration-200">Home</a>
                            <a href="#about" className="hover:text-[#FF6B6B] transition duration-200">About</a>
                            <a href="#features" className="hover:text-[#FF6B6B] transition duration-200">Features</a>
                            <a href="#roles" className="hover:text-[#FF6B6B] transition duration-200">Portals</a>
                            <a href="#faq" className="hover:text-[#FF6B6B] transition duration-200">FAQ</a>
                            <a href="#get-started" className="hover:text-[#FF6B6B] transition duration-200">Get Started</a>
                        </div>

                        {/* Auth Navigation Action & Mobile Menu Toggle Button */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-[#FF6B6B] hover:bg-[#FF5252] px-4 sm:px-6 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/40 active:scale-95"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-full bg-[#4ECDC4] hover:bg-[#3DB2A9] px-4 sm:px-6 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/40 active:scale-95 flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" /></svg>
                                    Log in
                                </Link>
                            )}

                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                type="button"
                                className="inline-flex lg:hidden items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Dropdown Navigation Menu */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 font-bold text-sm text-slate-700 shadow-lg">
                            <a
                                href="#home"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                Home
                            </a>
                            <a
                                href="#about"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                About
                            </a>
                            <a
                                href="#features"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                Features
                            </a>
                            <a
                                href="#roles"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                Portals
                            </a>
                            <a
                                href="#faq"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                FAQ
                            </a>
                            <a
                                href="#get-started"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#FF6B6B] transition"
                            >
                                Get Started
                            </a>
                        </div>
                    )}
                </header>

                {/* ========================================================= */}
                {/* GLOBAL FALLING OBJECTS                                    */}
                {/* ========================================================= */}
                <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden" aria-hidden="true">
                    {particles.map((p, idx) => (
                        <span
                            key={idx}
                            className="animate-falling-particle opacity-70"
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
                {/* FLOATING SIDE DECORATIONS                                 */}
                {/* ========================================================= */}

                {/* Top-Left: Boy Jumping */}
                <div className="absolute top-28 left-2 sm:left-4 md:left-8 lg:left-12 z-20 pointer-events-none animate-float-1">
                    <img
                        src="/storage/images/boyJumping.png"
                        alt="Boy Jumping"
                        className="w-14 sm:w-20 md:w-32 lg:w-44 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* Mid-Right: Phone */}
                <div className="absolute top-84 right-2 sm:right-4 md:right-8 lg:right-12 z-20 pointer-events-none animate-float-2">
                    <img
                        src="/storage/images/phone.png"
                        alt="Phone"
                        className="w-12 sm:w-18 md:w-28 lg:w-36 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* Lower-Left: School Supplies */}
                <div className="absolute top-[48rem] sm:top-[42rem] lg:top-[38rem] left-2 sm:left-4 md:left-8 lg:left-10 z-20 pointer-events-none animate-float-3">
                    <img
                        src="/storage/images/schoolMaterial.png"
                        alt="School Material"
                        className="w-12 sm:w-18 md:w-28 lg:w-36 h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* ========================================================= */}
                {/* HERO SECTION                                              */}
                {/* ========================================================= */}
                <section id="home" className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden z-10 pt-4">

                    {/* Bright Background Image Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/storage/images/studynestBG.png"
                            alt="StudyNest Background"
                            className="w-full h-full object-cover object-bottom opacity-80"
                        />
                        {/* Soft white top & bottom gradient masks for readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-[#FFFDF9]"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                        {/* HERO MAIN CONTENT */}
                        <main className="mt-6 sm:mt-10 lg:mt-14 pb-12 sm:pb-20">
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
                </section>

                {/* ========================================================= */}
                {/* ABOUT & PROBLEM STATEMENT SECTION                         */}
                {/* ========================================================= */}
                <section id="about" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#E0F2F1] text-xs font-black text-[#009688] uppercase tracking-widest border border-[#B2DFDB]">
                            System Overview
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-800">
                            Transforming Classroom Learning
                        </h2>
                        <div className="h-1.5 w-16 bg-[#FF6B6B] mx-auto rounded-full"></div>
                        <p className="text-slate-600 text-xs sm:text-base font-medium leading-relaxed">
                            StudyNest bridges traditional elementary education and modern digital learning by giving teachers, students, and school leaders a unified platform designed specifically for public elementary school workflows.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {/* Problem Card */}
                        <div className="bg-rose-50/80 rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-rose-500 text-white rounded-2xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-rose-900">Traditional Challenges</h3>
                            </div>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Paper-based assignments easily lost, damaged, or misplaced.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Limited access to learning resources outside of regular school hours.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Manual tracking of academic progress and classroom performance.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Inconsistent academic updates and student-teacher messaging channels.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solution Card */}
                        <div className="bg-emerald-50/80 rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-emerald-900">The StudyNest Solution</h3>
                            </div>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>Centralized digital lesson distribution and instant file accessibility.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>Automated quiz evaluation with instant score feedback for learners.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>Gamified literacy and numeracy activities to increase classroom engagement.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>Role-Based Access Control (RBAC) ensuring secure, LRN-tailored portals.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ========================================================= */}
                {/* CORE FEATURES SECTION                                     */}
                {/* ========================================================= */}
                <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s1.5 0 1.5 1.5v1.5c0 1.5-1.5 1.5-1.5 1.5H9m0-4.5v4.5m0-4.5h3m-3 9.75h1.5s1.5 0 1.5 1.5v1.5c0 1.5-1.5 1.5-1.5 1.5H9m0-4.5v4.5m0-4.5h3" /></svg>
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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" /></svg>
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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
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
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-800">
                                Progress Tracking
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                Calculates mathematical aggregates instantly for continuous evaluation modules and performance distributions.
                            </p>
                        </div>

                    </div>
                </section>

                {/* ========================================================= */}
                {/* INTERACTIVE ROLE-BASED PORTALS SECTION                    */}
                {/* ========================================================= */}
                <section id="roles" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                    <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#F3E5F5] text-xs font-black text-[#9C27B0] uppercase tracking-widest border border-[#E1BEE7]">
                            Role-Based Portals
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                            Tailored For Every User
                        </h2>
                        <div className="h-1.5 w-14 bg-[#9C27B0] mx-auto rounded-full"></div>
                    </div>

                    {/* Tab Selection */}
                    <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                        <button
                            onClick={() => setActiveRoleTab('student')}
                            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                                activeRoleTab === 'student'
                                    ? 'bg-[#4ECDC4] text-white shadow-md scale-105'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Students (Grades 4-6)
                        </button>
                        <button
                            onClick={() => setActiveRoleTab('teacher')}
                            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                                activeRoleTab === 'teacher'
                                    ? 'bg-[#FF9800] text-white shadow-md scale-105'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Teachers
                        </button>
                        <button
                            onClick={() => setActiveRoleTab('principal')}
                            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                                activeRoleTab === 'principal'
                                    ? 'bg-[#9C27B0] text-white shadow-md scale-105'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Principal
                        </button>
                    </div>

                    {/* Role Content Display */}
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-amber-100 shadow-xl max-w-4xl mx-auto">
                        {activeRoleTab === 'student' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#E0F2F1] text-[#009688] rounded-2xl">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 01-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Student Access Portal</h3>
                                        <p className="text-xs text-slate-500 font-bold">Log in using Learner Reference Number (LRN)</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📖 My Lessons & Learning Materials</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📝 Digital Assignment Submissions</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">⚡ Interactive Quizzes & Automated Scoring</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">🎮 Literacy & Numeracy Educational Games</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📢 Class Bulletins & Teacher Messages</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📊 Self-Monitoring Academic Progress Tracker</div>
                                </div>
                            </div>
                        )}

                        {activeRoleTab === 'teacher' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#FFF3E0] text-[#FF9800] rounded-2xl">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Teacher Management Portal</h3>
                                        <p className="text-xs text-slate-500 font-bold">Assigned Grade-Level Management Scope</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📚 Lesson & Module Creation</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📄 Assignment Review & Submission Grading</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">🎯 Online Quiz Maker & Automated Scoring</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">🕹️ Assign Educational Learning Games</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">💬 Direct Academic Messaging with Students</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📈 Class Performance Reports Generation</div>
                                </div>
                            </div>
                        )}

                        {activeRoleTab === 'principal' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-[#F3E5F5] text-[#9C27B0] rounded-2xl">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5s1.5 0 1.5 1.5v1.5c0 1.5-1.5 1.5-1.5 1.5H9m0-4.5v4.5m0-4.5h3m-3 9.75h1.5s1.5 0 1.5 1.5v1.5c0 1.5-1.5 1.5-1.5 1.5H9m0-4.5v4.5m0-4.5h3" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Principal Administrative Panel</h3>
                                        <p className="text-xs text-slate-500 font-bold">School-wide System Control & Monitoring</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">👥 Teacher & Student User Account Management</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">🏫 Teacher Grade-Level Assignment Matrix</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📊 School-Wide Academic Reports & Summaries</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📢 Global School Announcements Creation</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">🔒 Access Control & System Permissions</div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">📈 Continuous Audit & System Monitoring</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ========================================================= */}
                {/* FREQUENTLY ASKED QUESTIONS SECTION (ACCORDION)            */}
                {/* ========================================================= */}
                <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                    <div className="text-center space-y-2 mb-10">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-blue-100 text-xs font-black text-blue-800 uppercase tracking-widest border border-blue-200">
                            Got Questions?
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                            Frequently Asked Questions
                        </h2>
                        <div className="h-1.5 w-14 bg-blue-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Who can use the StudyNest platform?',
                                a: 'StudyNest is specifically tailored for Grades 4, 5, and 6 (Key Stage 2) elementary students, teachers, and school administrators of Ilijan Sur Elementary School.'
                            },
                            {
                                q: 'How do students log into their accounts?',
                                a: 'Students log in using their 12-digit Learner Reference Number (LRN) provided by the school administration.'
                            },
                            {
                                q: 'Does StudyNest support offline or paper-based learning?',
                                a: 'Yes! StudyNest supports both digital assignment submissions and manual tracking for physical paper-based classroom activities.'
                            },
                            {
                                q: 'Can teachers track student quiz results automatically?',
                                a: 'Yes, quizzes created within the platform feature automated scoring and instant grade recording for teacher review.'
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border-2 border-slate-200/80 overflow-hidden shadow-xs">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full text-left p-4 sm:p-5 font-extrabold text-xs sm:text-base text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                                >
                                    <span>{faq.q}</span>
                                    <svg className={`w-5 h-5 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-[#FF6B6B]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                                {openFaq === idx && (
                                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/50">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ========================================================= */}
                {/* ENHANCED GET STARTED SECTION                              */}
                {/* ========================================================= */}
                <section id="get-started" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="animate-float-1 bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFD166] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-4 border-amber-200/40">
                        {/* Background Decorative Glow Effect */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                        <div className="space-y-2 max-w-2xl relative z-10">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight drop-shadow-sm">
                                Ready to start learning?
                            </h2>
                            <p className="text-xs sm:text-sm font-bold text-white/95 leading-relaxed drop-shadow-xs">
                                Ilijan Sur Elementary School • Empowering the next generation through digital innovation.
                            </p>
                        </div>
                        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
                            {!auth?.user && (
                                <Link
                                    href={route('login')}
                                    className="rounded-full bg-white text-[#FF6B6B] hover:bg-amber-50 px-8 py-3.5 text-xs sm:text-sm font-black shadow-xl hover:shadow-2xl transition duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
                                >
                                    Log In Now
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

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
