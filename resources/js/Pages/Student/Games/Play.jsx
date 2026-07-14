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

    const definition = gameDefinitions[game.title];
    const EngineComponent = ENGINE_MAP[game.title];

    const handleExit = () => {
        if (confirm('Leave the game? Your progress on this attempt will not be saved.')) {
            router.visit(route('student.games.index'));
        }
    };

    // Auto-save: immediately submit the score to the backend
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

    // Fallback: unrecognised game or coming soon
    if (!definition || !EngineComponent || definition.comingSoon) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{game.title}</h2>}
            >
                <Head title={`Playing: ${game.title}`} />
                <div className="py-12">
                    <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                        <Card className="text-center py-10">
                            <p className="text-gray-600 dark:text-gray-300">
                                This game isn't available to play yet. Please check back later or ask your teacher.
                            </p>
                            <div className="mt-6">
                                <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                                    Back to Games
                                </SecondaryButton>
                            </div>
                        </Card>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Active gameplay
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">{game.title}</h2>}
        >
            <Head title={`Playing: ${game.title}`} />

            {isSubmitting && <LoadingSpinner overlay size="lg" text="Saving your results..." />}

            <div className="py-12">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <EngineComponent
                        content={definition.content}
                        onComplete={handleComplete}
                        onExit={handleExit}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
