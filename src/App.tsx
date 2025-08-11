import React from 'react';
import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';

function App() {
  const { gameStatus } = useGameStore();

  const renderScreen = () => {
    switch (gameStatus) {
      case 'setup':
        return <SetupScreen />;
      case 'playing':
        return <GameScreen />;
      case 'finished':
        return <ResultsScreen />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;