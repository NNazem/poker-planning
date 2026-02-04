import { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from './Player';
import { ResultsDisplay } from './ResultsDisplay';

export function PokerTable() {
  const { roomState } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
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

  return (
    <div className="flex justify-center mb-6 lg:mb-10">
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl"
        style={{ aspectRatio: '16/10' }}
      >
        {/* Poker Table */}
        <div className="poker-table absolute inset-0 rounded-full lg:rounded-[200px] flex items-center justify-center">
          
          {/* Players */}
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
          
          {/* Center content */}
          <div className="relative z-10 text-center">
            <ResultsDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
