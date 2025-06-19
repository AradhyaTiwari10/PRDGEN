# Quill.js Collaborative Text Editor Setup

This project now includes a real-time collaborative text editor built with Quill.js, Yjs, and WebSocket technology.

## 🚀 Quick Start

### 1. Install Dependencies

The required packages are already installed:
- `quill` - Rich text editor
- `yjs` - Conflict-free replicated data types for collaboration
- `y-websocket` - WebSocket provider for Yjs
- `y-quill` - Quill.js binding for Yjs
- `quill-cursors` - Collaborative cursor support

### 2. Start Development Environment (Automated)

**Option A: Single Command (Recommended)**
```bash
npm run dev
```

This automatically starts both the WebSocket server and Vite development server with colored output:
- 🔵 **WS**: WebSocket server on `ws://localhost:1234`
- 🟢 **VITE**: React app on `http://localhost:8081`

**Option B: Using Shell Script**
```bash
./dev-start.sh
```

**Option C: Manual (if you prefer separate terminals)**
```bash
# Terminal 1: Start WebSocket server
npm run websocket

# Terminal 2: Start Vite only
npm run dev:vite-only
```

### 3. Available npm Scripts

```bash
npm run dev           # Start both WebSocket server and Vite (recommended)
npm run dev:vite-only # Start only Vite development server
npm run websocket     # Start only WebSocket server
npm run build         # Build for production
npm run preview       # Preview production build
```

### 4. Test Real-time Collaboration

1. Navigate to any idea page (e.g., `/idea/some-id`)
2. Open the same URL in multiple browser tabs or windows
3. Start typing in one tab - you should see changes appear in real-time in other tabs
4. Notice the collaborative cursors showing where other users are typing

## 🎯 Features

### ✅ Implemented Features

- **Real-time text synchronization** using Yjs
- **Rich text editing** with Quill.js toolbar (bold, italic, underline, headers, lists)
- **Collaborative cursors** showing where other users are typing
- **User presence indicators** in the editor header
- **Conflict-free editing** - multiple users can edit simultaneously
- **WebSocket connection status** (Live/Offline indicator)
- **Custom styling** that matches your app's theme

### 🎨 Editor Features

- **Toolbar**: Bold, Italic, Underline, Headers (H1, H2), Bullet Lists, Numbered Lists
- **Keyboard shortcuts**: Standard rich text shortcuts work
- **Auto-save integration**: Works with your existing auto-save system
- **Read-only mode**: Respects permission levels for shared ideas
- **Responsive design**: Works on desktop and mobile

### 👥 Collaboration Features

- **Real-time sync**: Changes appear instantly across all connected clients
- **Collaborative cursors**: See colored cursors with user names
- **Typing indicators**: See when other users are actively typing
- **User avatars**: Display user initials in the collaboration header
- **Connection status**: Visual indicators for online/offline status

## 🔧 Technical Details

### Architecture

```
React App (Quill Editor) ←→ WebSocket Server ←→ Other React Clients
                ↓
            Yjs Document (CRDT)
```

### Key Components

1. **QuillCollaborativeEditor.tsx**: Main editor component
2. **websocket-server.js**: WebSocket server for real-time sync
3. **Yjs Document**: Conflict-free replicated data type for text
4. **QuillBinding**: Connects Quill editor to Yjs document

### Data Flow

1. User types in Quill editor
2. QuillBinding captures changes and updates Yjs document
3. Yjs sends changes through WebSocket to server
4. Server broadcasts changes to all connected clients
5. Other clients receive changes and update their Quill editors

## 🛠️ Customization

### Toolbar Configuration

Edit the toolbar in `QuillCollaborativeEditor.tsx`:

```typescript
modules: {
  toolbar: !readOnly ? [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ] : false,
  // Add more toolbar options here
}
```

### Styling

The editor includes custom CSS that matches your app's theme. Modify the styles in the `<style>` tag within the component.

### WebSocket Configuration

Change the WebSocket URL in `QuillCollaborativeEditor.tsx`:

```typescript
const provider = new WebsocketProvider(
  'ws://localhost:1234', // Change this URL
  `idea-${ideaId}`,
  ydoc
);
```

## 🐛 Troubleshooting

### Common Issues

1. **"Offline" status**: Make sure the WebSocket server is running
2. **Changes not syncing**: Check browser console for WebSocket errors
3. **Port conflicts**: Change the port in `websocket-server.js`
4. **Cursor positioning**: Refresh the page if cursors appear misaligned

### Debug Mode

Add console logging to see collaboration events:

```typescript
provider.on('status', (event) => {
  console.log('WebSocket status:', event.status);
});

quill.on('text-change', (delta, oldDelta, source) => {
  console.log('Text changed:', { delta, source });
});
```

## 🚀 Production Considerations

For production deployment:

1. **Persistent Storage**: Use y-leveldb or y-redis for document persistence
2. **Authentication**: Add user authentication to WebSocket connections
3. **Scaling**: Use multiple server instances with shared storage
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Error Handling**: Add comprehensive error handling and recovery

## 📝 Next Steps

- The current setup uses in-memory storage (documents are lost on server restart)
- Consider integrating with your database for persistence
- Add user authentication and permissions to the WebSocket server
- Implement document versioning and history
- Add more rich text features (images, tables, etc.)

## 🎉 Success!

You now have a fully functional real-time collaborative text editor! Open multiple browser tabs to the same idea and start collaborating in real-time.
