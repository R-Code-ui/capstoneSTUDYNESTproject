import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableWord({ id, word, used }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: used });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : used ? 0.25 : 1,
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            disabled={used}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium shadow cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {word}
        </button>
    );
}

function BlankSlot({ id, filled, wrong }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: !!filled });
    return (
        <span
            ref={setNodeRef}
            className={`inline-flex min-w-[80px] px-3 py-1 mx-1 rounded-md border-2 justify-center font-semibold align-middle
                ${filled
                    ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : wrong
                        ? 'bg-red-100 border-red-400 dark:bg-red-900/30'
                        : isOver
                            ? 'border-blue-500 border-dashed bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-300 dark:border-gray-600 border-dashed'}
            `}
        >
            {filled || '\u00A0'}
        </span>
    );
}

export default function StoryFillIn({ content, onComplete, onExit }) {
    const { paragraph, blanks, wordBank } = content;
    const [filledBlanks, setFilledBlanks] = useState(() => Array(blanks.length).fill(null));
    const [usedWords, setUsedWords] = useState([]);
    const [wrongBlank, setWrongBlank] = useState(null);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [bankOrder] = useState(() => shuffle(wordBank));

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const word = String(active.id).replace('word-', '');
        const blankIdx = parseInt(String(over.id).replace('blank-', ''), 10);
        if (filledBlanks[blankIdx]) return;

        if (blanks[blankIdx] === word) {
            const newFilled = [...filledBlanks];
            newFilled[blankIdx] = word;
            setFilledBlanks(newFilled);
            setUsedWords([...usedWords, word]);

            if (newFilled.every((b) => b !== null)) {
                const finalScore = Math.max(0, 100 - wrongAttempts * 10);
                setTimeout(() => onComplete(finalScore), 500);
            }
        } else {
            setWrongAttempts((w) => w + 1);
            setWrongBlank(blankIdx);
            setTimeout(() => setWrongBlank(null), 500);
        }
    };

    const parts = paragraph.split(/\{(\d+)\}/);

    return (
        <GameShell title="Story Fill-In" description={content.description} onExit={onExit}>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <p className="text-lg leading-loose text-gray-800 dark:text-gray-200">
                    {parts.map((part, i) => {
                        if (i % 2 === 1) {
                            const blankIdx = parseInt(part, 10);
                            return (
                                <BlankSlot
                                    key={i}
                                    id={`blank-${blankIdx}`}
                                    filled={filledBlanks[blankIdx]}
                                    wrong={wrongBlank === blankIdx}
                                />
                            );
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mt-8">
                    {bankOrder.map((word) => (
                        <DraggableWord
                            key={word}
                            id={`word-${word}`}
                            word={word}
                            used={usedWords.includes(word)}
                        />
                    ))}
                </div>
            </DndContext>
        </GameShell>
    );
}
