const socket = io();

let currentRoom = null;
let currentPlayer = null;
let myVote = null;

// Avatar gradient classes for variety
const avatarGradients = [
  'avatar-gradient-1', 'avatar-gradient-2', 'avatar-gradient-3',
  'avatar-gradient-4', 'avatar-gradient-5', 'avatar-gradient-6'
];

// Login functionality
const playerNameInput = document.getElementById('player-name');
const roomIdInput = document.getElementById('room-id');
const joinBtn = document.getElementById('join-btn');

// Enter key support
[playerNameInput, roomIdInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
  });
});

joinBtn.addEventListener('click', joinRoom);

function joinRoom() {
  const playerName = playerNameInput.value.trim();
  let roomId = roomIdInput.value.trim();
  
  if (!playerName) {
    alert('Inserisci il tuo nome!');
    playerNameInput.focus();
    return;
  }
  
  if (!roomId) {
    roomId = 'room-' + Math.random().toString(36).substr(2, 9);
  }
  
  currentPlayer = playerName;
  currentRoom = roomId;
  
  socket.emit('join-room', { roomId, playerName });
  
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('current-room').textContent = roomId;
  
  // Generate voting cards after entering game
  generateVotingCards();
}

// Generate voting cards (1-10)
function generateVotingCards() {
  const cardsContainer = document.getElementById('cards');
  cardsContainer.innerHTML = ''; // Clear existing
  
  for (let i = 1; i <= 10; i++) {
    const card = document.createElement('div');
    card.className = 'vote-card card bg-gradient-card cursor-pointer flex items-center justify-center text-2xl lg:text-3xl font-bold border-2 border-primary hover:border-4';
    card.textContent = i;
    card.style.animationDelay = `${i * 0.03}s`;
    card.addEventListener('click', () => selectVote(i, card));
    cardsContainer.appendChild(card);
  }
  
  // Add special cards functionality
  document.querySelectorAll('.special-card').forEach(card => {
    const vote = card.dataset.vote;
    card.addEventListener('click', () => selectVote(vote, card));
  });
}

// Vote selection
function selectVote(vote, cardElement) {
  // Remove previous selection
  document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  
  myVote = vote;
  socket.emit('vote', { roomId: currentRoom, vote });
  
  // Haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

// New round
document.getElementById('new-round-btn').addEventListener('click', () => {
  socket.emit('new-round', { roomId: currentRoom });
  myVote = null;
  document.querySelectorAll('.vote-card').forEach(c => c.classList.remove('selected'));
  
  // Haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 100, 50]);
  }
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

// Render players around the table
function renderPlayers(room) {
  const container = document.getElementById('players-container');
  container.innerHTML = '';
  
  const playerCount = room.players.length;
  
  // Responsive radius calculation
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const radiusX = (containerWidth * 0.42); // 42% of width
  const radiusY = (containerHeight * 0.38); // 38% of height
  
  room.players.forEach((player, index) => {
    // Calculate position around ellipse
    const angle = (index / playerCount) * 2 * Math.PI - Math.PI / 2;
    const x = containerWidth / 2 + radiusX * Math.cos(angle);
    const y = containerHeight / 2 + radiusY * Math.sin(angle);
    
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';
    playerDiv.style.left = x + 'px';
    playerDiv.style.top = y + 'px';
    playerDiv.style.transform = 'translate(-50%, -50%)';
    
    // Avatar with gradient
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar ' + avatarGradients[index % avatarGradients.length];
    avatar.textContent = player.name.charAt(0).toUpperCase();
    
    // Player name
    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;
    
    // Highlight current player
    if (player.name === currentPlayer) {
      name.classList.add('badge', 'badge-success', 'badge-outline');
    }
    
    playerDiv.appendChild(avatar);
    playerDiv.appendChild(name);
    
    // Show vote if player has voted
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

// Show voting results
function showResults(room) {
  const votes = Object.values(room.votes).filter(v => !isNaN(parseFloat(v)));
  
  let average;
  if (votes.length > 0) {
    average = (votes.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / votes.length).toFixed(1);
  } else {
    average = 'N/A';
  }
  
  document.getElementById('average-result').textContent = average;
  document.getElementById('result-display').classList.remove('hidden');
  document.getElementById('waiting-message').classList.add('hidden');
  
  // Celebration haptic
  if ('vibrate' in navigator) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

// Hide results
function hideResults() {
  document.getElementById('result-display').classList.add('hidden');
  document.getElementById('waiting-message').classList.remove('hidden');
}

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
  // Could show a reconnection UI here
});

socket.on('connect', () => {
  console.log('Connected to server');
  // If we were in a room, rejoin
  if (currentRoom && currentPlayer) {
    socket.emit('join-room', { roomId: currentRoom, playerName: currentPlayer });
  }
});

// Responsive table resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-render players on resize to adjust positions
    if (currentRoom) {
      // Request current room state
      socket.emit('get-room-state', { roomId: currentRoom });
    }
  }, 300);
});

// Copy room ID to clipboard on click
document.getElementById('current-room').addEventListener('click', function() {
  const roomId = this.textContent;
  navigator.clipboard.writeText(roomId).then(() => {
    // Visual feedback
    const originalText = this.textContent;
    this.textContent = '✓ Copiato!';
    setTimeout(() => {
      this.textContent = originalText;
    }, 1500);
  });
});
