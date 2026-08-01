import { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import GameShell from './GameShell';

function DraggableItem({ id, value, placed, onClick, selected }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled: !!placed });
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
            onClick={onClick}
            className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-orange-400 text-white text-xl font-black shadow-[0_4px_0_rgb(194,65,12)] touch-none select-none
                ${placed ? 'opacity-0' : 'opacity-100'}
                ${selected ? 'ring-2 ring-indigo-300' : ''}
            `}
        >
            {value}
        </button>
    );
}

function Basket({ id, label, count, onClick, active }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <button
            type="button"
            ref={setNodeRef}
            onClick={onClick}
            disabled={!onClick}
            className={`flex-1 min-h-[160px] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center gap-3
                ${onClick ? 'cursor-pointer' : 'cursor-default'}
                ${isOver || active ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200 bg-white'}
            `}
        >
            <span className="text-xl font-black text-indigo-900">{label}</span>
            <div className="bg-indigo-100 px-4 py-1 rounded-full text-sm font-bold text-indigo-600">
                {count} items
            </div>
        </button>
    );
}

export default function SortingBaskets({ content, onComplete, onExit, onProgress, initialState }) {
    const round = content.rounds[0];
    const [items, setItems] = useState(() => {
        if (initialState?.items) return initialState.items;
        return round.items.map((it, i) => ({
            id: `item-${i}`,
            value: it.value,
            type: it.type,
            placed: null,
        }));
    });
    const [finished, setFinished] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const basketACount = items.filter((i) => i.placed === round.basketA).length;
    const basketBCount = items.filter((i) => i.placed === round.basketB).length;

    const updateProgress = useCallback((currentItems) => {
        if (onProgress) {
            onProgress({ items: currentItems });
        }
    }, [onProgress]);

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
            updateProgress(updated);
            return updated;
        });
        setSelectedItem(null);
    };

    const placeItem = (itemId, basketLabel) => {
        if (finished || !itemId) return;

        setItems((prev) => {
            const updated = prev.map((it) =>
                it.id === itemId ? { ...it, placed: basketLabel } : it
            );
            const allPlaced = updated.every((it) => it.placed !== null);
            if (allPlaced) {
                const correct = updated.filter((it) => it.placed === it.type).length;
                const finalScore = Math.round((correct / updated.length) * 100);
                setFinished(true);
                setTimeout(() => onComplete(finalScore), 600);
            }
            updateProgress(updated);
            return updated;
        });
        setSelectedItem(null);
    };

    const handleSelectItem = (itemId) => {
        if (finished) return;
        const item = items.find((it) => it.id === itemId);
        if (!item || item.placed !== null) return;
        setSelectedItem((prev) => (prev === itemId ? null : itemId));
    };

    return (
        <GameShell title="Sorting Baskets" description={content.description} onExit={onExit}>
            <div className="max-w-2xl mx-auto flex flex-col gap-8 p-6 bg-white rounded-3xl border border-indigo-100 shadow-xl">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="flex flex-wrap gap-4 justify-center min-h-[5rem] p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        {items.filter((i) => !i.placed).map((it) => (
                            <DraggableItem
                                key={it.id}
                                id={it.id}
                                value={it.value}
                                placed={it.placed}
                                selected={selectedItem === it.id}
                                onClick={() => handleSelectItem(it.id)}
                            />
                        ))}
                    </div>
                    <div className="flex gap-6">
                        <Basket id="basket-A" label={round.basketA} count={basketACount} onClick={() => selectedItem && placeItem(selectedItem, round.basketA)} active={selectedItem !== null} />
                        <Basket id="basket-B" label={round.basketB} count={basketBCount} onClick={() => selectedItem && placeItem(selectedItem, round.basketB)} active={selectedItem !== null} />
                    </div>
                    <p className="text-center text-sm text-slate-500 font-medium uppercase tracking-widest">Tap an item, then tap a basket to sort it, or drag to sort.</p>
                </DndContext>
                {finished && (
                    <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                        <p className="text-lg font-black text-green-700">
                            Great job! Calculating your score...
                        </p>
                    </div>
                )}
            </div>
        </GameShell>
    );
}
