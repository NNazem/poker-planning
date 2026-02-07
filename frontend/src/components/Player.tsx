import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { Player as PlayerType } from '../types';

const AVATAR_COLORS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-orange-500',
  'from-indigo-500 to-purple-500',
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
  const { currentPlayer, pokePlayer, pokeEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const [isPoked, setIsPoked] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);

  useEffect(() => {
    if (pokeEvent?.target === player.id) {
      setIsPoked(true);
      if (isMe && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      setTimeout(() => setIsPoked(false), 800);
    }
  }, [pokeEvent, player.id, isMe]);

  useEffect(() => {
    if (reactionEvent?.from === player.id) {
      setShowReaction(reactionEvent.emoji);
      setTimeout(() => setShowReaction(null), 2000);
    }
  }, [reactionEvent, player.id]);

  const handleClick = () => {
    if (!isMe && !revealed) {
      pokePlayer(player.id);
    }
  };

  return (
    <div
      className={`absolute flex flex-col items-center gap-1 ${isPoked ? 'player-poked' : ''}`}
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
          border-3 border-white/40 shadow-lg
          ${!isMe && !revealed ? 'player-avatar-clickable' : ''}`}
        title={!isMe ? `Poke ${player.name}!` : ''}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className={`px-2 py-1 rounded-xl text-xs lg:text-sm whitespace-nowrap
        bg-black/80 border border-white/20
        ${isMe ? 'ring-2 ring-crt-green ring-offset-1 ring-offset-transparent' : ''}`}>
        {player.name}
      </div>

      {/* Vote card */}
      {hasVoted && (
        <div className={`w-10 h-14 lg:w-12 lg:h-16 rounded-md flex items-center justify-center
          text-lg lg:text-xl font-bold shadow-lg border-2
          ${revealed
            ? 'bg-white text-gray-900 border-white/50 card-flip-reveal'
            : 'card-back-pattern text-white border-crt-green/50 player-voted-pulse'}`}
        >
          {revealed ? vote : '🃏'}
        </div>
      )}
    </div>
  );
}
