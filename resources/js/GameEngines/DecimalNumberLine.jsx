import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function DecimalNumberLine({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const increment = content.increment ?? 0.5;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);
    const [selected, setSelected] = useState(null);

    const round = rounds[roundIndex];

    const numbers = [];
    for (let v = round.min; v <= round.max + 1e-9; v += increment) {
        numbers.push(Math.round(v * 10) / 10);
    }

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const handleSelect = (num) => {
        if (feedback) return;
        setSelected(num);
        const isCorrect = Math.abs(num - round.answer) < 0.01;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setFeedback(null);
                setSelected(null);
                updateProgress({ roundIndex: next, correctCount: newCorrect });
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    return (
        <GameShell
            title="Decimal Number Line"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 rounded-3xl border border-fuchsia-100 shadow-inner">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-white px-6 py-4 rounded-3xl shadow-lg border-2 border-fuchsia-100 text-center max-w-md">
                        <span className="text-lg font-black text-gray-800">
                            Start at {round.start.toFixed(1)}. Jump{' '}
                            <span className="text-fuchsia-600">
                                {round.operation === '+' ? 'forward' : 'backward'} {round.jumpAmount.toFixed(1)}
                            </span>
                            . Click where you land!
                        </span>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <div className="flex items-center gap-1 min-w-max px-4 py-6">
                            {numbers.map((num) => {
                                const isStart = Math.abs(num - round.start) < 0.01;
                                const isSelected = selected !== null && Math.abs(selected - num) < 0.01;
                                const isCorrectAnswer = feedback && Math.abs(num - round.answer) < 0.01;

                                return (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => handleSelect(num)}
                                        disabled={!!feedback}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-2 shadow transition
                                            ${isStart ? 'border-fuchsia-400 bg-fuchsia-100' : 'border-gray-200 bg-white'}
                                            ${isSelected && feedback === 'correct' ? 'bg-green-500 text-white border-green-500' : ''}
                                            ${isSelected && feedback === 'incorrect' ? 'bg-red-500 text-white border-red-500' : ''}
                                            ${isCorrectAnswer && !isSelected ? 'border-green-500 bg-green-100' : ''}
                                            ${!feedback ? 'hover:border-fuchsia-400 cursor-pointer' : 'cursor-default'}
                                        `}
                                    >
                                        {num.toFixed(1)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {feedback && (
                        <div className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Correct!' : `✗ The answer was ${round.answer.toFixed(1)}`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
