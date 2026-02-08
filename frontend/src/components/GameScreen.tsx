import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { PokerTable } from './PokerTable';
import { VotingCards } from './VotingCards';
import { LanguageSelector } from './LanguageSelector';

interface GameScreenProps {
  onBack: () => void;
}

export function GameScreen({ onBack }: GameScreenProps) {
  const { t } = useTranslation();
  const { currentRoom, roomState, connected, revealVotes } = useGame();
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    if (currentRoom) {
      const url = `${window.location.origin}?room=${currentRoom}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalPlayers = roomState?.players.length ?? 0;
  const votedCount = roomState ? Object.keys(roomState.votes).length : 0;
  const allVoted = totalPlayers > 0 && votedCount === totalPlayers && !roomState?.revealed;

  return (
    <div className="min-h-screen bg-balatro">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 bg-bal-bg/80 backdrop-blur-sm border-b-2 border-bal-gold/20 px-3 py-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg text-bal-text-dim hover:text-bal-text hover:bg-bal-surface transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-bal-gold font-bold tracking-wider text-sm uppercase hidden sm:inline">
              🃏 {t('app.subtitle')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Room code */}
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-1.5 bg-bal-surface hover:bg-bal-surface-light rounded-lg px-3 py-1.5 text-sm font-mono transition-colors border border-bal-surface-light"
              title={t('game.copyCode')}
            >
              <span className="text-bal-text-muted">#</span>
              <span className="text-bal-green font-bold">{currentRoom}</span>
              {copied && <span className="text-bal-green text-xs">✓</span>}
            </button>

            {/* Player count & vote progress */}
            <div className="flex items-center gap-1 text-bal-text-dim text-sm">
              <span>👥</span>
              <span className="font-mono">{votedCount}/{totalPlayers}</span>
            </div>

            <LanguageSelector />

            {/* Connection dot */}
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-bal-green' : 'bg-bal-red'} animate-pulse`} title={connected ? 'Connected' : 'Disconnected'} />
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Poker Table */}
        <PokerTable allVoted={allVoted} onReveal={revealVotes} />

        {/* Voting Cards */}
        <VotingCards />
      </div>
    </div>
  );
}
