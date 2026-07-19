import { useState, useCallback } from 'react';
import GameShell from './GameShell';

function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function FractionPizza({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [shaded, setShaded] = useState(() =>
        initialState ? Array(rounds[initialState.roundIndex].totalSlices).fill(false) : Array(rounds[0].totalSlices).fill(false)
    );
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];
    const sliceAngle = 360 / round.totalSlices;

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
            });
        }
    }, [onProgress]);

    const toggleSlice = (idx) => {
        if (feedback) return;
        setShaded((prev) => prev.map((s, i) => (i === idx ? !s : s)));
    };

    const handleCheck = () => {
        const shadedCount = shaded.filter(Boolean).length;
        const isCorrect = shadedCount === round.target;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setShaded(Array(rounds[next].totalSlices).fill(false));
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrect });
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    return (
        <GameShell
            title="Fraction Pizza"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-8 p-6 bg-orange-50 rounded-3xl border border-orange-100 shadow-inner max-w-lg mx-auto">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-md border-b-4 border-orange-200 text-center">
                    <p className="text-lg font-bold text-gray-700">
                        Shade <span className="text-orange-600 font-black text-2xl px-2">{round.targetLabel}</span>
                        of the pizza!
                    </p>
                </div>

                <div className="relative group p-4 bg-white rounded-full shadow-2xl">
                    <svg viewBox="0 0 200 200" className="w-56 h-56 cursor-pointer drop-shadow-lg">
                        <circle cx="100" cy="100" r="98" fill="#f59e0b" stroke="#92400e" strokeWidth="4" />
                        <circle cx="100" cy="100" r="92" fill="#fde68a" />
                        {Array.from({ length: round.totalSlices }).map((_, i) => {
                            const start = i * sliceAngle;
                            const end = start + sliceAngle;
                            return (
                                <path
                                    key={i}
                                    d={describeSlice(100, 100, 92, start, end)}
                                    fill={shaded[i] ? '#ea580c' : 'transparent'}
                                    stroke="#b45309"
                                    strokeWidth="1"
                                    onClick={() => toggleSlice(i)}
                                    className="cursor-pointer hover:fill-orange-400"
                                />
                            );
                        })}
                    </svg>
                </div>

                <div className="h-24 flex flex-col items-center justify-center">
                    {feedback ? (
                        <div className={`text-xl font-black px-6 py-3 rounded-full shadow-lg flex items-center gap-2 ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Yummy! Correct!' : '✗ Oops! Try again.'}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCheck}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-black text-lg px-10 py-4 rounded-full shadow-[0_6px_0_rgb(194,65,12)] active:shadow-none active:translate-y-1"
                        >
                            Check Answer
                        </button>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
