# 1-on-1 Chat Matcher �

A modern WebSocket-based random chat application that matches users for private 1-on-1 conversations based on gender preferences.

## ✨ Features

- **Gender-based matching** - Choose male/female and get matched with opposite gender
- **Random pairing** - Randomly matches available users for fairness
- **Private 1-on-1 chats** - Each conversation is completely private between two users
- **Real-time statistics** - See how many users are waiting vs. chatting by gender
- **Instant matching** - Get matched immediately if someone is waiting
- **Disconnect & rematch** - Easy controls to end current chat and find new match
- **Typing indicators** - See when your chat partner is typing
- **Sound notifications** - Audio alerts for new matches and messages (toggleable)
- **Auto-reconnection** - Automatically reconnects on connection loss
- **Responsive design** - Works perfectly on desktop and mobile
- **Message timestamps** - See when messages were sent

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open the matcher:**
   Open `client.html` in multiple browser tabs/windows to test matching

## 🎯 How It Works

### Matching Algorithm
1. **Profile Setup** - Users enter username and select gender (male/female)
2. **Waiting Queue** - Users looking for matches are added to gender-based queues
3. **Random Matching** - When opposite gender users are available, they're randomly paired
4. **Private Chat** - Matched users get a private chat room for 1-on-1 conversation
5. **Disconnect/Rematch** - Users can disconnect and find new matches anytime

### User Flow
1. Set your username and gender
2. Click "Find Match" to start looking
3. Wait for a match (or get matched instantly)
4. Chat privately with your matched partner
5. Use "Disconnect" or "New Match" to end and find someone new

## 📊 Statistics Panel

The app shows real-time statistics:
- **Males Online**: Waiting count, Chatting count  
- **Females Online**: Waiting count, Chatting count

This helps users understand activity levels and expected wait times.

## 🛠️ Development

For development with auto-restart:
```bash
npm run dev
```

## 📁 Project Structure

```
websocket-chat/
├── server.js      # WebSocket matching server
├── client.html    # Chat matcher interface  
├── package.json   # Dependencies and scripts
└── README.md      # This file
```

## 🔧 Configuration

The server runs on **port 8080** by default. To change this, modify the port in `server.js`:

```javascript
const wss = new WebSocket.Server({ port: 8080 });
```

## 📡 WebSocket Events

### Client → Server
- `setProfile` - Set username and gender
- `findMatch` - Request to be matched with someone
- `message` - Send message to current chat partner
- `typing` - Send typing indicator to partner
- `disconnect` - Disconnect from current match

### Server → Client
- `welcome` - Initial connection with user ID and stats
- `statsUpdate` - Updated online user statistics
- `waiting` - User added to waiting queue
- `matched` - Successfully matched with partner
- `message` - Message from chat partner
- `typing` - Partner typing indicator
- `partnerDisconnected` - Chat partner left

## 🎨 Interface States

1. **Profile Setup** - Username and gender selection
2. **Online** - Ready to find matches, viewing stats
3. **Waiting** - Looking for a match (spinning loader)
4. **Matched** - Chatting with matched partner

## 🔒 Privacy & Safety

- **Private rooms** - Each 1-on-1 chat is completely private
- **No message history** - Messages aren't stored permanently
- **Anonymous matching** - Only usernames are shared, no personal info
- **Easy disconnect** - Users can leave conversations anytime

## 💡 Perfect For

- **Random chat experiences** - Meet new people randomly
- **Language practice** - Practice conversations with native speakers  
- **Anonymous conversations** - Chat without revealing personal details
- **Social platforms** - Integrate into larger social applications

## 🔒 Security Note

This is a demonstration application. For production use, consider adding:
- Input validation and content filtering
- Rate limiting and abuse prevention  
- User reporting and moderation system
- HTTPS/WSS encryption
- User authentication (optional)
- Message logging for moderation

## 📝 License

MIT License - Feel free to use this code for learning and projects!