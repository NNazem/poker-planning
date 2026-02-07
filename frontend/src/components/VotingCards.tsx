import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';

const ALL_VOTES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?', '☕'];

export function VotingCards() {
  const { t } = useTranslation();
  const { vote, myVote, setMyVote } = useGame();

  const handleVote = (value: string) => {
    vote(value);
    setMyVote(value);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-lg lg:text-xl font-mono text-crt-green/80 mb-4 lg:mb-6 text-glow-green">
        {t('game.selectCard')}
      </h2>

      {/* All cards in one grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-12 gap-2 lg:gap-3 max-w-4xl mx-auto px-2">
        {ALL_VOTES.map((value, index) => (
          <button
            key={value}
            className={`retro-card vote-card-enter cursor-pointer flex flex-col items-center justify-center
              text-2xl sm:text-3xl lg:text-3xl font-bold aspect-[5/7] relative
              ${myVote === value ? 'selected' : ''}`}
            style={{ animationDelay: `${index * 0.03}s` }}
            onClick={() => handleVote(value)}
          >
            <span className={myVote === value ? 'text-crt-green' : 'text-white/90'}>
              {value}
            </span>
            {/* Checkmark for selected */}
            {myVote === value && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-crt-green rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
