import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function GraphBuilder({ content, onComplete, onExit, onProgress, initialState }) {
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
            onProgress({
                roundIndex: newState.roundIndex,
                scoreSum: newState.scoreSum,
            });
        }
    }, [onProgress]);

    const handleTrackClick = (catIndex, e) => {
        if (stage !== 'build') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const ratio = 1 - clickY / rect.height;
        const newValue = Math.max(0, Math.min(round.maxValue, Math.round(ratio * round.maxValue)));
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
        <GameShell title="Graph Builder" description={content.description} roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`} onExit={onExit}>
            <div className="flex flex-col items-center gap-8 p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-indigo-900">{round.title}</h2>
                    {stage === 'build' && <p className="text-indigo-500 font-medium">Click in the bars to set the values!</p>}
                </div>

                {stage === 'build' && (
                    <div className="w-full flex flex-col items-center gap-8">
                        <div className="flex items-end gap-6 h-64 px-4 py-2 border-b-2 border-indigo-100">
                            {round.categories.map((cat, i) => {
                                const value = values[i];
                                const heightPct = (value / round.maxValue) * 100;
                                const matched = value === cat.target;

                                return (
                                    <div key={cat.label} className="flex flex-col items-center">
                                        <div
                                            onClick={(e) => handleTrackClick(i, e)}
                                            className="relative w-16 h-48 bg-indigo-50 rounded-t-xl cursor-pointer overflow-hidden border border-indigo-100 shadow-inner hover:bg-indigo-100"
                                        >
                                            <div className={`absolute bottom-0 left-0 right-0 ${matched ? 'bg-green-400' : 'bg-indigo-500'}`} style={{ height: `${heightPct}%` }} />
                                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(0deg, #c7d2fe 1px, transparent 1px)', backgroundSize: '100% 20%' }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-900 mt-3">{cat.label}</span>
                                        <span className="text-xs font-mono bg-indigo-100 px-2 py-0.5 rounded-full text-indigo-600 mt-1">{value}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {allMatch && (
                            <button type="button" onClick={handleContinueToQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg px-8 py-3 rounded-full shadow-lg">
                                Continue →
                            </button>
                        )}
                    </div>
                )}

                {(stage === 'question' || stage === 'feedback') && (
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="text-lg font-bold text-gray-800 bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
                            {round.question}
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            {round.categories.map((cat) => {
                                const isSelected = selectedAnswer === cat.label;
                                const isCorrectAnswer = stage === 'feedback' && cat.label === round.answer;
                                let statusClasses = "border-2 border-indigo-200 bg-white hover:border-indigo-400";
                                if (stage === 'feedback') {
                                    if (isSelected && cat.label === round.answer) statusClasses = "bg-green-500 text-white border-green-500";
                                    else if (isSelected && cat.label !== round.answer) statusClasses = "bg-red-500 text-white border-red-500";
                                    else if (isCorrectAnswer) statusClasses = "bg-green-100 text-green-700 border-green-300";
                                    else statusClasses = "opacity-50 border-gray-200";
                                }

                                return (
                                    <button
                                        key={cat.label}
                                        type="button"
                                        onClick={() => handleAnswer(cat.label)}
                                        disabled={stage === 'feedback'}
                                        className={`px-6 py-4 rounded-xl font-bold ${statusClasses}`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </GameShell>
    );
}
