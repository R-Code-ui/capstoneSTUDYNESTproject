import { useState } from 'react';
import GameShell from './GameShell';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ClueDetective({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [selected, setSelected] = useState(new Set());
    const [correctCount, setCorrectCount] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];

    const toggleWord = (idx) => {
        if (feedback || idx === round.targetIndex) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
            }
            return next;
        });
    };

    const handleSubmit = () => {
        const [start, end] = round.clueRange;
        const expected = new Set();
        for (let i = start; i <= end; i++) expected.add(i);

        const isCorrect =
            selected.size === expected.size &&
            [...selected].every((i) => expected.has(i));

        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrectCount);
                setRoundIndex(next);
                setSelected(new Set());
                setFeedback(null);
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1200);
    };

    const clueText = () => {
        const [start, end] = round.clueRange;
        return round.words.slice(start, end + 1).join(' ');
    };

    return (
        <GameShell
            title="Clue Detective"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Click the words that give a clue to the meaning of the bolded word, then submit.
                </p>

                <p className="text-lg leading-loose text-center text-gray-800 dark:text-gray-200">
                    {round.words.map((word, i) => {
                        const isTarget = i === round.targetIndex;
                        const isSelected = selected.has(i);
                        const isClue = feedback && i >= round.clueRange[0] && i <= round.clueRange[1];

                        return (
                            <span
                                key={i}
                                onClick={() => toggleWord(i)}
                                className={`inline-block px-1 mx-0.5 rounded cursor-pointer transition
                                    ${isTarget ? 'font-bold text-blue-600 dark:text-blue-400 cursor-default' : ''}
                                    ${!isTarget && isSelected ? 'bg-blue-200 dark:bg-blue-800' : ''}
                                    ${!isTarget && !isSelected && isClue ? 'bg-green-200 dark:bg-green-800' : ''}
                                `}
                            >
                                {word}
                            </span>
                        );
                    })}
                </p>

                {!feedback && (
                    <PrimaryButton type="button" onClick={handleSubmit} disabled={selected.size === 0}>
                        Submit Clue
                    </PrimaryButton>
                )}

                {feedback && (
                    <div className={`text-lg font-semibold text-center ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback === 'correct' ? '✓ Correct!' : `✗ The clue was: "${clueText()}"`}
                    </div>
                )}
            </div>
        </GameShell>
    );
}
