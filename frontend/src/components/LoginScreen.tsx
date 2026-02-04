import { useState, type KeyboardEvent } from 'react';
import { useGame } from '../context/GameContext';

interface LoginScreenProps {
  onJoin: () => void;
}

export function LoginScreen({ onJoin }: LoginScreenProps) {
  const { joinRoom, connected } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert('Inserisci il tuo nome!');
      return;
    }
    
    const finalRoomId = roomId.trim() || `room-${Math.random().toString(36).substr(2, 9)}`;
    joinRoom(finalRoomId, playerName.trim());
    onJoin();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-primary">
      <div className="card w-full max-w-md bg-base-300/50 backdrop-blur-md shadow-2xl border border-white/10">
        <div className="card-body items-center text-center">
          {/* Uncharted Logo */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Uncharted_logo.svg/200px-Uncharted_logo.svg.png" 
              alt="Uncharted" 
              className="h-8 opacity-80"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
            <span className="text-xs text-amber-400 font-semibold tracking-widest uppercase">Team</span>
          </div>
          
          <div className="text-6xl mb-4 animate-bounce">🃏</div>
          <h1 className="card-title text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Planning Poker
          </h1>
          <p className="text-xs text-amber-500/60 italic mb-6">"Sic Parvis Magna"</p>
          
          {/* Connection status */}
          <div className={`badge ${connected ? 'badge-success' : 'badge-error'} gap-1 mb-4`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            {connected ? 'Connesso' : 'Connessione...'}
          </div>
          
          <div className="form-control w-full gap-3">
            <input 
              type="text" 
              placeholder="Il tuo nome" 
              className="input input-bordered input-primary w-full text-lg"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <input 
              type="text" 
              placeholder="Room ID (opzionale)" 
              className="input input-bordered w-full"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="btn btn-primary btn-lg w-full gap-2"
              onClick={handleJoin}
              disabled={!connected}
            >
              <span>Entra al tavolo</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
          
          <div className="divider text-xs opacity-50">Press Enter to join</div>
        </div>
      </div>
    </div>
  );
}
