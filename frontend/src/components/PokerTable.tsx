import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { ResultsModal as ResultsDisplay } from './ResultsDisplay';
import type { Player as PlayerType } from '../types';

// Fixed seat positions (percentage-based) — Zynga Poker style
// 10 seats around an elliptical table
const SEAT_POSITIONS = [
  { top: '2%',  left: '50%',  transform: 'translate(-50%, 0)' },       // top center
  { top: '8%',  left: '80%',  transform: 'translate(-50%, 0)' },       // top right
  { top: '40%', left: '95%',  transform: 'translate(-50%, -50%)' },    // right
  { top: '75%', left: '82%',  transform: 'translate(-50%, -50%)' },    // bottom right
  { top: '90%', left: '62%',  transform: 'translate(-50%, -50%)' },    // bottom right-center
  { top: '90%', left: '38%',  transform: 'translate(-50%, -50%)' },    // bottom left-center
  { top: '75%', left: '18%',  transform: 'translate(-50%, -50%)' },    // bottom left
  { top: '40%', left: '5%',   transform: 'translate(-50%, -50%)' },    // left
  { top: '8%',  left: '20%',  transform: 'translate(-50%, 0)' },       // top left
  { top: '2%',  left: '50%',  transform: 'translate(-50%, 0)' },       // overflow (wraps)
];

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

export function PokerTable() {
  const { t } = useTranslation();
  const { roomState } = useGame();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const players = roomState?.players ?? [];
  const maxSeats = Math.max(players.length, 6); // Show at least 6 seats
  const seats = SEAT_POSITIONS.slice(0, Math.min(maxSeats, 10));

  // Mobile: vertical list
  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="poker-table-balatro relative rounded-2xl p-4 mx-auto max-w-sm">
          {roomState && !roomState.revealed && (
            <div className="text-center py-2">
              <span className="text-bal-green/70 text-sm animate-pulse font-mono">
                {t('game.waiting')}
              </span>
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
              />
            ))}
            {/* Empty seats on mobile */}
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
      </div>
    );
  }

  // Desktop: fixed seat positions
  return (
    <div className="flex justify-center mb-6 lg:mb-10">
      <div className="relative w-full max-w-4xl" style={{ aspectRatio: '16/10' }}>
        <div className="poker-table-balatro absolute inset-0 rounded-full lg:rounded-[200px] flex items-center justify-center">
          
          {/* Fixed seats */}
          {seats.map((pos, seatIndex) => {
            const player = players[seatIndex];
            return (
              <div
                key={seatIndex}
                className="absolute"
                style={{ top: pos.top, left: pos.left, transform: pos.transform }}
              >
                {player ? (
                  <SeatPlayer
                    player={player}
                    index={seatIndex}
                    hasVoted={roomState!.votes[player.id] !== undefined}
                    vote={roomState!.votes[player.id]}
                    revealed={roomState!.revealed}
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
              <div className="text-xl lg:text-2xl text-bal-green/60 animate-pulse font-mono">
                {t('game.waiting')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty Seat ── */
function EmptySeat() {
  return (
    <div className="flex flex-col items-center gap-1 opacity-25">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-dashed border-bal-text-muted/40 flex items-center justify-center">
        <span className="text-bal-text-muted/50 text-lg">+</span>
      </div>
    </div>
  );
}

/* ── Desktop Seat Player ── */
function SeatPlayer({ player, index, hasVoted, vote, revealed }: {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
}) {
  const { currentPlayer, pokePlayer, pokeEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isPoked, setIsPoked] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);

  useEffect(() => {
    if (pokeEvent?.target === player.id) {
      setIsPoked(true);
      if (isMe && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]);
      setTimeout(() => setIsPoked(false), 800);
    }
  }, [pokeEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      setTimeout(() => setShowReaction(null), 2000);
    }
  }, [reactionEvent, player.id]);

  return (
    <div className={`flex flex-col items-center gap-1 ${isPoked ? 'player-poked' : ''}`}>
      {/* Floating reaction */}
      {showReaction && (
        <div className="reaction-float" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
          {showReaction}
        </div>
      )}

      {/* Avatar */}
      <div
        onClick={() => !isMe && !revealed && pokePlayer(player.id)}
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center
          text-lg lg:text-xl font-bold bg-gradient-to-br ${colorClass}
          border-2 border-bal-surface-light shadow-lg
          ${!isMe && !revealed ? 'player-avatar-clickable' : ''}`}
        title={!isMe ? `Poke ${player.name}!` : ''}
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
        <div className={`w-10 h-14 lg:w-12 lg:h-16 rounded-md flex items-center justify-center
          text-lg lg:text-xl font-bold shadow-lg border-2
          ${revealed
            ? 'bg-bal-text text-bal-bg border-bal-text-dim card-flip-reveal'
            : 'card-back-pattern text-white border-bal-gold-dim player-voted-pulse'}`}
        >
          {revealed ? vote : '🃏'}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Player Row ── */
function MobilePlayerRow({ player, index, hasVoted, vote, revealed }: {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
}) {
  const { currentPlayer, pokePlayer, pokeEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isPoked, setIsPoked] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);

  useEffect(() => {
    if (pokeEvent?.target === player.id) {
      setIsPoked(true);
      if (isMe && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]);
      setTimeout(() => setIsPoked(false), 800);
    }
  }, [pokeEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      setTimeout(() => setShowReaction(null), 2000);
    }
  }, [reactionEvent, player.id]);

  return (
    <div className={`flex items-center gap-3 bg-bal-surface/50 rounded-xl px-3 py-2 border border-bal-surface-light/50 ${isPoked ? 'player-poked' : ''} ${isMe ? 'ring-1 ring-bal-green/50' : ''}`}>
      <div
        onClick={() => !isMe && !revealed && pokePlayer(player.id)}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold bg-gradient-to-br ${colorClass} border-2 border-bal-surface-light shrink-0 ${!isMe && !revealed ? 'player-avatar-clickable' : ''}`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-bal-text truncate">
          {player.name} {isMe && <span className="text-bal-green text-xs">(you)</span>}
        </div>
      </div>
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
