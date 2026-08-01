import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableWord({ id, word }) {
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
            className="px-5 py-2.5 rounded-2xl bg-violet-500 text-white font-bold shadow border-b-4 border-violet-700 cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {word}
        </button>
    );
}

function DroppableTarget({ id, word, matched, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const bg = matched
        ? 'bg-green-500 border-green-700 text-white'
        : wrong
        ? 'bg-red-500 border-red-700 text-white'
        : isOver
        ? 'border-violet-400 bg-violet-50'
        : 'border-violet-200 bg-white';

    return (
        <div
            ref={setNodeRef}
            className={`w-full py-4 rounded-2xl border-4 border-dashed font-bold text-lg text-center shadow ${bg}`}
        >
            {word}
        </div>
    );
}

export default function HomophoneMatch({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds; // each round: { word: 'pair', match: 'pear', distractors: ['pare', 'pear']? }
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

        const wordId = String(active.id);
        const targetId = String(over.id);

        if (targetId === `target-${round.word}` && wordId === `word-${round.match}`) {
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
            title="Homophone Match"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-3xl border border-violet-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col items-center gap-8">
                        <div className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-violet-100">
                            <span className="text-xl font-black text-violet-600">{round.word}</span>
                        </div>

                        <div className="w-full max-w-xs">
                            <DroppableTarget
                                id={`target-${round.word}`}
                                word={matched ? round.match : 'Drop here'}
                                matched={matched}
                                wrong={feedback === 'incorrect'}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {round.options.map((option) => (
                                <DraggableWord key={option} id={`word-${option}`} word={option} />
                            ))}
                        </div>
                    </div>
                </DndContext>

                {feedback === 'incorrect' && (
                    <div className="text-center mt-4 text-lg font-black text-red-600">
                        ✗ Try again! The correct pair: {round.word} – {round.match}
                    </div>
                )}
            </div>
        </GameShell>
    );
}
