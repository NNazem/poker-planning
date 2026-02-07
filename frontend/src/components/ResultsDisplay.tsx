import { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

export function ResultsModal() {
  const { t } = useTranslation();
  const { roomState, newRound, setMyVote } = useGame();

  const { average, distribution, hasConsensus } = useMemo(() => {
    if (!roomState) return { average: 'N/A', distribution: [], hasConsensus: false };

    const numericVotes = Object.values(roomState.votes)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    const avg = numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : 'N/A';

    // Build distribution
    const counts: Record<string, number> = {};
    Object.values(roomState.votes).forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });

    const dist = Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => {
        const na = parseFloat(a.value), nb = parseFloat(b.value);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        if (!isNaN(na)) return -1;
        if (!isNaN(nb)) return 1;
        return a.value.localeCompare(b.value);
      });

    const uniqueNumeric = [...new Set(numericVotes)];
    const consensus = uniqueNumeric.length === 1 && numericVotes.length > 1;

    return { average: avg, distribution: dist, hasConsensus: consensus };
  }, [roomState]);

  const prevRevealedRef = useRef(false);

  useEffect(() => {
    if (roomState?.revealed && !prevRevealedRef.current) {
      if (hasConsensus) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#22c55e', '#eab308', '#3b82f6', '#ef4444'] });
        setTimeout(() => {
          confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
        }, 200);
      } else {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      }
    }
    prevRevealedRef.current = roomState?.revealed ?? false;
  }, [roomState?.revealed, hasConsensus]);

  const handleNewRound = () => {
    newRound();
    setMyVote(null);
    if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
  };

  if (!roomState?.revealed) return null;

  const maxCount = Math.max(...distribution.map(d => d.count), 1);
  const totalVotes = Object.keys(roomState.votes).length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 results-backdrop" onClick={handleNewRound}>
      <div
        className="crt-enter w-full max-w-lg bg-bal-bg/90 border-2 border-bal-gold/40 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Average */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="text-4xl">🎯</span>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-bal-text-muted font-mono">{t('game.average')}</div>
            <div className="text-5xl font-bold text-bal-green text-glow-green font-mono">{average}</div>
          </div>
        </div>

        {/* Consensus badge */}
        {hasConsensus && (
          <div className="flex justify-center mb-4">
            <span className="badge badge-success gap-1 text-sm font-bold uppercase tracking-wider px-4 py-2">
              ✓ {t('game.consensus')}
            </span>
          </div>
        )}

        {/* Vote distribution bar chart */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider text-bal-text-muted font-mono text-center mb-3">
            {t('game.votes')} ({totalVotes})
          </div>
          <div className="flex items-end justify-center gap-3 h-32">
            {distribution.map(({ value, count }) => (
              <div key={value} className="flex flex-col items-center gap-1">
                <span className="text-xs text-bal-text-dim font-mono">{count}</span>
                <div
                  className="vote-bar w-10 rounded-t-md min-h-[4px]"
                  style={{ height: `${(count / maxCount) * 100}px` }}
                />
                <span className="text-sm font-bold text-bal-text font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New round button */}
        <div className="flex justify-center">
          <button
            className="btn btn-warning gap-2 uppercase tracking-wider font-bold border-2 border-yellow-500"
            onClick={handleNewRound}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('game.newRound')}
          </button>
        </div>
      </div>
    </div>
  );
}
