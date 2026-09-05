import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { ConfirmModal } from '@/Components/Modal';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
    ['numbers', 'coins', 'items', 'options', 'choices', 'prefixes', 'letters', 'cells', 'weights', 'categories',
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

function sanitizeProgress(progress, content) {
    if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return null;

    const safeProgress = { ...progress };
    if (Array.isArray(content?.rounds) && Number.isInteger(safeProgress.roundIndex)) {
        safeProgress.roundIndex = Math.min(Math.max(safeProgress.roundIndex, 0), content.rounds.length - 1);
    }

    return safeProgress;
}

const keepFocusedFieldVisible = (event) => {
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 150);
};

export default function GamesPlay({ result, game, preview = false }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewComplete, setPreviewComplete] = useState(false);
    const [confirmingExit, setConfirmingExit] = useState(false);
    const isLeavingRef = useRef(false);
    const isCompletingRef = useRef(false);

    const definition = gameDefinitions[game.title];
    const EngineComponent = ENGINE_MAP[game.title];
    const gameContent = useMemo(
        () => (definition ? prepareGameContent(definition, game, result.id) : null),
        [definition, game, result.id]
    );
    const safeInitialProgress = useMemo(() => sanitizeProgress(result.progress_data, gameContent), [result.progress_data, gameContent]);
    const [currentProgress, setCurrentProgress] = useState(safeInitialProgress);

    useEffect(() => () => {
        isLeavingRef.current = true;
    }, []);

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

    const exitGame = () => {
        isLeavingRef.current = true;
        if (preview) {
            router.visit(route('teacher.games.show', game.id), {
                onError: () => toast.error('Unable to return to the game details. Please try again.'),
            });
            return;
        }
        if (!currentProgress) {
            router.visit(route('student.games.index'), {
                onError: () => toast.error('Unable to return to games. Please try again.'),
            });
            return;
        }
        setIsSubmitting(true);
        router.post(route('student.games.save-progress', result.id), { progress: currentProgress }, {
            preserveState: true,
            onSuccess: () => toast.success('Game progress saved.'),
            onError: () => {
                isLeavingRef.current = false;
                toast.error('Unable to save your game progress. Please try again.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleExit = () => {
        if (!preview && currentProgress) {
            setConfirmingExit(true);
            return;
        }
        exitGame();
    };

    const handleComplete = (score) => {
        if (isLeavingRef.current || isCompletingRef.current) return;
        isCompletingRef.current = true;
        if (preview) {
            setPreviewComplete(true);
            return;
        }
        setIsSubmitting(true);
        router.post(route('student.games.submit-result', result.id), { score }, {
            onSuccess: () => toast.success('Game completed successfully.'),
            onError: () => {
                isCompletingRef.current = false;
                toast.error('Unable to submit the game result. Please try again.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    if (!definition || !EngineComponent || definition.comingSoon) {
        return (
            <AuthenticatedLayout header={<div className="w-full"><button type="button" onClick={() => router.visit(route('student.games.index'), { onError: () => toast.error('Unable to return to games. Please try again.') })} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-slate-800"><ArrowLeftIcon className="h-4 w-4" /> Back to Games</button></div>}>
                <Head title={`Playing: ${game.title}`} />
                <div className="flex min-h-[100dvh] items-center justify-center bg-white p-4 sm:p-6">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
                        <div className="text-6xl mb-6">🚀</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon!</h3>
                        <p className="text-gray-600 mb-8">This game isn't available to play yet. Check back later or ask your teacher!</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={
            <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <h2 className="break-words text-lg font-semibold leading-tight text-gray-800 sm:text-xl">{game.title}</h2>
                    {preview && <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">Teacher preview</span>}
                </div>
                <button type="button" onClick={handleExit} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-300 dark:hover:bg-slate-800">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Games
                </button>
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
                .student-game-play-stage input,
                .student-game-play-stage select,
                .student-game-play-stage textarea { scroll-margin-block: 9rem; }
                .student-game-play-stage button,
                .student-game-play-stage svg {
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }
                .student-game-play-stage [aria-roledescription="draggable"] {
                    -webkit-user-select: none;
                    user-select: none;
                    touch-action: none;
                }
                .student-game-play-stage .student-game-shell > div:first-child > button { display: none !important; }
                .student-game-play-stage .student-game-shell > div:first-child { justify-content: flex-end; }
                @media (max-width: 640px) {
                    .student-game-play-stage { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                    .student-game-play-stage .student-game-surface { border-radius: 1.25rem !important; padding: 1rem !important; }
                    .student-game-play-stage input:not([type="checkbox"]):not([type="radio"]),
                    .student-game-play-stage select,
                    .student-game-play-stage textarea { font-size: 16px; }
                }
                @media (hover: none), (prefers-reduced-motion: reduce) {
                    .student-game-play-stage .animate-in { animation: none !important; }
                }
            `}</style>

            <div className="student-game-play-stage relative min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-indigo-50 via-sky-50 to-amber-50 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8" onFocusCapture={keepFocusedFieldVisible}>
                <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/40 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-200/40 blur-3xl" />
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:px-8">
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
                            initialState={safeInitialProgress}
                        />
                    </div>
                </div>
            </div>
            <ConfirmModal
                show={confirmingExit}
                onClose={() => setConfirmingExit(false)}
                onConfirm={() => {
                    setConfirmingExit(false);
                    exitGame();
                }}
                title="Leave this game?"
                message="Your current progress will be saved before you leave."
                confirmText="Save and leave"
                cancelText="Keep playing"
                confirmColor="blue"
            />
        </AuthenticatedLayout>
    );
}
