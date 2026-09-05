import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import StatusBadge from '@/Components/StatusBadge';
import gameDefinitions from '@/GameEngines/gameDefinitions';
import { toast } from 'sonner';
import {
    BookOpenIcon,
    CalculatorIcon,
    UserIcon,
    CalendarIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
};

export default function GamesShow({
    game,
    can_play,
    attempts_remaining,
    current_result,
    latest_completed_attempt_id,
}) {
    const [isLoading, setIsLoading] = useState(false);

    const definition = gameDefinitions[game.title];
    const friendlyDescription = definition?.description || game.instructions;
    const difficultyLabel = {
        guided: 'Easy',
        standard: 'Average',
        challenge: 'Difficult',
    }[game.difficulty] || 'Average';

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

    const handleStart = () => {
        setIsLoading(true);
        if (current_result) {
            router.visit(route('student.games.play.show', current_result.id), {
                onError: () => toast.error('Unable to continue this game. Please try again.'),
                onFinish: () => setIsLoading(false),
            });
        } else {
            router.post(route('student.games.play', game.id), {}, {
                onSuccess: () => toast.success('Game started.'),
                onError: () => toast.error('Unable to start the game. Please try again.'),
                onFinish: () => setIsLoading(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full min-w-0 items-center justify-between gap-4">
                    <h2 className="min-w-0 flex-1 break-words text-xl font-semibold leading-tight text-gray-800">{game.title}</h2>
                    <div className="hidden shrink-0 items-center gap-2 xl:flex">
                        {latest_completed_attempt_id && (
                            <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700" href={route('student.games.results', latest_completed_attempt_id)} onError={() => toast.error('Unable to open the game results. Please try again.')}>
                                    <ChartBarIcon className="w-4 h-4 mr-1" />
                                    View Results
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={game.title} />

            <div className="student-game-show-page py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6" onFocusCapture={keepFocusedFieldVisible}>
                <style>{`
                    .studynest-layout.theme-dark .student-game-show-page .bg-white { background-color: rgb(15 23 42) !important; border-color: rgb(51 65 85) !important; }
                    .studynest-layout.theme-dark .student-game-show-page .bg-gray-50 { background-color: rgb(30 41 59) !important; border-color: rgb(71 85 105) !important; }
                    .studynest-layout.theme-dark .student-game-show-page .text-gray-800,
                    .studynest-layout.theme-dark .student-game-show-page .text-gray-700 { color: rgb(226 232 240) !important; }
                    .studynest-layout.theme-dark .student-game-show-page .text-gray-600,
                    .studynest-layout.theme-dark .student-game-show-page .text-gray-500 { color: rgb(148 163 184) !important; }
                    .studynest-layout.theme-dark .student-game-show-page .bg-yellow-50 {
                        background-color: rgb(69 47 15) !important;
                        border-color: rgb(161 98 7) !important;
                    }
                    .studynest-layout.theme-dark .student-game-show-page .text-yellow-700 { color: rgb(253 230 138) !important; }
                    .studynest-layout.theme-dark .student-game-show-page .student-game-show-actions {
                        background-color: rgb(15 23 42 / .97) !important;
                        border-color: rgb(51 65 85) !important;
                    }
                    .studynest-layout.theme-dark .student-game-show-page .student-game-show-actions .studynest-secondary-button {
                        border-color: rgb(71 85 105) !important;
                        background-color: rgb(30 41 59) !important;
                        color: rgb(226 232 240) !important;
                    }
                    .student-game-show-page input, .student-game-show-page select, .student-game-show-page textarea { scroll-margin-block: 8rem; }
                    .student-game-show-card { transition: transform 180ms ease, box-shadow 180ms ease; }
                    @media (max-width: 639px) { .student-game-show-page input:not([type="checkbox"]):not([type="radio"]), .student-game-show-page select, .student-game-show-page textarea { font-size: 16px; } }
                    @media (hover: hover) and (pointer: fine) { .student-game-show-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(15 23 42 / 0.08); } }
                    @media (hover: none), (prefers-reduced-motion: reduce) { .student-game-show-card { transform: none !important; transition-duration: 0.01ms !important; } }
                `}</style>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    <div className="student-game-show-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="space-y-5 p-4 sm:p-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                                    {getTypeIcon(game.game_type)}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getTypeLabel(game.game_type)}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                    {difficultyLabel} level
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {game.teacher}
                                </span>
                                {game.due_date && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Due: {game.due_date}
                                    </span>
                                )}
                                {game.deadline_status && <StatusBadge status={game.deadline_status} size="sm" />}
                            </div>

                            <div className="xl:hidden">
                                <h3 className="text-2xl font-bold text-gray-800 break-words">
                                    {game.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:gap-4 sm:p-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{game.max_attempts}</div>
                                    <div className="text-xs font-medium text-gray-500">Max Attempts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{attempts_remaining}</div>
                                    <div className="text-xs font-medium text-gray-500">Attempts Remaining</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">How to Play</h4>
                                <p className="text-gray-600 break-words">
                                    {friendlyDescription}
                                </p>
                            </div>

                            {definition?.comingSoon && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-700 text-sm">
                                        This game is still being finished. Check back soon!
                                    </p>
                                </div>
                            )}

                            {game.deadline_status === 'expired' && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                                    <p className="font-medium text-red-700 dark:text-red-200">
                                        This game has expired. New and in-progress attempts can no longer be played.
                                    </p>
                                </div>
                            )}

                            {!can_play && game.deadline_status !== 'expired' && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 font-medium">
                                        You have reached the maximum number of attempts for this game.
                                    </p>
                                </div>
                            )}

                            {can_play && current_result && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-700">
                                        You have an in-progress attempt.
                                    </p>
                                </div>
                            )}

                            <div className="student-game-show-actions sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-4 pt-4 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0">
                                <SecondaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={() => router.visit(route('student.games.index'), {
                                    onError: () => toast.error('Unable to return to games. Please try again.'),
                                })}>
                                    Cancel
                                </SecondaryButton>
                                {can_play && (
                                    <PrimaryButton className="min-h-11 w-full justify-center sm:w-auto" onClick={handleStart} disabled={isLoading}>
                                        {isLoading ? 'Loading...' : current_result ? 'Continue Game' : 'Start Game'}
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
