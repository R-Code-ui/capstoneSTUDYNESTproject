import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableItem({ id, value, placed }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: !!placed });
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : placed ? 0 : 1,
        pointerEvents: placed ? 'none' : 'auto',
    };
    return (
        <button
            type="button"
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-500 text-white text-lg font-bold shadow cursor-grab active:cursor-grabbing touch-none select-none"
        >
            {value}
        </button>
    );
}

function Basket({ id, label, count }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-h-[120px] rounded-xl border-4 border-dashed flex flex-col items-center justify-center gap-2 transition
                ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}
            `}
        >
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">{label}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">{count} items</span>
        </div>
    );
}

export default function SortingBaskets({ content, onComplete, onExit }) {
    const round = content.rounds[0];
    const [items, setItems] = useState(() =>
        round.items.map((it, i) => ({ id: `item-${i}`, value: it.value, type: it.type, placed: null }))
    );
    const [finished, setFinished] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const basketACount = items.filter((i) => i.placed === round.basketA).length;
    const basketBCount = items.filter((i) => i.placed === round.basketB).length;

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || finished) return;

        const basketId = String(over.id);
        if (basketId !== 'basket-A' && basketId !== 'basket-B') return;
        const basketLabel = basketId === 'basket-A' ? round.basketA : round.basketB;

        setItems((prev) => {
            const updated = prev.map((it) =>
                it.id === active.id ? { ...it, placed: basketLabel } : it
            );
            const allPlaced = updated.every((it) => it.placed !== null);
            if (allPlaced) {
                const correct = updated.filter((it) => it.placed === it.type).length;
                const finalScore = Math.round((correct / updated.length) * 100);
                setFinished(true);
                setTimeout(() => onComplete(finalScore), 600);
            }
            return updated;
        });
    };

    return (
        <GameShell title="Sorting Baskets" description={content.description} onExit={onExit}>
            <div className="flex flex-col gap-6">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-wrap gap-3 justify-center min-h-[4rem]">
                        {items.filter((i) => !i.placed).map((it) => (
                            <DraggableItem key={it.id} id={it.id} value={it.value} placed={it.placed} />
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Basket id="basket-A" label={round.basketA} count={basketACount} />
                        <Basket id="basket-B" label={round.basketB} count={basketBCount} />
                    </div>
                </DndContext>

                {finished && (
                    <div className="text-center text-lg font-semibold text-green-600 dark:text-green-400">
                        Great job! Calculating your score...
                    </div>
                )}
            </div>
        </GameShell>
    );
}
