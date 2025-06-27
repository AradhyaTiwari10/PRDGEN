# BlockNote Collaborative Editor - Complete Guide

## Overview

The IdeaVault application now features a modern, real-time collaborative editor built with BlockNote, replacing the previous Quill-based system. This new implementation provides better performance, cleaner code, and enhanced user experience.

## 🎯 Key Features

### ✨ Real-time Collaboration
- **Live Document Syncing**: Changes appear instantly across all connected clients
- **Conflict Resolution**: Built-in operational transform handling via Yjs
- **User Awareness**: See active collaborators with colored avatars
- **Connection Status**: Visual indicators for connection health

### 🎨 Enhanced UI/UX
- **Clean Status Bar**: Shows connection status and active users
- **Collaboration Badges**: Visual indicators for shared editing
- **Color-coded Users**: Each collaborator gets a unique color
- **Responsive Design**: Works seamlessly on all screen sizes

### ⚡ Performance Optimizations
- **Efficient WebSocket Usage**: Single connection per document
- **Smart Content Parsing**: Handles both JSON and text content formats
- **Auto-cleanup**: Removes inactive sessions automatically
- **Debounced Updates**: Prevents excessive network requests

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│   Client A          │    │   WebSocket     │    │   Client B          │
│   BlockNote Editor  │◄──►│   Server        │◄──►│   BlockNote Editor  │
│   + Yjs Document    │    │   (Port 1234)   │    │   + Yjs Document    │
└─────────────────────┘    └─────────────────┘    └─────────────────────┘
           │                         │                         │
           │                         │                         │
           ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Supabase Database                                 │
│   • idea_editing_sessions (presence tracking)                           │
│   • collaboration_requests (invitation system)                          │
│   • shared_ideas (permission management)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── hooks/
│   └── use-blocknote-collaboration.ts    # Main collaboration hook
├── components/
│   └── editor/
│       ├── BlockNoteCollaborativeEditorV2.tsx  # New editor component
│       ├── blocknote-theme.css                 # Custom styling
│       └── CollaborationTestButton.tsx         # Debug component
└── pages/
    └── idea/
        └── DetailedIdeaPage.tsx               # Updated to use new editor
```

## 🔧 Implementation Details

### Core Hook: `useBlockNoteCollaboration`

```typescript
const {
  collaborators,        // Array of active users
  isConnected,         // WebSocket connection status
  connectionStatus,    // 'connecting' | 'connected' | 'disconnected'
  currentUser,         // Current user info
  getYjsDocument,      // Get Yjs document for BlockNote
  getProvider,         // Get WebSocket provider
  cleanup              // Manual cleanup function
} = useBlockNoteCollaboration(ideaId);
```

### Editor Component Usage

```typescript
<BlockNoteCollaborativeEditorV2
  content={content}
  onChange={setContent}
  readOnly={isReadOnly}
  ideaId={ideaId}
/>
```

## 🚀 Setup Instructions

### 1. WebSocket Server

The collaboration requires a WebSocket server running on port 1234:

```bash
# Start the WebSocket server
node websocket-server.js
```

The server handles:
- Room-based document separation
- Message relay between clients
- Connection lifecycle management

### 2. Database Migrations

All necessary migrations are included:
- `20250618000009_optimize_collaboration_system.sql`

Apply with:
```bash
npx supabase db reset
```

### 3. Dependencies

Required packages (already installed):
- `@blocknote/core`
- `@blocknote/react` 
- `@blocknote/mantine`
- `yjs`
- `y-websocket`

## 🎨 Styling

### Theme Integration

The editor uses a custom theme that matches IdeaVault's design:
- **Colors**: Sage green (`#5A827E`) and light green (`#B9D4AA`)
- **Dark Theme**: Seamless integration with existing dark mode
- **Typography**: Consistent with app-wide styling

### CSS Classes

