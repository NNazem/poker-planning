import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';

function App() {
  const [inGame, setInGame] = useState(false);

  return (
    <GameProvider>
      {inGame ? (
        <GameScreen />
      ) : (
        <LoginScreen onJoin={() => setInGame(true)} />
      )}
    </GameProvider>
  );
}

export default App;
