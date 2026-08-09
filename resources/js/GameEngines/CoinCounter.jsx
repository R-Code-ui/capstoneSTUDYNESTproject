import { useState, useCallback } from 'react';
import GameShell from './GameShell';

export default function CoinCounter({ content, onComplete, onExit, onProgress, initialState }) {
    const rounds = content.rounds;

    // Helper: filter out any coin that matches the target value
    const getAvailableCoins = (round) => round.coins.filter(v => v !== round.target);

    const initialRoundIndex = initialState?.roundIndex ?? 0;
    const initialRound = rounds[initialRoundIndex];

    const [roundIndex, setRoundIndex] = useState(initialRoundIndex);
    const [correctCount, setCorrectCount] = useState(initialState?.correctCount ?? 0);
    const [overshoots, setOvershoots] = useState(initialState?.overshoots ?? 0);
    const [placed, setPlaced] = useState([]);
    const [bank, setBank] = useState(() =>
        getAvailableCoins(initialRound).map((v, i) => ({ key: `c-${i}-${v}`, value: v }))
    );
    const [status, setStatus] = useState('playing');
    const [history, setHistory] = useState([]);

    const round = rounds[roundIndex];
    const jarTotal = placed.reduce((sum, c) => sum + c.value, 0);

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
            const nextRound = rounds[next];
            setCorrectCount(newCorrect);
            setRoundIndex(next);
            setPlaced([]);
            setBank(getAvailableCoins(nextRound).map((v, i) => ({ key: `c-${i}-${v}-${next}`, value: v })));
            setStatus('playing');
            updateProgress({ roundIndex: next, correctCount: newCorrect, overshoots });
        } else {
            const rawScore = Math.round((newCorrect / rounds.length) * 100);
            const finalScore = Math.max(0, rawScore - overshoots * 5);
            onComplete(finalScore);
        }
    };

    const placeCoin = (coinId) => {
        if (status !== 'playing') return;

        const tileIdx = bank.findIndex((t) => t.key === coinId);
        if (tileIdx === -1) return;

        const coin = bank[tileIdx];
        const newTotal = jarTotal + coin.value;
        const newPlaced = [...placed, coin];
        setPlaced(newPlaced);
        setBank(bank.filter((_, i) => i !== tileIdx));
        setHistory((prev) => [...prev, coin.key]);

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

    const undoLastCoin = () => {
        if (history.length === 0) return;
        const lastCoinKey = history[history.length - 1];
        const tileIdx = placed.findIndex((c) => c.key === lastCoinKey);
        if (tileIdx === -1) return;

        const coin = placed[tileIdx];
        setPlaced((prev) => prev.filter((_, i) => i !== tileIdx));
        setBank((prev) => [...prev, coin]);
        setHistory((prev) => prev.slice(0, -1));
        if (status === 'tooMuch' || status === 'filled') {
            setStatus('playing');
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
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-3xl border border-amber-100 shadow-inner">
                <div className="flex flex-col items-center gap-4">
                    {/* Target and jar row */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-20 h-20 rounded-3xl bg-orange-400 shadow-xl flex items-center justify-center text-2xl font-black text-white border-b-4 border-orange-600">
                                ₱{round.target}
                            </div>
                            <span className="text-xs font-bold text-orange-600 uppercase">Target</span>
                        </div>

                        <div className="flex flex-col items-center w-full max-w-sm">
                            <div
                                className={`relative w-full h-40 rounded-[2rem] border-4 border-dashed flex flex-wrap content-center items-center justify-center gap-2 p-4 shadow-xl
                                    ${status === 'filled' ? 'border-green-500 bg-green-100'
                                        : status === 'tooMuch' ? 'border-red-500 bg-red-100'
                                        : 'border-amber-300 bg-white'}
                                `}
                            >
                                <div className="pointer-events-none absolute left-4 right-4 top-3 h-4 rounded-full border-4 border-amber-200 bg-amber-50" />
                                {placed.length === 0 && (
                                    <div className="pointer-events-none text-center text-amber-600 text-xs font-bold uppercase">Tap coins to add</div>
                                )}
                                {placed.map((c) => (
                                    <div key={c.key} className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-black text-xs shadow border-b-2 border-yellow-600">
                                        ₱{c.value}
                                    </div>
                                ))}
                            </div>
                            <span className={`text-xs font-bold mt-1 uppercase ${jarTotal > round.target ? 'text-red-500' : 'text-amber-500'}`}>
                                Total: ₱{jarTotal}
                            </span>
                        </div>
                    </div>

                    {/* Coins bank */}
                    <div className="bg-white/60 p-3 rounded-2xl w-full">
                        <p className="text-center text-xs font-bold text-gray-500 mb-2 uppercase">
                            Tap a coin to add it to the jar
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center min-h-[3rem]">
                            {bank.map((coin) => (
                                <button
                                    key={coin.key}
                                    type="button"
                                    onClick={() => placeCoin(coin.key)}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-black text-xs shadow border-b-2 border-yellow-600 active:scale-95"
                                >
                                    ₱{coin.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-center gap-2 mt-3">
                    {status === 'tooMuch' && (
                        <button
                            type="button"
                            onClick={handleResetJar}
                            className="px-5 py-2 rounded-full bg-red-600 text-white font-bold shadow active:scale-95"
                        >
                            Reset Jar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={undoLastCoin}
                        disabled={history.length === 0}
                        className="px-5 py-2 rounded-full bg-white text-amber-700 font-bold border border-amber-200 shadow active:scale-95 disabled:opacity-40"
                    >
                        Undo Last Coin
                    </button>
                </div>
            </div>
        </GameShell>
    );
}
