export interface TopItem {
  rank: number;
  name: string;
  isRevealed: boolean;
  guessedBy?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isAdmin?: boolean;
}

export interface GameState {
  category: string;
  topItems: TopItem[];
  players: Player[];
  currentPlayerIndex: number;
  gameStatus: 'menu' | 'setup' | 'lobby' | 'playing' | 'finished';
  isLoading: boolean;
  gameMode: 'single' | 'multiplayer';
  roomId?: string;
  currentPlayer?: Player;
  isMyTurn?: boolean;
}

export interface Room {
  id: string;
  category: string;
  topItems: TopItem[];
  players: Player[];
  currentPlayerIndex: number;
  gameStatus: 'lobby' | 'playing' | 'finished';
  createdAt: Date;
}