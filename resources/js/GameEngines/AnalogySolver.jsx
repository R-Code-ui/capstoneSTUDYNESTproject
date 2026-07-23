import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function AnalogySolver({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const handlePick = (option) => {
        if (feedback) return;

        setSelected(option);
        const isCorrect = option === round.correct;
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

    return (
        <GameShell
            title="Analogy Solver"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-3xl border border-cyan-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-6 py-5 rounded-3xl shadow-lg border-2 border-cyan-100 text-center max-w-lg">
                        <span className="text-xl sm:text-2xl font-black text-gray-800">{round.prompt}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        {round.options.map((opt) => {
                            const isSelected = selected === opt;
                            const showCorrect = feedback && opt === round.correct;
                            const showWrongSelected = feedback && isSelected && opt !== round.correct;

                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handlePick(opt)}
                                    disabled={!!feedback}
                                    className={`px-4 py-4 rounded-2xl font-black text-lg shadow-lg border-b-4 active:scale-95 transition
                                        ${showCorrect ? 'bg-green-400 border-green-600 text-white' : ''}
                                        ${showWrongSelected ? 'bg-red-400 border-red-600 text-white' : ''}
                                        ${!feedback ? 'bg-white border-cyan-200 text-gray-700 hover:border-cyan-400' : ''}
                                        ${feedback && !showCorrect && !showWrongSelected ? 'bg-white border-gray-100 text-gray-300' : ''}
                                    `}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {feedback && (
                        <div className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Correct!' : `✗ The answer was "${round.correct}"`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
