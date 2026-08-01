import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GameShell from './GameShell';

function SortableEvent({ id, text, index, selected, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black shadow-lg border-b-4 ${
                selected
                    ? 'bg-orange-700 border-orange-900 text-white ring-2 ring-orange-300'
                    : 'bg-orange-500 border-orange-700 text-white'
            } cursor-grab active:cursor-grabbing touch-none select-none`}
        >
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-orange-600 text-sm font-black shrink-0">
                {index + 1}
            </span>
            {text}
        </button>
    );
}

export default function SequenceTheStory({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [items, setItems] = useState(() =>
        rounds[initialState?.roundIndex ?? 0].scrambled.map((text, i) => ({ id: `e-${i}-${text}`, text }))
    );
    const [feedback, setFeedback] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [history, setHistory] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const round = rounds[roundIndex];

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ roundIndex: newState.roundIndex, correctCount: newState.correctCount });
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id || feedback) return;

        setHistory((prev) => [...prev, [...items]]);
        setItems((prev) => {
            const oldIndex = prev.findIndex((i) => i.id === active.id);
            const newIndex = prev.findIndex((i) => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleWordClick = (index) => {
        if (feedback) return;
        if (selectedIndex === null) {
            setSelectedIndex(index);
            return;
        }

        if (selectedIndex === index) {
            setSelectedIndex(null);
            return;
        }

        setHistory((prev) => [...prev, [...items]]);
        setItems((prev) => {
            const next = [...prev];
            [next[selectedIndex], next[index]] = [next[index], next[selectedIndex]];
            return next;
        });
        setSelectedIndex(null);
    };

    const undoLastMove = () => {
        if (feedback || history.length === 0) return;
        const previous = history[history.length - 1];
        setItems(previous);
        setHistory((prev) => prev.slice(0, -1));
        setSelectedIndex(null);
    };

    const handleCheck = () => {
        const attempt = items.map((i) => i.text);
        const isCorrect = attempt.join('|') === round.correct.join('|');
        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrectCount);
                setRoundIndex(next);
                setItems(rounds[next].scrambled.map((text, i) => ({ id: `e-${i}-${text}`, text })));
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrectCount });
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1200);
    };

    return (
        <GameShell
            title="Sequence the Story"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100 shadow-inner">
                <div className="flex flex-col items-center gap-6">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-3 w-full max-w-md">
                                {items.map((item, idx) => (
                                    <SortableEvent
                                        key={item.id}
                                        id={item.id}
                                        text={item.text}
                                        index={idx}
                                        selected={selectedIndex === idx}
                                        onClick={() => handleWordClick(idx)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={undoLastMove}
                            disabled={history.length === 0 || !!feedback}
                            className="px-6 py-3 rounded-full bg-white text-orange-700 font-black border border-orange-200 shadow-sm disabled:opacity-40"
                        >
                            Undo Move
                        </button>
                        {!feedback && (
                            <button
                                type="button"
                                onClick={handleCheck}
                                className="px-6 py-3 rounded-full bg-orange-600 text-white font-black shadow-lg active:scale-95"
                            >
                                Check Order
                            </button>
                        )}
                    </div>

                    {feedback && (
                        <div className={`text-xl font-black text-center ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback === 'correct' ? '✓ Correct order!' : `✗ Correct order: ${round.correct.join(' → ')}`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
