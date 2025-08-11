import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Room management
  createRoom(playerName: string, category: string) {
    this.socket?.emit('createRoom', { playerName, category });
  }

  joinRoom(playerName: string, roomId: string) {
    this.socket?.emit('joinRoom', { playerName, roomId });
  }

  startGame() {
    this.socket?.emit('startGame');
  }

  submitGuess(guess: string) {
    this.socket?.emit('submitGuess', { guess });
  }

  endGame() {
    this.socket?.emit('endGame');
  }

  // Event listeners
  onRoomCreated(callback: (data: any) => void) {
    this.socket?.on('roomCreated', callback);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket?.on('playerJoined', callback);
  }

  onGameStarted(callback: (data: any) => void) {
    this.socket?.on('gameStarted', callback);
  }

  onCorrectGuess(callback: (data: any) => void) {
    this.socket?.on('correctGuess', callback);
  }

  onWrongGuess(callback: (data: any) => void) {
    this.socket?.on('wrongGuess', callback);
  }

  onNextTurn(callback: (data: any) => void) {
    this.socket?.on('nextTurn', callback);
  }

  onGameEnded(callback: (data: any) => void) {
    this.socket?.on('gameEnded', callback);
  }

  onPlayerLeft(callback: (data: any) => void) {
    this.socket?.on('playerLeft', callback);
  }

  onError(callback: (data: any) => void) {
    this.socket?.on('error', callback);
  }

  // Remove listeners
  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();