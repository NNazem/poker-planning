import { useEffect, useRef, useCallback, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { RoomState, ShootEvent, ReactionEvent } from '../types';

export type { ShootEvent };

const SERVER_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : window.location.origin;

interface UseSocketReturn {
  connected: boolean;
  roomState: RoomState | null;
  shootEvent: ShootEvent | null;
  reactionEvent: ReactionEvent | null;
  joinError: string | null;
  joinRoom: (roomId: string, playerName: string) => void;
  vote: (roomId: string, vote: string) => void;
  newRound: (roomId: string) => void;
  revealVotes: (roomId: string) => void;
  shoot: (roomId: string, targetId: string) => void;
  sendReaction: (roomId: string, emoji: string) => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [shootEvent, setShootEvent] = useState<ShootEvent | null>(null);
  const [reactionEvent, setReactionEvent] = useState<ReactionEvent | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

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

    socket.on('shoot', (data: ShootEvent) => {
      setShootEvent(data);
      setTimeout(() => setShootEvent(null), 1500);
    });

    socket.on('join-error', (data: { message: string }) => {
      setJoinError(data.message);
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
    setJoinError(null);
    socketRef.current?.emit('join-room', { roomId, playerName });
  }, []);

  const vote = useCallback((roomId: string, voteValue: string) => {
    socketRef.current?.emit('vote', { roomId, vote: voteValue });
  }, []);

  const newRound = useCallback((roomId: string) => {
    socketRef.current?.emit('new-round', { roomId });
  }, []);

  const revealVotes = useCallback((roomId: string) => {
    socketRef.current?.emit('reveal-votes', { roomId });
  }, []);

  const shoot = useCallback((roomId: string, targetId: string) => {
    socketRef.current?.emit('shoot', { roomId, targetId });
  }, []);

  const sendReaction = useCallback((roomId: string, emoji: string) => {
    socketRef.current?.emit('reaction', { roomId, emoji });
  }, []);

  return { connected, roomState, shootEvent, reactionEvent, joinError, joinRoom, vote, newRound, revealVotes, shoot, sendReaction };
}
