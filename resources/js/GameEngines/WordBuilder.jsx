import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function buildBank(letters) {
    return shuffle(letters).map((letter, i) => ({
        key: `${letter}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        letter,
    }));
}

function DraggableTile({ id, letter }) {
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
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-500 shadow-[0_4px_0_rgb(67,56,202)] text-white text-2xl font-black cursor-grab active:cursor-grabbing hover:bg-indigo-600 touch-none select-none"
        >
            {letter}
        </button>
    );
}

function DroppableSlot({ id, letter, onRemove }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            onClick={() => letter && onRemove()}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl border-4 border-dashed text-2xl font-black
                ${letter
                    ? 'bg-green-500 border-green-600 text-white cursor-pointer shadow-[0_4px_0_rgb(21,128,61)]'
                    : isOver
                        ? 'border-indigo-400 bg-indigo-50 shadow-md'
                        : 'border-indigo-200 bg-white'
                }
            `}
        >
            {letter || ''}
        </div>
    );
}

export default function WordBuilder({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [slots, setSlots] = useState(() => Array(rounds[initialState?.roundIndex ?? 0].word.length).fill(null));
    const [bank, setBank] = useState(() => buildBank(rounds[initialState?.roundIndex ?? 0].letters));
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
        if (!over || feedback) return;

        const slotId = String(over.id);
        if (!slotId.startsWith('slot-')) return;

        const slotIdx = parseInt(slotId.replace('slot-', ''), 10);
        if (slots[slotIdx]) return;

        const tileIdx = bank.findIndex((t) => t.key === active.id);
        if (tileIdx === -1) return;

        const letter = bank[tileIdx].letter;
        const newSlots = [...slots];
        newSlots[slotIdx] = letter;
        setSlots(newSlots);
        setBank(bank.filter((_, i) => i !== tileIdx));

        if (newSlots.every((s) => s !== null)) {
            checkRound(newSlots);
        }
    };

    const handleRemove = (slotIdx) => {
        if (feedback) return;
        const letter = slots[slotIdx];
        if (!letter) return;
        const newSlots = [...slots];
        newSlots[slotIdx] = null;
        setSlots(newSlots);
        setBank([...bank, { key: `${letter}-back-${Math.random().toString(36).slice(2, 6)}`, letter }]);
    };

    const checkRound = (finalSlots) => {
        const attempt = finalSlots.join('');
        const isCorrect = attempt === round.word;
        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrectCount);
                setRoundIndex(next);
                setSlots(Array(rounds[next].word.length).fill(null));
                setBank(buildBank(rounds[next].letters));
                setFeedback(null);
                updateProgress({ roundIndex: next, correctCount: newCorrectCount });
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    return (
        <GameShell title="Word Builder" description={content.description} roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`} onExit={onExit}>
            <div className="flex flex-col items-center gap-8 p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
                <div className="text-8xl p-4 bg-indigo-50 rounded-3xl shadow-inner">
                    {round.image}
                </div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex gap-3 justify-center flex-wrap">
                        {slots.map((letter, i) => (
                            <DroppableSlot key={i} id={`slot-${i}`} letter={letter} onRemove={() => handleRemove(i)} />
                        ))}
                    </div>

                    <div className="w-full border-t border-indigo-100 pt-6">
                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {bank.map((tile) => (
                                <DraggableTile key={tile.key} id={tile.key} letter={tile.letter} />
                            ))}
                        </div>
                    </div>
                </DndContext>

                <div className="h-10 flex items-center justify-center">
                    {feedback && (
                        <div className={`text-xl font-black px-6 py-2 rounded-full ${feedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {feedback === 'correct' ? '✓ Great job!' : `✗ Oops! It was "${round.word}"`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
