import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';

import gameDefinitions from '@/GameEngines/gameDefinitions';

import WordBuilder from '@/GameEngines/WordBuilder';
import SentenceScramble from '@/GameEngines/SentenceScramble';
import BalloonPopMath from '@/GameEngines/BalloonPopMath';
import SortingBaskets from '@/GameEngines/SortingBaskets';
import RhymeMatch from '@/GameEngines/RhymeMatch';
import AlphabeticalOrder from '@/GameEngines/AlphabeticalOrder';
import CoinCounter from '@/GameEngines/CoinCounter';
import RoundingRocket from '@/GameEngines/RoundingRocket';
import MatchTheMeaning from '@/GameEngines/MatchTheMeaning';
import StoryFillIn from '@/GameEngines/StoryFillIn';
import FractionPizza from '@/GameEngines/FractionPizza';
import NumberLineRunner from '@/GameEngines/NumberLineRunner';
import CompoundWordCombiner from '@/GameEngines/CompoundWordCombiner';
import AnalogySolver from '@/GameEngines/AnalogySolver';
import AreaBlocks from '@/GameEngines/AreaBlocks';
import DecimalNumberLine from '@/GameEngines/DecimalNumberLine';
// --- new Grade 6 games ---
import HomophoneMatch from '@/GameEngines/HomophoneMatch';
import PrefixPower from '@/GameEngines/PrefixPower';
import MultiplicationFrenzy from '@/GameEngines/MultiplicationFrenzy';
import DivisionDash from '@/GameEngines/DivisionDash';
// --- kept Grade 6 games ---
import BalanceScale from '@/GameEngines/BalanceScale';
import SequenceTheStory from '@/GameEngines/SequenceTheStory';
import IdiomMatch from '@/GameEngines/IdiomMatch';
import CoordinatePlaneTreasureHunt from '@/GameEngines/CoordinatePlaneTreasureHunt';

const ENGINE_MAP = {
    'Word Builder': WordBuilder,
    'Sentence Scramble': SentenceScramble,
    'Balloon Pop Math': BalloonPopMath,
    'Sorting Baskets': SortingBaskets,
    'Rhyme Match': RhymeMatch,
    'Alphabetical Order': AlphabeticalOrder,
    'Coin Counter': CoinCounter,
    'Rounding Rocket': RoundingRocket,
    'Match the Meaning': MatchTheMeaning,
    'Story Fill-In': StoryFillIn,
    'Fraction Pizza': FractionPizza,
    'Number Line Runner': NumberLineRunner,
    'Compound Word Combiner': CompoundWordCombiner,
    'Analogy Solver': AnalogySolver,
    'Area Blocks': AreaBlocks,
    'Decimal Number Line': DecimalNumberLine,
    // new Grade 6
    'Homophone Match': HomophoneMatch,
    'Prefix Power': PrefixPower,
    'Multiplication Frenzy': MultiplicationFrenzy,
    'Division Dash': DivisionDash,
    // kept Grade 6
    'Balance Scale': BalanceScale,
    'Sequence the Story': SequenceTheStory,
    'Idiom Match': IdiomMatch,
    'Coordinate Plane Treasure Hunt': CoordinatePlaneTreasureHunt,
};

