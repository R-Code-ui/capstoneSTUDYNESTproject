import { useState, useCallback } from 'react';
import GameShell from './GameShell';

const SVG_SIZE = 360;
const PADDING = 28;

export default function CoordinatePlaneTreasureHunt({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];
    const { rangeMin, rangeMax } = round;
    const span = rangeMax - rangeMin;
    const usableSize = SVG_SIZE - PADDING * 2;
    const cellSize = usableSize / span;

    const toScreenX = (val) => PADDING + (val - rangeMin) * cellSize;
    const toScreenY = (val) => SVG_SIZE - PADDING - (val - rangeMin) * cellSize;

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const gridLines = [];
    for (let v = rangeMin; v <= rangeMax; v++) {
        gridLines.push(v);
    }

    const handlePointClick = (px, py) => {
        if (feedback) return;
        setSelected({ x: px, y: py });
    };

    const handleSubmit = () => {
        if (!selected || feedback) return;
        const isCorrect = selected.x === round.x && selected.y === round.y;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setSelected(null);
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrect });
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    const handleClearSelection = () => {
        if (feedback) return;
        setSelected(null);
    };

    return (
        <GameShell
            title="Coordinate Plane Treasure Hunt"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-3xl border border-teal-100 shadow-inner">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-teal-100">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm mr-2">Find the treasure at</span>
                        <span className="text-2xl font-black text-teal-600">({round.x}, {round.y})</span>
                    </div>

                    <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full max-w-[360px] h-auto aspect-square bg-white rounded-2xl shadow-lg border border-teal-100">
                        {gridLines.map((v) => (
                            <line
                                key={`v-${v}`}
                                x1={toScreenX(v)} y1={PADDING}
                                x2={toScreenX(v)} y2={SVG_SIZE - PADDING}
                                stroke={v === 0 ? '#0d9488' : '#e5e7eb'}
                                strokeWidth={v === 0 ? 2 : 1}
                            />
                        ))}
                        {gridLines.map((v) => (
                            <line
                                key={`h-${v}`}
                                x1={PADDING} y1={toScreenY(v)}
                                x2={SVG_SIZE - PADDING} y2={toScreenY(v)}
                                stroke={v === 0 ? '#0d9488' : '#e5e7eb'}
                                strokeWidth={v === 0 ? 2 : 1}
                            />
                        ))}

                        {gridLines.flatMap((px) =>
                            gridLines.map((py) => {
                                const isSelected = selected && selected.x === px && selected.y === py;
                                const isTarget = feedback && px === round.x && py === round.y;
                                return (
                                    <circle
                                        key={`${px}-${py}`}
                                        cx={toScreenX(px)}
                                        cy={toScreenY(py)}
                                        r={isSelected || isTarget ? 14 : 11}
                                        stroke="transparent"
                                        strokeWidth="16"
                                        fill={
                                            isSelected && feedback === 'correct' ? '#22c55e'
                                            : isSelected && feedback === 'incorrect' ? '#ef4444'
                                            : isTarget ? '#22c55e'
                                            : '#99f6e4'
                                        }
                                        className="cursor-pointer"
                                        onClick={() => handlePointClick(px, py)}
                                    />
                                );
                            })
                        )}
                    </svg>

                    {!feedback && selected && (
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="px-6 py-3 rounded-full bg-teal-600 text-white font-black shadow-lg hover:bg-teal-700"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="px-6 py-3 rounded-full bg-white text-teal-700 font-black border border-teal-200 shadow-sm hover:bg-teal-50"
                            >
                                Undo
                            </button>
                        </div>
                    )}

                    {feedback && (
                        <div className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Treasure found!' : `✗ It was at (${round.x}, ${round.y})`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
