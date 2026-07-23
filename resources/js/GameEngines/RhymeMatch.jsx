import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function RhymeMatch({ content, onComplete, onExit, onProgress, initialState }) {
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

        setSelected(option.word);
        const isCorrect = option.isRhyme;
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
        }, 800);
    };

    return (
        <GameShell
            title="Rhyme Match"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-6 rounded-3xl border border-rose-100 shadow-inner">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-rose-100 flex items-center gap-4">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Rhymes with</span>
                        <span className="text-4xl font-black text-rose-500 uppercase">{round.target}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl">
                        {round.options.map((opt) => {
                            const isSelected = selected === opt.word;
                            const showCorrect = feedback && opt.isRhyme;
                            const showWrongSelected = feedback && isSelected && !opt.isRhyme;

                            return (
                                <button
                                    key={opt.word}
                                    type="button"
                                    onClick={() => handlePick(opt)}
                                    disabled={!!feedback}
                                    className={`px-4 py-4 rounded-2xl font-black text-lg uppercase shadow-lg border-b-4 active:scale-95 transition
                                        ${showCorrect ? 'bg-green-400 border-green-600 text-white' : ''}
                                        ${showWrongSelected ? 'bg-red-400 border-red-600 text-white' : ''}
                                        ${!feedback ? 'bg-white border-rose-200 text-gray-700 hover:border-rose-400' : ''}
                                        ${feedback && !showCorrect && !showWrongSelected ? 'bg-white border-gray-100 text-gray-300' : ''}
                                    `}
                                >
                                    {opt.word}
                                </button>
                            );
                        })}
                    </div>

                    {feedback && (
                        <div className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Nice rhyme!' : '✗ Not quite — try the next one!'}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
