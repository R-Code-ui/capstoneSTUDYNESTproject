import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableWeight({ id, value, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-500 text-white font-black text-lg shadow-lg border-b-4 border-indigo-700 cursor-grab active:cursor-grabbing active:scale-95 touch-none select-none ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            {value}
        </button>
    );
}

export default function BalanceScale({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [overshoots, setOvershoots] = useState(initialState?.overshoots ?? 0);
    const [placed, setPlaced] = useState([]);
    const [bank, setBank] = useState(() =>
        rounds[initialState?.roundIndex ?? 0].weights.map((v, i) => ({ key: `w-${i}-${v}`, value: v }))
    );
    const [status, setStatus] = useState('playing');

    const round = rounds[roundIndex];
    const rightSum = placed.reduce((sum, w) => sum + w.value, 0);

    const { setNodeRef, isOver } = useDroppable({ id: 'right-pan', disabled: status !== 'playing' });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
                overshoots: newState.overshoots,
            });
        }
    }, [onProgress]);

    const advanceRound = (wasCorrect) => {
        const newCorrect = correctCount + (wasCorrect ? 1 : 0);
        const newOvershoots = overshoots;
        if (roundIndex + 1 < rounds.length) {
            const next = roundIndex + 1;
            setCorrectCount(newCorrect);
            setRoundIndex(next);
            setPlaced([]);
            setBank(rounds[next].weights.map((v, i) => ({ key: `w-${i}-${v}-${next}`, value: v })));
            setStatus('playing');
            updateProgress({ roundIndex: next, correctCount: newCorrect, overshoots: newOvershoots });
        } else {
            const rawScore = Math.round((newCorrect / rounds.length) * 100);
            const finalScore = Math.max(0, rawScore - newOvershoots * 1);   // penalty: -1 per overshoot (silent)
            onComplete(finalScore);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || over.id !== 'right-pan' || status !== 'playing') return;

        placeWeight(active.id);
    };

    const placeWeight = (weightId) => {
        if (status !== 'playing') return;

        const tileIdx = bank.findIndex((t) => t.key === weightId);
        if (tileIdx === -1) return;

        const tile = bank[tileIdx];
        const newSum = rightSum + tile.value;
        const newPlaced = [...placed, tile];
        setPlaced(newPlaced);
        setBank(bank.filter((_, i) => i !== tileIdx));

        if (newSum === round.leftValue) {
            setStatus('balanced');
            setTimeout(() => advanceRound(true), 900);
        } else if (newSum > round.leftValue) {
            // Overshoot – immediately advance with penalty (no retry)
            setStatus('tooHeavy');
            setOvershoots((prev) => {
                const newVal = prev + 1;
                updateProgress({ roundIndex, correctCount, overshoots: newVal });
                return newVal;
            });
            // Advance after a short delay (shows feedback)
            setTimeout(() => advanceRound(false), 1200);
        }
    };

    return (
        <GameShell
            title="Balance Scale"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col items-center gap-8 mb-8">
                        <div className="flex items-end justify-center gap-8 w-full max-w-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-28 h-28 rounded-3xl bg-amber-400 shadow-xl flex items-center justify-center text-4xl font-black text-white border-b-8 border-amber-600">
                                    {round.leftValue}
                                </div>
                                <span className="text-xs font-bold text-amber-600 mt-3 uppercase tracking-widest">Target</span>
                            </div>

                            <div className="text-4xl text-indigo-300 pb-8">⚖️</div>

                            <div className="flex flex-col items-center">
                                <div
                                    ref={setNodeRef}
                                    className={`w-28 h-28 rounded-3xl border-4 border-dashed flex flex-wrap items-center justify-center gap-2 p-3 shadow-lg ${
                                        status === 'balanced' ? 'border-green-500 bg-green-100'
                                        : status === 'tooHeavy' ? 'border-red-500 bg-red-100'
                                        : isOver ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-indigo-200 bg-white'
                                    }`}
                                >
                                    {placed.map((w) => (
                                        <div
                                            key={w.key}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xs shadow"
                                        >
                                            {w.value}
                                        </div>
                                    ))}
                                </div>
                                <span className={`text-xs font-bold mt-3 uppercase tracking-widest ${rightSum > round.leftValue ? 'text-red-500' : 'text-indigo-400'}`}>
                                    Sum: {rightSum}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm">
                        <p className="text-center text-sm font-bold text-gray-400 mb-4 uppercase">
                            Drag or tap weights to add them to the scale
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {bank.map((tile) => (
                                <DraggableWeight
                                    key={tile.key}
                                    id={tile.key}
                                    value={tile.value}
                                    onClick={() => placeWeight(tile.key)}
                                />
                            ))}
                        </div>
                    </div>
                </DndContext>

                <div className="h-20 mt-6 flex justify-center items-center">
                    {status === 'balanced' && (
                        <div className="text-2xl font-black text-green-600 animate-bounce flex items-center gap-2">
                            <span>✓</span> Perfect Balance!
                        </div>
                    )}

                    {status === 'tooHeavy' && (
                        <div className="text-xl font-black text-red-600 animate-in fade-in zoom-in">
                            Too heavy!
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
