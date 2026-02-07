import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { Player } from './Player';

export function PokerTable() {
  const { t } = useTranslation();
  const { roomState } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getPlayerPosition = (index: number, total: number) => {
    const radiusX = dimensions.width * 0.42;
    const radiusY = dimensions.height * 0.38;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: dimensions.width / 2 + radiusX * Math.cos(angle),
      y: dimensions.height / 2 + radiusY * Math.sin(angle),
    };
  };

  // Mobile: vertical list layout
  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="poker-table-balatro relative rounded-2xl p-4 mx-auto max-w-sm">
          {/* Waiting text in center */}
          {roomState && !roomState.revealed && (
            <div className="text-center py-3">
              <span className="text-crt-green/70 text-sm animate-pulse font-mono">
                {t('game.waiting')}
              </span>
            </div>
          )}
          
          {/* Player list */}
          <div className="flex flex-col gap-2 relative z-10">
            {roomState?.players.map((player, index) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={index}
                hasVoted={roomState.votes[player.id] !== undefined}
                vote={roomState.votes[player.id]}
                revealed={roomState.revealed}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: elliptical layout
  return (
    <div className="flex justify-center mb-6 lg:mb-10">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl"
        style={{ aspectRatio: '16/10' }}
      >
        <div className="poker-table-balatro absolute inset-0 rounded-full lg:rounded-[200px] flex items-center justify-center">
          {/* Players on ellipse */}
          {roomState?.players.map((player, index) => (
            <Player
              key={player.id}
              player={player}
              position={getPlayerPosition(index, roomState.players.length)}
              index={index}
              hasVoted={roomState.votes[player.id] !== undefined}
              vote={roomState.votes[player.id]}
              revealed={roomState.revealed}
            />
          ))}

          {/* Center: waiting text */}
          {roomState && !roomState.revealed && (
            <div className="relative z-10 text-center">
              <div className="text-xl lg:text-2xl text-crt-green/60 animate-pulse font-mono">
                {t('game.waiting')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile player row component
import type { Player as PlayerType } from '../types';

function PlayerRow({ player, index, hasVoted, vote, revealed }: {
  player: PlayerType;
  index: number;
  hasVoted: boolean;
  vote?: string;
  revealed: boolean;
}) {
  const { currentPlayer, pokePlayer, pokeEvent, reactionEvent } = useGame();
  const isMe = player.name === currentPlayer;
  const [isPoked, setIsPoked] = useState(false);
  const [showReaction, setShowReaction] = useState<string | null>(null);

  const AVATAR_COLORS = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
  ];
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

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

  const handlePoke = () => {
    if (!isMe && !revealed) pokePlayer(player.id);
  };

  return (
    <div className={`flex items-center gap-3 bg-black/30 rounded-xl px-3 py-2 border border-white/10 ${isPoked ? 'player-poked' : ''} ${isMe ? 'ring-1 ring-crt-green/50' : ''}`}>
      {/* Avatar */}
      <div
        onClick={handlePoke}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold bg-gradient-to-br ${colorClass} border-2 border-white/30 shrink-0 ${!isMe && !revealed ? 'player-avatar-clickable' : ''}`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + reaction */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">
          {player.name} {isMe && <span className="text-crt-green text-xs">(you)</span>}
        </div>
      </div>

      {showReaction && <span className="text-xl">{showReaction}</span>}

      {/* Vote status */}
      <div className="shrink-0">
        {hasVoted ? (
          <div className={`w-10 h-14 rounded-md flex items-center justify-center text-base font-bold border-2 ${
            revealed
              ? 'bg-white text-gray-900 border-white/50 card-flip-reveal'
              : 'card-back-pattern text-white border-crt-green/50 player-voted-pulse'
          }`}>
            {revealed ? vote : '🃏'}
          </div>
        ) : (
          <div className="w-10 h-14 rounded-md border-2 border-white/10 flex items-center justify-center text-white/20 text-xs">
            —
          </div>
        )}
      </div>
    </div>
  );
}
