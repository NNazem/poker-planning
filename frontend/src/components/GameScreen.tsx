import { useGame } from '../context/GameContext';
import { PokerTable } from './PokerTable';
import { VotingCards } from './VotingCards';

export function GameScreen() {
  const { currentRoom, connected } = useGame();

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-primary">
      {/* Header */}
      <div className="text-center mb-6 lg:mb-10">
        {/* Uncharted branding */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Uncharted_logo.svg/200px-Uncharted_logo.svg.png" 
            alt="Uncharted" 
            className="h-8 lg:h-10 opacity-80 hover:opacity-100 transition-opacity"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <span className="text-xs lg:text-sm text-amber-400 font-semibold tracking-widest uppercase">
            Team
          </span>
        </div>
        
        <h1 className="text-3xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          🃏 Planning Poker
        </h1>
        
        <p className="text-xs text-amber-500/60 italic mb-2">"Sic Parvis Magna"</p>
        
        {/* Room badge */}
        <div className="flex items-center justify-center gap-2">
          <div 
            className="badge badge-primary badge-lg gap-2 cursor-pointer hover:badge-secondary transition-colors"
            onClick={copyRoomId}
            title="Click to copy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Room: <span className="font-mono font-bold">{currentRoom}</span>
          </div>
          
          {/* Connection indicator */}
          <div className={`badge ${connected ? 'badge-success' : 'badge-error'} badge-sm gap-1`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          </div>
        </div>
      </div>

      {/* Poker Table */}
      <PokerTable />

      {/* Voting Cards */}
      <VotingCards />
    </div>
  );
}
