import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function AreaBlocks({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [filled, setFilled] = useState(new Set());
    const [feedback, setFeedback] = useState(null);

    const round = rounds[roundIndex];
    const totalCells = round.gridRows * round.gridCols;

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const toggleCell = (idx) => {
        if (feedback) return;
        setFilled((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
            }
            return next;
        });
    };

    const handleCheck = () => {
        const selectedCells = [...filled].map((index) => ({
            row: Math.floor(index / round.gridCols),
            col: index % round.gridCols,
        }));
        const rows = selectedCells.map((cell) => cell.row);
        const cols = selectedCells.map((cell) => cell.col);
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        const selectedRows = maxRow - minRow + 1;
        const selectedCols = maxCol - minCol + 1;
        const formsSolidRectangle = selectedCells.length === selectedRows * selectedCols;
        const isCorrect = filled.size === round.target
            && selectedRows === round.rows
            && selectedCols === round.cols
            && formsSolidRectangle;
        const newCorrect = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrect);
                setRoundIndex(next);
                setFilled(new Set());
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrect });
            } else {
                const finalScore = Math.round((newCorrect / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1000);
    };

    return (
        <GameShell
            title="Area Blocks"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-lime-50 to-green-50 p-6 rounded-3xl border border-lime-100 shadow-inner">
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-lime-100 text-center">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-sm block">
                            Build a rectangle
                        </span>
                        <span className="text-2xl font-black text-lime-600">
                            {round.rows} rows × {round.cols} columns = {round.target} squares
                        </span>
                    </div>

                    <div
                        className="grid gap-1 bg-white p-2 rounded-2xl shadow-inner border border-lime-100"
                        style={{ gridTemplateColumns: `repeat(${round.gridCols}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: totalCells }).map((_, idx) => {
                            const isFilled = filled.has(idx);
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => toggleCell(idx)}
                                    disabled={!!feedback}
                                    className={`w-4 h-4 sm:w-8 sm:h-8 rounded-md border transition
                                        ${isFilled ? 'bg-lime-500 border-lime-600' : 'bg-gray-50 border-gray-200 hover:border-lime-300'}
                                    `}
                                />
                            );
                        })}
                    </div>

                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Filled: {filled.size} / {round.target}
                    </div>

                    {!feedback && (
                        <button
                            type="button"
                            onClick={handleCheck}
                            disabled={filled.size === 0}
                            className="px-6 py-3 rounded-full bg-lime-600 text-white font-black shadow-lg active:scale-95 disabled:opacity-40"
                        >
                            Check
                        </button>
                    )}

                    {feedback && (
                        <div className={`text-xl font-black ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Perfect area!' : `✗ You need exactly ${round.target} squares`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
