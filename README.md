# 🃏 Planning Poker

A modern, real-time Planning Poker web application for agile grooming sessions. Built with WebSocket technology for instant synchronization across all devices.

## ✨ Features

- **Real-time voting** - Instant synchronization using Socket.io
- **Dark mode by default** - Beautiful dark theme optimized for long sessions
- **Fully responsive** - Optimized for all devices:
  - 💻 MacBook Pro 14" & 16"
  - 📱 iPhone Pro & Pro Max
  - 📱 iPad Air
- **Modern UI** - Built with Tailwind CSS + DaisyUI
- **Special cards** - Support for "?" (unknown) and "☕" (break) votes
- **Anonymous rooms** - Auto-generated room IDs or custom room names
- **Smooth animations** - Polished interactions and transitions
- **Haptic feedback** - Vibration feedback on mobile devices
- **Copy room ID** - Click room ID to copy to clipboard

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Running the app

```bash
node server.js
```

The app will be available at `http://localhost:3000`

## 🎮 How to Use

1. **Enter your name** and optionally a room ID
2. **Share the room ID** with your team
3. **Vote** by clicking on a card (1-10, ?, or ☕)
4. **Wait** for everyone to vote
5. **Results reveal** automatically when all votes are in
6. **Start a new round** with one click

## 🛠 Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JavaScript + Tailwind CSS + DaisyUI
- **Real-time**: WebSocket communication

## 📱 Responsive Breakpoints

- **Mobile (iPhone)**: 320px - 430px
- **Tablet (iPad)**: 768px - 1024px
- **Laptop (MacBook 14")**: 1440px+
- **Desktop (MacBook 16")**: 1700px+

## 🎨 Design Features

- Gradient backgrounds
- Poker table with realistic styling
- Avatar system with unique gradients per player
- Card flip animations
- Smooth hover effects
- Visual feedback for all interactions

## 🔒 Privacy

- No data persistence - rooms exist only in memory
- No user tracking or analytics
- Auto-generated anonymous room IDs

## 📝 License

Private project - All rights reserved

## 👤 Author

Developed for agile team grooming sessions
