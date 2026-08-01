import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function DivisionDash({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);
    const [wrongAnswer, setWrongAnswer] = useState(null);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const handleAnswer = (choice) => {
        if (feedback) return;
        if (choice === round.quotient) {
            setFeedback('correct');
            const newCorrectCount = correctCount + 1;
            setTimeout(() => {
                if (roundIndex + 1 < rounds.length) {
                    const next = roundIndex + 1;
                    setCorrectCount(newCorrectCount);
                    setRoundIndex(next);
                    setFeedback(null);
                    setWrongAnswer(null);
                    updateProgress({ roundIndex: next, correctCount: newCorrectCount });
                } else {
                    const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                    onComplete(finalScore);
                }
            }, 700);
        } else {
            setWrongAnswer(choice);
            setFeedback('incorrect');
            setTimeout(() => {
                if (roundIndex + 1 < rounds.length) {
                    const next = roundIndex + 1;
                    setRoundIndex(next);
                    setFeedback(null);
                    setWrongAnswer(null);
                    updateProgress({ roundIndex: next, correctCount });
                } else {
                    const finalScore = Math.round((correctCount / rounds.length) * 100);
                    onComplete(finalScore);
                }
            }, 1200);
        }
    };

    return (
        <GameShell
            title="Division Dash"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-3xl border border-emerald-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-8 py-5 rounded-full shadow-lg border-2 border-emerald-100 flex items-center gap-6">
                        <span className="text-3xl font-black text-emerald-600">
                            {round.dividend} ÷ {round.divisor}
                        </span>
                        <span className="text-gray-400 font-black">= ?</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        {round.choices.map((choice) => {
                            const isWrongSelection = wrongAnswer === choice;
                            const isCorrect = feedback === 'correct' && choice === round.quotient;
                            let bg = 'bg-white border-emerald-200 text-emerald-800';
                            if (isWrongSelection) bg = 'bg-red-500 border-red-700 text-white';
                            else if (isCorrect) bg = 'bg-green-500 border-green-700 text-white';

                            return (
                                <button
                                    key={choice}
                                    type="button"
                                    onClick={() => handleAnswer(choice)}
                                    disabled={!!feedback}
                                    className={`w-full py-4 rounded-2xl font-black text-2xl shadow border-b-4 active:scale-95 ${bg}`}
                                >
                                    {choice}
                                </button>
                            );
                        })}
                    </div>

                    {feedback === 'correct' && (
                        <div className="text-xl font-black text-green-600">✓ Correct!</div>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="text-xl font-black text-red-600">
                            ✗ The answer was {round.quotient}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
