# WebSocket Chat Backend

A real-time chat application backend with voice calling functionality built with Node.js and WebSockets.

## Features

- **Real-time Messaging**: Instant text chat between users
- **Voice Calls**: WebRTC-powered voice communication with call ringing
- **Gender-based Matching**: Automatic pairing system based on user preferences
- **Live Statistics**: Real-time user count and status tracking
- **Auto-reconnection**: Robust connection handling with automatic reconnects

## Tech Stack

- **Node.js** - Runtime environment
- **ws** - WebSocket library for real-time communication
- **uuid** - Unique identifier generation for chat rooms
- **WebRTC Signaling** - Voice call coordination

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs on port 8081 by default.

## API Overview

The WebSocket server handles these message types:
- `setProfile` - User registration with username/gender
- `findMatch` - Request to find a chat partner
- `message` - Send text messages
- `typing` - Typing indicators
- `voiceSignal` - WebRTC signaling for voice calls
- `disconnect` - End current chat session

## Deployment

Deployed on **Render** at: `https://chat-backend-4tpa.onrender.com`

Environment variables:
- `PORT` - Server port (default: 8081)

## Project Structure

```
backend/
├── server.js          # Main WebSocket server
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

Built for pairing with a static frontend deployed on Cloudflare Pages.
