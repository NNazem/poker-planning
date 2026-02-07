import { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';
import './App.css';

function getRoomFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

function setRoomInURL(roomId: string | null) {
  const url = new URL(window.location.href);
  if (roomId) {
    url.searchParams.set('room', roomId);
  } else {
    url.searchParams.delete('room');
  }
  window.history.replaceState({}, '', url.toString());
}

function App() {
  const [inGame, setInGame] = useState(false);
  const [initialRoom, setInitialRoom] = useState<string | null>(null);

  useEffect(() => {
    const roomFromURL = getRoomFromURL();
    if (roomFromURL) {
      setInitialRoom(roomFromURL);
    }
  }, []);

  const handleJoin = (roomId: string) => {
    setRoomInURL(roomId);
    setInGame(true);
  };

  const handleBack = () => {
    setRoomInURL(null);
    setInGame(false);
  };

  return (
    <GameProvider>
      {/* CRT effects */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />
      
      <div className="crt-screen">
        {inGame ? (
          <GameScreen onBack={handleBack} />
        ) : (
          <LoginScreen onJoin={handleJoin} initialRoom={initialRoom} />
        )}
      </div>
    </GameProvider>
  );
}

export default App;
