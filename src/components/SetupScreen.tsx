import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateTop10List } from '../services/openai';

export const SetupScreen: React.FC = () => {
  const [inputCategory, setInputCategory] = useState('');
  const [playerName, setPlayerName] = useState('');
  const { 
    players, 
    addPlayer, 
    setCategory, 
    setTopItems, 
    setGameStatus, 
    isLoading, 
    setLoading 
  } = useGameStore();

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const handleStartGame = async () => {
    if (!inputCategory.trim() || players.length === 0) return;

    setLoading(true);
    try {
      const items = await generateTop10List(inputCategory);
      const topItems = items.map((name, index) => ({
        rank: index + 1,
        name,
        isRevealed: false
      }));
      
      setCategory(inputCategory);
      setTopItems(topItems);
      setGameStatus('playing');
    } catch (error) {
      console.error('Error generating top 10 list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Top 10 Challenge</h1>
          <p className="text-gray-600">Create your category and start guessing!</p>
        </div>

        <div className="space-y-6">
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
            onClick={handleStartGame}
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
        </div>
      </motion.div>
    </div>
  );
};