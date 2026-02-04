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
  const { currentPlayer } = useGame();
  const isMe = player.name === currentPlayer;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div 
      className="player absolute flex flex-col items-center gap-1 animate-[playerJoin_0.5s_ease-out]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Avatar */}
      <div 
        className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center 
          text-lg lg:text-xl font-bold bg-gradient-to-br ${colorClass}
          border-3 border-white shadow-lg hover:scale-110 transition-transform`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
      
      {/* Name */}
      <div className={`px-2 py-1 rounded-xl text-xs lg:text-sm whitespace-nowrap 
        bg-black/70 backdrop-blur-sm border border-white/20
        ${isMe ? 'ring-2 ring-success ring-offset-1 ring-offset-transparent' : ''}`}>
        {player.name}
      </div>
      
      {/* Vote card */}
      {hasVoted && (
        <div className={`w-10 h-14 lg:w-12 lg:h-16 rounded-md flex items-center justify-center
          text-lg lg:text-xl font-bold shadow-lg border-2 border-white/30
          ${revealed 
            ? 'bg-white text-gray-900 player-vote-reveal' 
            : 'bg-gradient-to-br from-green-500 to-green-600 text-white vote-chip-enter player-voted'}`}
        >
          {revealed ? vote : '🃏'}
        </div>
      )}
    </div>
  );
}
