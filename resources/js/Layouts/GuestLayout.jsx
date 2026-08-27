import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function GuestLayout({ children, heading = 'Welcome Back!' }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('studynest-theme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('studynest-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <div className="studynest-auth relative flex h-dvh min-h-dvh max-h-dvh w-full items-center justify-center overflow-hidden px-4 py-3 font-sans text-slate-900 sm:px-6 sm:py-6 lg:px-8">

            {/* GPU-Accelerated CSS Keyframes for Performance */}
            <style>{`
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(3deg); }
                }
                @keyframes floatBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes itemFall {
                    0% { transform: translate3d(0, -30px, 0) rotate(0deg); opacity: 0; }
                    15% { opacity: 0.75; }
                    85% { opacity: 0.75; }
                    100% { transform: translate3d(25px, 105vh, 0) rotate(360deg); opacity: 0; }
                }

                .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
                .animate-float-bounce { animation: floatBounce 4s ease-in-out infinite; }

                /* GPU Acceleration for silky smooth 60fps frame rates */
                .fall-item {
                    position: absolute;
                    top: -40px;
                    pointer-events: none;
                    will-change: transform, opacity;
                    animation-name: itemFall;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }

                /* Staggered Timings & Screen Positions */
                .f-1  { left: 3%;  animation-duration: 11s; animation-delay: 0s; }
                .f-2  { left: 11%; animation-duration: 14s; animation-delay: 3s; }
                .f-3  { left: 20%; animation-duration: 10s; animation-delay: 6s; }
                .f-4  { left: 29%; animation-duration: 13s; animation-delay: 1.5s; }
                .f-5  { left: 38%; animation-duration: 12s; animation-delay: 8s; }
                .f-6  { left: 48%; animation-duration: 15s; animation-delay: 4s; }
                .f-7  { left: 57%; animation-duration: 9s;  animation-delay: 0.5s; }
                .f-8  { left: 66%; animation-duration: 13s; animation-delay: 7s; }
                .f-9  { left: 75%; animation-duration: 11s; animation-delay: 2s; }
                .f-10 { left: 84%; animation-duration: 14s; animation-delay: 5s; }
                .f-11 { left: 93%; animation-duration: 10s; animation-delay: 9s; }
            `}</style>

            <style>{`
                .studynest-auth {
                    font-family: Figtree, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    background: #f8fafc;
                }
                .studynest-auth .auth-background {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    background-image: url('/storage/images/studynestbackgroundschool.jpeg');
                    background-size: cover;
                    background-position: center;
                }
                .studynest-auth .auth-background::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgb(2 6 23 / 0.88), rgb(15 23 42 / 0.74));
                }
                .studynest-auth .auth-card {
                    background: rgb(255 255 255 / 0.88);
                    border-color: rgb(255 255 255 / 0.72);
                    box-shadow: 0 25px 70px rgb(15 23 42 / 0.24);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                }
                .studynest-auth .auth-panel { background: rgb(255 255 255 / 0.46); }
                .dark .studynest-auth { background: #020617; color: #f8fafc; }
                .dark .studynest-auth .auth-background::after {
                    background: linear-gradient(135deg, rgb(2 6 23 / 0.88), rgb(15 23 42 / 0.74));
                }
                .dark .studynest-auth .auth-card {
                    background: rgb(15 23 42 / 0.76);
                    border-color: rgb(148 163 184 / 0.28);
                    box-shadow: 0 25px 70px rgb(2 6 23 / 0.55);
                }
                .dark .studynest-auth .auth-panel { background: rgb(15 23 42 / 0.42); }
                .studynest-auth .auth-card [class~="text-slate-800"],
                .studynest-auth .auth-card [class~="text-slate-700"],
                .studynest-auth .auth-card [class~="text-gray-700"],
                .studynest-auth .auth-card [class~="text-gray-800"] { color: #1e293b; }
                .dark .studynest-auth [class~="text-slate-800"],
                .dark .studynest-auth [class~="text-slate-700"],
                .dark .studynest-auth [class~="text-gray-700"],
                .dark .studynest-auth [class~="text-gray-800"] { color: #f8fafc; }
                .dark .studynest-auth [class~="text-slate-600"],
                .dark .studynest-auth [class~="text-slate-500"],
                .dark .studynest-auth [class~="text-gray-400"] { color: #cbd5e1; }
                .studynest-auth input {
                    border-radius: 9999px;
                    background-color: rgb(255 255 255 / 0.86);
                    color: #1e293b;
                    border-color: rgb(148 163 184 / 0.65);
                }
                .studynest-auth input::placeholder { color: rgb(100 116 139 / 0.85); }
                .studynest-auth input:focus {
                    background-color: rgb(255 255 255 / 0.98) !important;
                    border-color: rgb(37 99 235 / 0.75) !important;
                    box-shadow: 0 0 0 3px rgb(37 99 235 / 0.14) !important;
                    outline: none !important;
                }
                .dark .studynest-auth input {
                    background-color: rgb(2 6 23 / 0.58);
                    color: #f8fafc;
                    border-color: rgb(148 163 184 / 0.45);
                }
                .dark .studynest-auth input::placeholder { color: #94a3b8; }
                .dark .studynest-auth input:focus {
                    background-color: rgb(2 6 23 / 0.58) !important;
                    border-color: rgb(148 163 184 / 0.45) !important;
                }
                .dark .studynest-auth [class~="bg-[#E0F2F1]"],
                .dark .studynest-auth [class~="bg-[#FFF3E0]"],
                .dark .studynest-auth [class~="bg-[#F3E5F5]"],
                .dark .studynest-auth [class~="bg-emerald-50"] {
                    background-color: rgb(30 41 59 / 0.78);
                    border-color: rgb(96 165 250 / 0.35);
                }
                .dark .studynest-auth [class~="border-slate-100"] { border-color: rgb(148 163 184 / 0.25); }
                .dark .studynest-auth [class~="text-emerald-700"] { color: #86efac; }
            `}</style>

            <div className="auth-background" aria-hidden="true" />

            <button
                type="button"
                onClick={() => setIsDarkMode((previous) => !previous)}
                className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/75 text-slate-700 shadow-lg backdrop-blur-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/70 dark:border-slate-500/50 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
                {isDarkMode ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
            </button>

            {/* Main Center Box */}
            <main className="relative z-10 flex max-h-full w-full items-center justify-center py-2 sm:py-6">

                {/* Central Card Container */}
                <div className="auth-card w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl">

                    {/* Header Banner */}
                    <div className="auth-panel flex flex-col items-center border-b border-white/30 px-6 pb-5 pt-7 text-center sm:px-8">
                        <Link href="/" className="transition transform hover:scale-105 inline-block">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                            />
                        </Link>
                        <p className="mt-2 text-sm font-bold tracking-[0.18em] text-slate-800 dark:text-white">
                            StudyNest
                        </p>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
                            {heading}
                        </h2>
                    </div>

                    {/* Dynamic Form Children */}
                    <div className="auth-panel p-5 sm:p-8">
                        {children}
                    </div>
                </div>

            </main>
        </div>
    );
}
