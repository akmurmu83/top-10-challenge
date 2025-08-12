import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Copy, Crown, Wifi } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';

export const LobbyScreen: React.FC = () => {
  const {
    category,
    players,
    roomId,
    currentPlayer,
    setGameStatus,
    updateRoom,
    setCurrentPlayer,
    setIsMyTurn
  } = useGameStore();

  const isAdmin = currentPlayer?.isAdmin || false;

  useEffect(() => {
    // Socket event listeners
    socketService.onGameStarted((data) => {
      updateRoom(data.room);
      // Set initial turn state
      const socketId = socketService.getSocket()?.id;
      const isMyTurnNow = data.currentPlayer?.id === socketId;
      setIsMyTurn(isMyTurnNow);
      setGameStatus('playing');
    });

    socketService.onPlayerJoined((data) => {
      updateRoom(data.room);
    });

    socketService.onPlayerLeft((data) => {
      updateRoom(data.room);
    });

    socketService.onError((data) => {
      console.error('Lobby error:', data.message);
    });

    return () => {
      socketService.off('gameStarted');
      socketService.off('playerJoined');
      socketService.off('playerLeft');
      socketService.off('error');
    };
  }, []);

  const handleStartGame = () => {
    if (isAdmin) {
      socketService.startGame();
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Lobby</h1>
          <p className="text-gray-600 mb-4">{category}</p>
          
          {/* Room ID */}
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
            <span className="text-sm text-gray-600">Room ID:</span>
            <span className="font-mono font-bold text-lg text-gray-800">{roomId}</span>
            <button
              onClick={handleCopyRoomId}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy Room ID"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Connected to server</span>
        </div>

        {/* Players List */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Players ({players.length})</span>
          </div>
          
          <div className="space-y-3">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  player.id === currentPlayer?.id
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : 'bg-white'
                } shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{player.name}</p>
                    <p className="text-sm text-gray-500">
                      {player.id === currentPlayer?.id ? 'You' : 'Player'}
                    </p>
                  </div>
                </div>
                
                {player.isAdmin && (
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-700">Admin</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Players take turns guessing items from the top 10 list</li>
            <li>• Correct guesses reveal the item and award points</li>
            <li>• Higher ranked items give more points (Rank 1 = 10 pts)</li>
            <li>• Game ends when all items are revealed</li>
          </ul>
        </div>

        {/* Start Game Button */}
        {isAdmin ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartGame}
            disabled={players.length < 1}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-5 h-5" />
            Start Game
          </motion.button>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-2">Waiting for admin to start the gamo...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Share the Room ID with your friends so they can join!
          </p>
        </div>
      </motion.div>
    </div>
  );
};