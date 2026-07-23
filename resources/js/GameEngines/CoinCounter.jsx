import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableCoin({ id, value }) {
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
            className={`w-16 h-16 flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-black text-sm shadow-lg border-b-4 border-yellow-600 cursor-grab active:cursor-grabbing active:scale-95 touch-none select-none ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            ₱{value}
        </button>
    );
}

export default function CoinCounter({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;
    const [roundIndex, setRoundIndex] = useState(initialState?.roundIndex ?? 0);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [overshoots, setOvershoots] = useState(initialState?.overshoots ?? 0);
    const [placed, setPlaced] = useState([]);
    const [bank, setBank] = useState(() =>
        rounds[initialState?.roundIndex ?? 0].coins.map((v, i) => ({ key: `c-${i}-${v}`, value: v }))
    );
    const [status, setStatus] = useState('playing');

    const round = rounds[roundIndex];
    const jarTotal = placed.reduce((sum, c) => sum + c.value, 0);

    const { setNodeRef, isOver } = useDroppable({ id: 'coin-jar', disabled: status !== 'playing' });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const updateProgress = useCallback((newState) => {
        if (onProgress) {
            onProgress({
                roundIndex: newState.roundIndex,
                correctCount: newState.correctCount,
                overshoots: newState.overshoots,
            });
        }
    }, [onProgress]);

    const advanceRound = (wasCorrect) => {
        const newCorrect = correctCount + (wasCorrect ? 1 : 0);
        if (roundIndex + 1 < rounds.length) {
            const next = roundIndex + 1;
            setCorrectCount(newCorrect);
            setRoundIndex(next);
            setPlaced([]);
            setBank(rounds[next].coins.map((v, i) => ({ key: `c-${i}-${v}-${next}`, value: v })));
            setStatus('playing');
            updateProgress({ roundIndex: next, correctCount: newCorrect, overshoots });
        } else {
            const rawScore = Math.round((newCorrect / rounds.length) * 100);
            const finalScore = Math.max(0, rawScore - overshoots * 5);
            onComplete(finalScore);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || over.id !== 'coin-jar' || status !== 'playing') return;

        const tileIdx = bank.findIndex((t) => t.key === active.id);
        if (tileIdx === -1) return;

        const coin = bank[tileIdx];
        const newTotal = jarTotal + coin.value;
        const newPlaced = [...placed, coin];
        setPlaced(newPlaced);
        setBank(bank.filter((_, i) => i !== tileIdx));

        if (newTotal === round.target) {
            setStatus('filled');
            setTimeout(() => advanceRound(true), 900);
        } else if (newTotal > round.target) {
            setStatus('tooMuch');
            setOvershoots((prev) => {
                const newVal = prev + 1;
                updateProgress({ roundIndex, correctCount, overshoots: newVal });
                return newVal;
            });
        }
    };

    const handleResetJar = () => {
        if (status !== 'tooMuch') return;
        setBank([...bank, ...placed]);
        setPlaced([]);
        setStatus('playing');
    };

    return (
        <GameShell
            title="Coin Counter"
            description={content.description}
            roundLabel={`Round ${roundIndex + 1} of ${rounds.length}`}
            onExit={onExit}
        >
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-3xl border border-amber-100 shadow-inner">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col items-center gap-8 mb-8">
                        <div className="flex items-end justify-center gap-8 w-full max-w-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-28 h-28 rounded-3xl bg-orange-400 shadow-xl flex items-center justify-center text-3xl font-black text-white border-b-8 border-orange-600 animate-pulse">
                                    ₱{round.target}
                                </div>
                                <span className="text-xs font-bold text-orange-600 mt-3 uppercase tracking-widest">Target</span>
                            </div>

                            <div className="text-4xl pb-8">🏺</div>

                            <div className="flex flex-col items-center">
                                <div
                                    ref={setNodeRef}
                                    className={`w-28 h-28 rounded-3xl border-4 border-dashed flex flex-wrap items-center justify-center gap-1 p-3 shadow-lg
                                        ${status === 'filled' ? 'border-green-500 bg-green-100'
                                            : status === 'tooMuch' ? 'border-red-500 bg-red-100'
                                            : isOver ? 'border-amber-500 bg-amber-50'
                                            : 'border-amber-200 bg-white'}
                                    `}
                                >
                                    {placed.map((c) => (
                                        <div key={c.key} className="w-7 h-7 flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-[10px] shadow">
                                            ₱{c.value}
                                        </div>
                                    ))}
                                </div>
                                <span className={`text-xs font-bold mt-3 uppercase tracking-widest ${jarTotal > round.target ? 'text-red-500' : 'text-amber-500'}`}>
                                    Total: ₱{jarTotal}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-sm">
                        <p className="text-center text-sm font-bold text-gray-400 mb-4 uppercase">Drag coins into the jar</p>
                        <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                            {bank.map((coin) => (
                                <DraggableCoin key={coin.key} id={coin.key} value={coin.value} />
                            ))}
                        </div>
                    </div>
                </DndContext>

                <div className="h-20 mt-6 flex justify-center items-center">
                    {status === 'filled' && (
                        <div className="text-2xl font-black text-green-600 animate-bounce flex items-center gap-2">
                            <span>✓</span> Exact Amount!
                        </div>
                    )}

                    {status === 'tooMuch' && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="text-xl font-black text-red-600">Too much!</div>
                            <button
                                type="button"
                                onClick={handleResetJar}
                                className="px-6 py-3 rounded-full bg-red-600 text-white font-bold shadow-lg active:scale-95"
                            >
                                Reset Jar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GameShell>
    );
}
