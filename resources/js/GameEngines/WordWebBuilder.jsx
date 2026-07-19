import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

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
            className="px-5 py-2.5 rounded-full bg-teal-500 text-white font-bold shadow-[0_4px_0_rgb(13,148,136)] hover:bg-teal-600 cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {word}
        </button>
    );
}

export default function WordWebBuilder({ content, onComplete, onExit, onProgress, initialState }) {
    const { centralWord, correctWords, distractorWords } = content;
    const [bank] = useState(() => shuffle([...correctWords, ...distractorWords]));
    const [placed, setPlaced] = useState(() => initialState?.placed ?? []);
    const [wrongFlash, setWrongFlash] = useState(false);
    const [wrongAttempts, setWrongAttempts] = useState(() => initialState?.wrongAttempts ?? 0);

    const { setNodeRef, isOver } = useDroppable({ id: 'web-zone' });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const remaining = bank.filter((w) => !placed.includes(w));

    const updateProgress = useCallback((newPlaced, newWrongAttempts) => {
        if (onProgress) {
            onProgress({ placed: newPlaced, wrongAttempts: newWrongAttempts });
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || over.id !== 'web-zone') return;

        const word = String(active.id);
        if (placed.includes(word)) return;

        if (correctWords.includes(word)) {
            const newPlaced = [...placed, word];
            setPlaced(newPlaced);
            updateProgress(newPlaced, wrongAttempts);

            if (newPlaced.length === correctWords.length) {
                const finalScore = Math.max(0, 100 - wrongAttempts * 5);
                setTimeout(() => onComplete(finalScore), 700);
            }
        } else {
            const newWrongAttempts = wrongAttempts + 1;
            setWrongAttempts(newWrongAttempts);
            setWrongFlash(true);
            updateProgress(placed, newWrongAttempts);
            setTimeout(() => setWrongFlash(false), 500);
        }
    };

    return (
        <GameShell title="Word Web Builder" description={content.description} onExit={onExit}>
            <div className="flex flex-col items-center gap-8 p-6">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div
                        ref={setNodeRef}
                        className={`relative w-80 h-80 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-8
                            ${wrongFlash
                                ? 'border-red-400 bg-red-50'
                                : isOver
                                    ? 'border-teal-400 bg-teal-50'
                                    : 'border-slate-200 bg-white shadow-lg'
                            }
                        `}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-indigo-600 text-white font-black text-center flex items-center justify-center shadow-lg z-10 p-2 break-words">
                            {centralWord}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center mt-24">
                            {placed.map((word) => (
                                <span key={word} className="px-3 py-1.5 rounded-full bg-green-500 text-white font-bold text-sm shadow">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="w-full max-w-lg bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-center text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Drag matches into the circle</p>
                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {remaining.map((word) => (
                                <DraggableWord key={word} id={word} word={word} />
                            ))}
                        </div>
                    </div>
                </DndContext>

                <p className="text-slate-500 text-sm font-medium">
                    Drag only the words that relate to <span className="font-bold text-indigo-600">{centralWord}</span>.
                </p>
            </div>
        </GameShell>
    );
}
