import React from 'react';
import { useGameStore } from './store/gameStore';
import { MenuScreen } from './components/MenuScreen';
import { SetupScreen } from './components/SetupScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';

function App() {
  const { gameStatus } = useGameStore();

  const renderScreen = () => {
    switch (gameStatus) {
      case 'menu':
        return <MenuScreen />;
      case 'setup':
        return <SetupScreen />;
      case 'lobby':
        return <LobbyScreen />;
      case 'playing':
        return <GameScreen />;
      case 'finished':
        return <ResultsScreen />;
      default:
        return <MenuScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
}

export default App;