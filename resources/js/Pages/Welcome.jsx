import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AcademicCapIcon,
    BookOpenIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    DocumentTextIcon,
    MegaphoneIcon,
    MoonIcon,
    PuzzlePieceIcon,
    SunIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [activeRoleTab, setActiveRoleTab] = useState('student');
    const [openFaq, setOpenFaq] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('studynest-theme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('studynest-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

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

                /* Modern UI theme: clean blue-and-slate styling without external packages */
                [class~="bg-[#FFFDF9]"] {
                    background-color: #f8fafc;
                }
                [class~="text-[#2D3748]"] {
                    color: #0f172a;
                }
                [class~="bg-[#FF6B6B]"],
                [class~="bg-[#4ECDC4]"] {
                    background-color: #2563eb;
                }
                [class~="hover:bg-[#FF5252]"]:hover,
                [class~="hover:bg-[#3DB2A9]"]:hover {
                    background-color: #1d4ed8;
                }
                [class~="text-[#FF6B6B]"],
                [class~="text-[#009688]"],
                [class~="text-[#FF9800]"],
                [class~="text-[#9C27B0]"] {
                    color: #2563eb;
                }
                [class~="hover:text-[#FF6B6B]"]:hover {
                    color: #1d4ed8;
                }
                [class~="border-amber-100"],
                [class~="border-[#B2DFDB]"],
                [class~="border-[#E1BEE7]"],
                [class~="border-[#F8BBD0]"],
                [class~="border-[#FFF59D]"],
                [class~="border-[#BBDEFB]"] {
                    border-color: #dbeafe;
                }
                [class*="from-[#FF6B6B]"] {
                    --tw-gradient-from: #2563eb var(--tw-gradient-from-position);
                }
                [class*="via-[#FF8E53]"] {
                    --tw-gradient-to: rgb(96 165 250 / 0) var(--tw-gradient-to-position);
                    --tw-gradient-stops: var(--tw-gradient-from), #60a5fa var(--tw-gradient-via-position), var(--tw-gradient-to);
                }
                [class*="to-[#FFD166]"] {
                    --tw-gradient-to: #93c5fd var(--tw-gradient-to-position);
                }
                [class~="bg-[#FFE66D]"] {
                    background-color: #dbeafe;
                }
                [class~="bg-[#FFFDE7]"] {
                    background-color: #eff6ff;
                }
                [class~="text-[#FBC02D]"],
                [class~="bg-[#FBC02D]"],
                [class~="border-[#FFD166]"] {
                    color: #2563eb;
                    border-color: #bfdbfe;
                }
                [class~="bg-[#FBC02D]"] {
                    background-color: #2563eb;
                }
                [class~="bg-[#E0F2F1]"],
                [class~="bg-[#FFF3E0]"],
                [class~="bg-[#F3E5F5]"] {
                    background-color: #eff6ff;
                }
                [class~="bg-blue-100"] {
                    background-color: #dbeafe;
                }
                [class~="text-blue-800"] {
                    color: #1e40af;
                }
                [class~="bg-blue-500"] {
                    background-color: #2563eb;
                }
                [class~="border-blue-200"] {
                    border-color: #bfdbfe;
                }
                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        scroll-behavior: auto !important;
                    }
                }
                .studynest-page {
                    font-family: Figtree, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }
                .studynest-hero { isolation: isolate; }
                .studynest-hero::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    border: 1px solid rgb(255 255 255 / 0.16);
                    border-radius: 2rem;
                    pointer-events: none;
                }
                .studynest-card {
                    transition: transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease;
                }
                .studynest-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 45px rgb(15 23 42 / 0.10);
                    border-color: rgb(37 99 235 / 0.35);
                }
                [class~="bg-rose-50/80"],
                [class~="bg-emerald-50/80"],
                [class~="bg-[#FFF3E0]"],
                [class~="bg-[#E0F2F1]"],
                [class~="bg-[#F3E5F5]"],
                [class~="bg-[#E3F2FD]"],
                [class~="bg-[#FCE4EC]"],
                [class~="bg-[#FFFDE7]"] {
                    background-color: #ffffff;
                }
                [class~="border-rose-200"],
                [class~="border-emerald-200"],
                [class~="border-[#FFE0B2]"],
                [class~="border-[#B2DFDB]"],
                [class~="border-[#E1BEE7]"],
                [class~="border-[#BBDEFB]"],
                [class~="border-[#F8BBD0]"],
                [class~="border-[#FFF59D]"] {
                    border-color: #e2e8f0;
                }
                [class~="bg-rose-500"],
                [class~="bg-emerald-500"],
                [class~="bg-[#FF9800]"],
                [class~="bg-[#009688]"],
                [class~="bg-[#9C27B0]"],
                [class~="bg-[#2196F3]"],
                [class~="bg-[#E91E63]"],
                [class~="bg-[#FBC02D]"] {
                    background-color: #2563eb;
                }
                [class~="text-rose-900"],
                [class~="text-emerald-900"],
                [class~="text-rose-500"],
                [class~="text-emerald-600"],
                [class~="text-[#FF9800]"],
                [class~="text-[#009688]"],
                [class~="text-[#9C27B0]"],
                [class~="text-[#2196F3]"],
                [class~="text-[#E91E63]"],
                [class~="text-[#FBC02D]"] {
                    color: #2563eb;
                }
                .dark .studynest-page {
                    background-color: #0f172a;
                    color: #e2e8f0;
                }
                .dark .studynest-page [class~="bg-white"],
                .dark .studynest-page [class~="bg-white/90"],
                .dark .studynest-page [class~="bg-white/95"],
                .dark .studynest-page [class~="bg-slate-50"],
                .dark .studynest-page [class~="bg-slate-50/50"],
                .dark .studynest-page [class~="bg-slate-100"] {
                    background-color: #111827;
                }
                .dark .studynest-page [class~="bg-slate-950"] {
                    background-color: #020617;
                }
                .dark .studynest-page [class~="bg-rose-50/80"],
                .dark .studynest-page [class~="bg-emerald-50/80"],
                .dark .studynest-page [class~="bg-[#FFF3E0]"],
                .dark .studynest-page [class~="bg-[#E0F2F1]"],
                .dark .studynest-page [class~="bg-[#F3E5F5]"],
                .dark .studynest-page [class~="bg-[#E3F2FD]"],
                .dark .studynest-page [class~="bg-[#FCE4EC]"],
                .dark .studynest-page [class~="bg-[#FFFDE7]"] {
                    background-color: #1e293b;
                }
                .dark .studynest-page [class~="text-slate-900"],
                .dark .studynest-page [class~="text-slate-800"],
                .dark .studynest-page [class~="text-slate-700"] {
                    color: #f8fafc;
                }
                .dark .studynest-page [class~="text-rose-900"],
                .dark .studynest-page [class~="text-emerald-900"] {
                    color: #f8fafc;
                }
                .dark .studynest-page [class~="text-slate-600"],
                .dark .studynest-page [class~="text-slate-500"],
                .dark .studynest-page [class~="text-slate-400"] {
                    color: #cbd5e1;
                }
                .dark .studynest-page [class~="border-slate-100"],
                .dark .studynest-page [class~="border-slate-200"],
                .dark .studynest-page [class~="border-slate-200/80"],
                .dark .studynest-page [class~="border-white"] {
                    border-color: #334155;
                }
                .dark .studynest-page [class~="border-amber-100"],
                .dark .studynest-page [class~="border-rose-200"],
                .dark .studynest-page [class~="border-emerald-200"],
                .dark .studynest-page [class~="border-[#FFE0B2]"],
                .dark .studynest-page [class~="border-[#B2DFDB]"],
                .dark .studynest-page [class~="border-[#E1BEE7]"],
                .dark .studynest-page [class~="border-[#BBDEFB]"],
                .dark .studynest-page [class~="border-[#F8BBD0]"],
                .dark .studynest-page [class~="border-[#FFF59D]"],
                .dark .studynest-page [class~="border-blue-200"] {
                    border-color: #334155;
                }
                .dark .studynest-page [class~="border-white/20"],
                .dark .studynest-page [class~="border-white/25"] {
                    border-color: rgb(148 163 184 / 0.28);
                }
                .dark .studynest-page [class~="bg-blue-100"],
                .dark .studynest-page [class~="bg-[#FFE66D]"] {
                    background-color: #1e3a8a;
                }
                .dark .studynest-page [class~="bg-[#FFFDE7]"] {
                    background-color: #1e293b;
                }
                .dark .studynest-page [class~="text-blue-800"] {
                    color: #bfdbfe;
                }
                .dark .studynest-page [class~="hover:bg-slate-50"]:hover,
                .dark .studynest-page [class~="hover:bg-slate-100"]:hover {
                    background-color: #1e293b;
                }
            `}</style>

            <div className="studynest-page relative min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-950">

                {/* ========================================================= */}
                {/* 100% STICKY TOP NAVIGATION BAR                            */}
                {/* ========================================================= */}
                <header className={`fixed left-1/2 top-6 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 overflow-hidden border border-white bg-white/90 shadow-lg shadow-slate-900/10 backdrop-blur-xl ${isMobileMenuOpen ? 'rounded-3xl' : 'rounded-full'}`}>
                    <nav className="px-4 sm:px-6 lg:px-8 h-16 sm:h-[4.5rem] flex items-center justify-between">

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
                            <button
                                type="button"
                                onClick={() => setIsDarkMode((previous) => !previous)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                                title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                            >
                                {isDarkMode ? (
                                    <SunIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <MoonIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
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
                                className={`inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] ${isMobileMenuOpen ? 'bg-[#4ECDC4]/15 text-[#168f87]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                aria-expanded={isMobileMenuOpen}
                                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
                        <div className="lg:hidden border-t border-slate-200 bg-white/95 px-4 pb-4 pt-3 font-bold text-sm text-slate-700">
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
                {/* HERO SECTION                                              */}
                {/* ========================================================= */}
                <section id="home" className="studynest-hero relative w-full max-w-none mx-0 mt-0 min-h-screen flex flex-col justify-center overflow-hidden rounded-none z-10 scroll-mt-24">

                    {/* School background with a dark overlay for readable text */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/storage/images/studynestbackgroundschool.jpeg"
                            alt="Ilijan Sur Elementary School"
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/55 to-blue-950/70"></div>
                        <div className="absolute inset-0 bg-slate-950/20"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                        {/* HERO MAIN CONTENT */}
                        <main className="mt-6 sm:mt-10 lg:mt-14 pb-12 sm:pb-20">
                            <div className="text-center lg:text-left text-white">
                                <div className="lg:flex lg:items-center lg:gap-10">

                                    {/* Left Text Box (Colorful White Glass Card) */}
                    <div className="lg:w-7/12 space-y-4 sm:space-y-6 bg-slate-950/25 backdrop-blur-sm p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10">

                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider border border-white/25">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-300 opacity-75"></span>
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400"></span>
                                            </span>
                                            Key Stage 2 (Grades 4-6)
                                        </div>

                                        <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-tight uppercase text-white">
                                            <span className="block text-blue-300 font-black mb-1">
                                                STUDYNEST:
                                            </span>
                                            <span className="block text-white text-sm sm:text-xl lg:text-2xl font-bold tracking-normal normal-case leading-snug">
                                                A Simplified Learning Management System for Key Stage 2 Learners of Ilijan Sur Elementary School
                                            </span>
                                        </h1>

                                        <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed font-medium">
                                            Empowering teachers and elementary students with intuitive tools to manage lessons, track academic milestones, complete assignments, and engage in modern digital learning.
                                        </p>

                                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
                                            {!auth?.user && (
                                                <Link
                                                    href={route('login')}
                                                    className="rounded-full bg-blue-600 hover:bg-blue-500 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-blue-950/30 transition duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300/40"
                                                >
                                                    Get Started
                                                </Link>
                                            )}
                                            <a
                                                href="#features"
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition duration-200 group border border-white/25 active:scale-95"
                                            >
                                                Learn More
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition duration-200 text-blue-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right Side Showcase Display */}
                                    <div className="mt-8 lg:mt-0 lg:w-5/12 flex justify-center items-center">
                                        <div className="relative w-full max-w-xs sm:max-w-sm px-4">
                                            {/* Vibrant Background Glow Accent */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-blue-400/30 rounded-full blur-2xl -z-10"></div>

                                            {/* Showcase Frame */}
                                            <div className="rounded-3xl bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md border border-white flex items-center justify-center transition duration-300 hover:scale-105 group">
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
                                    <span>Role-Based Access Control (RBAC) ensuring secure, role-tailored portals.</span>
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
                                Secure, high-integrity gateways protecting school-issued account credentials and role-specific access keys.
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
                                         <p className="text-xs text-slate-500 font-bold">Log in using the student account credentials provided by the school</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><BookOpenIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>My Lessons & Learning Materials</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><DocumentTextIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Digital Assignment Submissions</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><AcademicCapIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Interactive Quizzes & Automated Scoring</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><PuzzlePieceIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Literacy & Numeracy Educational Games</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><MegaphoneIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Class Bulletins & Teacher Messages</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><ChartBarIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Self-Monitoring Academic Progress Tracker</span></div>
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
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><BookOpenIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Lesson & Module Creation</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><DocumentTextIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Assignment Review & Submission Grading</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><AcademicCapIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Online Quiz Maker & Automated Scoring</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><PuzzlePieceIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Assign Educational Learning Games</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><ChatBubbleLeftIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Direct Academic Messaging with Students</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><ChartBarIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Class Performance Reports Generation</span></div>
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
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><UserGroupIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Teacher & Student User Account Management</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><BuildingOfficeIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Teacher Grade-Level Assignment Matrix</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><ChartBarIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>School-Wide Academic Reports & Summaries</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><MegaphoneIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Global School Announcements Creation</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><UserGroupIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Access Control & System Permissions</span></div>
                                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2"><ChartBarIcon className="h-5 w-5 shrink-0 text-blue-600" /> <span>Continuous Audit & System Monitoring</span></div>
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
                                 a: 'Students log in using the school-issued student account credentials provided by the school administration.'
                            },
                            {
                                q: 'Does StudyNest support offline or paper-based learning?',
                                a: 'Yes! StudyNest supports both digital assignment submissions and manual tracking for physical paper-based classroom activities.'
                            },
                             {
                                 q: 'Can teachers track student quiz results automatically?',
                                 a: 'Yes, quizzes created within the platform feature automated scoring and instant grade recording for teacher review.'
                             },
                             {
                                 q: 'What devices can students use to access StudyNest?',
                                 a: 'StudyNest works on modern phones, tablets, laptops, and desktop computers with an internet browser.'
                             },
                             {
                                 q: 'How does StudyNest protect user access?',
                                 a: 'Each role has its own protected portal, and access is limited according to the permissions assigned by the school.'
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
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-400/40">
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
                                    className="rounded-full bg-white text-blue-700 hover:bg-blue-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 px-8 py-3.5 text-xs sm:text-sm font-black shadow-xl hover:shadow-2xl transition duration-300 hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
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
                <footer className="relative z-10 mt-12 sm:mt-20 border-t border-blue-500/30 bg-slate-950 py-8 text-center text-slate-400">
                    <div className="max-w-7xl mx-auto px-4">
                        <p className="text-xs sm:text-sm font-bold text-white">
                            © {new Date().getFullYear()} StudyNest — Learning Management System
                        </p>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-medium">
                            Ilijan Sur Elementary School • Key Stage 2 Learners
                        </p>
                        <div className="mt-4 inline-flex items-center gap-3 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700 text-[11px] font-mono text-slate-400">
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
