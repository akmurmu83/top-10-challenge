import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, Sparkles, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const MenuScreen: React.FC = () => {
  const { setGameMode, setGameStatus } = useGameStore();

  const handleSinglePlayer = () => {
    setGameMode('single');
    setGameStatus('setup');
  };

  const handleMultiplayer = () => {
    setGameMode('multiplayer');
    setGameStatus('setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"
          >
            <Gamepad2 className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold text-gray-800 mb-3"
          >
            Top 10 Challenge
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 mb-2"
          >
            Test your knowledge and compete with friends!
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-purple-600"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by AI</span>
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSinglePlayer}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">Play Alone</div>
                <div className="text-blue-100 text-sm">Challenge yourself with AI-generated lists</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMultiplayer}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">Play with Friends</div>
                <div className="text-pink-100 text-sm">Create or join a room for multiplayer fun</div>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Guess the top 10 items in various categories and earn points based on their ranking!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};