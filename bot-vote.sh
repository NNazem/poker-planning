#!/bin/bash
# Usage: ./bot-vote.sh [room] [votes]
# Example: ./bot-vote.sh demo-room "Alice:4,Bob:9,Charlie:6,Diana:5"
# Default: demo-room with random votes

ROOM="${1:-demo-room}"
VOTES="${2:-Alice:$(shuf -i1-10 -n1),Bob:$(shuf -i1-10 -n1),Charlie:$(shuf -i1-10 -n1),Diana:$(shuf -i1-10 -n1)}"

cd ~/.openclaw/workspace/poker-planning

node -e "
const io = require('socket.io-client');
const votes = '$VOTES'.split(',').map(v => v.split(':'));
votes.forEach(([name,vote]) => {
  const s = io('http://127.0.0.1:3001');
  s.on('connect', () => {
    s.emit('join-room', { roomId: '$ROOM', playerName: name });
    setTimeout(() => { s.emit('vote', { roomId: '$ROOM', vote }); console.log(name+' voted '+vote); }, 500);
  });
});
setTimeout(() => process.exit(0), 2000);
"
