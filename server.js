const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8081 });

// Store clients: { id: string, ws: WebSocket, username: string, gender: string, joinedAt: Date, status: string, roomId: string, partnerId: string }
const clients = new Map();
const waitingQueue = new Map(); // gender -> [clientIds]
const chatRooms = new Map(); // roomId -> { user1Id, user2Id, messages: [] }

function broadcast(data, exceptId = null) {
  const msg = JSON.stringify(data);
  for (const [id, client] of clients.entries()) {
    if (id !== exceptId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

function sendToUser(userId, data) {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(data));
  }
}

function sendToRoom(roomId, data, exceptId = null) {
  const room = chatRooms.get(roomId);
  if (!room) return;
  
  [room.user1Id, room.user2Id].forEach(userId => {
    if (userId !== exceptId) {
      sendToUser(userId, data);
    }
  });
}

function findMatch(clientId) {
  const client = clients.get(clientId);
  if (!client) return null;
  
  const oppositeGender = client.gender === 'male' ? 'female' : 'male';
  const waitingUsers = waitingQueue.get(oppositeGender) || [];
  
  if (waitingUsers.length > 0) {
    // Random match from waiting users
    const randomIndex = Math.floor(Math.random() * waitingUsers.length);
    const partnerId = waitingUsers.splice(randomIndex, 1)[0];
    
    // Remove current user from their waiting queue
    const currentGenderQueue = waitingQueue.get(client.gender) || [];
    const currentIndex = currentGenderQueue.indexOf(clientId);
    if (currentIndex > -1) {
      currentGenderQueue.splice(currentIndex, 1);
    }
    
    return partnerId;
  }
  
  return null;
}

function createChatRoom(user1Id, user2Id) {
  const roomId = uuidv4();
  const room = {
    user1Id,
    user2Id,
    messages: [],
    createdAt: new Date()
  };
  
  chatRooms.set(roomId, room);
  
  // Update client statuses
  const user1 = clients.get(user1Id);
  const user2 = clients.get(user2Id);
  
  if (user1) {
    user1.status = 'matched';
    user1.roomId = roomId;
    user1.partnerId = user2Id;
  }
  
  if (user2) {
    user2.status = 'matched';
    user2.roomId = roomId;
    user2.partnerId = user1Id;
  }
  
  return roomId;
}

function addToWaitingQueue(clientId) {
  const client = clients.get(clientId);
  if (!client) return;
  
  if (!waitingQueue.has(client.gender)) {
    waitingQueue.set(client.gender, []);
  }
  
  const queue = waitingQueue.get(client.gender);
  if (!queue.includes(clientId)) {
    queue.push(clientId);
  }
  
  client.status = 'waiting';
}

function removeFromWaitingQueue(clientId) {
  const client = clients.get(clientId);
  if (!client) return;
  
  const queue = waitingQueue.get(client.gender) || [];
  const index = queue.indexOf(clientId);
  if (index > -1) {
    queue.splice(index, 1);
  }
}

function disconnectFromRoom(clientId) {
  const client = clients.get(clientId);
  if (!client || !client.roomId) return;
  
  const room = chatRooms.get(client.roomId);
  if (room) {
    const partnerId = client.partnerId;
    const partner = clients.get(partnerId);
    
    // Notify partner about disconnect
    if (partner) {
      sendToUser(partnerId, {
        type: 'partnerDisconnected',
        message: 'Your chat partner has disconnected'
      });
      
      // Reset partner status
      partner.status = 'online';
      partner.roomId = null;
      partner.partnerId = null;
    }
    
    // Remove room
    chatRooms.delete(client.roomId);
  }
  
  // Reset client status
  client.status = 'online';
  client.roomId = null;
  client.partnerId = null;
}

function getOnlineUsers() {
  const users = {
    waiting: { male: 0, female: 0 },
    matched: { male: 0, female: 0 },
    total: { male: 0, female: 0 }
  };
  
  for (const [id, client] of clients.entries()) {
    if (client.gender) {
      users.total[client.gender]++;
      if (client.status === 'waiting') {
        users.waiting[client.gender]++;
      } else if (client.status === 'matched') {
        users.matched[client.gender]++;
      }
    }
  }
  
  return users;
}

wss.on('connection', (ws) => {
  const id = uuidv4();
  const joinedAt = new Date();
  clients.set(id, { 
    ws, 
    joinedAt,
    status: 'online',
    roomId: null,
    partnerId: null
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'welcome', 
    id,
    stats: getOnlineUsers()
  }));

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return;
    }
    
    const client = clients.get(id);
    if (!client) return;

    switch(data.type) {
      case 'setProfile':
        client.username = data.username || `User-${id.slice(0, 8)}`;
        client.gender = data.gender;
        client.status = 'online';
        
        // Send updated stats to all users
        broadcast({ type: 'statsUpdate', stats: getOnlineUsers() });
        break;
        
      case 'findMatch':
        if (client.status !== 'online') return;
        
        addToWaitingQueue(id);
        const partnerId = findMatch(id);
        
        if (partnerId) {
          // Create chat room
          const roomId = createChatRoom(id, partnerId);
          const partner = clients.get(partnerId);
          
          // Notify both users about match
          sendToUser(id, {
            type: 'matched',
            partner: {
              username: partner.username,
              gender: partner.gender
            },
            roomId
          });
          
          sendToUser(partnerId, {
            type: 'matched',
            partner: {
              username: client.username,
              gender: client.gender
            },
            roomId
          });
        } else {
          // No match found, user added to waiting queue
          sendToUser(id, {
            type: 'waiting',
            message: 'Looking for a match...'
          });
        }
        
        broadcast({ type: 'statsUpdate', stats: getOnlineUsers() });
        break;
        
      case 'message':
        if (client.status !== 'matched' || !client.roomId) return;
        
        const messageObj = {
          type: 'message',
          text: data.text,
          timestamp: new Date().toISOString(),
          fromMe: false
        };
        
        // Send to partner
        sendToRoom(client.roomId, {
          ...messageObj,
          fromMe: false
        }, id);
        
        // Send back to sender with fromMe: true
        sendToUser(id, {
          ...messageObj,
          fromMe: true
        });
        
        // Add to room history
        const room = chatRooms.get(client.roomId);
        if (room) {
          room.messages.push({
            text: data.text,
            senderId: id,
            timestamp: new Date().toISOString()
          });
        }
        break;
        
      case 'typing':
        if (client.status !== 'matched' || !client.roomId) return;
        
        sendToRoom(client.roomId, {
          type: 'typing',
          typing: !!data.typing
        }, id);
        break;
        
      case 'voiceSignal':
        if (client.status !== 'matched' || !client.roomId) return;
        
        // Forward voice signaling data to partner
        sendToRoom(client.roomId, {
          type: 'voiceSignal',
          signalType: data.signalType,
          offer: data.offer,
          answer: data.answer,
          candidate: data.candidate
        }, id);
        break;
        
      case 'disconnect':
        removeFromWaitingQueue(id);
        disconnectFromRoom(id);
        broadcast({ type: 'statsUpdate', stats: getOnlineUsers() });
        break;
    }
  });

  ws.on('close', () => {
    removeFromWaitingQueue(id);
    disconnectFromRoom(id);
    clients.delete(id);
    broadcast({ type: 'statsUpdate', stats: getOnlineUsers() });
  });
});

console.log('🚀 WebSocket 1-on-1 matching chat server running on ws://localhost:8081');
console.log('� Features: gender-based matching, private 1-on-1 chats, random pairing');
console.log('⏰ Server started at:', new Date().toLocaleString());
