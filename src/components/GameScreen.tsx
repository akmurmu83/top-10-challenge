import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Zap, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const GameScreen: React.FC = () => {
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const {
    category,
    topItems,
    players,
    currentPlayerIndex,
    revealItem,
    nextPlayer,
    getCurrentPlayer,
    getRevealedCount,
    setGameStatus
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const revealedCount = getRevealedCount();

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || !currentPlayer) return;

    const isCorrect = revealItem(guess.trim(), currentPlayer.name);
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setGuess('');
    
    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        // Check if game is complete
        if (getRevealedCount() === 10) {
          setGameStatus('finished');
        }
      }
      nextPlayer();
    }, 1500);
  };

  const handleEndGame = () => {
    setGameStatus('finished');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{category}</h1>
              <p className="text-gray-600">Revealed: {revealedCount}/10</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Player</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-gray-800">{currentPlayer?.name}</span>
                </div>
              </div>
              
              <button
                onClick={handleEndGame}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                End Game
              </button>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {topItems.map((item) => (
            <motion.div
              key={item.rank}
              className="relative aspect-square"
              layout
            >
              <div className="w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden">
                <AnimatePresence mode="wait">
                  {!item.isRevealed ? (
                    <motion.div
                      key="sticker"
                      initial={{ opacity: 1 }}
                      exit={{ 
                        opacity: 0,
                        rotateY: 90,
                        scale: 0.8
                      }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center text-white font-bold"
                    >
                      <span className="text-2xl mb-2">#{item.rank}</span>
                      <span className="text-xs opacity-80">MYSTERY</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed"
                      initial={{ 
                        opacity: 0,
                        rotateY: -90,
                        scale: 0.8
                      }}
                      animate={{ 
                        opacity: 1,
                        rotateY: 0,
                        scale: 1
                      }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex flex-col items-center justify-center text-white p-2"
                    >
                      <span className="text-lg font-bold mb-1">#{item.rank}</span>
                      <span className="text-xs text-center font-medium leading-tight">
                        {item.name}
                      </span>
                      {item.guessedBy && (
                        <span className="text-xs opacity-80 mt-1">
                          by {item.guessedBy}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Guess Input */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleGuess} className="flex gap-3">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={`${currentPlayer?.name}, make your guess...`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={feedback !== null}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!guess.trim() || feedback !== null}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Guess
            </motion.button>
          </form>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white font-semibold shadow-lg z-50 ${
                feedback === 'correct' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
            >
              {feedback === 'correct' ? '🎉 Correct! Great guess!' : '❌ Not quite right, try again!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scoreboard */}
        <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">Scoreboard</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    player.name === currentPlayer?.name
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{player.name}</span>
                  </div>
                  <span className="font-bold text-purple-600">{player.score}pts</span>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};