const ART_BY_GAME = {
    'Word Builder': { icon: '\u{1F524}', label: 'Letter lab', theme: 'from-violet-500 to-fuchsia-500' },
    'Sentence Scramble': { icon: '\u{1F9E9}', label: 'Word puzzle', theme: 'from-sky-500 to-indigo-500' },
    'Rhyme Match': { icon: '\u{1F3B5}', label: 'Rhyme time', theme: 'from-pink-500 to-rose-500' },
    'Alphabetical Order': { icon: '\u{1F524}', label: 'ABC sort', theme: 'from-violet-500 to-purple-500' },
    'Balloon Pop Math': { icon: '\u{1F388}', label: 'Balloon party', theme: 'from-cyan-500 to-blue-500' },
    'Sorting Baskets': { icon: '\u{1F9FA}', label: 'Sort it out', theme: 'from-amber-500 to-orange-500' },
    'Coin Counter': { icon: '\u{1FA99}', label: 'Coin challenge', theme: 'from-yellow-500 to-amber-500' },
    'Rounding Rocket': { icon: '\u{1F680}', label: 'Rocket round', theme: 'from-indigo-500 to-purple-500' },
    'Match the Meaning': { icon: '\u{1F4DA}', label: 'Word match', theme: 'from-indigo-500 to-violet-500' },
    'Story Fill-In': { icon: '\u{1F4DD}', label: 'Story studio', theme: 'from-purple-500 to-pink-500' },
    'Fraction Pizza': { icon: '\u{1F355}', label: 'Pizza fractions', theme: 'from-orange-500 to-red-500' },
    'Number Line Runner': { icon: '\u{1F3C3}', label: 'Number race', theme: 'from-sky-500 to-cyan-500' },
    'Compound Word Combiner': { icon: '\u{1F9E9}', label: 'Word mixer', theme: 'from-fuchsia-500 to-purple-500' },
    'Analogy Solver': { icon: '\u{1F9E0}', label: 'Brain boost', theme: 'from-pink-500 to-rose-500' },
    'Area Blocks': { icon: '\u{1F7E9}', label: 'Shape builder', theme: 'from-green-500 to-emerald-500' },
    'Decimal Number Line': { icon: '\u{1F4CF}', label: 'Decimal dash', theme: 'from-blue-500 to-indigo-500' },
    // --- new Grade 6 ---
    'Homophone Match': { icon: '\u{1F50A}', label: 'Sound match', theme: 'from-violet-500 to-fuchsia-500' },
    'Prefix Power': { icon: '\u{1F4A5}', label: 'Prefix builder', theme: 'from-cyan-500 to-blue-500' },
    'Multiplication Frenzy': { icon: '\u{2716}', label: 'Multiply!', theme: 'from-amber-500 to-orange-500' },
    'Division Dash': { icon: '\u{2797}', label: 'Divide!', theme: 'from-emerald-500 to-teal-500' },
    // --- kept Grade 6 ---
    'Balance Scale': { icon: '\u{2696}\uFE0F', label: 'Balance lab', theme: 'from-amber-500 to-yellow-500' },
    'Sequence the Story': { icon: '\u{1F4D6}', label: 'Story order', theme: 'from-rose-500 to-pink-500' },
    'Idiom Match': { icon: '\u{1F4AC}', label: 'Idiom explorer', theme: 'from-orange-500 to-amber-500' },
    'Coordinate Plane Treasure Hunt': { icon: '\u{1F5FA}\uFE0F', label: 'Treasure map', theme: 'from-emerald-500 to-cyan-500' },
};

export function getGameArt(title, type) {
    return ART_BY_GAME[title] || (type === 'literacy'
        ? { icon: '\u{1F4D8}', label: 'Reading quest', theme: 'from-indigo-500 to-violet-500' }
        : { icon: '\u{1F3AF}', label: 'Math mission', theme: 'from-cyan-500 to-blue-500' });
}

