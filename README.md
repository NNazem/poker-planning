# 🃏 Planning Poker

Real-time Planning Poker for agile teams.

## Quick Start

```bash
docker run -p 3000:3000 $(docker build -q https://github.com/NNazem/poker-planning.git)
```

Open http://localhost:3000

---

## Or clone & run

```bash
git clone https://github.com/NNazem/poker-planning.git
cd poker-planning
docker compose up
```

## Features

- Real-time WebSocket voting
- Multiple rooms
- Auto-reveal when everyone votes
- Consensus detection
- 5 languages (IT, ES, PT, EU, BR)
- Mobile responsive
- ~15MB Docker image

## License

MIT
