import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggablePrefix({ id, prefix }) {
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
            className="px-5 py-2.5 rounded-2xl bg-cyan-500 text-white font-bold shadow border-b-4 border-cyan-700 cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {prefix}
        </button>
    );
}

function BaseWordDropZone({ id, word, correct, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const bg = correct
        ? 'bg-green-500 border-green-700 text-white'
        : wrong
        ? 'bg-red-500 border-red-700 text-white'
        : isOver
        ? 'border-cyan-400 bg-cyan-50'
        : 'border-cyan-200 bg-white';

    return (
        <div
            ref={setNodeRef}
            className={`w-full py-5 rounded-2xl border-4 border-dashed font-bold text-2xl text-center shadow ${bg}`}
        >
            {word}
        </div>
    );
}

export default function PrefixPower({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [feedback, setFeedback] = useState(null);
    const [matched, setMatched] = useState(false);

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || feedback) return;

        const prefixId = String(active.id);
        const targetId = String(over.id);

        if (targetId === `base-${round.baseWord}` && prefixId === `prefix-${round.correctPrefix}`) {
            setMatched(true);
            setFeedback('correct');
            const newCorrectCount = correctCount + 1;
            setTimeout(() => {
                if (roundIndex + 1 < rounds.length) {
                    const next = roundIndex + 1;
                    setCorrectCount(newCorrectCount);
                    setRoundIndex(next);
                    setMatched(false);
                    setFeedback(null);
                    updateProgress({ roundIndex: next, correctCount: newCorrectCount });
                } else {
                    const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                    onComplete(finalScore);
                }
            }, 800);
        } else {
            setFeedback('incorrect');
            setTimeout(() => {
                if (roundIndex + 1 < rounds.length) {
                    const next = roundIndex + 1;
                    setRoundIndex(next);
                    setMatched(false);
                    setFeedback(null);
                    updateProgress({ roundIndex: next, correctCount });
                } else {
                    const finalScore = Math.round((correctCount / rounds.length) * 100);
                    onComplete(finalScore);
                }
            }, 1200);
        }
    };

    return (
        <GameShell
            title="Prefix Power"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-3xl border border-cyan-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col items-center gap-8">
                        <div className="bg-white px-8 py-5 rounded-full shadow-lg border-2 border-cyan-100 flex items-center gap-6">
                            <span className="text-xl font-black text-cyan-600">
                                {matched ? round.correctPrefix + round.baseWord : '____' + round.baseWord}
                            </span>
                        </div>

                        <BaseWordDropZone
                            id={`base-${round.baseWord}`}
                            word={round.baseWord}
                            correct={matched}
                            wrong={feedback === 'incorrect'}
                        />

                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {round.prefixes.map((prefix) => (
                                <DraggablePrefix key={prefix} id={`prefix-${prefix}`} prefix={prefix} />
                            ))}
                        </div>
                    </div>
                </DndContext>

                {feedback === 'incorrect' && (
                    <div className="text-center mt-4 text-lg font-black text-red-600">
                        ✗ The correct prefix is "{round.correctPrefix}"
                    </div>
                )}
            </div>
        </GameShell>
    );
}
