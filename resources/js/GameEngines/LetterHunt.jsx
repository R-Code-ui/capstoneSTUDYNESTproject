import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function LetterHunt({ content, onComplete, onExit, onProgress, initialState }) {
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

    return (
        <GameShell
            title="Letter Hunt"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-emerald-100 flex items-center gap-4">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Find</span>
                        <span className="text-4xl font-black text-emerald-600 tracking-widest">{round.word}</span>
                    </div>

                    <div className="flex gap-2">
                        {round.word.split('').map((letter, i) => (
                            <div
                                key={i}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm border-2 transition
                                    ${i < foundCount ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-emerald-200 text-emerald-200'}
                                `}
                            >
                                {i < foundCount ? letter : ''}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {round.cells.map((letter, i) => {
                            const isUsed = round.path.slice(0, foundCount).includes(i);
                            const isWrong = wrongCellIndex === i;

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleCellClick(i)}
                                    disabled={isUsed || !!feedback}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-b-4 active:scale-95 transition
                                        ${isUsed ? 'bg-emerald-300 border-emerald-500 text-white opacity-60' : ''}
                                        ${isWrong ? 'bg-red-400 border-red-600 text-white' : ''}
                                        ${!isUsed && !isWrong ? 'bg-white border-teal-200 text-gray-700 hover:border-teal-400 cursor-pointer' : ''}
                                    `}
                                >
                                    {letter}
                                </button>
                            );
                        })}
                    </div>

                    {feedback === 'correct' && (
                        <div className="text-xl font-black text-green-600">✓ Word found!</div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