Key classes in `blocknote-theme.css`:
- `.blocknote-ideavault`: Main editor container
- `.collaboration-cursor__*`: Cursor styling
- `.bn-block-*`: Block-specific styling

## 🔐 Security & Permissions

### Row-Level Security (RLS)
- Ideas are protected by user ownership
- Shared ideas respect permission levels (view/edit/manage)
- Real-time subscriptions are user-scoped

### Permission Levels
- **View**: Read-only access to content
- **Edit**: Can modify content and structure
- **Manage**: Full access including sharing controls

## 🐛 Troubleshooting

### Common Issues

1. **"Offline" Status**
   - Check if WebSocket server is running on port 1234
   - Verify no firewall blocking localhost connections
   - Look for console errors in browser dev tools

2. **Changes Not Syncing**
   - Refresh the page to reinitialize connection
   - Check WebSocket server logs for errors
   - Verify database connectivity

3. **Missing Collaborators**
   - Ensure users have proper permissions
   - Check if they're authenticated properly
   - Verify idea sharing is set up correctly

### Debug Mode

Add the `CollaborationTestButton` component to any page:

```typescript
import { CollaborationTestButton } from '@/components/editor/CollaborationTestButton';

<CollaborationTestButton ideaId={ideaId} />
```

This shows:
- Connection status
- Active collaborators
- WebSocket state
- User information

## 📊 Performance Metrics

### Before (Quill + Complex Hooks)
- Multiple WebSocket connections per session
- Complex state management across 3 hooks
- Heavy real-time channel usage
- Frequent re-renders

### After (BlockNote + Simplified Hook)
- Single WebSocket connection per document
- Unified collaboration state
- Optimized Yjs integration
- Minimal re-renders

## 🔄 Migration Notes

### Breaking Changes
- `useRealtimeCollaboration` → `useBlockNoteCollaboration`
- `BlockNoteCollaborativeEditor` → `BlockNoteCollaborativeEditorV2`
- Simplified props interface
- Different event handling model

### Backward Compatibility
- Old collaboration data remains accessible
- Database schema is fully compatible
- WebSocket server handles both old and new clients

## 🚀 Testing the System

### Manual Testing Steps

1. **Single User Test**
   - Open an idea
   - Verify editor loads correctly
   - Check connection status shows "Connected"
   - Type content and verify auto-save works

2. **Multi-User Test**
   - Open same idea in two browser tabs/windows
   - Verify both show "Connected" status
   - Type in one tab, see changes in the other
   - Check collaborator avatars appear

3. **Permission Test**
   - Share idea with "view" permission
   - Verify read-only mode works
   - Share with "edit" permission
   - Verify collaborative editing works

### Automated Testing

Run the development server:
```bash
npm run dev
```

Navigate to an idea page and check:
- Console for any errors
- Network tab for WebSocket connection
- Real-time updates between tabs

## 🎉 Success Criteria

The collaboration system is working correctly when:

1. ✅ WebSocket connects immediately upon page load
2. ✅ Collaborator avatars appear for active users
3. ✅ Text changes sync in real-time (< 100ms delay)
4. ✅ Connection status updates accurately
5. ✅ Auto-save works without conflicts
6. ✅ No console errors or warnings
7. ✅ Proper cleanup on page navigation

## 🔮 Future Enhancements

### Planned Features
- **Version History**: Track document versions
- **Comment System**: Add inline comments
- **Voice/Video Chat**: Integrate communication
- **Advanced Permissions**: Field-level permissions
- **Offline Support**: Sync when reconnected

### Technical Improvements
- **Redis Integration**: Scale WebSocket server
- **Database Sharding**: Handle large user base
- **CDN Integration**: Optimize asset delivery
- **Performance Monitoring**: Track collaboration metrics

---

The new BlockNote collaborative editor represents a significant improvement in code quality, user experience, and system performance. The simplified architecture makes it easier to maintain and extend while providing a superior editing experience for users. 