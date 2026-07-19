import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

import gameDefinitions from '@/GameEngines/gameDefinitions';
import WordBuilder from '@/GameEngines/WordBuilder';
import SentenceScramble from '@/GameEngines/SentenceScramble';
import BalloonPopMath from '@/GameEngines/BalloonPopMath';
import SortingBaskets from '@/GameEngines/SortingBaskets';
import MatchTheMeaning from '@/GameEngines/MatchTheMeaning';
import StoryFillIn from '@/GameEngines/StoryFillIn';
import FractionPizza from '@/GameEngines/FractionPizza';
import NumberLineRunner from '@/GameEngines/NumberLineRunner';
import ClueDetective from '@/GameEngines/ClueDetective';
import WordWebBuilder from '@/GameEngines/WordWebBuilder';
import BalanceScale from '@/GameEngines/BalanceScale';
import GraphBuilder from '@/GameEngines/GraphBuilder';

const ENGINE_MAP = {
    'Word Builder': WordBuilder,
    'Sentence Scramble': SentenceScramble,
    'Balloon Pop Math': BalloonPopMath,
    'Sorting Baskets': SortingBaskets,
    'Match the Meaning': MatchTheMeaning,
    'Story Fill-In': StoryFillIn,
    'Fraction Pizza': FractionPizza,
    'Number Line Runner': NumberLineRunner,
    'Clue Detective': ClueDetective,
    'Word Web Builder': WordWebBuilder,
    'Balance Scale': BalanceScale,
    'Graph Builder': GraphBuilder,
};

export default function GamesPlay({ result, game }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(
        result.progress_data || null   // resume from saved state
    );

    const definition = gameDefinitions[game.title];
    const EngineComponent = ENGINE_MAP[game.title];

    // Called by the engine every time progress changes
    const handleProgress = (progress) => {
        setCurrentProgress(progress);
    };

    // Save progress and exit
    const handleExit = () => {
        if (!currentProgress) {
            // No progress yet – just leave
            router.visit(route('student.games.index'));
            return;
        }

        setIsSubmitting(true);
        // The server now redirects to the game list, so no manual navigation is needed
        router.post(
            route('student.games.save-progress', result.id),
            { progress: currentProgress },
            {
                preserveState: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Game finished – submit final result
    const handleComplete = (score) => {
        setIsSubmitting(true);
        router.post(
            route('student.games.submit-result', result.id),
            { score },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    if (!definition || !EngineComponent || definition.comingSoon) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-bold text-indigo-900 dark:text-white">{game.title}</h2>}
            >
                <Head title={`Playing: ${game.title}`} />
                <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
                    <Card className="max-w-md w-full text-center p-10 bg-white rounded-3xl shadow-xl border border-indigo-100 animate-in zoom-in duration-300">
                        <div className="text-6xl mb-6">🚀</div>
                        <h3 className="text-2xl font-black text-indigo-900 mb-2">Coming Soon!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            This game isn't available to play yet. Check back later or ask your teacher!
                        </p>
                        <SecondaryButton
                            onClick={() => router.visit(route('student.games.index'))}
                            className="px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            Back to Games
                        </SecondaryButton>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-bold text-indigo-900 dark:text-white">{game.title}</h2>}
        >
            <Head title={`Playing: ${game.title}`} />

            {isSubmitting && <LoadingSpinner overlay size="lg" text="Saving your progress..." />}

            <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-8">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <EngineComponent
                            content={definition.content}
                            onComplete={handleComplete}
                            onExit={handleExit}
                            onProgress={handleProgress}          // ✅ new
                            initialState={result.progress_data}   // ✅ resume
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
