import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, RotateCcw, Home } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const ResultsScreen: React.FC = () => {
  const { 
    category, 
    topItems, 
    players, 
    resetGame,
    setGameStatus 
  } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const handlePlayAgain = () => {
    resetGame();
  };

  const handleBackToSetup = () => {
    resetGame();
    setGameStatus('setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Winner Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-yellow-400 rounded-full mb-4 shadow-lg"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🎉 Game Complete! 🎉
          </h1>
          
          {winner && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-white/90 mb-2"
            >
              Winner: <span className="font-bold text-yellow-200">{winner.name}</span>
            </motion.div>
          )}
          
          <p className="text-lg text-white/80">Category: {category}</p>
        </motion.div>

        {/* Final Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <Medal className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">Final Leaderboard</h2>
          </div>

          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg' 
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-300'
                  } text-white`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{player.name}</p>
                    <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-600'}`}>
                      {player.score} points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {index === 0 && <Star className="w-6 h-6 text-yellow-200 fill-current" />}
                  {index === 1 && <Star className="w-6 h-6 text-gray-200 fill-current" />}
                  {index === 2 && <Star className="w-6 h-6 text-orange-200 fill-current" />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Complete Top 10 List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Complete Top 10: {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topItems.map((item, index) => (
              <motion.div
                key={item.rank}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  item.isRevealed 
                    ? 'bg-green-100 border border-green-300' 
                    : 'bg-red-100 border border-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    item.isRevealed ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {item.rank}
                  </div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                
                <div className="text-right">
                  {item.isRevealed ? (
                    <div>
                      <p className="text-xs text-green-600">Guessed by</p>
                      <p className="font-medium text-green-800">{item.guessedBy}</p>
                    </div>
                  ) : (
                    <span className="text-red-600 text-sm">Not guessed</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handlePlayAgain}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          
          <button
            onClick={handleBackToSetup}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg"
          >
            <Home className="w-5 h-5" />
            New Game
          </button>
        </motion.div>
      </div>
    </div>
  );
};