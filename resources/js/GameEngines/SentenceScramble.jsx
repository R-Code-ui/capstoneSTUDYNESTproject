import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GameShell from './GameShell';
import PrimaryButton from '@/Components/PrimaryButton';

function SortableWord({ id, word }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 20 : 1 };

    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="px-6 py-3 rounded-2xl font-bold shadow-[0_4px_0_rgb(67,56,202)] cursor-grab active:cursor-grabbing touch-none select-none bg-indigo-500 text-white"
        >
            {word}
        </button>
    );
}

export default function SentenceScramble({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [items, setItems] = useState(() => {
        const startRound = initialState?.roundIndex ?? 0;
        return rounds[startRound].scrambled.map((word, i) => ({ id: `w-${i}-${word}`, word }));
    });
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
                updateProgress({ roundIndex: next, correctCount: newCorrectCount });
            } else {
                const finalScore = Math.round((newCorrectCount / rounds.length) * 100);
                onComplete(finalScore);
            }
        }, 1000);
    };

    return (
        <GameShell title="Sentence Scramble" description={content.description} roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`} onExit={onExit}>
            <div className="flex flex-col items-center gap-8 p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl max-w-2xl mx-auto">
                <p className="text-indigo-400 font-medium text-center">Drag and drop the words to unscramble the sentence!</p>
                <div className="w-full min-h-[120px] bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200 flex items-center justify-center p-6">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {items.map((item) => (
                                    <SortableWord key={item.id} id={item.id} word={item.word} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <PrimaryButton type="button" onClick={handleCheck} className="text-lg px-8 py-3" disabled={!!feedback}>
                        Check My Sentence
                    </PrimaryButton>
                </div>
                <div className="h-12 flex items-center justify-center">
                    {feedback && (
                        <div className={`text-lg font-black px-6 py-2 rounded-full ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {feedback === 'correct' ? '✓ Correct!' : `✗ The sentence was: "${round.correct.join(' ')}"`}
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
