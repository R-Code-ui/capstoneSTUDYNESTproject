import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function SkipCountingPath({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [foundCount, setFoundCount] = useState(0);
    const [wrongCellIndex, setWrongCellIndex] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const handleCellClick = (cellIndex) => {
        if (feedback) return;

        const expectedCellIndex = round.path[foundCount];

        if (cellIndex === expectedCellIndex) {
            const newFoundCount = foundCount + 1;
            setFoundCount(newFoundCount);

            if (newFoundCount === round.path.length) {
                const newCorrect = correctCount + 1;
                setFeedback('correct');

                setTimeout(() => {
                    if (roundIndex + 1 < rounds.length) {
                        const next = roundIndex + 1;
                        setCorrectCount(newCorrect);
                        setRoundIndex(next);
                        setFoundCount(0);
                        setFeedback(null);
                        updateProgress({ roundIndex: next, correctCount: newCorrect });
                    } else {
                        const finalScore = Math.round((newCorrect / rounds.length) * 100);
                        onComplete(finalScore);
                    }
                }, 800);
            }
        } else {
            setWrongCellIndex(cellIndex);
            setTimeout(() => setWrongCellIndex(null), 350);
        }
    };

    const foundSequence = round.path.slice(0, foundCount).map((idx) => round.cells[idx]);

    return (
        <GameShell
            title="Skip Counting Path"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-3xl border border-sky-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-sky-100 flex items-center gap-4">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                            Skip count by {round.skipBy}, starting at
                        </span>
                        <span className="text-3xl font-black text-sky-600">{round.startAt}</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 min-h-[2.5rem]">
                        {foundSequence.map((val, i) => (
                            <div
                                key={i}
                                className="w-12 h-9 rounded-lg flex items-center justify-center font-black text-sm bg-sky-500 text-white shadow"
                            >
                                {val}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {round.cells.map((num, i) => {
                            const isUsed = round.path.slice(0, foundCount).includes(i);
                            const isWrong = wrongCellIndex === i;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleCellClick(i)}
                                    disabled={isUsed || !!feedback}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border-b-4 active:scale-95 transition
                                        ${isUsed ? 'bg-sky-300 border-sky-500 text-white opacity-60' : ''}
                                        ${isWrong ? 'bg-red-400 border-red-600 text-white' : ''}
                                        ${!isUsed && !isWrong ? 'bg-white border-blue-200 text-gray-700 hover:border-blue-400 cursor-pointer' : ''}
                                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>

                    {feedback === 'correct' && (
                        <div className="text-xl font-black text-green-600">✓ Path complete!</div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
