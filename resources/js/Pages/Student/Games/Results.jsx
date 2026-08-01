import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import {
    BookOpenIcon,
    CalculatorIcon,
    StarIcon,
    CheckCircleIcon,
    HeartIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function GamesResults({ result, game, can_play_again }) {
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        router.post(route('student.games.play', game.id), {}, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-center">
                        <div className="p-6 py-8">
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
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {can_play_again && (
                            <PrimaryButton onClick={handlePlayAgain} disabled={isLoading}>
                                <ArrowPathIcon className="w-4 h-4 mr-1" />
                                {isLoading ? 'Loading...' : 'Play Again'}
                            </PrimaryButton>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
