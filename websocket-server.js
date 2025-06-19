/**
 * Simple WebSocket server for Yjs collaboration
 * Run this with: node websocket-server.js
 *
 * This server enables real-time collaboration between multiple clients
 * using Yjs and y-websocket.
 */

import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import * as Y from 'yjs';

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Store documents in memory (for production, use persistent storage)
const docs = new Map();

console.log('🚀 Starting WebSocket server for Yjs collaboration...');

wss.on('connection', (ws, req) => {
  console.log('📡 New WebSocket connection established');

  // Extract room name from URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomName = url.searchParams.get('room') || 'default-room';

  console.log(`🏠 Client joined room: ${roomName}`);

  // Get or create document for this room
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
    console.log(`📄 Created new document for room: ${roomName}`);
  }

  const doc = docs.get(roomName);

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      // Forward message to all other clients in the same room
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
  console.log('🔗 Clients can now connect for real-time collaboration');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
