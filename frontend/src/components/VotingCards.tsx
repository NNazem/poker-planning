import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';
import { VOTE_OPTIONS } from '../constants/votes';

// Suit symbols for decoration
const SUITS = ['♠', '♥', '♦', '♣'];

function getSuit(index: number) {
  return SUITS[index % SUITS.length];
}

function getSuitColor(index: number) {
  const suit = SUITS[index % SUITS.length];
  // Gold for red suits, cream for black — all retro themed
  return suit === '♥' || suit === '♦' ? 'text-bal-gold' : 'text-bal-text';
}

export function VotingCards() {
  const { t } = useTranslation();
  const { vote, myVote } = useGame();

  const handleVote = (value: string) => {
    vote(value);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-lg lg:text-xl font-mono text-bal-green/80 mb-4 lg:mb-6 text-glow-green">
        {t('game.selectCard')}
      </h2>

      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 lg:gap-3 max-w-4xl mx-auto px-2">
        {VOTE_OPTIONS.map((value, index) => {
          const selected = myVote === value;
          const suit = getSuit(index);
          const suitColor = getSuitColor(index);

          return (
            <button
              key={value}
              className={`playing-card vote-card-enter cursor-pointer relative aspect-[5/7]
                ${selected ? 'playing-card-selected' : ''}`}
              style={{ animationDelay: `${index * 0.04}s` }}
              onClick={() => handleVote(value)}
            >
              {/* Top-left corner */}
              <div className={`absolute top-1.5 left-1.5 lg:top-2 lg:left-2 flex flex-col items-center leading-none ${selected ? 'text-bal-green' : suitColor}`}>
                <span className="text-xs lg:text-sm font-bold">{value}</span>
                <span className="text-[10px] lg:text-xs">{suit}</span>
              </div>

              {/* Center value */}
              <div className={`absolute inset-0 flex items-center justify-center ${selected ? 'text-bal-green' : suitColor}`}>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{value}</span>
              </div>

              {/* Bottom-right corner (rotated) */}
              <div className={`absolute bottom-1.5 right-1.5 lg:bottom-2 lg:right-2 flex flex-col items-center leading-none rotate-180 ${selected ? 'text-bal-green' : suitColor}`}>
                <span className="text-xs lg:text-sm font-bold">{value}</span>
                <span className="text-[10px] lg:text-xs">{suit}</span>
              </div>

              {/* Checkmark for selected */}
              {selected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-bal-green rounded-full flex items-center justify-center z-10">
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
