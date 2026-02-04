export interface Player {
  id: string;
  name: string;
}

export interface RoomState {
  players: Player[];
  votes: Record<string, string>;
  revealed: boolean;
}

export interface GameState {
  connected: boolean;
  currentRoom: string | null;
  currentPlayer: string | null;
  roomState: RoomState | null;
  myVote: string | null;
}

export type VoteValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '?' | '☕';
