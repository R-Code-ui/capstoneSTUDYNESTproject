import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function NumberLineRunner({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);
    const [selected, setSelected] = useState(null);

    const round = rounds[roundIndex];
    const numbers = Array.from({ length: round.max - round.min + 1 }, (_, i) => round.min + i);

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
            });
        }
    }, [onProgress]);

    const handleSelect = (num) => {
        if (feedback) return;
        setSelected(num);
    };

    const handleSubmit = () => {
        if (selected === null || feedback) return;
        const isCorrect = selected === round.answer;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setFeedback(null);
                setSelected(null);
                updateProgress({ roundIndex: next, correctCount: newCorrect });
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    const handleClearSelection = () => {
        if (feedback) return;
        setSelected(null);
    };

    return (
        <GameShell title="Number Line Runner" description={content.description} roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`} onExit={onExit}>
            <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-col items-center gap-5 rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-inner sm:gap-8 sm:p-6">
                <div className="w-full min-w-0 max-w-full break-words rounded-2xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm sm:px-8 sm:py-5">
                    <p className="text-base font-bold leading-relaxed text-gray-800 sm:text-xl">
                        Start at <span className="text-blue-600 px-2 py-1 bg-blue-100 rounded-lg font-black">{round.start}</span>.
                        Jump {round.operation === '+' ? 'forward' : 'backward'}
                        <span className="text-blue-600 font-black px-1"> {round.steps} </span> spaces.
                    </p>
                    <p className="mt-2 text-sm font-medium text-blue-400">Click where you land!</p>
                </div>

                <div className="w-full overflow-x-hidden py-2 sm:overflow-x-auto sm:py-4">
                    <div className="grid w-full grid-cols-4 justify-items-center gap-2 px-1 sm:flex sm:min-w-max sm:items-center sm:justify-center sm:gap-3 sm:px-4">
                        {numbers.map((num) => {
                            const isStart = num === round.start;
                            const isSelected = selected === num;
                            const isCorrectAnswer = feedback && num === round.answer;
                            let baseStyle = "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm border-2";
                            let stateStyle = "bg-white border-blue-200 text-blue-900 hover:border-blue-400";

                            if (isStart) stateStyle = "bg-blue-500 border-blue-600 text-white shadow-blue-200";
                            if (isSelected && !feedback) stateStyle = "bg-cyan-100 border-cyan-500 text-cyan-900";
                            if (isSelected && feedback === 'correct') stateStyle = "bg-green-500 border-green-600 text-white";
                            if (isSelected && feedback === 'incorrect') stateStyle = "bg-red-500 border-red-600 text-white";
                            if (isCorrectAnswer && !isSelected) stateStyle = "bg-green-100 border-green-400 text-green-700";
                            if (feedback) stateStyle += " cursor-default opacity-80";

                            return (
                                <button key={num} type="button" onClick={() => handleSelect(num)} disabled={!!feedback} className={`${baseStyle} ${stateStyle}`}>
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {!feedback && selected !== null && (
                    <div className="flex items-center justify-center gap-4">
                        <button type="button" onClick={handleSubmit} className="px-6 py-3 rounded-full bg-blue-600 text-white font-black shadow-lg hover:bg-blue-700">
                            Submit
                        </button>
                        <button type="button" onClick={handleClearSelection} className="px-6 py-3 rounded-full bg-white text-blue-700 font-black border border-blue-200 shadow-sm hover:bg-blue-50">
                            Undo
                        </button>
                    </div>
                )}

                <div className="h-10 flex items-center justify-center">
                    {feedback && (
                        <div className={`text-xl font-black px-6 py-2 rounded-full shadow-md ${feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {feedback === 'correct' ? '✓ Great Jump!' : `✗ Oops! The answer was ${round.answer}`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
