import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function DraggableWord({ id, word, matched }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: matched });
    const style = { transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, zIndex: isDragging ? 50 : 1 };

    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            disabled={matched}
            className={`w-full px-5 py-4 rounded-2xl font-bold shadow-lg touch-none select-none ${matched ? 'bg-green-400 text-white cursor-default opacity-60' : 'bg-indigo-500 text-white cursor-grab active:cursor-grabbing border-b-4 border-indigo-700'}`}
        >
            {word}
        </button>
    );
}

function DroppableTarget({ id, word, matched, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: matched });
    return (
        <div ref={setNodeRef} className={`w-full px-5 py-4 rounded-2xl border-4 border-dashed text-center font-bold flex items-center justify-center min-h-[64px] ${matched ? 'bg-green-50 border-green-300 text-green-700' : wrong ? 'bg-red-50 border-red-300 text-red-600' : isOver ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            {word}
        </div>
    );
}

export default function MatchTheMeaning({ content, onComplete, onExit, onProgress, initialState }) {
    const pairs = content.pairs;
    const [rightOrder] = useState(() => shuffle(pairs.map((p) => p.match)));
    const [matchedWords, setMatchedWords] = useState(initialState?.matchedWords ?? []);
    const [wrongTarget, setWrongTarget] = useState(null);
    const [attempts, setAttempts] = useState(initialState?.attempts ?? 0);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }));

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                matchedWords: newState.matchedWords,
                attempts: newState.attempts,
            });
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        const word = String(active.id).replace('word-', '');
        const targetWord = String(over.id).replace('target-', '');
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
        }
    };

    return (
        <GameShell title="Match the Meaning" description={content.description} onExit={onExit}>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            {pairs.map((p) => (
                                <DraggableWord key={p.word} id={`word-${p.word}`} word={p.word} matched={matchedWords.includes(p.word)} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-4">
                            {rightOrder.map((w) => {
                                const matchedPair = pairs.find((p) => p.match === w && matchedWords.includes(p.word));
                                return <DroppableTarget key={w} id={`target-${w}`} word={w} matched={!!matchedPair} wrong={wrongTarget === w} />;
                            })}
                        </div>
                    </div>
                </DndContext>
                <p className="text-xs text-gray-400 mt-6 text-center uppercase tracking-widest font-bold">
                    Tap or drag words to match them with the correct meaning
                </p>
            </div>
        </GameShell>
    );
}
