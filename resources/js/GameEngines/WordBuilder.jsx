import { useState } from 'react';
import {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
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
        opacity: isDragging ? 0.4 : 1,
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xl font-bold shadow cursor-grab active:cursor-grabbing touch-none select-none"
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
            className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 text-xl font-bold transition
                ${letter
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-400 cursor-pointer'
                    : isOver
                        ? 'border-blue-500 border-dashed bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 border-dashed'}
            `}
        >
            {letter || ''}
        </div>
    );
}

export default function WordBuilder({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [slots, setSlots] = useState(() => Array(rounds[0].word.length).fill(null));
    const [bank, setBank] = useState(() => buildBank(rounds[0].letters));
    const [feedback, setFeedback] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const round = rounds[roundIndex];

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
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 900);
    };

    return (
        <GameShell
            title="Word Builder"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <div className="text-6xl">{round.image}</div>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {slots.map((letter, i) => (
                            <DroppableSlot key={i} id={`slot-${i}`} letter={letter} onRemove={() => handleRemove(i)} />
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mt-6 min-h-[3rem]">
                        {bank.map((tile) => (
                            <DraggableTile key={tile.key} id={tile.key} letter={tile.letter} />
                        ))}
                    </div>
                </DndContext>

                {feedback && (
                    <div className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback === 'correct' ? '✓ Correct!' : `✗ It was "${round.word}"`}
                    </div>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500">Tip: tap a filled slot to put the letter back.</p>
            </div>
        </GameShell>
    );
}
