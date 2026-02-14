import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { ResultsModal as ResultsDisplay } from './ResultsDisplay';
import { Bullet } from './Bullet';
import { PlayerSeat } from './PlayerSeat';
import { generateSeats, getCardOffset } from '../utils/seats';

export function PokerTable({ allVoted, onReveal }: { allVoted?: boolean; onReveal?: () => void }) {
  const { t } = useTranslation();
  const { roomState, shootEvent } = useGame();
  const [isMobile, setIsMobile] = useState(false);
  const playerRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeBullets, setActiveBullets] = useState<{ id: number; from: string; target: string }[]>([]);
  const bulletIdRef = useRef(0);

  const registerPlayerRef = useCallback((playerId: string, el: HTMLElement | null) => {
    playerRefs.current[playerId] = el;
  }, []);

  // Handle shoot events — create bullet
  useEffect(() => {
    if (!shootEvent) return;
    const { from, target } = shootEvent;
    const fromEl = playerRefs.current[from];
    const toEl = playerRefs.current[target];
    if (!fromEl || !toEl) return;

    const id = ++bulletIdRef.current;
    setActiveBullets(prev => [...prev, { id, from, target }]);
  }, [shootEvent]);

  const removeBullet = useCallback((id: number) => {
    setActiveBullets(prev => prev.filter(b => b.id !== id));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const players = roomState?.players ?? [];
  const totalSeats = Math.max(players.length, 6);
  const seats = generateSeats(totalSeats);

  const bulletsOverlay = activeBullets.map(b => {
    const fromEl = playerRefs.current[b.from];
    const toEl = playerRefs.current[b.target];
    if (!fromEl || !toEl) return null;
    return <Bullet key={b.id} fromEl={fromEl} toEl={toEl} onDone={() => removeBullet(b.id)} />;
  });

  // Mobile: vertical list
  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="poker-table-balatro relative rounded-2xl p-4 mx-auto max-w-sm">
          {roomState && !roomState.revealed && (
            <div className="text-center py-2">
              {allVoted ? (
                <button
                  onClick={onReveal}
                  className="btn btn-warning btn-sm gap-1 uppercase tracking-wider font-bold border-2 border-yellow-500 animate-pulse"
                >
                  👁️ {t('game.revealVotes', 'Rivela voti')}
                </button>
              ) : (
                <span className="text-sm animate-pulse font-mono text-bal-green/70">
                  {t('game.waiting')}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2 relative z-10">
            {players.map((player, index) => (
              <PlayerSeat
                key={player.id}
                player={player}
                index={index}
                hasVoted={roomState!.votes[player.id] !== undefined}
                vote={roomState!.votes[player.id]}
                revealed={roomState!.revealed}
                registerRef={registerPlayerRef}
                variant="mobile"
              />
            ))}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 rounded-xl px-3 py-2 border border-bal-surface-light/20 opacity-30">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-bal-text-muted/30 flex items-center justify-center shrink-0">
                  <span className="text-bal-text-muted/50 text-xs">?</span>
                </div>
                <span className="text-sm text-bal-text-muted/50 italic">Empty seat</span>
              </div>
            ))}
          </div>
          <ResultsDisplay />
        </div>
        {bulletsOverlay}
      </div>
    );
  }

  // Desktop
  return (
    <div className="flex justify-center mb-6 lg:mb-10">
      <div className="relative w-full max-w-4xl" style={{ aspectRatio: '16/10' }}>
        <div className="poker-table-balatro absolute inset-0 rounded-full lg:rounded-[200px] flex items-center justify-center">

          {seats.map((seat, i) => {
            const player = players[i];
            const cardOffset = getCardOffset(seat.x, seat.y);
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${seat.y}%`,
                  left: `${seat.x}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {player ? (
                  <PlayerSeat
                    player={player}
                    index={i}
                    hasVoted={roomState!.votes[player.id] !== undefined}
                    vote={roomState!.votes[player.id]}
                    revealed={roomState!.revealed}
                    cardOffset={cardOffset}
                    registerRef={registerPlayerRef}
                    variant="desktop"
                  />
                ) : (
                  <EmptySeat />
                )}
              </div>
            );
          })}

          {/* Center content */}
          <div className="relative z-10 text-center">
            <ResultsDisplay />
            {roomState && !roomState.revealed && (
              allVoted ? (
                <button
                  onClick={onReveal}
                  className="btn btn-lg btn-warning gap-2 uppercase tracking-wider font-bold border-2 border-yellow-500 animate-pulse"
                >
                  👁️ {t('game.revealVotes', 'Rivela voti')}
                </button>
              ) : (
                <div className="text-xl lg:text-2xl text-bal-green/60 animate-pulse font-mono">
                  {t('game.waiting')}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {bulletsOverlay}
    </div>
  );
}

function EmptySeat() {
  return (
    <div className="flex flex-col items-center gap-1 opacity-25">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-dashed border-bal-text-muted/40 flex items-center justify-center">
        <span className="text-bal-text-muted/40 text-sm">?</span>
      </div>
    </div>
  );
}
