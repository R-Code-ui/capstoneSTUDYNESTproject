import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableWeight({ id, value }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : 1,
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="w-12 h-12 flex items-center justify-center rounded-md bg-slate-600 text-white font-bold shadow cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {value}
        </button>
    );
}

export default function BalanceScale({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [overshoots, setOvershoots] = useState(0);
    const [placed, setPlaced] = useState([]);
    const [bank, setBank] = useState(() =>
        rounds[0].weights.map((v, i) => ({ key: `w-${i}-${v}`, value: v }))
    );
    const [status, setStatus] = useState('playing'); // playing | balanced | tooHeavy

    const round = rounds[roundIndex];
    const rightSum = placed.reduce((sum, w) => sum + w.value, 0);

    const { setNodeRef, isOver } = useDroppable({ id: 'right-pan', disabled: status !== 'playing' });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const advanceRound = (wasCorrect) => {
        const newCorrect = correctCount + (wasCorrect ? 1 : 0);
        if (roundIndex + 1 < rounds.length) {
            const next = roundIndex + 1;
            setCorrectCount(newCorrect);
            setRoundIndex(next);
            setPlaced([]);
            setBank(rounds[next].weights.map((v, i) => ({ key: `w-${i}-${v}-${next}`, value: v })));
            setStatus('playing');
        } else {
            const rawScore = Math.round((newCorrect / rounds.length) * 100);
            const finalScore = Math.max(0, rawScore - overshoots * 5);
            onComplete(finalScore);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || over.id !== 'right-pan' || status !== 'playing') return;

        const tileIdx = bank.findIndex((t) => t.key === active.id);
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
            setStatus('tooHeavy');
            setOvershoots((o) => o + 1);
        }
    };

    const handleResetPan = () => {
        if (status !== 'tooHeavy') return;
        setBank([...bank, ...placed]);
        setPlaced([]);
        setStatus('playing');
    };

    return (
        <GameShell
            title="Balance Scale"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex items-end gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-28 h-20 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-2xl font-bold text-amber-900 dark:text-amber-100">
                                {round.leftValue}
                            </div>
                            <span className="text-xs text-gray-400 mt-1">Target</span>
                        </div>

                        <div className="text-3xl text-gray-400 pb-6">⚖️</div>

                        <div className="flex flex-col items-center">
                            <div
                                ref={setNodeRef}
                                className={`w-28 h-20 rounded-lg border-4 border-dashed flex flex-wrap items-center justify-center gap-1 p-1 transition
                                    ${status === 'balanced' ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                                        : status === 'tooHeavy' ? 'border-red-500 bg-red-100 dark:bg-red-900/30'
                                        : isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                        : 'border-gray-300 dark:border-gray-600'}
                                `}
                            >
                                {placed.map((w) => (
                                    <span key={w.key} className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                        {w.value}
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400 mt-1">Sum: {rightSum}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mt-4 min-h-[3rem]">
                        {bank.map((tile) => (
                            <DraggableWeight key={tile.key} id={tile.key} value={tile.value} />
                        ))}
                    </div>
                </DndContext>

                {status === 'balanced' && (
                    <div className="text-lg font-semibold text-green-600">✓ Balanced!</div>
                )}

                {status === 'tooHeavy' && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-lg font-semibold text-red-600">Too heavy!</div>
                        <button
                            type="button"
                            onClick={handleResetPan}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                        >
                            Reset Weights
                        </button>
                    </div>
                )}
            </div>
        </GameShell>
    );
}
