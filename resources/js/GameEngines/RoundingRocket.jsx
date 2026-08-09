import { useState, useCallback, useMemo } from 'react';
import GameShell from './GameShell';

export default function RoundingRocket({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];
    const { number, roundTo, choices } = round;

    // 🔒 Memoize shuffled order – changes only when roundIndex changes 
    const shuffledChoices = useMemo(() => {
        return [...choices].sort(() => Math.random() - 0.5);
    }, [roundIndex]); // safe: round changes with roundIndex

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const correctAnswer = Math.round(number / roundTo) * roundTo;

    const handleChoice = (choice) => {
        if (feedback) return;
        setSelected(choice);
        const isCorrect = choice === correctAnswer;
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        const newCorrect = correctCount + (isCorrect ? 1 : 0);

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
        }, 800);
    };

    return (
        <GameShell
            title="Rounding Rocket"
            description="Choose the correct rounded number to launch your rocket!"
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-indigo-100 flex items-center gap-4">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                            Round to nearest {roundTo}
                        </span>
                        <span className="text-4xl font-black text-indigo-600">{number}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
                        {shuffledChoices.map((choice, i) => {
                            const isSelected = selected === choice;
                            const isCorrectChoice = choice === correctAnswer;
                            let btnStyle = 'bg-white border-blue-200 text-gray-700 hover:border-blue-400';
                            if (feedback) {
                                if (isCorrectChoice) {
                                    btnStyle = 'bg-green-100 border-green-500 text-green-700';
                                } else if (isSelected && !isCorrectChoice) {
                                    btnStyle = 'bg-red-100 border-red-500 text-red-700';
                                } else {
                                    btnStyle = 'bg-gray-100 border-gray-300 text-gray-400';
                                }
                            }
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleChoice(choice)}
                                    disabled={!!feedback}
                                    className={`w-full h-16 rounded-2xl flex items-center justify-center font-black text-lg shadow border-2 active:scale-95 transition ${btnStyle}`}
                                >
                                    {choice}
                                </button>
                            );
                        })}
                    </div>

                    {feedback === 'correct' && (
                        <div className="text-xl font-black text-green-600">🚀 Correct! Launching...</div>
                    )}
                    {feedback === 'incorrect' && (
                        <div className="text-xl font-black text-red-600">❌ Wrong answer. The correct one was {correctAnswer}</div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
