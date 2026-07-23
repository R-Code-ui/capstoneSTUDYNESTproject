import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function PercentBarBuilder({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [values, setValues] = useState(() => rounds[initialState?.roundIndex ?? 0].categories.map(() => 0));
    const [stage, setStage] = useState('build');
    const [scoreSum, setScoreSum] = useState(initialState?.scoreSum ?? 0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const round = rounds[roundIndex];
    const allMatch = values.every((v, i) => v === round.categories[i].target);

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, scoreSum: newState.scoreSum });
        }
    }, [onProgress]);

    const handleTrackClick = (catIndex, e) => {
        if (stage !== 'build') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const ratio = 1 - clickY / rect.height;
        const newValue = Math.max(0, Math.min(100, Math.round(ratio * 100 / 5) * 5));
        setValues((prev) => prev.map((v, i) => (i === catIndex ? newValue : v)));
    };

    const handleContinueToQuestion = () => {
        setStage('question');
    };

    const handleAnswer = (label) => {
        if (stage !== 'question') return;
        setSelectedAnswer(label);
        const isCorrect = label === round.answer;
        const roundScore = 70 + (isCorrect ? 30 : 0);
        const newScoreSum = scoreSum + roundScore;
        setStage('feedback');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setScoreSum(newScoreSum);
                setRoundIndex(next);
                setValues(rounds[next].categories.map(() => 0));
                setStage('build');
                setSelectedAnswer(null);
                updateProgress({ roundIndex: next, scoreSum: newScoreSum });
            } else {
                const finalScore = Math.round(newScoreSum / rounds.length);
                onComplete(finalScore);
            }
        }, 1200);
    };

    return (
        <GameShell
            title="Percent Bar Builder"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                <div className="flex flex-col items-center gap-6">
                    <div className="text-lg font-black text-gray-800 text-center">{round.title}</div>

                    {stage === 'build' && (
                        <>
                            <p className="text-sm text-gray-500 font-bold text-center">
                                Click inside each bar's track to build it up to the correct percentage.
                            </p>
                            <div className="flex items-end gap-6" style={{ height: '220px' }}>
                                {round.categories.map((cat, i) => {
                                    const value = values[i];
                                    const matched = value === cat.target;
                                    return (
                                        <div key={cat.label} className="flex flex-col items-center">
                                            <div
                                                onClick={(e) => handleTrackClick(i, e)}
                                                className="relative w-16 h-48 bg-white rounded-xl cursor-pointer overflow-hidden border-2 border-indigo-100 shadow-inner"
                                            >
                                                <div
                                                    className={`absolute bottom-0 left-0 right-0 transition-all ${matched ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                    style={{ height: `${value}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-gray-700 mt-2">{cat.label}</span>
                                            <span className="text-xs font-bold text-gray-400">{value}%</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {allMatch && (
                                <button
                                    type="button"
                                    onClick={handleContinueToQuestion}
                                    className="px-6 py-3 rounded-full bg-indigo-600 text-white font-black shadow-lg active:scale-95"
                                >
                                    Continue
                                </button>
                            )}
                        </>
                    )}

                    {(stage === 'question' || stage === 'feedback') && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-lg font-black text-gray-900 text-center">{round.question}</div>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {round.categories.map((cat) => {
                                    const isSelected = selectedAnswer === cat.label;
                                    const isCorrectAnswer = stage === 'feedback' && cat.label === round.answer;
                                    return (
                                        <button
                                            key={cat.label}
                                            type="button"
                                            onClick={() => handleAnswer(cat.label)}
                                            disabled={stage === 'feedback'}
                                            className={`px-4 py-3 rounded-2xl border-2 font-black shadow-lg transition
                                                ${isSelected && stage === 'feedback' && cat.label === round.answer ? 'bg-green-500 text-white border-green-500' : ''}
                                                ${isSelected && stage === 'feedback' && cat.label !== round.answer ? 'bg-red-500 text-white border-red-500' : ''}
                                                ${isCorrectAnswer && !isSelected ? 'border-green-500 bg-green-100' : ''}
                                                ${stage === 'question' ? 'border-gray-200 bg-white hover:border-indigo-400' : ''}
                                            `}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
