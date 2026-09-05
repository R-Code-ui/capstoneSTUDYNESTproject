import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';
import {
    BookOpenIcon,
    CalculatorIcon,
    StarIcon,
    CheckCircleIcon,
    HeartIcon,
    ArrowPathIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
};

export default function GamesResults({ result, game, can_play_again }) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmingRetry, setConfirmingRetry] = useState(false);
    const resultTone = result.score >= 80 ? 'excellent' : result.score >= 60 ? 'good' : 'practice';

    const getTypeIcon = (type) => {
        return type === 'literacy' ? (
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
        ) : (
            <CalculatorIcon className="w-8 h-8 text-purple-600" />
        );
    };

    const getTypeLabel = (type) => {
        return type === 'literacy' ? 'Literacy' : 'Numeracy';
    };

    const getResultIcon = () => {
        if (result.score >= 80) {
            return <StarIcon className="w-16 h-16 text-yellow-500" />;
        } else if (result.score >= 60) {
            return <CheckCircleIcon className="w-16 h-16 text-emerald-500" />;
        } else {
            return <HeartIcon className="w-16 h-16 text-red-500" />;
        }
    };

    const getResultMessage = () => {
        if (result.score >= 80) {
            return 'Excellent!';
        } else if (result.score >= 60) {
            return 'Good Job!';
        } else {
            return 'Keep Practicing!';
        }
    };

    const getResultBadgeClass = () => {
        if (result.score >= 80) {
            return 'bg-emerald-100 text-emerald-800';
        } else if (result.score >= 60) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-red-100 text-red-800';
        }
    };

    const handlePlayAgain = () => {
        setConfirmingRetry(false);
        setIsLoading(true);
        router.post(route('student.games.play', game.id), {}, {
            preserveState: true,
            onSuccess: () => toast.success('New game attempt started.'),
            onError: () => toast.error('Unable to start another game attempt. Please try again.'),
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
                    <button type="button" onClick={() => router.visit(route('student.games.index'), { onError: () => toast.error('Unable to return to games. Please try again.') })} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-blue-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950" aria-label="Back to Games" title="Back to Games">
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                    </button>
                    <h2 className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800">Game Results: {game.title}</h2>
                </div>
            }
        >
            <Head title={`Results: ${game.title}`} />

            <div className="student-game-results-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6" onFocusCapture={keepFocusedFieldVisible}>
                <style>{`
                    .studynest-layout.theme-dark .student-game-results-page .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .text-gray-800,
                    .studynest-layout.theme-dark .student-game-results-page .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .text-gray-600,
                    .studynest-layout.theme-dark .student-game-results-page .text-gray-500 { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary[data-result="excellent"] {
                        background-image: linear-gradient(135deg, rgb(6 78 59), rgb(12 74 110)) !important;
                        background-color: rgb(6 78 59) !important;
                        border-color: rgb(52 211 153) !important;
                    }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary[data-result="good"] {
                        background-image: linear-gradient(135deg, rgb(69 47 15), rgb(30 58 95)) !important;
                        background-color: rgb(69 47 15) !important;
                        border-color: rgb(251 191 36) !important;
                    }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary[data-result="practice"] {
                        background-image: linear-gradient(135deg, rgb(88 28 43), rgb(69 26 26)) !important;
                        background-color: rgb(88 28 43) !important;
                        border-color: rgb(251 113 133) !important;
                    }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary .text-gray-800 { color: rgb(248 250 252) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary .text-gray-500 { color: rgb(203 213 225) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary .bg-blue-50 { background-color: rgb(30 58 138 / .52) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary .bg-blue-100 { background-color: rgb(30 64 175 / .65) !important; color: rgb(219 234 254) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary [class~="bg-emerald-100"] { background-color: rgb(6 95 70 / .72) !important; color: rgb(209 250 229) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary [class~="bg-yellow-100"] { background-color: rgb(120 53 15 / .76) !important; color: rgb(254 243 199) !important; }
                    .studynest-layout.theme-dark .student-game-results-page .student-game-result-summary [class~="bg-red-100"] { background-color: rgb(127 29 29 / .76) !important; color: rgb(254 226 226) !important; }
                    .student-game-results-page input, .student-game-results-page select, .student-game-results-page textarea { scroll-margin-block: 8rem; }
                    .student-game-result-card { transition: transform 180ms ease, box-shadow 180ms ease; }
                    @media (max-width: 639px) { .student-game-results-page input:not([type="checkbox"]):not([type="radio"]), .student-game-results-page select, .student-game-results-page textarea { font-size: 16px; } }
                    @media (hover: hover) and (pointer: fine) { .student-game-result-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / 0.08); } }
                    @media (hover: none), (prefers-reduced-motion: reduce) { .student-game-result-card { transform: none !important; transition-duration: 0.01ms !important; } }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Results Card ===== */}
                    <div
                        data-result={resultTone}
                        className="student-game-result-summary student-game-result-card overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 text-center shadow-sm"
                    >
                        <div className="px-4 py-7 sm:p-8">
                            <h1 className="mb-4 break-words text-xl font-bold text-gray-800 xl:hidden">{game.title}</h1>
                            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                                    {getTypeIcon(game.game_type)}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getTypeLabel(game.game_type)}
                                </span>
                            </div>

                            <div className="flex justify-center mb-4">
                                {getResultIcon()}
                            </div>

                            <div className="text-5xl font-bold text-gray-800">
                                {result.score}
                            </div>

                            <div className="text-lg text-gray-500 mt-1">
                                points
                            </div>

                            <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getResultBadgeClass()}`}>
                                {getResultMessage()}
                            </div>
                        </div>
                    </div>

                    {/* ===== Actions ===== */}
                    {can_play_again && (
                        <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex justify-center gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                            <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => setConfirmingRetry(true)} disabled={isLoading}>
                                <ArrowPathIcon className="w-4 h-4 mr-1" />
                                {isLoading ? 'Loading...' : 'Play Again'}
                            </PrimaryButton>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                show={confirmingRetry}
                onClose={() => setConfirmingRetry(false)}
                onConfirm={handlePlayAgain}
                title="Start another game attempt?"
                message="Starting another attempt uses one of your remaining game attempts."
                confirmText="Start attempt"
                cancelText="Cancel"
                confirmColor="blue"
            />
        </AuthenticatedLayout>
    );
}
