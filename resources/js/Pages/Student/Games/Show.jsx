import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import {
    BookOpenIcon,
    CalculatorIcon,
    UserIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

export default function GamesShow({ game, can_play, attempts_remaining, current_result }) {
    const [isLoading, setIsLoading] = useState(false);

    const getTypeIcon = (type) => {
        return type === 'literacy' ? (
            <BookOpenIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        ) : (
            <CalculatorIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        );
    };

    const getTypeLabel = (type) => {
        return type === 'literacy' ? 'Literacy' : 'Numeracy';
    };

    const handleStart = () => {
        setIsLoading(true);
        if (current_result) {
            // Go directly to the in‑progress game
            router.visit(route('student.games.play.show', current_result.id));
        } else {
            // Start a new attempt – simple GET navigation (no POST needed)
            router.visit(route('student.games.play', game.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {game.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                        Back to Games
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={game.title} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Game Information ===== */}
                    <Card>
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30">
                                    {getTypeIcon(game.game_type)}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {getTypeLabel(game.game_type)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {game.teacher}
                                </span>
                                {game.due_date && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        Due: {game.due_date}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {game.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{game.max_attempts}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Max Attempts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{attempts_remaining}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Attempts Remaining</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {game.instructions}
                                </p>
                            </div>

                            {!can_play && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 font-medium">
                                        You have reached the maximum number of attempts for this game.
                                    </p>
                                </div>
                            )}

                            {can_play && current_result && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        You have an in-progress attempt.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                                    Cancel
                                </SecondaryButton>
                                {can_play && (
                                    <PrimaryButton onClick={handleStart} disabled={isLoading}>
                                        {isLoading ? 'Loading...' : current_result ? 'Continue Game' : 'Start Game'}
                                    </PrimaryButton>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
