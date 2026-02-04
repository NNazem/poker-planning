import { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

export function ResultsDisplay() {
  const { t } = useTranslation();
  const { roomState, newRound, setMyVote } = useGame();

  const { average, individualVotes, hasConsensus } = useMemo(() => {
    if (!roomState) return { average: 'N/A', individualVotes: [], hasConsensus: false };
    
    const numericVotes = Object.values(roomState.votes)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
    
    const avg = numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : 'N/A';
    
    const votes = roomState.players.map(player => ({
      name: player.name,
      vote: roomState.votes[player.id],
      diff: !isNaN(parseFloat(roomState.votes[player.id])) && !isNaN(parseFloat(avg))
        ? Math.abs(parseFloat(roomState.votes[player.id]) - parseFloat(avg))
        : 0
    }));
    
    const uniqueVotes = [...new Set(numericVotes)];
    const consensus = uniqueVotes.length === 1 && numericVotes.length > 1;
    
    return { average: avg, individualVotes: votes, hasConsensus: consensus };
  }, [roomState]);

  const prevRevealedRef = useRef(false);

  // Confetti effect on consensus
  useEffect(() => {
    if (roomState?.revealed && !prevRevealedRef.current) {
      // Just revealed
      if (hasConsensus) {
        // Big confetti celebration for consensus!
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#eab308', '#3b82f6', '#ef4444'],
        });
        
        // Extra burst
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 200);
      } else {
        // Small confetti for normal reveal
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    }
    prevRevealedRef.current = roomState?.revealed ?? false;
  }, [roomState?.revealed, hasConsensus]);

  const handleNewRound = () => {
    newRound();
    setMyVote(null);
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  };

  if (!roomState?.revealed) {
    return (
      <div className="text-xl lg:text-2xl opacity-70 animate-pulse">
        {t('game.waiting')}
      </div>
    );
  }

  return (
    <div className="card bg-base-300/90 backdrop-blur-md shadow-2xl border border-white/10">
      <div className="card-body items-center p-4 lg:p-6">
        {/* Average */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">🎯</div>
          <div>
            <div className="text-xs uppercase tracking-wider opacity-60">{t('game.average')}</div>
            <div className="text-4xl lg:text-5xl font-bold text-success">{average}</div>
          </div>
        </div>
        
        {/* Individual votes */}
        <div className="w-full">
          <div className="text-xs uppercase tracking-wider opacity-60 mb-2 text-center">
            {t('game.votes')}
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {individualVotes.map(({ name, vote, diff }) => (
              <div 
                key={name}
                className="flex items-center gap-1 bg-base-100 rounded-full px-2 py-1 text-sm border border-white/10"
              >
                <span className="opacity-70 text-xs">{name.substring(0, 8)}</span>
                <span className={`font-bold ${
                  diff < 1 ? 'text-success' : 
                  diff < 3 ? 'text-warning' : 'text-error'
                }`}>
                  {vote ?? '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Consensus badge */}
        {hasConsensus && (
          <div className="mt-3">
            <span className="badge badge-success gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('game.consensus')}
            </span>
          </div>
        )}
        
        {/* New round button */}
        <button 
          className="btn btn-warning btn-sm mt-3 gap-2"
          onClick={handleNewRound}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('game.newRound')}
        </button>
      </div>
    </div>
  );
}
