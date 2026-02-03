const socket = io();

let currentRoom = null;
let currentPlayer = null;
let myVote = null;

// Login
document.getElementById('join-btn').addEventListener('click', () => {
  const playerName = document.getElementById('player-name').value.trim();
  let roomId = document.getElementById('room-id').value.trim();
  
  if (!playerName) {
    alert('Inserisci il tuo nome!');
    return;
  }
  
  if (!roomId) {
    roomId = 'room-' + Math.random().toString(36).substr(2, 9);
  }
  
  currentPlayer = playerName;
  currentRoom = roomId;
  
  socket.emit('join-room', { roomId, playerName });
  
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  document.getElementById('current-room').textContent = roomId;
});

// Create voting cards
const cardsContainer = document.getElementById('cards');
for (let i = 1; i <= 10; i++) {
  const card = document.createElement('div');
  card.className = 'vote-card';
  card.textContent = i;
  card.addEventListener('click', () => selectVote(i, card));
  cardsContainer.appendChild(card);
}

function selectVote(vote, cardElement) {
  // Remove previous selection
  document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  
  myVote = vote;
  socket.emit('vote', { roomId: currentRoom, vote });
}

// New round
document.getElementById('new-round-btn').addEventListener('click', () => {
  socket.emit('new-round', { roomId: currentRoom });
  myVote = null;
  document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
});

// Update room state
socket.on('room-update', (room) => {
  renderPlayers(room);
  
  if (room.revealed) {
    showResults(room);
  } else {
    hideResults();
  }
});

function renderPlayers(room) {
  const container = document.getElementById('players-container');
  container.innerHTML = '';
  
  const playerCount = room.players.length;
  const radius = 300;
  
  room.players.forEach((player, index) => {
    const angle = (index / playerCount) * 2 * Math.PI - Math.PI / 2;
    const x = 400 + radius * Math.cos(angle);
    const y = 250 + radius * Math.sin(angle);
    
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';
    playerDiv.style.left = x + 'px';
    playerDiv.style.top = y + 'px';
    playerDiv.style.transform = 'translate(-50%, -50%)';
    
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    avatar.textContent = player.name.charAt(0).toUpperCase();
    
    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;
    
    playerDiv.appendChild(avatar);
    playerDiv.appendChild(name);
    
    // Show vote
    const hasVoted = room.votes[player.id] !== undefined;
    if (hasVoted) {
      const voteDiv = document.createElement('div');
      voteDiv.className = 'player-vote' + (room.revealed ? '' : ' hidden');
      voteDiv.textContent = room.revealed ? room.votes[player.id] : '🃏';
      playerDiv.appendChild(voteDiv);
    }
    
    container.appendChild(playerDiv);
  });
}

function showResults(room) {
  const votes = Object.values(room.votes);
  const average = (votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(1);
  
  document.getElementById('average-result').textContent = average;
  document.getElementById('result-display').style.display = 'block';
  document.getElementById('waiting-message').style.display = 'none';
}

function hideResults() {
  document.getElementById('result-display').style.display = 'none';
  document.getElementById('waiting-message').style.display = 'block';
}
