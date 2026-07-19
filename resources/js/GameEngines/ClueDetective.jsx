import { useState, useCallback } from 'react';
import GameShell from './GameShell';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ClueDetective({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [selected, setSelected] = useState(new Set());
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
            });
        }
    }, [onProgress]);

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
                updateProgress({ roundIndex: next, correctCount: newCorrectCount });
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
            <div className="flex flex-col items-center gap-8 p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
                <div className="bg-indigo-50 px-6 py-3 rounded-full text-indigo-600 font-bold text-sm shadow-inner text-center">
                    🔍 Click the clues that define the bold word!
                </div>

                <div className="flex flex-wrap justify-center gap-2 leading-loose">
                    {round.words.map((word, i) => {
                        const isTarget = i === round.targetIndex;
                        const isSelected = selected.has(i);
                        const isClue = feedback && i >= round.clueRange[0] && i <= round.clueRange[1];

                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => toggleWord(i)}
                                className={`px-3 py-1 rounded-xl font-medium text-lg active:scale-95 cursor-pointer
                                    ${isTarget
                                        ? 'text-indigo-600 font-black cursor-default underline decoration-4 decoration-indigo-400 underline-offset-4'
                                        : ''
                                    }
                                    ${!isTarget && isSelected
                                        ? 'bg-indigo-500 text-white shadow-md'
                                        : !isTarget && !isSelected && isClue
                                            ? 'bg-green-400 text-white shadow-md'
                                            : !isTarget
                                                ? 'bg-gray-100 text-gray-700'
                                                : ''
                                    }
                                `}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>

                <div className="h-20 flex items-center justify-center">
                    {!feedback ? (
                        <PrimaryButton
                            type="button"
                            onClick={handleSubmit}
                            disabled={selected.size === 0}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg shadow-lg disabled:opacity-50"
                        >
                            Submit Clue
                        </PrimaryButton>
                    ) : (
                        <div className={`text-xl font-black px-8 py-4 rounded-full shadow-lg ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Great job!' : '✗ Almost! Look for clues.'}
                        </div>
                    )}
                </div>

                {feedback === 'incorrect' && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-700">Clue:</span> "{clueText()}"
                    </div>
                )}
            </div>
        </GameShell>
    );
}
