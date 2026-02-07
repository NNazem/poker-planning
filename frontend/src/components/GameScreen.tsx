import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { PokerTable } from './PokerTable';
import { VotingCards } from './VotingCards';
import { ResultsModal } from './ResultsDisplay';
import { LanguageSelector } from './LanguageSelector';

interface GameScreenProps {
  onBack: () => void;
}

export function GameScreen({ onBack }: GameScreenProps) {
  const { t } = useTranslation();
  const { currentRoom, connected, roomState } = useGame();
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    if (currentRoom) {
      const url = `${window.location.origin}?room=${currentRoom}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const playerCount = roomState?.players.length ?? 0;
  const voteCount = roomState ? Object.keys(roomState.votes).length : 0;

  return (
    <div className="min-h-screen bg-balatro crt-enter">
      {/* Header toolbar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b-2 border-retro-gold/20 px-3 py-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto gap-2 flex-wrap">
          {/* Left: back + team name */}
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-retro-gold font-bold tracking-wider text-sm uppercase hidden sm:inline">
              {t('app.subtitle')}
            </span>
          </div>

          {/* Center: room code + copy */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 text-sm font-mono transition-colors"
              title={t('game.copyCode')}
            >
              <span className="text-white/60">#</span>
              <span className="text-crt-green font-bold">{currentRoom}</span>
              {copied ? (
                <span className="text-crt-green text-xs">✓</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* Player count */}
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <span>👤</span>
              <span>{playerCount}</span>
            </div>

            {/* Vote progress */}
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <span>🗳️</span>
              <span>{voteCount}/{playerCount}</span>
            </div>
          </div>

          {/* Right: connection + language + reveal */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} title={connected ? 'Connected' : 'Disconnected'} />
            <LanguageSelector />
            <RevealButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        {/* Poker Table */}
        <PokerTable />

        {/* Voting Cards */}
        <VotingCards />
      </div>

      {/* Results Modal */}
      <ResultsModal />
    </div>
  );
}

function RevealButton() {
  const { t } = useTranslation();
  const { roomState } = useGame();

  if (!roomState || roomState.revealed) return null;

  const voteCount = Object.keys(roomState.votes).length;
  if (voteCount === 0) return null;

  // We emit reveal by setting revealed state - but the original code doesn't have a reveal action.
  // The reveal happens server-side. We'll show the button as info only.
  // Actually looking at the code, there's no explicit reveal - it auto-reveals or the server handles it.
  // We'll show vote progress indicator styled as a button.
  return (
    <div className="badge badge-success badge-sm gap-1 font-bold uppercase text-xs">
      {t('game.reveal')}
    </div>
  );
}
