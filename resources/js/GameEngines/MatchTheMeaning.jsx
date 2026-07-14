import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableWord({ id, word, matched }) {
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
            className={`w-full px-4 py-2 rounded-lg text-white font-medium shadow touch-none select-none
                ${matched ? 'bg-green-500 cursor-default' : 'bg-blue-600 cursor-grab active:cursor-grabbing'}
            `}
        >
            {word}
        </button>
    );
}

function DroppableTarget({ id, word, matched, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: matched });
    return (
        <div
            ref={setNodeRef}
            className={`w-full px-4 py-2 rounded-lg border-2 text-center font-medium transition
                ${matched
                    ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : wrong
                        ? 'bg-red-100 border-red-400 dark:bg-red-900/30'
                        : isOver
                            ? 'border-blue-500 border-dashed bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-300 dark:border-gray-600 border-dashed'}
            `}
        >
            {word}
        </div>
    );
}

export default function MatchTheMeaning({ content, onComplete, onExit }) {
    const pairs = content.pairs;
    const [rightOrder] = useState(() => shuffle(pairs.map((p) => p.match)));
    const [matchedWords, setMatchedWords] = useState([]);
    const [wrongTarget, setWrongTarget] = useState(null);
    const [attempts, setAttempts] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

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
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        {pairs.map((p) => (
                            <DraggableWord
                                key={p.word}
                                id={`word-${p.word}`}
                                word={p.word}
                                matched={matchedWords.includes(p.word)}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                        {rightOrder.map((w) => {
                            const matchedPair = pairs.find((p) => p.match === w && matchedWords.includes(p.word));
                            return (
                                <DroppableTarget
                                    key={w}
                                    id={`target-${w}`}
                                    word={w}
                                    matched={!!matchedPair}
                                    wrong={wrongTarget === w}
                                />
                            );
                        })}
                    </div>
                </div>
            </DndContext>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">
                Drag each word on the left to its matching meaning on the right.
            </p>
        </GameShell>
    );
}
