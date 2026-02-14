import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { ResultsModal as ResultsDisplay } from './ResultsDisplay';
import { playPewSound, playHitSound } from '../utils/sounds';
import type { Player as PlayerType } from '../types';

// Table center in percentage
const TABLE_CENTER = { x: 50, y: 50 };

// Generate N evenly-spaced seats around an ellipse
function generateSeats(count: number): { x: number; y: number }[] {
  const n = Math.min(Math.max(count, 1), 10);
  const seats: { x: number; y: number }[] = [];
  const cx = 50, cy = 48;
  const rx = 44, ry = 44;
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < n; i++) {
    const angle = startAngle + (2 * Math.PI * i) / n;
    seats.push({
      x: Math.round(cx + rx * Math.cos(angle)),
      y: Math.round(cy + ry * Math.sin(angle)),
    });
  }
  return seats;
}

function getCardOffset(seatX: number, seatY: number): { dx: number; dy: number } {
  const dirX = TABLE_CENTER.x - seatX;
  const dirY = TABLE_CENTER.y - seatY;
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len === 0) return { dx: 0, dy: 0 };
  const scale = 85 / len;
  return { dx: dirX * scale, dy: dirY * scale };
}

const AVATAR_COLORS = [
  'from-emerald-700 to-emerald-500',
  'from-amber-700 to-amber-500',
  'from-teal-700 to-teal-500',
  'from-rose-800 to-rose-600',
  'from-violet-800 to-violet-600',
  'from-cyan-800 to-cyan-600',
  'from-lime-700 to-lime-500',
  'from-fuchsia-800 to-fuchsia-600',
  'from-orange-700 to-orange-500',
  'from-sky-800 to-sky-600',
];

// ── Bullet component ──
function Bullet({ fromEl, toEl, onDone }: { fromEl: HTMLElement; toEl: HTMLElement; onDone: () => void }) {
  const bulletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    const bullet = bulletRef.current;
    if (!bullet) return;

    // Calculate angle for rotation
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    bullet.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    playPewSound();

    const anim = bullet.animate([
      { left: `${startX}px`, top: `${startY}px`, opacity: 1 },
      { left: `${endX}px`, top: `${endY}px`, opacity: 1 },
    ], {
      duration: 300,
      easing: 'linear',
      fill: 'forwards',
    });

    anim.onfinish = () => {
      playHitSound();
      onDone();
    };
  }, [fromEl, toEl, onDone]);

  return (
    <div
      ref={bulletRef}
      className="fixed z-50 pointer-events-none"
      style={{ width: 0, height: 0 }}
    >
      {/* Bullet trail */}
      <div className="absolute" style={{
        width: '18px',
        height: '6px',
        background: 'linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fff)',
        borderRadius: '3px',
        boxShadow: '0 0 8px #fbbf24, 0 0 16px #f59e0b',
        transform: 'translate(-50%, -50%)',
      }} />
    </div>
  );
}

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
              <MobilePlayerRow
                key={player.id}
                player={player}
                index={index}
                hasVoted={roomState!.votes[player.id] !== undefined}
                vote={roomState!.votes[player.id]}
                revealed={roomState!.revealed}
                registerRef={registerPlayerRef}
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
        {/* Bullets overlay */}
        {activeBullets.map(b => {
          const fromEl = playerRefs.current[b.from];
          const toEl = playerRefs.current[b.target];
          if (!fromEl || !toEl) return null;
          return <Bullet key={b.id} fromEl={fromEl} toEl={toEl} onDone={() => removeBullet(b.id)} />;
        })}
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
                  <SeatPlayer
                    player={player}
                    index={i}
                    hasVoted={roomState!.votes[player.id] !== undefined}
                    vote={roomState!.votes[player.id]}
                    revealed={roomState!.revealed}
                    cardOffset={cardOffset}
                    registerRef={registerPlayerRef}
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

      {/* Bullets overlay */}
      {activeBullets.map(b => {
        const fromEl = playerRefs.current[b.from];
        const toEl = playerRefs.current[b.target];
        if (!fromEl || !toEl) return null;
        return <Bullet key={b.id} fromEl={fromEl} toEl={toEl} onDone={() => removeBullet(b.id)} />;
      })}
    </div>
  );
}

/* ── Empty Seat ── */
function EmptySeat() {
  return (
    <div className="flex flex-col items-center gap-1 opacity-25">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-dashed border-bal-text-muted/40 flex items-center justify-center">
        <span className="text-bal-text-muted/40 text-sm">?</span>
      </div>
    </div>
  );
}

