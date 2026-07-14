import { useState, useEffect, useRef } from 'react';
import GameShell from './GameShell';

const BALLOON_COLORS = ['bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-sky-400'];

function setupRound(round) {
    return round.numbers.map((n, i) => ({
        id: `b-${i}-${n}-${Math.random().toString(36).slice(2, 6)}`,
        value: n,
        isTarget: n === round.target,
        popped: false,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    }));
}

export default function BalloonPopMath({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [balloons, setBalloons] = useState(() => setupRound(rounds[0]));
    const [correctTaps, setCorrectTaps] = useState(0);
    const [wrongTaps, setWrongTaps] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);
    const finishedRef = useRef(false);

    const round = rounds[roundIndex];

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // auto-advance once every target balloon in the round is popped
    useEffect(() => {
        const targets = balloons.filter((b) => b.isTarget);
        if (targets.length > 0 && targets.every((b) => b.popped)) {
            const timeout = setTimeout(advanceRound, 500);
            return () => clearTimeout(timeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [balloons]);

    return (
        <GameShell
            title="Balloon Pop Math"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length} • ⏱ ${timeLeft}s`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    Tap the balloons that equal <span className="text-blue-600 dark:text-blue-400">{round.target}</span>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    {balloons.map((b) => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => handleTap(b)}
                            disabled={b.popped}
                            className={`w-16 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition
                                ${b.popped ? 'opacity-20 scale-75' : `${b.color} hover:scale-105`}
                            `}
                        >
                            {b.value}
                        </button>
                    ))}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Correct: {correctTaps} • Wrong: {wrongTaps}
                </div>
            </div>
        </GameShell>
    );
}
