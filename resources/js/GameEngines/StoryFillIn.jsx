import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableWord({ id, word, used, onClick }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: used });
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
            disabled={used}
            onClick={() => !used && onClick?.(word)}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-[0_4px_0_rgb(67,56,202)] touch-none select-none
                ${used
                    ? 'opacity-20 cursor-default'
                    : 'bg-indigo-500 hover:bg-indigo-600 cursor-grab active:cursor-grabbing'
                }
            `}
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
            className={`inline-flex min-w-[100px] px-3 py-1 mx-1.5 rounded-lg border-2 border-dashed font-bold align-middle justify-center
                ${filled
                    ? 'bg-green-100 border-green-400 text-green-700 shadow-inner'
                    : wrong
                        ? 'bg-red-100 border-red-400'
                        : isOver
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-indigo-200 bg-white'
                }
            `}
        >
            {filled || '\u00A0'}
        </span>
    );
}

export default function StoryFillIn({ content, onComplete, onExit, onProgress, initialState }) {
    const { paragraph, blanks, wordBank } = content;
    const [filledBlanks, setFilledBlanks] = useState(() => initialState?.filledBlanks ?? Array(blanks.length).fill(null));
    const [usedWords, setUsedWords] = useState(() => initialState?.usedWords ?? []);
    const [wrongBlank, setWrongBlank] = useState(null);
    const [wrongAttempts, setWrongAttempts] = useState(() => initialState?.wrongAttempts ?? 0);
    const [bankOrder] = useState(() => shuffle(wordBank));

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const updateProgress = useCallback((state) => {
        if (onProgress) {
            onProgress(state);
        }
    }, [onProgress]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const word = String(active.id).replace('word-', '');
        const blankIdx = parseInt(String(over.id).replace('blank-', ''), 10);
        if (filledBlanks[blankIdx]) return;

        if (blanks[blankIdx] === word) {
            const newFilled = [...filledBlanks];
            newFilled[blankIdx] = word;
            const newUsed = [...usedWords, word];
            setFilledBlanks(newFilled);
            setUsedWords(newUsed);
            updateProgress({ filledBlanks: newFilled, usedWords: newUsed, wrongAttempts });

            if (newFilled.every((b) => b !== null)) {
                const finalScore = Math.max(0, 100 - wrongAttempts * 10);
                setTimeout(() => onComplete(finalScore), 500);
            }
        } else {
            const newWrongAttempts = wrongAttempts + 1;
            setWrongAttempts(newWrongAttempts);
            setWrongBlank(blankIdx);
            updateProgress({ filledBlanks, usedWords, wrongAttempts: newWrongAttempts });
            setTimeout(() => setWrongBlank(null), 500);
        }
    };

    const handleSelectWord = (selectedWord) => {
        const nextBlank = filledBlanks.findIndex((b) => b === null);
        if (nextBlank === -1) return;

        if (blanks[nextBlank] === selectedWord) {
            const newFilled = [...filledBlanks];
            newFilled[nextBlank] = selectedWord;
            const newUsed = [...usedWords, selectedWord];
            setFilledBlanks(newFilled);
            setUsedWords(newUsed);
            updateProgress({ filledBlanks: newFilled, usedWords: newUsed, wrongAttempts });

            if (newFilled.every((b) => b !== null)) {
                const finalScore = Math.max(0, 100 - wrongAttempts * 10);
                setTimeout(() => onComplete(finalScore), 500);
            }
        } else {
            const newWrongAttempts = wrongAttempts + 1;
            setWrongAttempts(newWrongAttempts);
            setWrongBlank(nextBlank);
            updateProgress({ filledBlanks, usedWords, wrongAttempts: newWrongAttempts });
            setTimeout(() => setWrongBlank(null), 500);
        }
    };

    const parts = paragraph.split(/\{(\d+)\}/);

    return (
        <GameShell title="Story Fill-In" description={content.description} onExit={onExit}>
            <div className="max-w-3xl mx-auto flex flex-col gap-10">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl leading-loose text-gray-700 text-lg">
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
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                        <p className="text-center text-indigo-400 font-bold mb-4 uppercase tracking-wider text-sm">Word Bank</p>
                        <p className="text-center text-sm text-indigo-500 mb-4">Tap a word to fill the next blank, or drag it into the right space.</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {bankOrder.map((word) => (
                                <DraggableWord
                                    key={word}
                                    id={`word-${word}`}
                                    word={word}
                                    used={usedWords.includes(word)}
                                    onClick={handleSelectWord}
                                />
                            ))}
                        </div>
                    </div>
                </DndContext>
            </div>
        </GameShell>
    );
}
