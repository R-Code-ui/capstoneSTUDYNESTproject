import { useState, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GameShell from './GameShell';

function SortableLetter({ id, letter }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 20 : 1,
    };

    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="w-14 h-14 rounded-2xl bg-violet-500 text-white text-2xl font-black shadow-[0_4px_0_rgb(109,40,217)] cursor-grab active:cursor-grabbing touch-none select-none flex items-center justify-center"
        >
            {letter}
        </button>
    );
}

export default function AlphabeticalOrder({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [items, setItems] = useState(() => {
        const startRound = initialState?.roundIndex ?? 0;
        const r = rounds[startRound];
        return r.letters.map((letter, i) => ({ id: `l-${i}-${letter}`, letter }));
    });
    const [feedback, setFeedback] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
            });
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id || feedback) return;
        setItems((prev) => {
            const oldIndex = prev.findIndex((i) => i.id === active.id);
            const newIndex = prev.findIndex((i) => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleCheck = () => {
        const currentOrder = items.map((i) => i.letter);
        const correctOrder = round.correctOrder;
        const isCorrect = currentOrder.join(',') === correctOrder.join(',');
        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrectCount);
                setRoundIndex(next);
                const nextRound = rounds[next];
                setItems(nextRound.letters.map((l, i) => ({ id: `l-${i}-${l}`, letter: l })));
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrectCount });
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1000);
    };

    return (
        <GameShell
            title="Alphabetical Order"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-8 p-6 bg-white rounded-3xl border border-violet-100 shadow-xl max-w-2xl mx-auto">
                <p className="text-violet-600 font-medium text-center">
                    Drag the letters into alphabetical order
                </p>

                <div className="w-full min-h-[100px] bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200 flex items-center justify-center p-6">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {items.map((item) => (
                                    <SortableLetter key={item.id} id={item.id} letter={item.letter} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={handleCheck}
                        disabled={!!feedback}
                        className="px-8 py-3 rounded-full bg-violet-600 text-white font-black text-lg shadow-lg hover:bg-violet-700 disabled:opacity-50"
                    >
                        Check Order
                    </button>
                </div>

                <div className="h-12 flex items-center justify-center">
                    {feedback && (
                        <div className={`text-lg font-black px-6 py-2 rounded-full ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {feedback === 'correct' ? '✓ Correct!' : `✗ The order is: ${round.correctOrder.join(' ')}`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
