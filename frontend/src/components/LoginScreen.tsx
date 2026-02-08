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
        <div className="rounded-xl border-2 border-bal-gold/30 bg-bal-bg/80 backdrop-blur-sm shadow-2xl p-6 md:p-8">
          {/* Language Selector */}
          <div className="mb-4">
            <LanguageSelector />
          </div>

          {/* Team branding */}
          <div className="text-center mb-2">
            <span className="text-xs text-bal-gold font-semibold tracking-[0.2em] uppercase">
              {t('app.subtitle')}
            </span>
          </div>

          <div className="text-center text-6xl mb-4">🃏</div>

          <h1 className="text-center text-4xl font-bold mb-2 text-glow-green text-bal-green font-mono">
            {t('app.title')}
          </h1>

          <p className="text-center text-xs text-bal-gold-dim/60 italic mb-6">"{t('app.motto')}"</p>

          {/* Connection status */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bal-surface/50 border border-bal-surface-light/50">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-bal-green' : 'bg-bal-red'} animate-pulse`} />
              <span className="text-xs text-bal-text-dim">{connected ? 'Online' : 'Connecting...'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={t('login.namePlaceholder')}
              className="w-full px-4 py-3 text-lg rounded-lg bg-bal-surface border-2 border-bal-gold-dim/40 text-bal-text placeholder:text-bal-text-muted focus:border-bal-green focus:outline-none transition-colors"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <input
              type="text"
              placeholder={t('login.roomPlaceholder')}
              className="w-full px-4 py-3 rounded-lg bg-bal-surface border-2 border-bal-surface-light text-bal-text placeholder:text-bal-text-muted focus:border-bal-green focus:outline-none transition-colors"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <p className="text-xs text-bal-text-muted text-center">{t('login.createNew')}</p>
            <button
              className="w-full py-3 px-6 text-lg font-bold uppercase tracking-wider rounded-lg
                bg-bal-green-dark border-2 border-bal-green text-bal-green
                hover:bg-bal-green hover:text-bal-bg transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={handleJoin}
              disabled={!connected}
            >
              <span className="flex items-center justify-center gap-2">
                {t('login.joinButton')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
