# 🃏 Planning Poker

Real-time Planning Poker for agile teams. Vote on story points together.

## Run in 10 seconds

```bash
docker run -p 3000:3000 ghcr.io/nnazem/poker-planning:latest
```

Open http://localhost:3000

That's it.

---

## Build locally

```bash
git clone https://github.com/NNazem/poker-planning.git
cd poker-planning
docker build -t poker-planning .
docker run -p 3000:3000 poker-planning
```

## Features

- Real-time WebSocket voting
- Multiple rooms
- Auto-reveal when everyone votes
- Consensus detection with confetti
- 5 languages (IT, ES, PT, EU, BR)
- Mobile friendly
- ~15MB Docker image

## Tech

Go backend + React/TypeScript frontend. Single binary, single container.

## License

MIT
