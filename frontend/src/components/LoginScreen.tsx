import { useState, useEffect, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { LanguageSelector } from './LanguageSelector';

interface LoginScreenProps {
  onJoin: (roomId: string) => void;
  initialRoom?: string | null;
}

export function LoginScreen({ onJoin, initialRoom }: LoginScreenProps) {
  const { t } = useTranslation();
  const { joinRoom, connected } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    if (initialRoom) {
      setRoomId(initialRoom);
    }
  }, [initialRoom]);

  const handleJoin = () => {
    if (!playerName.trim()) {
      alert(t('login.namePlaceholder') + '!');
      return;
    }
    const finalRoomId = roomId.trim() || `room-${Math.random().toString(36).substr(2, 9)}`;
    joinRoom(finalRoomId, playerName.trim());
    onJoin(finalRoomId);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-balatro">
      <div className="crt-enter w-full max-w-md">
        <div className="rounded-xl border-2 border-retro-gold/30 bg-black/60 backdrop-blur-sm shadow-2xl p-6 md:p-8">
          {/* Language Selector */}
          <div className="mb-4">
            <LanguageSelector />
          </div>

          {/* Team branding */}
          <div className="text-center mb-2">
            <span className="text-xs text-retro-gold font-semibold tracking-[0.2em] uppercase">
              {t('app.subtitle')}
            </span>
          </div>

          <div className="text-center text-6xl mb-4">🃏</div>

          <h1 className="text-center text-4xl font-bold mb-2 text-glow-green text-crt-green font-mono">
            {t('app.title')}
          </h1>

          <p className="text-center text-xs text-retro-gold/60 italic mb-6">"{t('app.motto')}"</p>

          {/* Connection status */}
          <div className="flex justify-center mb-4">
            <div className={`badge ${connected ? 'badge-success' : 'badge-error'} gap-1`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              {connected ? '✓' : '...'}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t('login.namePlaceholder')}
              className="input input-bordered input-success w-full text-lg bg-black/50 border-crt-green/40 text-white placeholder:text-white/30"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <input
              type="text"
              placeholder={t('login.roomPlaceholder')}
              className="input input-bordered w-full bg-black/50 border-white/20 text-white placeholder:text-white/30"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <p className="text-xs opacity-50 text-center">{t('login.createNew')}</p>
            <button
              className="btn btn-success btn-lg w-full gap-2 uppercase tracking-wider font-bold border-2 border-crt-green"
              onClick={handleJoin}
              disabled={!connected}
            >
              <span>{t('login.joinButton')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
