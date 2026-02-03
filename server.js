const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

let rooms = {}; // { roomId: { players: [], votes: {}, revealed: false } }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], votes: {}, revealed: false };
    }

    const player = { id: socket.id, name: playerName };
    rooms[roomId].players.push(player);
    
    io.to(roomId).emit('room-update', rooms[roomId]);
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('vote', ({ roomId, vote }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes[socket.id] = vote;
      
      // Check if all players voted
      const allVoted = rooms[roomId].players.every(p => rooms[roomId].votes[p.id] !== undefined);
      
      if (allVoted) {
        rooms[roomId].revealed = true;
      }
      
      io.to(roomId).emit('room-update', rooms[roomId]);
    }
  });

  socket.on('new-round', ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes = {};
      rooms[roomId].revealed = false;
      io.to(roomId).emit('room-update', rooms[roomId]);
    }
  });

  socket.on('disconnect', () => {
    // Remove player from all rooms
    for (let roomId in rooms) {
      const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = rooms[roomId].players[playerIndex].name;
        rooms[roomId].players.splice(playerIndex, 1);
        delete rooms[roomId].votes[socket.id];
        
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('room-update', rooms[roomId]);
        }
        console.log(`${playerName} left room ${roomId}`);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Planning Poker running on port ${PORT}`);
});
