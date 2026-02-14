import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { Player as PlayerType } from '../types';

const AVATAR_COLORS = [
  'from-emerald-700 to-emerald-500',
  'from-amber-700 to-amber-500',
  'from-teal-700 to-teal-500',
  'from-rose-800 to-rose-600',
  'from-violet-800 to-violet-600',
  'from-cyan-800 to-cyan-600',
];

interface PlayerProps {
  player: PlayerType;
  position: { x: number; y: number };
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
}

export function Player({ player, position, index, hasVoted, vote, revealed }: PlayerProps) {
  const { currentPlayer, shootPlayer, shootEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isHit, setIsHit] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);

  useEffect(() => {
    if (shootEvent?.target === player.id) {
      setIsHit(true);
      if (isMe && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      setTimeout(() => setIsHit(false), 600);
    }
  }, [shootEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      setTimeout(() => setShowReaction(null), 2000);
    }
  }, [reactionEvent, player.id]);

  const handleClick = () => {
    if (!isMe && !revealed) {
      shootPlayer(player.id);
    }
  };

  return (
    <div
      className={`absolute flex flex-col items-center gap-1 ${isHit ? 'player-hit' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Floating reaction */}
      {showReaction && (
        <div className="reaction-float" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
          {showReaction}
        </div>
      )}

      {/* Avatar */}
      <div
        onClick={handleClick}
        className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center
          text-lg lg:text-xl font-bold bg-gradient-to-br ${colorClass}
          border-3 border-bal-surface-light shadow-lg
          ${!isMe && !revealed ? 'player-avatar-clickable' : ''}`}
        title={!isMe ? `Poke ${player.name}!` : ''}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className={`px-2 py-1 rounded-xl text-xs lg:text-sm whitespace-nowrap
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
            : 'card-back-pattern text-white border-bal-green/50 player-voted-pulse'}`}
        >
          {revealed ? vote : '🃏'}
        </div>
      )}
    </div>
  );
}
