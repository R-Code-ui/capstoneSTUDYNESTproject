import { useState } from 'react';
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

export default function FractionPizza({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [shaded, setShaded] = useState(() => Array(rounds[0].totalSlices).fill(false));
    const [correctCount, setCorrectCount] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];
    const sliceAngle = 360 / round.totalSlices;

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
            <div className="flex flex-col items-center gap-6">
                <div className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                    Shade <span className="text-orange-600 dark:text-orange-400">{round.targetLabel}</span> of the pizza
                </div>

                <svg viewBox="0 0 200 200" className="w-56 h-56">
                    <circle cx="100" cy="100" r="98" fill="#fde68a" stroke="#b45309" strokeWidth="3" />
                    {Array.from({ length: round.totalSlices }).map((_, i) => {
                        const start = i * sliceAngle;
                        const end = start + sliceAngle;
                        return (
                            <path
                                key={i}
                                d={describeSlice(100, 100, 96, start, end)}
                                fill={shaded[i] ? '#ea580c' : 'transparent'}
                                stroke="#b45309"
                                strokeWidth="2"
                                onClick={() => toggleSlice(i)}
                                className="cursor-pointer"
                            />
                        );
                    })}
                </svg>

                {feedback && (
                    <div className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback === 'correct' ? '✓ Correct!' : `✗ That's not ${round.targetLabel}`}
                    </div>
                )}

                {!feedback && (
                    <button
                        type="button"
                        onClick={handleCheck}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                    >
                        Check
                    </button>
                )}
            </div>
        </GameShell>
    );
}
