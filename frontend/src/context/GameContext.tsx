import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import type { RoomState } from '../types';

interface GameContextType {
  connected: boolean;
  roomState: RoomState | null;
  currentRoom: string | null;
  currentPlayer: string | null;
  myVote: string | null;
  joinRoom: (roomId: string, playerName: string) => void;
  vote: (vote: string) => void;
  newRound: () => void;
  setMyVote: (vote: string | null) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { connected, roomState, joinRoom: socketJoin, vote: socketVote, newRound: socketNewRound } = useSocket();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    socketJoin(roomId, playerName);
    setCurrentRoom(roomId);
    setCurrentPlayer(playerName);
  }, [socketJoin]);

  const vote = useCallback((voteValue: string) => {
    if (currentRoom) {
      socketVote(currentRoom, voteValue);
      setMyVote(voteValue);
    }
  }, [currentRoom, socketVote]);

  const newRound = useCallback(() => {
    if (currentRoom) {
      socketNewRound(currentRoom);
      setMyVote(null);
    }
  }, [currentRoom, socketNewRound]);

  return (
    <GameContext.Provider value={{
      connected,
      roomState,
      currentRoom,
      currentPlayer,
      myVote,
      joinRoom,
      vote,
      newRound,
      setMyVote,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