/* ── Desktop Seat Player ── */
function SeatPlayer({ player, index, hasVoted, vote, revealed, cardOffset = { dx: 0, dy: 55 }, registerRef }: {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
  cardOffset?: { dx: number; dy: number };
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  const { currentPlayer, shootPlayer, shootEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isHit, setIsHit] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Register ref for bullet tracking
  useEffect(() => {
    registerRef(player.id, avatarRef.current);
    return () => registerRef(player.id, null);
  }, [player.id, registerRef]);

  useEffect(() => {
    if (shootEvent?.target === player.id) {
      // Delay hit effect to match bullet travel time
      const timer = setTimeout(() => {
        setIsHit(true);
        if (isMe && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]);
        setTimeout(() => setIsHit(false), 600);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shootEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      const timer = setTimeout(() => setShowReaction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [reactionEvent, player.id]);

  return (
    <div className={`relative flex flex-col items-center gap-1 ${isHit ? 'player-hit' : ''}`}>
      {/* Floating reaction */}
      {showReaction && (
        <div className="reaction-float" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
          {showReaction}
        </div>
      )}

      {/* Hit flash */}
      {isHit && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="hit-flash">💥</div>
        </div>
      )}

      {/* Avatar */}
      <div
        ref={avatarRef}
        onClick={() => !isMe && !revealed && shootPlayer(player.id)}
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center
          text-lg lg:text-xl font-bold bg-gradient-to-br ${colorClass}
          border-2 border-bal-surface-light shadow-lg
          ${!isMe && !revealed ? 'player-avatar-clickable cursor-crosshair' : ''}`}
        title={!isMe ? `🔫 Spara a ${player.name}!` : ''}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name badge */}
      <div className={`px-2 py-0.5 rounded-lg text-xs lg:text-sm whitespace-nowrap
        bg-bal-bg/80 border border-bal-surface-light
        ${isMe ? 'ring-2 ring-bal-green ring-offset-1 ring-offset-transparent' : ''}`}>
        {player.name}
      </div>

      {/* Vote card */}
      {hasVoted && (
        <div
          className={`absolute w-10 h-14 lg:w-12 lg:h-16 rounded-md flex items-center justify-center
            text-lg lg:text-xl font-bold shadow-lg border-2 z-20
            ${revealed
              ? 'bg-bal-text text-bal-bg border-bal-text-dim card-flip-reveal'
              : 'card-back-pattern text-white border-bal-gold-dim player-voted-pulse'}`}
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${cardOffset.dx}px), calc(-50% + ${cardOffset.dy}px))`,
          }}
        >
          {revealed ? vote : '🃏'}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Player Row ── */
function MobilePlayerRow({ player, index, hasVoted, vote, revealed, registerRef }: {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  const { currentPlayer, shootPlayer, shootEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isHit, setIsHit] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerRef(player.id, avatarRef.current);
    return () => registerRef(player.id, null);
  }, [player.id, registerRef]);

  useEffect(() => {
    if (shootEvent?.target === player.id) {
      const timer = setTimeout(() => {
        setIsHit(true);
        if (isMe && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]);
        setTimeout(() => setIsHit(false), 600);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [shootEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      const timer = setTimeout(() => setShowReaction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [reactionEvent, player.id]);

  return (
    <div className={`flex items-center gap-3 bg-bal-surface/50 rounded-xl px-3 py-2 border border-bal-surface-light/50 ${isHit ? 'player-hit' : ''} ${isMe ? 'ring-1 ring-bal-green/50' : ''}`}>
      <div
        ref={avatarRef}
        onClick={() => !isMe && !revealed && shootPlayer(player.id)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold bg-gradient-to-br ${colorClass} border-2 border-bal-surface-light shrink-0 ${!isMe && !revealed ? 'player-avatar-clickable cursor-crosshair' : ''}`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-bal-text truncate">
          {player.name} {isMe && <span className="text-bal-green text-xs">(you)</span>}
        </div>
      </div>
      {isHit && <span className="text-xl">💥</span>}
      {showReaction && <span className="text-xl">{showReaction}</span>}
      <div className="shrink-0">
        {hasVoted ? (
          <div className={`w-10 h-14 rounded-md flex items-center justify-center text-base font-bold border-2 ${
            revealed
              ? 'bg-bal-text text-bal-bg border-bal-text-dim card-flip-reveal'
              : 'card-back-pattern text-white border-bal-gold-dim player-voted-pulse'
          }`}>
            {revealed ? vote : '🃏'}
          </div>
        ) : (
          <div className="w-10 h-14 rounded-md border-2 border-bal-surface-light/30 flex items-center justify-center text-bal-text-muted text-xs">—</div>
        )}
      </div>
    </div>
  );
}
