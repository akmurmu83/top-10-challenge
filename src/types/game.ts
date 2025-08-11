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
}

export interface GameState {
  category: string;
  topItems: TopItem[];
  players: Player[];
  currentPlayerIndex: number;
  gameStatus: 'setup' | 'playing' | 'finished';
  isLoading: boolean;
}