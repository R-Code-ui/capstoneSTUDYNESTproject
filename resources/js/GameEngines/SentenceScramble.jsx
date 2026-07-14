import { useState } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GameShell from './GameShell';
import PrimaryButton from '@/Components/PrimaryButton';

function SortableWord({ id, word }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {word}
        </div>
    );
}

export default function SentenceScramble({ content, onComplete, onExit }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [items, setItems] = useState(() =>
        rounds[0].scrambled.map((word, i) => ({ id: `w-${i}-${word}`, word }))
    );
    const [feedback, setFeedback] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const round = rounds[roundIndex];

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id || feedback) return;

        setItems((prev) => {
            const oldIndex = prev.findIndex((i) => i.id === active.id);
            const newIndex = prev.findIndex((i) => i.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleCheck = () => {
        const attempt = items.map((i) => i.word);
        const isCorrect = attempt.join(' ') === round.correct.join(' ');
        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        setTimeout(() => {
            if (roundIndex + 1 < rounds.length) {
                const next = roundIndex + 1;
                setCorrectCount(newCorrectCount);
                setRoundIndex(next);
                setItems(rounds[next].scrambled.map((word, i) => ({ id: `w-${i}-${word}`, word })));
                setFeedback(null);
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1000);
    };

    return (
        <GameShell
            title="Sentence Scramble"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="flex flex-col items-center gap-6">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex flex-wrap gap-2 justify-center min-h-[3rem]">
                            {items.map((item) => (
                                <SortableWord key={item.id} id={item.id} word={item.word} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {feedback && (
                    <div className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback === 'correct' ? '✓ Correct!' : `✗ Correct order: "${round.correct.join(' ')}"`}
                    </div>
                )}

                {!feedback && (
                    <PrimaryButton type="button" onClick={handleCheck}>Check Sentence</PrimaryButton>
                )}
            </div>
        </GameShell>
    );
}
