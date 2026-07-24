import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

import gameDefinitions from '@/GameEngines/gameDefinitions';

// Grade 4
import WordBuilder from '@/GameEngines/WordBuilder';
import SentenceScramble from '@/GameEngines/SentenceScramble';
import BalloonPopMath from '@/GameEngines/BalloonPopMath';
import SortingBaskets from '@/GameEngines/SortingBaskets';
import RhymeMatch from '@/GameEngines/RhymeMatch';
import LetterHunt from '@/GameEngines/LetterHunt';
import CoinCounter from '@/GameEngines/CoinCounter';
import SkipCountingPath from '@/GameEngines/SkipCountingPath';

// Grade 5
import MatchTheMeaning from '@/GameEngines/MatchTheMeaning';
import StoryFillIn from '@/GameEngines/StoryFillIn';
import FractionPizza from '@/GameEngines/FractionPizza';
import NumberLineRunner from '@/GameEngines/NumberLineRunner';
import CompoundWordCombiner from '@/GameEngines/CompoundWordCombiner';
import AnalogySolver from '@/GameEngines/AnalogySolver';
import AreaBlocks from '@/GameEngines/AreaBlocks';
import DecimalNumberLine from '@/GameEngines/DecimalNumberLine';

// Grade 6
import ClueDetective from '@/GameEngines/ClueDetective';
import WordWebBuilder from '@/GameEngines/WordWebBuilder';
import BalanceScale from '@/GameEngines/BalanceScale';
import GraphBuilder from '@/GameEngines/GraphBuilder';
import SequenceTheStory from '@/GameEngines/SequenceTheStory';
import IdiomMatch from '@/GameEngines/IdiomMatch';
import CoordinatePlaneTreasureHunt from '@/GameEngines/CoordinatePlaneTreasureHunt';
import PercentBarBuilder from '@/GameEngines/PercentBarBuilder';

const ENGINE_MAP = {
    // Grade 4
    'Word Builder': WordBuilder,
    'Sentence Scramble': SentenceScramble,
    'Balloon Pop Math': BalloonPopMath,
    'Sorting Baskets': SortingBaskets,
    'Rhyme Match': RhymeMatch,
    'Letter Hunt': LetterHunt,
    'Coin Counter': CoinCounter,
    'Skip Counting Path': SkipCountingPath,

    // Grade 5
    'Match the Meaning': MatchTheMeaning,
    'Story Fill-In': StoryFillIn,
    'Fraction Pizza': FractionPizza,
    'Number Line Runner': NumberLineRunner,
    'Compound Word Combiner': CompoundWordCombiner,
    'Analogy Solver': AnalogySolver,
    'Area Blocks': AreaBlocks,
    'Decimal Number Line': DecimalNumberLine,

    // Grade 6
    'Clue Detective': ClueDetective,
    'Word Web Builder': WordWebBuilder,
    'Balance Scale': BalanceScale,
    'Graph Builder': GraphBuilder,
    'Sequence the Story': SequenceTheStory,
    'Idiom Match': IdiomMatch,
    'Coordinate Plane Treasure Hunt': CoordinatePlaneTreasureHunt,
    'Percent Bar Builder': PercentBarBuilder,
};

export default function GamesPlay({ result, game }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(
        result.progress_data || null
    );

    const definition = gameDefinitions[game.title];
    const EngineComponent = ENGINE_MAP[game.title];

    // Array of falling emoji particles (larger and more prominent)
    const particles = [
        { emoji: '👾', left: '3%', duration: '14s', delay: '0s', size: '28px' },
        { emoji: '🎮', left: '12%', duration: '18s', delay: '2s', size: '32px' },
        { emoji: '🏀', left: '22%', duration: '16s', delay: '4s', size: '30px' },
        { emoji: '⚽', left: '35%', duration: '20s', delay: '1s', size: '26px' },
        { emoji: '⚙️', left: '48%', duration: '15s', delay: '5s', size: '34px' },
        { emoji: '🛸', left: '60%', duration: '17s', delay: '3s', size: '30px' },
        { emoji: '👾', left: '72%', duration: '19s', delay: '6s', size: '28px' },
        { emoji: '🎮', left: '82%', duration: '13s', delay: '2.5s', size: '32px' },
        { emoji: '🏀', left: '92%', duration: '16s', delay: '4.5s', size: '30px' },
        { emoji: '⚙️', left: '8%', duration: '22s', delay: '7s', size: '26px' },
        { emoji: '🛸', left: '45%', duration: '18s', delay: '8s', size: '30px' },
        { emoji: '⚽', left: '68%', duration: '14s', delay: '9s', size: '28px' },
    ];

    const handleProgress = (progress) => {
        setCurrentProgress(progress);
    };

    const handleExit = () => {
        if (!currentProgress) {
            router.visit(route('student.games.index'));
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('student.games.save-progress', result.id),
            { progress: currentProgress },
            {
                preserveState: true,
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

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
                header={
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">{game.title}</h2>
                        <SecondaryButton onClick={() => router.visit(route('student.games.index'))}>
                            Back to Games
                        </SecondaryButton>
                    </div>
                }
            >
                <Head title={`Playing: ${game.title}`} />
                <div className="min-h-screen p-6 flex items-center justify-center bg-white">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-md w-full text-center p-10">
                        <div className="text-6xl mb-6">🚀</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
                        <p className="text-gray-600 mb-8">
                            This game isn't available to play yet. Check back later or ask your teacher!
                        </p>
                        <SecondaryButton
                            onClick={() => router.visit(route('student.games.index'))}
                            className="px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            Back to Games
                        </SecondaryButton>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                // 🔧 FIX: Removed Exit Game button, only title remains
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{game.title}</h2>
                </div>
            }
        >
            <Head title={`Playing: ${game.title}`} />

            {isSubmitting && <LoadingSpinner overlay size="lg" text="Saving your progress..." />}

            {/* ========================================================= */}
            {/* FALLING PARTICLES (Game Emojis)                            */}
            {/* ========================================================= */}
            <style>{`
                @keyframes fallAndRotateLarge {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.8;
                    }
                    90% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-falling-particle-large {
                    position: fixed;
                    top: -30px;
                    animation-name: fallAndRotateLarge;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                }
            `}</style>

            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                {particles.map((p, idx) => (
                    <span
                        key={idx}
                        className="animate-falling-particle-large opacity-60"
                        style={{
                            left: p.left,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            fontSize: p.size,
                        }}
                    >
                        {p.emoji}
                    </span>
                ))}
            </div>

            {/* ===== Main Game Container ===== */}
            <div className="relative z-10 min-h-screen bg-white py-8">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <EngineComponent
                            content={definition.content}
                            onComplete={handleComplete}
                            onExit={handleExit}
                            onProgress={handleProgress}
                            initialState={result.progress_data}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
