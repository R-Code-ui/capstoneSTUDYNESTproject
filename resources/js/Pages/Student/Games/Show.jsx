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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {game.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {latest_completed_attempt_id && (
                            <Link href={route('student.games.results', latest_completed_attempt_id)} onError={() => toast.error('Unable to open the game results. Please try again.')}>
                                <PrimaryButton>
                                    <ChartBarIcon className="w-4 h-4 mr-1" />
                                    View Results
                                </PrimaryButton>
                            </Link>
                        )}
                        <SecondaryButton onClick={() => router.visit(route('student.games.index'), {
                            onError: () => toast.error('Unable to return to games. Please try again.'),
                        })}>
                            Back to Games
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title={game.title} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
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

                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 break-words">
                                    {game.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
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

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                <SecondaryButton onClick={() => router.visit(route('student.games.index'), {
                                    onError: () => toast.error('Unable to return to games. Please try again.'),
                                })}>
                                    Cancel
                                </SecondaryButton>
                                {can_play && (
                                    <PrimaryButton onClick={handleStart} disabled={isLoading}>
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
