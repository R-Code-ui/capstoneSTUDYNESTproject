import { useState } from 'react';
import GameShell from './GameShell';

export default function GraphBuilder({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [values, setValues] = useState(() => rounds[0].categories.map(() => 0));
    const [stage, setStage] = useState('build'); // build | question | feedback
    const [scoreSum, setScoreSum] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const round = rounds[roundIndex];
    const allMatch = values.every((v, i) => v === round.categories[i].target);

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
        const roundScore = 70 + (isCorrect ? 30 : 0); // bars already matched to get here
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
            } else {
                const finalScore = Math.round(newScoreSum / rounds.length);
                onComplete(finalScore);
            }
        }, 1200);
    };

    return (
        <GameShell
            title="Graph Builder"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{round.title}</div>

                {stage === 'build' && (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Click inside each bar's track to build it up to the correct height.
                        </p>
                        <div className="flex items-end gap-6" style={{ height: '220px' }}>
                            {round.categories.map((cat, i) => {
                                const value = values[i];
                                const heightPct = (value / round.maxValue) * 100;
                                const matched = value === cat.target;
                                return (
                                    <div key={cat.label} className="flex flex-col items-center">
                                        <div
                                            onClick={(e) => handleTrackClick(i, e)}
                                            className="relative w-14 h-48 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-600"
                                        >
                                            <div
                                                className={`absolute bottom-0 left-0 right-0 transition-all ${matched ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ height: `${heightPct}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{cat.label}</span>
                                        <span className="text-xs text-gray-400">{value}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {allMatch && (
                            <button
                                type="button"
                                onClick={handleContinueToQuestion}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                            >
                                Continue
                            </button>
                        )}
                    </>
                )}

                {(stage === 'question' || stage === 'feedback') && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-lg font-medium text-gray-900 dark:text-white text-center">
                            {round.question}
                        </div>
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
                                        className={`px-4 py-2 rounded-lg border-2 font-medium transition
                                            ${isSelected && stage === 'feedback' && cat.label === round.answer ? 'bg-green-500 text-white border-green-500' : ''}
                                            ${isSelected && stage === 'feedback' && cat.label !== round.answer ? 'bg-red-500 text-white border-red-500' : ''}
                                            ${isCorrectAnswer && !isSelected ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : ''}
                                            ${stage === 'question' ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400' : ''}
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
        </GameShell>
    );
}
