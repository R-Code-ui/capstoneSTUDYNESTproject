import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function DraggableWord({ id, word, matched, selected, onClick }) {
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
            onClick={onClick}
            className={`w-full min-w-0 break-words rounded-2xl px-2 py-2 text-xs font-bold leading-snug shadow-lg touch-none select-none sm:px-5 sm:py-4 sm:text-base ${matched ? 'bg-green-400 text-white cursor-default opacity-60' : 'bg-indigo-500 text-white cursor-grab active:cursor-grabbing border-b-4 border-indigo-700'} ${selected ? 'ring-4 ring-indigo-200' : ''}`}
        >
            {word}
        </button>
    );
}

function DroppableTarget({ id, word, matched, wrong, selected, onClick }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: matched });
    return (
        <button type="button" ref={setNodeRef} disabled={matched} onClick={onClick} className={`flex min-h-12 w-full min-w-0 items-center justify-center break-words rounded-2xl border-4 border-dashed px-2 py-2 text-center text-xs font-bold leading-snug sm:min-h-[64px] sm:px-5 sm:py-4 sm:text-base ${matched ? 'bg-green-50 border-green-300 text-green-700 cursor-default' : wrong ? 'bg-red-50 border-red-300 text-red-600' : isOver || selected ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            {word}
        </button>
    );
}

export default function MatchTheMeaning({ content, onComplete, onExit, onProgress, initialState }) {
    const pairs = content.pairs;
    const [rightOrder] = useState(() => shuffle(pairs.map((p) => p.match)));
    const [matchedWords, setMatchedWords] = useState(initialState?.matchedWords ?? []);
    const [wrongTarget, setWrongTarget] = useState(null);
    const [attempts, setAttempts] = useState(initialState?.attempts ?? 0);
    const [selectedWord, setSelectedWord] = useState(null);

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

    const handleSelectTarget = (targetWord) => {
        if (!selectedWord) return;
        const pair = pairs.find((item) => item.word === selectedWord);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setSelectedWord(null);

        if (pair?.match === targetWord) {
            const newMatched = [...matchedWords, selectedWord];
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
        <GameShell title="Match the Meaning" description={content.description} onExit={onExit}>
            <div className="mx-auto w-full max-w-2xl rounded-3xl border border-indigo-100 bg-white p-4 shadow-xl sm:p-6">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 gap-2 sm:gap-8">
                        <div className="flex min-w-0 flex-col gap-2 sm:gap-4">
                            {pairs.map((p) => (
                                <DraggableWord key={p.word} id={`word-${p.word}`} word={p.word} matched={matchedWords.includes(p.word)} selected={selectedWord === p.word} onClick={() => !matchedWords.includes(p.word) && setSelectedWord(selectedWord === p.word ? null : p.word)} />
                            ))}
                        </div>
                        <div className="flex min-w-0 flex-col gap-2 sm:gap-4">
                            {rightOrder.map((w) => {
                                const matchedPair = pairs.find((p) => p.match === w && matchedWords.includes(p.word));
                                return <DroppableTarget key={w} id={`target-${w}`} word={w} matched={!!matchedPair} wrong={wrongTarget === w} selected={selectedWord !== null} onClick={() => handleSelectTarget(w)} />;
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
