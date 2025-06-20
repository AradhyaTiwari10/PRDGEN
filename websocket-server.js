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

// Store documents and room connections in memory
const docs = new Map();
const rooms = new Map(); // Map of roomName -> Set of WebSocket connections

console.log('🚀 Starting WebSocket server for Yjs collaboration...');

wss.on('connection', (ws, req) => {
  // Extract room name from URL path (y-websocket sends room name as path)
  const urlPath = req.url || '/';
  const roomName = urlPath.substring(1) || 'default-room'; // Remove leading slash

  // Client joined room: ${roomName}

  // Store room name on the WebSocket connection
  ws.roomName = roomName;

  // Get or create document for this room
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
    // Created new document for room: ${roomName}
  }

  // Add connection to room
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(ws);

  const doc = docs.get(roomName);

  // Handle incoming messages - only forward to clients in the same room
  ws.on('message', (message) => {
    try {
      const roomConnections = rooms.get(roomName);
      if (roomConnections) {
        roomConnections.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error(`❌ Error handling message in room ${roomName}:`, error);
    }
  });

  ws.on('close', () => {
    // Remove connection from room
    const roomConnections = rooms.get(roomName);
    if (roomConnections) {
      roomConnections.delete(ws);
      if (roomConnections.size === 0) {
        rooms.delete(roomName);
        // Room ${roomName} is now empty
      }
    }
    // Client left room: ${roomName}
  });

  ws.on('error', (error) => {
    console.error(`❌ WebSocket error in room ${roomName}:`, error);
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
