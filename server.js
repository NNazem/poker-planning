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
const MAX_PLAYERS_PER_ROOM = 20;
const MAX_CONNECTIONS_PER_IP = 5;
const RATE_LIMIT_WINDOW_MS = 1000;
const RATE_LIMIT_MAX_EVENTS = 10;

function isStr(v) { return typeof v === 'string'; }

function validRoom(id) { return isStr(id) && ROOM_RE.test(id); }
function validName(n) { return isStr(n) && n.trim().length > 0 && NAME_RE.test(n); }
function validVote(v) { return isStr(v) && VALID_VOTES.has(v); }

// ── Per-IP connection tracking ──
const connectionsPerIp = {}; // { ip: count }

function getIp(socket) {
  return socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address;
}

// ── Per-socket rate limiter ──
function rateLimited(socket) {
  const now = Date.now();
  if (!socket._rl || now - socket._rl.windowStart > RATE_LIMIT_WINDOW_MS) {
    socket._rl = { windowStart: now, count: 1 };
    return false;
  }
  socket._rl.count++;
  if (socket._rl.count > RATE_LIMIT_MAX_EVENTS) {
    return true;
  }
  return false;
}

// ── Connection limit middleware ──
io.use((socket, next) => {
  const ip = getIp(socket);
  const current = connectionsPerIp[ip] || 0;
  if (current >= MAX_CONNECTIONS_PER_IP) {
    return next(new Error('Troppe connessioni da questo IP.'));
  }
  connectionsPerIp[ip] = current + 1;
  socket._ip = ip;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'IP:', socket._ip);
  socket._currentRoom = null; // track current room for O(1) cleanup

  socket.on('join-room', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId, playerName } = payload;
    if (!validRoom(roomId)) return socket.emit('join-error', { message: 'Room ID non valido (alfanumerico, max 50 caratteri).' });
    if (!validName(playerName)) return socket.emit('join-error', { message: 'Nome non valido (1-30 caratteri, no caratteri di controllo).' });
    if (!rooms[roomId] && Object.keys(rooms).length >= MAX_ROOMS) return socket.emit('join-error', { message: 'Limite massimo di stanze raggiunto.' });
    // Remove from previous room (O(1) lookup)
    const prevRoom = socket._currentRoom;
    if (prevRoom && rooms[prevRoom]) {
      const idx = rooms[prevRoom].players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        rooms[prevRoom].players.splice(idx, 1);
        delete rooms[prevRoom].votes[socket.id];
        if (rooms[prevRoom].players.length === 0) {
          delete rooms[prevRoom];
        } else {
          io.to(prevRoom).emit('room-update', rooms[prevRoom]);
        }
      }
      socket.leave(prevRoom);
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
      if (rooms[roomId].players.length >= MAX_PLAYERS_PER_ROOM) {
        socket.emit('join-error', { message: `Stanza piena (max ${MAX_PLAYERS_PER_ROOM} giocatori).` });
        socket.leave(roomId);
        return;
      }
      rooms[roomId].players.push({ id: socket.id, name: playerName });
    }
    
    socket._currentRoom = roomId;
    io.to(roomId).emit('room-update', rooms[roomId]);
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('shoot', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId, targetId } = payload;
    if (!validRoom(roomId) || !isStr(targetId) || !rooms[roomId]) return;
    const shooter = rooms[roomId].players.find(p => p.id === socket.id);
    if (!shooter) return;
    io.to(roomId).emit('shoot', { from: socket.id, fromName: shooter.name, target: targetId });
  });

  socket.on('vote', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId, vote } = payload;
    if (!validRoom(roomId) || !validVote(vote) || !rooms[roomId]) return;
    rooms[roomId].votes[socket.id] = vote;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('reveal-votes', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId] || rooms[roomId].revealed) return;
    rooms[roomId].revealed = true;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('new-round', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId]) return;
    rooms[roomId].votes = {};
    rooms[roomId].revealed = false;
    io.to(roomId).emit('room-update', rooms[roomId]);
  });

  socket.on('get-room-state', (payload) => {
    if (rateLimited(socket)) return;
    if (!payload || typeof payload !== 'object') return;
    const { roomId } = payload;
    if (!validRoom(roomId) || !rooms[roomId]) return;
    socket.emit('room-update', rooms[roomId]);
  });

  socket.on('disconnect', () => {
    // Decrement IP connection count
    const ip = socket._ip;
    if (ip && connectionsPerIp[ip]) {
      connectionsPerIp[ip]--;
      if (connectionsPerIp[ip] <= 0) delete connectionsPerIp[ip];
    }
    // Remove player from their room (O(1) lookup)
    const rid = socket._currentRoom;
    if (rid && rooms[rid]) {
      const playerIndex = rooms[rid].players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const playerName = rooms[rid].players[playerIndex].name;
        rooms[rid].players.splice(playerIndex, 1);
        delete rooms[rid].votes[socket.id];
        if (rooms[rid].players.length === 0) {
          delete rooms[rid];
        } else {
          io.to(rid).emit('room-update', rooms[rid]);
        }
        console.log(`${playerName} left room ${rid}`);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Planning Poker running on port ${PORT}`);
});
