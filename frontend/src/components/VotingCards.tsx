import { useGame } from '../context/GameContext';

const VOTES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SPECIAL_VOTES = ['?', '☕'];

export function VotingCards() {
  const { vote, myVote, setMyVote } = useGame();

  const handleVote = (value: string) => {
    vote(value);
    setMyVote(value);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6">Scegli il tuo voto:</h2>
      
      {/* Number cards */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 lg:gap-4 max-w-4xl mx-auto px-2">
        {VOTES.map((value, index) => (
          <button
            key={value}
            className={`vote-card card cursor-pointer flex items-center justify-center 
              text-2xl lg:text-3xl font-bold border-2 aspect-[5/7]
              ${myVote === value 
                ? 'selected border-success bg-success/20' 
                : 'bg-base-300/50 border-white/20 hover:border-primary'}`}
            style={{ animationDelay: `${index * 0.03}s` }}
            onClick={() => handleVote(value)}
          >
            {value}
          </button>
        ))}
      </div>
      
      {/* Special cards */}
      <div className="flex justify-center gap-3 mt-4 lg:mt-6">
        {SPECIAL_VOTES.map((value) => (
          <button
            key={value}
            className={`vote-card card cursor-pointer w-16 h-20 lg:w-20 lg:h-28 
              flex items-center justify-center text-3xl lg:text-4xl font-bold border-2
              ${myVote === value 
                ? 'selected border-success' 
                : value === '?' ? 'bg-base-300/50 border-info' : 'bg-base-300/50 border-warning'}`}
            onClick={() => handleVote(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
