import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Sparkles, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

export const SetupScreen: React.FC = () => {
  const [inputCategory, setInputCategory] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [setupMode, setSetupMode] = useState<'category' | 'create' | 'join'>('category');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  
  const {
    gameMode,
    players,
    addPlayer,
    setCategory,
    setTopItems,
    setGameStatus,
    setRoomId: setStoreRoomId,
    setCurrentPlayer,
    updateRoom,
    isLoading,
    setLoading,
    resetGame
  } = useGameStore();

  React.useEffect(() => {
    if (gameMode === 'multiplayer') {
      const socket = socketService.connect();
      setIsConnected(socket.connected);

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      // Socket event listeners
      socketService.onRoomCreated((data) => {
        setStoreRoomId(data.roomId);
        updateRoom(data.room);
        setGameStatus('lobby');
        setLoading(false);
      });

      socketService.onPlayerJoined((data) => {
        updateRoom(data.room);
        setGameStatus('lobby');
        setLoading(false);
      });

      socketService.onError((data) => {
        setError(data.message);
        setLoading(false);
      });

      return () => {
        socketService.off('roomCreated');
        socketService.off('playerJoined');
        socketService.off('error');
      };
    }
  }, [gameMode]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const handleSinglePlayerStart = async () => {
    if (!inputCategory.trim() || players.length === 0) {
      setError('Please enter a category and add at least one player');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getTop10List(inputCategory);
      
      if (response.success) {
        setCategory(inputCategory);
        setTopItems(response.items);
        setGameStatus('playing');
      } else {
        throw new Error('Failed to generate list');
      }
    } catch (error) {
      console.error('Error generating top 10 list:', error);
      setError('Failed to generate top 10 list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    if (!playerName.trim() || !inputCategory.trim()) {
      setError('Please enter your name and a category');
      return;
    }

    setLoading(true);
    setError('');
    socketService.createRoom(playerName.trim(), inputCategory.trim());
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID');
      return;
    }

    setLoading(true);
    setError('');
    socketService.joinRoom(playerName.trim(), roomId.trim().toUpperCase());
  };

  const handleBack = () => {
    if (setupMode === 'category') {
      resetGame();
    } else {
      setSetupMode('category');
      setError('');
    }
  };

  const renderSinglePlayerSetup = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Game Category
        </label>
        <input
          type="text"
          value={inputCategory}
          onChange={(e) => setInputCategory(e.target.value)}
          placeholder="e.g., Top 10 richest people in the world"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Players
        </label>
        <form onSubmit={handleAddPlayer} className="flex gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {players.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Players ({players.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white px-3 py-1 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
              >
                {player.name}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSinglePlayerStart}
        disabled={!inputCategory.trim() || players.length === 0 || isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        ) : (
          <>
            <Play className="w-5 h-5" />
            Start Game
          </>
        )}
      </motion.button>
    </>
  );

  const renderMultiplayerSetup = () => {
    if (setupMode === 'category') {
      return (
        <>
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isConnected ? 'Connected to server' : 'Connecting to server...'}
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSetupMode('create')}
              disabled={!isConnected}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create New Room
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSetupMode('join')}
              disabled={!isConnected}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Existing Room
            </motion.button>
          </div>
        </>
      );
    }

    if (setupMode === 'create') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Category
            </label>
            <input
              type="text"
              value={inputCategory}
              onChange={(e) => setInputCategory(e.target.value)}
              placeholder="e.g., Top 10 richest people in the world"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || !inputCategory.trim() || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                Create Room
              </>
            )}
          </motion.button>
        </>
      );
    }

    if (setupMode === 'join') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room ID (e.g., ABC123)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              maxLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomId.trim() || isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                Join Room
              </>
            )}
          </motion.button>
        </>
      );
    }
  };

  const getTitle = () => {
    if (gameMode === 'single') return 'Single Player Setup';
    if (setupMode === 'category') return 'Multiplayer Mode';
    if (setupMode === 'create') return 'Create Room';
    if (setupMode === 'join') return 'Join Room';
    return 'Game Setup';
  };

  const getSubtitle = () => {
    if (gameMode === 'single') return 'Set up your solo challenge';
    if (setupMode === 'category') return 'Choose how to play with friends';
    if (setupMode === 'create') return 'Create a new room for your friends';
    if (setupMode === 'join') return 'Join an existing room';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">{getSubtitle()}</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          {gameMode === 'single' ? renderSinglePlayerSetup() : renderMultiplayerSetup()}
        </div>
      </motion.div>
    </div>
  );
};