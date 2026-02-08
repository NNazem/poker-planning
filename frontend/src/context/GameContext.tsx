import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import type { RoomState } from '../types';

interface PokeEvent {
  from: string;
  fromName: string;
  target: string;
}

interface ReactionEvent {
  from: string;
  fromName: string;
  emoji: string;
}

interface GameContextType {
  connected: boolean;
  roomState: RoomState | null;
  currentRoom: string | null;
  currentPlayer: string | null;
  myVote: string | null;
  pokeEvent: PokeEvent | null;
  reactionEvent: ReactionEvent | null;
  myPlayerId: string | null;
  joinRoom: (roomId: string, playerName: string) => void;
  vote: (vote: string) => void;
  newRound: () => void;
  revealVotes: () => void;
  setMyVote: (vote: string | null) => void;
  pokePlayer: (targetId: string) => void;
  sendReaction: (emoji: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { connected, roomState, pokeEvent, reactionEvent, joinRoom: socketJoin, vote: socketVote, newRound: socketNewRound, revealVotes: socketRevealVotes, poke: socketPoke, sendReaction: socketReaction } = useSocket();
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // Find my player ID from roomState
  const actualPlayerId = roomState?.players.find(p => p.name === currentPlayer)?.id ?? null;
  if (actualPlayerId && actualPlayerId !== myPlayerId) {
    setMyPlayerId(actualPlayerId);
  }

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

  const pokePlayer = useCallback((targetId: string) => {
    if (currentRoom) {
      socketPoke(currentRoom, targetId);
    }
  }, [currentRoom, socketPoke]);

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
      pokeEvent,
      reactionEvent,
      myPlayerId,
      joinRoom,
      vote,
      newRound,
      revealVotes,
      setMyVote,
      pokePlayer,
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
