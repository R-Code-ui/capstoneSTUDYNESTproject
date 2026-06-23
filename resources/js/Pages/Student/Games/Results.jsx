import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function GamesResults({ result, game, can_play_again }) {
    const [isLoading, setIsLoading] = useState(false);

    const getTypeIcon = (type) => {
        return type === 'literacy' ? '📖' : '🧮';
    };

    const getTypeLabel = (type) => {
        return type === 'literacy' ? 'Literacy' : 'Numeracy';
    };

    const handlePlayAgain = () => {
        setIsLoading(true);
        router.post(route('student.games.play', game.id), {}, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Game Results: {game.title}
                    </h2>
                    <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                        Back to Games
                    </SecondaryButton>
                </div>
            }
        >
            <Head title={`Results: ${game.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {isLoading && <LoadingSpinner overlay size="lg" />}

                    {/* ===== Results Card ===== */}
                    <Card className="text-center">
                        <div className="py-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <span className="text-4xl">{getTypeIcon(game.game_type)}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {getTypeLabel(game.game_type)}
                                </span>
                            </div>

                            <div className="text-6xl mb-4">
                                {result.score >= 80 ? '🌟' : result.score >= 60 ? '👍' : '💪'}
                            </div>

                            <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                {result.score}
                            </div>
                            <div className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                                points
                            </div>

                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Attempt {result.attempt_number} • Completed {result.completed_at}
                            </div>

                            <div className={`mt-4 inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                                result.score >= 80
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : result.score >= 60
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                                {result.score >= 80 ? '🌟 Excellent!' :
                                 result.score >= 60 ? '👍 Good Job!' :
                                 '💪 Keep Practicing!'}
                            </div>
                        </div>
                    </Card>

                    {/* ===== Actions ===== */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                            Back to Games
                        </SecondaryButton>
                        {can_play_again && (
                            <PrimaryButton onClick={handlePlayAgain} disabled={isLoading}>
                                {isLoading ? 'Loading...' : '🔄 Play Again'}
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
