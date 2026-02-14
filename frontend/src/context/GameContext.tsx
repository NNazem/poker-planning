import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useSocket, type ShootEvent } from '../hooks/useSocket';
import type { RoomState, ReactionEvent } from '../types';

interface GameContextType {
  connected: boolean;
  roomState: RoomState | null;
  currentRoom: string | null;
  currentPlayer: string | null;
  myVote: string | null;
  shootEvent: ShootEvent | null;
  reactionEvent: ReactionEvent | null;
  myPlayerId: string | null;
  joinError: string | null;
  joinRoom: (roomId: string, playerName: string) => void;
  vote: (vote: string) => void;
  newRound: () => void;
  revealVotes: () => void;
  setMyVote: (vote: string | null) => void;
  shootPlayer: (targetId: string) => void;
  sendReaction: (emoji: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { connected, roomState, shootEvent, reactionEvent, joinError, joinRoom: socketJoin, vote: socketVote, newRound: socketNewRound, revealVotes: socketRevealVotes, shoot: socketShoot, sendReaction: socketReaction } = useSocket();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // Find my player ID from roomState
  useEffect(() => {
    const actualPlayerId = roomState?.players.find(p => p.name === currentPlayer)?.id ?? null;
    if (actualPlayerId && actualPlayerId !== myPlayerId) {
      setMyPlayerId(actualPlayerId);
    }
  }, [roomState, currentPlayer, myPlayerId]);

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

  const revealVotes = useCallback(() => {
    if (currentRoom) {
      socketRevealVotes(currentRoom);
    }
  }, [currentRoom, socketRevealVotes]);

  const shootPlayer = useCallback((targetId: string) => {
    if (currentRoom) {
      socketShoot(currentRoom, targetId);
    }
  }, [currentRoom, socketShoot]);

  const sendReaction = useCallback((emoji: string) => {
    if (currentRoom) {
      socketReaction(currentRoom, emoji);
    }
  }, [currentRoom, socketReaction]);

  return (
    <GameContext.Provider value={{
      connected,
      roomState,
      currentRoom,
      currentPlayer,
      myVote,
      shootEvent,
      reactionEvent,
      myPlayerId,
      joinError,
      joinRoom,
      vote,
      newRound,
      revealVotes,
      setMyVote,
      shootPlayer,
      sendReaction,
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
