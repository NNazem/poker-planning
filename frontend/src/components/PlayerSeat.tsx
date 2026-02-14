import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { AVATAR_COLORS } from '../constants/avatar';
import type { Player as PlayerType } from '../types';

interface PlayerSeatProps {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
  variant: 'desktop' | 'mobile';
  cardOffset?: { dx: number; dy: number };
}

export function PlayerSeat({ player, index, hasVoted, vote, revealed, registerRef, variant, cardOffset = { dx: 0, dy: 55 } }: PlayerSeatProps) {
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

  if (variant === 'mobile') {
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

  // Desktop variant
  return (
    <div className={`relative flex flex-col items-center gap-1 ${isHit ? 'player-hit' : ''}`}>
      {showReaction && (
        <div className="reaction-float" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
          {showReaction}
        </div>
      )}

      {isHit && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="hit-flash">💥</div>
        </div>
      )}

      <div
        ref={avatarRef}
        onClick={() => !isMe && !revealed && shootPlayer(player.id)}
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center
          text-lg lg:text-xl font-bold bg-gradient-to-br ${colorClass}
          border-2 border-bal-surface-light shadow-lg
          ${!isMe && !revealed ? 'player-avatar-clickable cursor-crosshair' : ''}`}
        title={!isMe ? `🔫 Shoot ${player.name}!` : ''}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      <div className={`px-2 py-0.5 rounded-lg text-xs lg:text-sm whitespace-nowrap
        bg-bal-bg/80 border border-bal-surface-light
        ${isMe ? 'ring-2 ring-bal-green ring-offset-1 ring-offset-transparent' : ''}`}>
        {player.name}
      </div>

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
