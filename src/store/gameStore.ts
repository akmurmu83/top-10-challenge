import { create } from 'zustand';
import { GameState, TopItem, Player, Room } from '../types/game';
import { socketService } from '../services/socket';

interface GameStore extends GameState {
  setGameMode: (mode: 'single' | 'multiplayer') => void;
  setCategory: (category: string) => void;
  setTopItems: (items: TopItem[]) => void;
  addPlayer: (name: string) => void;
  setPlayers: (players: Player[]) => void;
  revealItem: (itemName: string, playerName: string) => boolean;
  revealItemByRank: (rank: number, name: string, guessedBy: string) => void;
  nextPlayer: () => void;
  setGameStatus: (status: GameState['gameStatus']) => void;
  setLoading: (loading: boolean) => void;
  setRoomId: (roomId: string) => void;
  setCurrentPlayer: (player: Player) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  updateRoom: (room: Room) => void;
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
  gameStatus: 'menu',
  isLoading: false,
  gameMode: 'single',
  roomId: undefined,
  currentPlayer: undefined,
  isMyTurn: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setGameMode: (mode) => set({ gameMode: mode }),

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

  setPlayers: (players) => set({ players }),

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

  revealItemByRank: (rank, name, guessedBy) => {
    const { topItems, players } = get();
    const updatedItems = topItems.map(item =>
      item.rank === rank
        ? { ...item, name, isRevealed: true, guessedBy }
        : item
    );

    const points = 11 - rank;
    const updatedPlayers = players.map(player =>
      player.name === guessedBy
        ? { ...player, score: player.score + points }
        : player
    );

    set({ topItems: updatedItems, players: updatedPlayers });
  },
  nextPlayer: () => {
    const { players, currentPlayerIndex } = get();
    set({
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });
  },

  setGameStatus: (status) => set({ gameStatus: status }),

  setLoading: (loading) => set({ isLoading: loading }),

  setRoomId: (roomId) => set({ roomId }),

  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),

  // updateRoom: (room) => {
  //   set({
  //     category: room.category,
  //     topItems: room.topItems,
  //     players: room.players,
  //     currentPlayerIndex: room.currentPlayerIndex,
  //     gameStatus: room.gameStatus,
  //   });
  // },
  updateRoom: (room) => {
    const socketId = socketService.getSocket()?.id;
    const me = room.players.find((p) => p.id === socketId);
    
    // Determine if it's my turn
    const currentTurnPlayer = room.players[room.currentPlayerIndex];
    const isMyTurnNow = currentTurnPlayer?.id === socketId;

    set({
      category: room.category,
      topItems: room.topItems,
      players: room.players,
      currentPlayerIndex: room.currentPlayerIndex,
      gameStatus: room.gameStatus,
      currentPlayer: me,
      isMyTurn: isMyTurnNow
    });
  },


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