import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableIdiom({ id, word, matched }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: matched });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : matched ? 0.3 : 1,
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            disabled={matched}
            className={`w-full px-4 py-3 rounded-2xl font-black text-sm sm:text-base shadow-lg border-b-4 touch-none select-none text-left
                ${matched ? 'bg-green-400 border-green-600 text-white cursor-default' : 'bg-amber-500 border-amber-700 text-white cursor-grab active:cursor-grabbing active:scale-95'}
            `}
        >
            {word}
        </button>
    );
}

function DroppableMeaning({ id, word, matched, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: matched });
    return (
        <div
            ref={setNodeRef}
            className={`w-full px-4 py-3 rounded-2xl border-4 text-center text-sm sm:text-base font-bold shadow-inner transition
                ${matched
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : wrong
                        ? 'bg-red-100 border-red-400'
                        : isOver
                            ? 'border-amber-400 border-dashed bg-amber-50'
                            : 'border-amber-200 border-dashed bg-white text-gray-500'}
            `}
        >
            {word}
        </div>
    );
}

export default function IdiomMatch({ content, onComplete, onExit, onProgress, initialState }) {
    const pairs = content.pairs;
    const [rightOrder] = useState(() => shuffle(pairs.map((p) => p.match)));
    const [matchedWords, setMatchedWords] = useState(initialState?.matchedWords ?? []);
    const [wrongTarget, setWrongTarget] = useState(null);
    const [attempts, setAttempts] = useState(initialState?.attempts ?? 0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({ matchedWords: newState.matchedWords, attempts: newState.attempts });
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const word = String(active.id).replace('idiom-', '');
        const targetWord = String(over.id).replace('meaning-', '');
        const pair = pairs.find((p) => p.word === word);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (pair && pair.match === targetWord) {
            const newMatched = [...matchedWords, word];
            setMatchedWords(newMatched);
            updateProgress({ matchedWords: newMatched, attempts: newAttempts });

            if (newMatched.length === pairs.length) {
                const finalScore = Math.round((pairs.length / newAttempts) * 100);
                setTimeout(() => onComplete(Math.min(100, finalScore)), 500);
            }
        } else {
            setWrongTarget(targetWord);
            setTimeout(() => setWrongTarget(null), 500);
            updateProgress({ matchedWords, attempts: newAttempts });
        }
    };

    return (
        <GameShell title="Idiom Match" description={content.description} onExit={onExit}>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-3xl border border-amber-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex flex-col gap-3">
                            {pairs.map((p) => (
                                <DraggableIdiom
                                    key={p.word}
                                    id={`idiom-${p.word}`}
                                    word={p.word}
                                    matched={matchedWords.includes(p.word)}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-3">
                            {rightOrder.map((w) => {
                                const matchedPair = pairs.find((p) => p.match === w && matchedWords.includes(p.word));
                                return (
                                    <DroppableMeaning
                                        key={w}
                                        id={`meaning-${w}`}
                                        word={w}
                                        matched={!!matchedPair}
                                        wrong={wrongTarget === w}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </DndContext>

                <p className="text-xs text-gray-400 mt-6 text-center uppercase tracking-widest font-bold">
                    Tap or drag each idiom to its true meaning
                </p>
            </div>
        </GameShell>
    );
}
