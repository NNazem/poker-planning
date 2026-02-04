import { useEffect, useRef, useCallback, useState } from 'react';
import type { RoomState } from '../types';

const WS_URL = import.meta.env.DEV 
  ? 'ws://localhost:3000/ws' 
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

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
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [pokeEvent, setPokeEvent] = useState<PokeEvent | null>(null);
  const [reactionEvent, setReactionEvent] = useState<ReactionEvent | null>(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        // Reconnect after 2 seconds
        setTimeout(connect, 2000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case 'room-update':
              setRoomState(message.data);
              break;
            case 'poke':
              setPokeEvent(message.data);
              // Clear after animation
              setTimeout(() => setPokeEvent(null), 1000);
              break;
            case 'reaction':
              setReactionEvent(message.data);
              // Clear after animation
              setTimeout(() => setReactionEvent(null), 2000);
              break;
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = useCallback((type: string, data: Record<string, unknown>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    sendMessage('join-room', { roomId, playerName });
  }, [sendMessage]);

  const vote = useCallback((roomId: string, voteValue: string) => {
    sendMessage('vote', { roomId, vote: voteValue });
  }, [sendMessage]);

  const newRound = useCallback((roomId: string) => {
    sendMessage('new-round', { roomId });
  }, [sendMessage]);

  const poke = useCallback((roomId: string, targetId: string) => {
    sendMessage('poke', { roomId, targetId });
  }, [sendMessage]);

  const sendReaction = useCallback((roomId: string, emoji: string) => {
    sendMessage('reaction', { roomId, emoji });
  }, [sendMessage]);

  return { connected, roomState, pokeEvent, reactionEvent, joinRoom, vote, newRound, poke, sendReaction };
}
