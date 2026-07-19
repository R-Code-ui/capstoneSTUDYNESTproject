import { useState, useEffect, useRef, useCallback } from 'react';
import GameShell from './GameShell';

const BALLOON_COLORS = ['bg-red-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-sky-500'];

function setupRound(round) {
    return round.numbers.map((n, i) => ({
        id: `b-${i}-${n}-${Math.random().toString(36).slice(2, 6)}`,
        value: n,
        isTarget: n === round.target,
        popped: false,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    }));
}

export default function BalloonPopMath({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [balloons, setBalloons] = useState(() => setupRound(rounds[initialState?.roundIndex ?? 0]));
    const [correctTaps, setCorrectTaps] = useState(initialState?.correctTaps ?? 0);
    const [wrongTaps, setWrongTaps] = useState(initialState?.wrongTaps ?? 0);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);
    const finishedRef = useRef(false);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctTaps: newState.correctTaps,
                wrongTaps: newState.wrongTaps,
            });
        }
    }, [onProgress]);

    useEffect(() => {
        setTimeLeft(15);
        finishedRef.current = false;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    advanceRound();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [roundIndex]);

    const handleTap = (balloon) => {
        if (balloon.popped) return;
        setBalloons((prev) => prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b)));
        if (balloon.isTarget) {
            setCorrectTaps((c) => c + 1);
        } else {
            setWrongTaps((w) => w + 1);
        }
    };

    const advanceRound = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        clearInterval(timerRef.current);

        if (roundIndex + 1 < rounds.length) {
            const next = roundIndex + 1;
            setRoundIndex(next);
            setBalloons(setupRound(rounds[next]));
            updateProgress({ roundIndex: next, correctTaps, wrongTaps });
        } else {
            const totalTargets = rounds.reduce(
                (sum, r) => sum + r.numbers.filter((n) => n === r.target).length,
                0
            );
            const rawScore = Math.max(0, correctTaps - wrongTaps);
            const finalScore = totalTargets > 0 ? Math.round((rawScore / totalTargets) * 100) : 0;
            onComplete(Math.min(100, finalScore));
        }
    };

    useEffect(() => {
        const targets = balloons.filter((b) => b.isTarget);
        if (targets.length > 0 && targets.every((b) => b.popped)) {
            const timeout = setTimeout(advanceRound, 500);
            return () => clearTimeout(timeout);
        }
    }, [balloons]);

    return (
        <GameShell
            title="Balloon Pop Math"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length} • ⏱ ${timeLeft}s`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-8 p-6 bg-gradient-to-b from-blue-50 to-white rounded-3xl border border-blue-100 shadow-inner">
                <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-blue-100 flex items-center gap-4">
                    <span className="text-gray-600 font-bold">Pop balloons equal to:</span>
                    <span className="text-4xl font-black text-blue-600 animate-pulse">{round.target}</span>
                </div>

                <div className="flex flex-wrap gap-6 justify-center max-w-2xl min-h-[300px] items-center">
                    {balloons.map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => handleTap(b)}
                            disabled={b.popped}
                            className={`relative w-20 h-24 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl active:scale-95 cursor-pointer
                                ${b.popped ? 'opacity-0 scale-50' : `${b.color}`}
                            `}
                        >
                            {b.value}
                            {!b.popped && (
                                <div className={`absolute -bottom-2 w-4 h-4 rotate-45 ${b.color} z-[-1]`}></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex gap-8 bg-white/50 px-6 py-3 rounded-2xl border border-white shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-green-500 uppercase tracking-widest">Correct</span>
                        <span className="text-2xl font-black text-green-600">{correctTaps}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-red-500 uppercase tracking-widest">Oops</span>
                        <span className="text-2xl font-black text-red-600">{wrongTaps}</span>
                    </div>
                </div>
            </div>
        </GameShell>
    );
}
