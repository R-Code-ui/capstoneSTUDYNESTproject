import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="h-screen max-h-screen w-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col justify-between relative overflow-hidden select-none">

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

            {/* Falling Leaves & School Elements Mix */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <span className="fall-item f-1 text-2xl">🍂</span>
                <span className="fall-item f-2 text-xl">✏️</span>
                <span className="fall-item f-3 text-2xl">🍃</span>
                <span className="fall-item f-4 text-xl">📐</span>
                <span className="fall-item f-5 text-2xl">🌿</span>
                <span className="fall-item f-6 text-xl">🎒</span>
                <span className="fall-item f-7 text-2xl">🍁</span>
                <span className="fall-item f-8 text-xl">📚</span>
                <span className="fall-item f-9 text-2xl">🍂</span>
                <span className="fall-item f-10 text-xl">🎨</span>
                <span className="fall-item f-11 text-2xl">🍃</span>
            </div>

            {/* Background Soft Glow Accents */}
            <div className="absolute -top-24 -left-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#4ECDC4]/15 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 bg-[#FF6B6B]/15 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Side Character Illustrations (Hidden on Mobile, Visible on Desktop) */}
            <div className="hidden lg:block absolute left-4 xl:left-8 bottom-6 z-0 pointer-events-none animate-float-slow">
                <img
                    src="/storage/images/boyJumping.png"
                    alt="Happy Student"
                    className="w-36 xl:w-48 h-auto object-contain drop-shadow-md"
                />
            </div>

            <div className="hidden lg:block absolute right-4 xl:right-8 bottom-6 z-0 pointer-events-none animate-float-bounce">
                <img
                    src="/storage/images/boyBasketball.png"
                    alt="Active Student"
                    className="w-36 xl:w-48 h-auto object-contain drop-shadow-md"
                />
            </div>

            {/* Main Center Box */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-4 sm:px-6">

                {/* Central Card Container */}
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all duration-300">

                    {/* Header Banner */}
                    <div className="bg-gradient-to-b from-[#FFFDF9] to-white px-6 pt-5 pb-3 text-center border-b border-slate-100 flex flex-col items-center">
                        <Link href="/" className="transition transform hover:scale-105 inline-block">
                            <img
                                src="/storage/images/studynestLogo.png"
                                alt="StudyNest Logo"
                                className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                            />
                        </Link>
                        <h2 className="mt-1.5 text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-[11px] sm:text-xs font-bold text-[#FF6B6B] tracking-wider uppercase mt-1 bg-[#FF6B6B]/10 px-3 py-0.5 rounded-full inline-block">
                            StudyNest Management Portal
                        </p>
                    </div>

                    {/* Dynamic Form Children */}
                    <div className="p-5 sm:p-6 bg-white">
                        {children}
                    </div>
                </div>

                {/* Footer Tagline */}
                <div className="mt-4 text-center text-slate-500 text-[11px] sm:text-xs font-semibold tracking-wider uppercase">
                    Ilijan Sur Elementary School
                </div>
            </div>
        </div>
    );
}