function seedFrom(value) {
    return Array.from(String(value)).reduce((seed, char) => ((seed * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function shuffled(items, seed) {
    const copy = [...items];
    let state = seed || 1;
    for (let index = copy.length - 1; index > 0; index -= 1) {
        state = (state * 1664525 + 1013904223) >>> 0;
        const swapIndex = state % (index + 1);
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function varyRound(round, seed) {
    const varied = { ...round };
    ['numbers', 'coins', 'items', 'options', 'letters', 'cells', 'weights', 'categories',
     'wordBank', 'correctWords', 'distractorWords', 'scrambled', 'pairs'].forEach((field, index) => {
        if (Array.isArray(varied[field])) varied[field] = shuffled(varied[field], seed + index + 1);
    });
    return varied;
}

function prepareGameContent(definition, game, attemptId) {
    const difficulty = game.settings?.difficulty || 'standard';
    const seed = seedFrom(`${game.id}-${attemptId || 'preview'}-${difficulty}`);

    const contentByDifficulty = definition.content?.[difficulty] || definition.content?.standard || definition.content;
    let content = { ...contentByDifficulty };

    if (game.title === 'Story Fill-In' && Array.isArray(content.wordBank) && Array.isArray(content.blanks)) {
        const correctWords = content.blanks;
        const distractors = content.wordBank.filter((word) => !correctWords.includes(word));
        content.wordBank = shuffled([...correctWords, ...shuffled(distractors, seed + 3)], seed + 4);
    }
    if (game.title === 'Word Web Builder' && Array.isArray(content.correctWords) && Array.isArray(content.distractorWords)) {
        content.correctWords = shuffled(content.correctWords, seed + 5);
        content.distractorWords = shuffled(content.distractorWords, seed + 6);
    }

    if (Array.isArray(content.stories)) {
        content = { ...content, ...shuffled(content.stories, seed)[0] };
        delete content.stories;
    }
    if (Array.isArray(content.themes)) {
        content = { ...content, ...shuffled(content.themes, seed)[0] };
        delete content.themes;
    }

    if (Array.isArray(content.rounds)) {
        content.rounds = shuffled(content.rounds, seed).map((round, idx) => varyRound(round, seed + idx));
    }
    if (Array.isArray(content.pairs)) {
        content.pairs = shuffled(content.pairs, seed);
    }

    return content;
}

export default function GamesPlay({ result, game, preview = false }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewComplete, setPreviewComplete] = useState(false);
    const [currentProgress, setCurrentProgress] = useState(result.progress_data || null);

    const definition = gameDefinitions[game.title];
    const EngineComponent = ENGINE_MAP[game.title];
    const gameContent = useMemo(
        () => (definition ? prepareGameContent(definition, game, result.id) : null),
        [definition, game, result.id]
    );

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

    const handleProgress = (progress) => setCurrentProgress(progress);

    const handleExit = () => {
        if (preview) {
            router.visit(route('teacher.games.show', game.id));
            return;
        }
        if (!currentProgress) {
            router.visit(route('student.games.index'));
            return;
        }
        setIsSubmitting(true);
        router.post(route('student.games.save-progress', result.id), { progress: currentProgress }, {
            preserveState: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleComplete = (score) => {
        if (preview) {
            setPreviewComplete(true);
            return;
        }
        setIsSubmitting(true);
        router.post(route('student.games.submit-result', result.id), { score }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (!definition || !EngineComponent || definition.comingSoon) {
        return (
            <AuthenticatedLayout header={<div className="flex justify-between"><h2>{game.title}</h2><SecondaryButton onClick={() => router.visit(route('student.games.index'))}>Back to Games</SecondaryButton></div>}>
                <Head title={`Playing: ${game.title}`} />
                <div className="min-h-screen p-6 flex items-center justify-center bg-white">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-md w-full text-center p-10">
                        <div className="text-6xl mb-6">🚀</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
                        <p className="text-gray-600 mb-8">This game isn't available to play yet. Check back later or ask your teacher!</p>
                        <SecondaryButton onClick={() => router.visit(route('student.games.index'))} className="px-8 py-3 rounded-full font-bold hover:scale-105">Back to Games</SecondaryButton>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">{game.title}</h2>
                    {preview && <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">Teacher preview</span>}
                </div>
            </div>
        }>
            <Head title={`Playing: ${game.title}`} />
            {isSubmitting && <LoadingSpinner overlay size="lg" text="Saving your progress..." />}

            <style>{`
                .studynest-layout.theme-dark .student-game-play-stage {
                    background: #020617 !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface {
                    background: rgba(255, 255, 255, .92) !important;
                    border-color: rgba(255, 255, 255, .8) !important;
                    color: #0f172a !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .bg-white {
                    background-color: #ffffff !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .bg-white\/50,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .bg-white\/60,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .bg-white\/90 {
                    background-color: rgba(255, 255, 255, .92) !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-slate-900,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-gray-900,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-gray-800,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-gray-700 {
                    color: #1e293b !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-slate-600,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-gray-600,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface .text-gray-500 {
                    color: #64748b !important;
                }
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface input,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface textarea,
                .studynest-layout.theme-dark .student-game-play-stage .student-game-surface select {
                    color: #1e293b !important;
                    background-color: #ffffff !important;
                }
                @media (max-width: 640px) {
                    .student-game-play-stage { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                    .student-game-play-stage .student-game-surface { border-radius: 1.25rem !important; padding: 1rem !important; }
                }
            `}</style>

            <div className="student-game-play-stage relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-sky-50 to-amber-50 py-8">
                <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-200/40 blur-3xl" />
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {previewComplete && (
                        <div className="relative mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-center font-bold text-emerald-700 shadow-sm">
                            Preview complete — no student result was created.
                        </div>
                    )}
                    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <EngineComponent
                            content={gameContent}
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
