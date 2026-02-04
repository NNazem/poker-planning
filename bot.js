const io = require('socket.io-client');

const ROOM_ID = 'uncharted-team';
const socket = io('http://localhost:3000');
const VOTES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

let hasVoted = false;

socket.on('connect', () => {
  console.log('✅ Bot connected:', socket.id);
  
  // Join the room
  socket.emit('join-room', {
    roomId: ROOM_ID,
    playerName: 'Jarvis 🤖'
  });
  
  console.log('');
  console.log('🎯 ROOM ID: ' + ROOM_ID);
  console.log('🔗 URL: http://lima-default.tail1af591.ts.net:3000');
  console.log('');
});

socket.on('room-update', (data) => {
  const playerNames = data.players.map(p => p.name).join(', ');
  const voteCount = Object.keys(data.votes).length;
  
  console.log('📊 Players:', playerNames, '| Votes:', voteCount + '/' + data.players.length);
  
  // If someone else voted and I haven't, vote after a short delay
  if (voteCount > 0 && !hasVoted && !data.revealed) {
    setTimeout(() => {
      const randomVote = VOTES[Math.floor(Math.random() * VOTES.length)];
      socket.emit('vote', { roomId: ROOM_ID, vote: randomVote });
      console.log('🎲 Voted:', randomVote);
      hasVoted = true;
    }, 1500); // Wait 1.5 seconds before voting
  }
  
  // Reset vote flag on new round
  if (voteCount === 0) {
    hasVoted = false;
  }
  
  if (data.revealed) {
    console.log('🎉 Votes revealed!');
  }
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

// Keep alive
setInterval(() => {}, 1000);
console.log('🔌 Connecting to Planning Poker...');
