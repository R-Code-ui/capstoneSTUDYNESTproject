import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getGameArt } from './gameArt';

export default function GameShell({ title, description, roundLabel, onExit, children }) {
    const art = getGameArt(title);

    return (
        <div className="student-game-shell w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
                <button
                    type="button"
                    onClick={onExit}
                    className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:-translate-x-0.5 hover:bg-white hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Exit
                </button>
                {roundLabel && (
                    <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-extrabold text-indigo-700">
                        {roundLabel}
                    </span>
                )}
            </div>

            <div className="student-game-surface touch-manipulation relative isolate flex min-h-[60vh] flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-[0_20px_60px_rgba(79,70,229,0.16)] backdrop-blur sm:p-6 md:p-8 lg:min-h-[68vh] lg:p-10">
                <div className="pointer-events-none absolute -left-16 -top-16 -z-10 h-48 w-48 rounded-full bg-fuchsia-100/70 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-12 -z-10 h-56 w-56 rounded-full bg-cyan-100/80 blur-2xl" />
                <div className={`pointer-events-none absolute -right-16 -top-16 -z-10 h-44 w-44 rounded-full bg-gradient-to-br ${art.theme} opacity-10`} aria-hidden="true" />
                <span className="pointer-events-none absolute right-5 top-3 -z-10 text-7xl opacity-10 sm:right-10 sm:text-8xl" aria-hidden="true">{art.icon}</span>
                <div className="mb-2 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${art.theme} px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm`}>
                        <span aria-hidden="true">{art.icon}</span>
                        {art.label}
                    </span>
                </div>
                <h2 className="mb-1 text-center text-xl font-black tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                    {title}
                </h2>
                {description && (
                    <p className="mx-auto mb-5 max-w-2xl text-center text-sm font-medium leading-relaxed text-slate-500 sm:mb-7 sm:text-base lg:mb-8">
                        {description}
                    </p>
                )}
                <div className="flex-1 flex flex-col justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
