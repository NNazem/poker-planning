import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { RoomState } from '../types';

const SERVER_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : window.location.origin;

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

interface UseSocketReturn {
  connected: boolean;
  roomState: RoomState | null;
  pokeEvent: PokeEvent | null;
  reactionEvent: ReactionEvent | null;
  joinRoom: (roomId: string, playerName: string) => void;
  vote: (roomId: string, vote: string) => void;
  newRound: (roomId: string) => void;
  poke: (roomId: string, targetId: string) => void;
  sendReaction: (roomId: string, emoji: string) => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [pokeEvent, setPokeEvent] = useState<PokeEvent | null>(null);
  const [reactionEvent, setReactionEvent] = useState<ReactionEvent | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.io connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setConnected(false);
    });

    socket.on('room-update', (data: RoomState) => {
      setRoomState(data);
    });

    socket.on('poke', (data: PokeEvent) => {
      setPokeEvent(data);
      setTimeout(() => setPokeEvent(null), 1000);
    });

    socket.on('reaction', (data: ReactionEvent) => {
      setReactionEvent(data);
      setTimeout(() => setReactionEvent(null), 2000);
    });

    return () => {
      socket.close();
    };
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    socketRef.current?.emit('join-room', { roomId, playerName });
  }, []);

  const vote = useCallback((roomId: string, voteValue: string) => {
    socketRef.current?.emit('vote', { roomId, vote: voteValue });
  }, []);

  const newRound = useCallback((roomId: string) => {
    socketRef.current?.emit('new-round', { roomId });
  }, []);

  const poke = useCallback((roomId: string, targetId: string) => {
    socketRef.current?.emit('poke', { roomId, targetId });
  }, []);

  const sendReaction = useCallback((roomId: string, emoji: string) => {
    socketRef.current?.emit('reaction', { roomId, emoji });
  }, []);

  return { connected, roomState, pokeEvent, reactionEvent, joinRoom, vote, newRound, poke, sendReaction };
}
