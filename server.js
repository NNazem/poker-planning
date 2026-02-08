const express = require('express');
const helmet = require('helmet');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'", "wss://poker.nazem.xyz", "ws://localhost:*"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));
app.use(express.static('public'));

let rooms = {}; // { roomId: { players: [], votes: {}, revealed: false } }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    // First, remove this socket from any room it was previously in
    for (let rid in rooms) {
      const idx = rooms[rid].players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        rooms[rid].players.splice(idx, 1);
        delete rooms[rid].votes[socket.id];
        if (rooms[rid].players.length === 0) {
          delete rooms[rid];
        } else {
          io.to(rid).emit('room-update', rooms[rid]);
        }
        socket.leave(rid);
      }
    }

    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], votes: {}, revealed: false };
    }

    // Reject if name already taken by another socket
    const existing = rooms[roomId].players.find(p => p.name === playerName);
    if (existing && existing.id !== socket.id) {
      socket.emit('join-error', { message: `Il nome "${playerName}" è già in uso in questa stanza.` });
      socket.leave(roomId);
      return;
    }

    if (!existing) {
      rooms[roomId].players.push({ id: socket.id, name: playerName });
    }
    
    io.to(roomId).emit('room-update', rooms[roomId]);
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('vote', ({ roomId, vote }) => {
    if (rooms[roomId]) {
      rooms[roomId].votes[socket.id] = vote;
      io.to(roomId).emit('room-update', rooms[roomId]);
    }
  });

  socket.on('reveal-votes', ({ roomId }) => {
    if (rooms[roomId] && !rooms[roomId].revealed) {
      rooms[roomId].revealed = true;
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

  socket.on('get-room-state', ({ roomId }) => {
    if (rooms[roomId]) {
      socket.emit('room-update', rooms[roomId]);
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
