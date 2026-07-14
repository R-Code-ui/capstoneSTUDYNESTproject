import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableWord({ id, word }) {
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
            className="px-3 py-1.5 rounded-full bg-teal-600 text-white font-medium shadow cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {word}
        </button>
    );
}

export default function WordWebBuilder({ content, onComplete, onExit }) {
    const { centralWord, correctWords, distractorWords } = content;
    const [bank] = useState(() => shuffle([...correctWords, ...distractorWords]));
    const [placed, setPlaced] = useState([]);
    const [wrongFlash, setWrongFlash] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(0);

    const { setNodeRef, isOver } = useDroppable({ id: 'web-zone' });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const remaining = bank.filter((w) => !placed.includes(w));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || over.id !== 'web-zone') return;

        const word = String(active.id);
        if (placed.includes(word)) return;

        if (correctWords.includes(word)) {
            const newPlaced = [...placed, word];
            setPlaced(newPlaced);

            if (newPlaced.length === correctWords.length) {
                const finalScore = Math.max(0, 100 - wrongAttempts * 5);
                setTimeout(() => onComplete(finalScore), 700);
            }
        } else {
            setWrongAttempts((w) => w + 1);
            setWrongFlash(true);
            setTimeout(() => setWrongFlash(false), 500);
        }
    };

    return (
        <GameShell title="Word Web Builder" description={content.description} onExit={onExit}>
            <div className="flex flex-col items-center gap-6">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div
                        ref={setNodeRef}
                        className={`relative w-72 h-72 rounded-full border-4 border-dashed flex flex-wrap items-center justify-center gap-2 p-6 transition
                            ${wrongFlash ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-teal-300 dark:border-teal-700'}
                        `}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-teal-700 text-white font-bold shadow z-10">
                            {centralWord}
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-16">
                            {placed.map((word) => (
                                <span key={word} className="px-3 py-1.5 rounded-full bg-green-500 text-white font-medium shadow">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mt-8 min-h-[3rem]">
                        {remaining.map((word) => (
                            <DraggableWord key={word} id={word} word={word} />
                        ))}
                    </div>
                </DndContext>

                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Drag only the words that relate to {centralWord} into the web.
                </p>
            </div>
        </GameShell>
    );
}
