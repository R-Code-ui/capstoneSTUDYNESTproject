import { useState } from 'react';
import GameShell from './GameShell';

export default function NumberLineRunner({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [selected, setSelected] = useState(null);

    const round = rounds[roundIndex];
    const numbers = Array.from({ length: round.max - round.min + 1 }, (_, i) => round.min + i);

    const handleSelect = (num) => {
        if (feedback) return;
        setSelected(num);
        const isCorrect = num === round.answer;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setFeedback(null);
                setSelected(null);
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    return (
        <GameShell
            title="Number Line Runner"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                    Start at <span className="text-blue-600 dark:text-blue-400">{round.start}</span>. Jump{' '}
                    <span className="text-blue-600 dark:text-blue-400">
                        {round.operation === '+' ? 'forward' : 'backward'} {round.steps}
                    </span>{' '}
                    spaces. Click where you land!
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="flex items-center gap-1 min-w-max px-4 py-6">
                        {numbers.map((num) => {
                            const isStart = num === round.start;
                            const isSelected = selected === num;
                            const isCorrectAnswer = feedback && num === round.answer;
                            return (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleSelect(num)}
                                    disabled={!!feedback}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition
                                        ${isStart ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
                                        ${isSelected && feedback === 'correct' ? 'bg-green-500 text-white border-green-500' : ''}
                                        ${isSelected && feedback === 'incorrect' ? 'bg-red-500 text-white border-red-500' : ''}
                                        ${isCorrectAnswer && !isSelected ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : ''}
                                        ${!feedback ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer' : 'cursor-default'}
                                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {feedback && (
                    <div className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback === 'correct' ? '✓ Correct!' : `✗ The answer was ${round.answer}`}
                    </div>
                )}
            </div>
        </GameShell>
    );
}
