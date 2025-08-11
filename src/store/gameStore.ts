import { create } from 'zustand';
import { GameState, TopItem, Player } from '../types/game';

interface GameStore extends GameState {
  setCategory: (category: string) => void;
  setTopItems: (items: TopItem[]) => void;
  addPlayer: (name: string) => void;
  revealItem: (itemName: string, playerName: string) => boolean;
  nextPlayer: () => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
  getCurrentPlayer: () => Player | null;
  getTotalScore: () => number;
  getRevealedCount: () => number;
}

const initialState: GameState = {
  category: '',
  topItems: [],
  players: [],
  currentPlayerIndex: 0,
  gameStatus: 'setup',
  isLoading: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setCategory: (category) => set({ category }),

  setTopItems: (items) => set({ topItems: items }),

  addPlayer: (name) => {
    const { players } = get();
    if (!players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
      set({
        players: [...players, { id: Date.now().toString(), name, score: 0 }]
      });
    }
  },

  revealItem: (itemName, playerName) => {
    const { topItems, players } = get();
    const itemIndex = topItems.findIndex(
      item => !item.isRevealed && item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (itemIndex === -1) return false;

    const updatedItems = [...topItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      isRevealed: true,
      guessedBy: playerName
    };

    const points = 11 - updatedItems[itemIndex].rank; // rank 1 = 10 points, rank 10 = 1 point
    const updatedPlayers = players.map(player =>
      player.name === playerName
        ? { ...player, score: player.score + points }
        : player
    );

    set({ topItems: updatedItems, players: updatedPlayers });
    return true;
  },

  nextPlayer: () => {
    const { players, currentPlayerIndex } = get();
    set({
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });
  },

  setGameStatus: (status) => set({ gameStatus: status }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetGame: () => set(initialState),

  getCurrentPlayer: () => {
    const { players, currentPlayerIndex } = get();
    return players[currentPlayerIndex] || null;
  },

  getTotalScore: () => {
    const { players } = get();
    return players.reduce((total, player) => total + player.score, 0);
  },

  getRevealedCount: () => {
    const { topItems } = get();
    return topItems.filter(item => item.isRevealed).length;
  },
}));