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

// ── Validation helpers ──
const VALID_VOTES = new Set(['1','2','3','4','5','6','7','8','9','10']);
const ROOM_RE = /^[a-zA-Z0-9_-]{1,50}$/;
const NAME_RE = /^[^\x00-\x1f]{1,30}$/; // no control chars, 1-30 length
const MAX_ROOMS = 100;

function isStr(v) { return typeof v === 'string'; }

function validRoom(id) { return isStr(id) && ROOM_RE.test(id); }
function validName(n) { return isStr(n) && n.trim().length > 0 && NAME_RE.test(n); }
function validVote(v) { return isStr(v) && VALID_VOTES.has(v); }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomId, playerName } = payload;
    if (!validRoom(roomId)) return socket.emit('join-error', { message: 'Room ID non valido (alfanumerico, max 50 caratteri).' });
    if (!validName(playerName)) return socket.emit('join-error', { message: 'Nome non valido (1-30 caratteri, no caratteri di controllo).' });
    if (!rooms[roomId] && Object.keys(rooms).length >= MAX_ROOMS) return socket.emit('join-error', { message: 'Limite massimo di stanze raggiunto.' });
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

  socket.on('vote', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomId, vote } = payload;
    if (!validRoom(roomId) || !validVote(vote) || !rooms[roomId]) return;
    rooms[roomId].votes[socket.id] = vote;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('reveal-votes', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId] || rooms[roomId].revealed) return;
    rooms[roomId].revealed = true;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('new-round', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId]) return;
    rooms[roomId].votes = {};
    rooms[roomId].revealed = false;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('get-room-state', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId]) return;
    socket.emit('room-update', rooms[roomId]);
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
