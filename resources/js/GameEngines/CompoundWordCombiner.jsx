import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function DraggableWord({ id, word, matched, selected, onClick }) {
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
            onClick={onClick}
            className={`w-full px-4 py-3 rounded-2xl font-black text-lg shadow-lg border-b-4 touch-none select-none
                ${matched ? 'bg-green-400 border-green-600 text-white cursor-default' : 'bg-violet-500 border-violet-700 text-white cursor-grab active:cursor-grabbing active:scale-95'}
                ${selected ? 'ring-4 ring-violet-200' : ''}
            `}
        >
            {word}
        </button>
    );
}

function DroppableTarget({ id, word, matched, wrong, selected, onClick }) {
    const { setNodeRef, isOver } = useDroppable({ id, disabled: matched });
    return (
        <button
            type="button"
            ref={setNodeRef}
            disabled={matched}
            onClick={onClick}
            className={`w-full px-4 py-3 rounded-2xl border-4 text-center font-black text-lg shadow-inner transition
                ${matched
                    ? 'bg-green-100 border-green-400 text-green-700 cursor-default'
                    : wrong
                        ? 'bg-red-100 border-red-400'
                        : isOver || selected
                            ? 'border-violet-400 border-dashed bg-violet-50'
                            : 'border-violet-200 border-dashed bg-white text-gray-500'}
            `}
        >
            {word}
        </button>
    );
}

export default function CompoundWordCombiner({ content, onComplete, onExit, onProgress, initialState }) {
    const pairs = content.pairs;
    const [rightOrder] = useState(() => shuffle(pairs.map((pair, index) => ({ ...pair, index }))));
    const [matchedWords, setMatchedWords] = useState(initialState?.matchedWords ?? []);
    const [wrongTarget, setWrongTarget] = useState(null);
    const [attempts, setAttempts] = useState(initialState?.attempts ?? 0);
    const [lastCombined, setLastCombined] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [history, setHistory] = useState([]);

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

        const word = String(active.id).replace('word-', '');
        const targetIndex = Number(String(over.id).replace('target-', ''));
        const pair = pairs.find((p) => p.word === word);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (pair && Number.isInteger(targetIndex) && pairs[targetIndex]?.word === word) {
            setHistory((prev) => [...prev, word]);
            const newMatched = [...matchedWords, word];
            setMatchedWords(newMatched);
            setSelectedWord(null);
            setLastCombined(`${word}${pairs[targetIndex].match}`);
            setTimeout(() => setLastCombined(null), 1200);
            updateProgress({ matchedWords: newMatched, attempts: newAttempts });

            if (newMatched.length === pairs.length) {
                const finalScore = Math.round((pairs.length / newAttempts) * 100);
                setTimeout(() => onComplete(Math.min(100, finalScore)), 700);
            }
        } else {
            setWrongTarget(targetIndex);
            setSelectedWord(null);
            setTimeout(() => setWrongTarget(null), 500);
            updateProgress({ matchedWords, attempts: newAttempts });
        }
    };

    const handleSelectWord = (word) => {
        if (matchedWords.includes(word)) return;
        setSelectedWord(selectedWord === word ? null : word);
    };

    const handleSelectTarget = (targetIndex) => {
        if (!selectedWord) return;
        const pair = pairs.find((p) => p.word === selectedWord);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (pair && pairs[targetIndex]?.word === selectedWord) {
            setHistory((prev) => [...prev, selectedWord]);
            const newMatched = [...matchedWords, selectedWord];
            setMatchedWords(newMatched);
            setSelectedWord(null);
            setLastCombined(`${selectedWord}${pairs[targetIndex].match}`);
            setTimeout(() => setLastCombined(null), 1200);
            updateProgress({ matchedWords: newMatched, attempts: newAttempts });

            if (newMatched.length === pairs.length) {
                const finalScore = Math.round((pairs.length / newAttempts) * 100);
                setTimeout(() => onComplete(Math.min(100, finalScore)), 700);
            }
        } else {
            setWrongTarget(targetIndex);
            setSelectedWord(null);
            setTimeout(() => setWrongTarget(null), 500);
            updateProgress({ matchedWords, attempts: newAttempts });
        }
    };

    const undoLastMatch = () => {
        if (history.length === 0) return;
        const lastWord = history[history.length - 1];
        setMatchedWords((prev) => prev.filter((w) => w !== lastWord));
        setHistory((prev) => prev.slice(0, -1));
        setWrongTarget(null);
        setSelectedWord(null);
    };

    return (
        <GameShell title="Compound Word Combiner" description={content.description} onExit={onExit}>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 sm:p-6 rounded-3xl border border-violet-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div className="flex flex-col gap-3">
                            {pairs.map((p) => (
                                <DraggableWord
                                    key={p.word}
                                    id={`word-${p.word}`}
                                    word={p.word}
                                    matched={matchedWords.includes(p.word)}
                                    selected={selectedWord === p.word}
                                    onClick={() => handleSelectWord(p.word)}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-3">
                            {rightOrder.map((pair) => {
                                return (
                                    <DroppableTarget
                                        key={`target-${pair.index}`}
                                        id={`target-${pair.index}`}
                                        word={pair.match}
                                        matched={matchedWords.includes(pair.word)}
                                        wrong={wrongTarget === pair.index}
                                        selected={selectedWord !== null}
                                        onClick={() => handleSelectTarget(pair.index)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </DndContext>

                {lastCombined && (
                    <div className="text-center mt-6 text-2xl font-black text-violet-600">
                        ✓ {lastCombined}!
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 mt-6">
                    <button
                        type="button"
                        onClick={undoLastMatch}
                        disabled={history.length === 0}
                        className="px-6 py-3 rounded-full bg-white text-violet-700 font-black border border-violet-200 shadow-sm hover:bg-violet-50 disabled:opacity-40"
                    >
                        Undo Last Match
                    </button>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold text-center">
                        Tap a word, then tap its matching half, or drag to match.
                    </p>
                </div>
            </div>
        </GameShell>
    );
}
