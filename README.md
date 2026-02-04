# 🃏 Planning Poker - Uncharted Team

Real-time Planning Poker app for agile teams.

## Stack

- **Backend:** Go 1.24 + Gorilla WebSocket
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + DaisyUI

## Quick Start

### Docker (Recommended)

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t poker-planning .
docker run -p 3000:3000 poker-planning
```

Access at: `http://localhost:3000`

### Local Development

**Backend:**
```bash
cd backend
go mod download
go run .
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

```
poker-planning/
├── backend/                    # Go backend
│   ├── main.go                 # Entry point
│   ├── handlers/               # WebSocket handlers
│   │   └── websocket.go
│   ├── models/                 # Data models
│   │   └── room.go
│   └── services/               # Business logic
│       └── room_service.go
│
├── frontend/                   # React frontend
│   └── src/
│       ├── components/         # UI components
│       ├── context/            # React context
│       ├── hooks/              # Custom hooks
│       └── types/              # TypeScript types
│
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Easy deployment
└── .dockerignore
```

## Features

- ✅ Real-time voting with WebSocket
- ✅ Multiple rooms support
- ✅ Auto-reveal when all vote
- ✅ Individual votes display
- ✅ Consensus detection
- ✅ Mobile responsive
- ✅ Uncharted team branding

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `STATIC_DIR` | `./static` | Static files directory |

## Deploy

### Fly.io
```bash
fly launch
fly deploy
```

### Railway
Connect repo and deploy automatically.

### Any Docker Host
```bash
docker-compose up -d
```

## License

MIT
