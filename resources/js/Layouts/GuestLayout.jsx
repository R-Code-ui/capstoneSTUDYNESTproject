import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#22486A] via-[#1a344d] to-[#3A3A3B] p-4 sm:p-6 relative overflow-hidden">

            {/* Soft Ambient Background Light Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5EC4D2]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10 border border-white/10">
                {/* Brand Showcase Header Block */}
                <div className="bg-gradient-to-b from-neutral-50 to-white px-8 pt-8 pb-4 text-center border-b border-neutral-50 flex flex-col items-center">
                    <Link href="/" className="transition duration-300 transform hover:scale-105 inline-block">
                        <img
                            src="/storage/images/studynestLogo.png"
                            alt="StudyNest Logo"
                            className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(94,196,210,0.15)]"
                        />
                    </Link>
                    <h2 className="mt-3 text-2xl font-black text-[#434343] tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-xs font-semibold text-[#1C56A6] tracking-wider uppercase mt-1">
                        StudyNest Management Portal
                    </p>
                </div>

                {/* Managed Form Segment Container */}
                <div className="px-8 py-6 bg-white">
                    {children}
                </div>
            </div>

            <div className="mt-6 text-center text-white/40 text-[11px] font-medium tracking-wider uppercase">
                Ilijan Sur Elementary School
            </div>
        </div>
    );
}
