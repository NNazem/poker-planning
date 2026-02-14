export interface Player {
  id: string;
  name: string;
}

export interface RoomState {
  players: Player[];
  votes: Record<string, string>;
  revealed: boolean;
}

export type VoteValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '?' | '☕';
