# WebSocket Server Setup for Real-time Collaboration

This guide explains how to set up the WebSocket server for real-time collaborative editing using Yjs.

## Prerequisites

Make sure you have Node.js installed on your system.

## Installation

1. Install the required WebSocket server dependencies:

```bash
npm install ws y-websocket
```

## Running the WebSocket Server

1. Start the WebSocket server:

```bash
node websocket-server.js
```

The server will start on `ws://localhost:1234` by default.

2. You should see output like:
```
🚀 Starting WebSocket server for Yjs collaboration...
✅ WebSocket server running on ws://localhost:1234
🔗 Clients can now connect for real-time collaboration
```

## Testing the Collaboration

1. Start your React development server:
```bash
npm run dev
```

2. Open multiple browser tabs/windows to the same idea page (e.g., `/idea/some-id`)

3. Start typing in one tab - you should see the changes appear in real-time in other tabs

4. You should see collaborator cursors and typing indicators

## Features

- **Real-time text synchronization**: Changes appear instantly across all connected clients
- **Collaborative cursors**: See where other users are typing with colored cursors
- **Conflict resolution**: Yjs automatically handles concurrent edits
- **Offline support**: Changes are queued when offline and synced when reconnected
- **User awareness**: See who's currently editing the document

## Troubleshooting

### WebSocket Connection Issues

If you see "Offline" status in the editor:

1. Make sure the WebSocket server is running on port 1234
2. Check that no firewall is blocking the connection
3. Verify the WebSocket URL in the editor component matches your server

### Port Conflicts

If port 1234 is already in use:

1. Change the PORT environment variable:
```bash
PORT=3001 node websocket-server.js
```

2. Update the WebSocket URL in `QuillCollaborativeEditor.tsx`:
```typescript
const provider = new WebsocketProvider(
  'ws://localhost:3001', // Update this URL
  `idea-${ideaId}`,
  ydoc
);
```

### Performance Considerations

- The server keeps documents in memory
- For production, consider using a persistent storage backend
- Monitor memory usage with many concurrent documents

## Production Deployment

For production deployment, consider:

1. **Persistent Storage**: Use y-leveldb or y-redis for document persistence
2. **Load Balancing**: Use multiple server instances with shared storage
3. **Authentication**: Add user authentication to the WebSocket connection
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Monitoring**: Add logging and monitoring for server health

## Next Steps

- The current implementation uses in-memory storage
- Documents are lost when the server restarts
- For production, integrate with your database for persistence
- Consider adding user authentication and permissions
