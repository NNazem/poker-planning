import { useMemo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

function VoteRow({ name, pVote, color, isMe, colorClasses, onChangeVote, onDirectVote, voteOptions }: {
  name: string; pVote: string; color: 'green' | 'yellow' | 'red'; isMe: boolean;
  colorClasses: Record<string, string>;
  onChangeVote: (dir: 'up' | 'down') => void;
  onDirectVote: (v: string) => void;
  voteOptions: string[];
}) {
  const [editing, setEditing] = useState(false);

  if (isMe && editing) {
    return (
      <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${colorClasses[color]} font-mono`}>
        <span className="text-sm text-bal-text">{name} (you)</span>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {voteOptions.map(v => (
            <button
              key={v}
              className={`w-8 h-8 rounded text-sm font-bold transition-all ${v === pVote ? 'bg-bal-green text-bal-bg scale-110' : 'bg-bal-surface border border-bal-text-muted/30 text-bal-text hover:bg-bal-surface-light'}`}
              onClick={(e) => { e.stopPropagation(); onDirectVote(v); setEditing(false); }}
            >{v}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 rounded-lg border ${colorClasses[color]} font-mono`}>
      <span className="text-sm text-bal-text">{name} {isMe ? '(you)' : ''}</span>
      <div className="flex items-center gap-2">
        {isMe && (
          <button
            className="w-7 h-7 rounded-full bg-bal-surface border border-bal-text-muted/30 text-bal-text font-bold text-sm hover:bg-bal-surface-light active:scale-95 transition-transform"
            onClick={(e) => { e.stopPropagation(); onChangeVote('down'); }}
          >−</button>
        )}
        <span
          className={`text-xl font-bold min-w-[2ch] text-center ${isMe ? 'cursor-pointer hover:underline' : ''}`}
          onClick={(e) => { if (isMe) { e.stopPropagation(); setEditing(true); } }}
        >{pVote}</span>
        {isMe && (
          <button
            className="w-7 h-7 rounded-full bg-bal-surface border border-bal-text-muted/30 text-bal-text font-bold text-sm hover:bg-bal-surface-light active:scale-95 transition-transform"
            onClick={(e) => { e.stopPropagation(); onChangeVote('up'); }}
          >+</button>
        )}
      </div>
    </div>
  );
}

export function ResultsModal() {
  const { t } = useTranslation();
  const { roomState, newRound, setMyVote, vote, currentPlayer } = useGame();

  const { average, playerVotes, hasConsensus } = useMemo(() => {
    if (!roomState) return { average: 'N/A', playerVotes: [], hasConsensus: false };

    const numericVotes = Object.values(roomState.votes)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    const avg = numericVotes.length > 0
      ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
      : 0;

    const avgStr = numericVotes.length > 0 ? avg.toFixed(1) : 'N/A';

    // Build per-player vote list
    const pVotes = roomState.players
      .filter(p => roomState.votes[p.id] !== undefined)
      .map(p => {
        const vote = roomState.votes[p.id];
        const numVote = parseFloat(vote);
        const diff = !isNaN(numVote) ? Math.abs(numVote - avg) : 0;
        // Color: green if within 1 of avg, yellow if within 2, red if further
        let color: 'green' | 'yellow' | 'red' = 'green';
        if (diff > 2) color = 'red';
        else if (diff > 1) color = 'yellow';
        return { name: p.name, vote, color };
      })
      .sort((a, b) => {
        const na = parseFloat(a.vote), nb = parseFloat(b.vote);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return 0;
      });

    const uniqueNumeric = [...new Set(numericVotes)];
    const consensus = uniqueNumeric.length === 1 && numericVotes.length > 1;

    return { average: avgStr, playerVotes: pVotes, hasConsensus: consensus };
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

  const totalVotes = Object.keys(roomState.votes).length;
  const VOTE_OPTIONS = ['1','2','3','4','5','6','7','8','9','10'];

  const handleChangeVote = (direction: 'up' | 'down') => {
    const myPlayer = roomState.players.find(p => p.name === currentPlayer);
    if (!myPlayer) return;
    const currentVote = roomState.votes[myPlayer.id];
    if (!currentVote) return;
    const idx = VOTE_OPTIONS.indexOf(currentVote);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? Math.min(idx + 1, VOTE_OPTIONS.length - 1) : Math.max(idx - 1, 0);
    if (newIdx !== idx) vote(VOTE_OPTIONS[newIdx]);
  };

  const colorClasses = {
    green: 'text-green-400 border-green-500/50 bg-green-500/10',
    yellow: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    red: 'text-red-400 border-red-500/50 bg-red-500/10',
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 results-backdrop">
      <div
        className="crt-enter w-full max-w-lg bg-bal-bg/90 border-2 border-bal-gold/40 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Average */}
        <div className="mb-2">
          <div className="text-xs uppercase tracking-wider text-bal-text-muted font-mono text-center mb-1">{t('game.average')}</div>
          <div className="text-5xl font-bold text-bal-green text-glow-green font-mono text-center">{average}</div>
        </div>

        {/* Consensus badge */}
        {hasConsensus && (
          <div className="flex justify-center mb-4">
            <span className="badge badge-success gap-1 text-sm font-bold uppercase tracking-wider px-4 py-2">
              ✓ {t('game.consensus')}
            </span>
          </div>
        )}

        {/* Individual votes */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider text-bal-text-muted font-mono text-center mb-3">
            {t('game.votes')} ({totalVotes})
          </div>
          <div className="flex flex-col gap-2">
            {playerVotes.map(({ name, vote: pVote, color }) => {
              const isMe = name === currentPlayer;
              return (
                <VoteRow
                  key={name}
                  name={name}
                  pVote={pVote}
                  color={color}
                  isMe={isMe}
                  colorClasses={colorClasses}
                  onChangeVote={handleChangeVote}
                  onDirectVote={(v) => vote(v)}
                  voteOptions={VOTE_OPTIONS}
                />
              );
            })}
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
