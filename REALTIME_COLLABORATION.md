# Real-time Collaborative Editing

This document describes the real-time collaborative editing feature implemented for the IdeaVault application.

## Features

### ✅ Implemented Features

1. **Real-time Content Synchronization**
   - Changes made by one user are instantly visible to all other collaborators
   - Uses Supabase Realtime for low-latency updates
   - Conflict resolution through operational transforms

2. **User Presence Indicators**
   - Shows who is currently editing the document
   - Displays user avatars and names in the editor header
   - Live connection status indicator

3. **Cursor Position Tracking**
   - Shows where each collaborator is currently editing
   - Colored cursor indicators with user names
   - Real-time cursor movement updates

4. **Visual Feedback**
   - Different colors for each collaborator
   - User avatars with initials
   - "Live" indicator showing connection status
   - Smooth animations for cursor movements

## Technical Implementation

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User A        │    │   Supabase       │    │   User B        │
│   Browser       │◄──►│   Realtime       │◄──►│   Browser       │
│                 │    │   Channel        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

1. **`useRealtimeCollaboration` Hook**
   - Manages real-time connections
   - Handles presence tracking
   - Broadcasts content and cursor changes

2. **`CollaborativeRichTextEditor` Component**
   - Enhanced TipTap editor with collaboration features
   - Shows collaborator cursors and presence
   - Handles real-time content updates

3. **Database Tables**
   - `idea_editing_sessions`: Tracks active editing sessions
   - `idea_content_changes`: Stores content change history

### Real-time Events

1. **Content Changes**
   - Event: `content-change`
   - Payload: `{ content, user_id, user_email, timestamp, cursor_position }`

2. **Cursor Updates**
   - Event: `cursor-update`
   - Payload: `{ user_id, cursor_position, selection_start, selection_end }`

3. **Presence Sync**
   - Automatic presence tracking via Supabase channels
   - Shows when users join/leave editing sessions

## Usage

### For Users

1. **Starting Collaboration**
   - Share an idea with edit permissions
   - Both users can open the idea simultaneously
   - Real-time editing begins automatically

2. **Visual Indicators**
   - See other editors in the header bar
   - Colored cursors show where others are typing
   - "Live" indicator shows connection status

3. **Editing Experience**
   - Type normally - changes sync automatically
   - See others' changes in real-time
   - Cursor positions update as you move around

### For Developers

1. **Adding to New Components**
   ```tsx
   import { CollaborativeRichTextEditor } from '@/components/editor/CollaborativeRichTextEditor';
   
   <CollaborativeRichTextEditor
     content={content}
     onChange={setContent}
     ideaId={ideaId}
     readOnly={false}
   />
   ```

2. **Customizing Collaboration**
   ```tsx
   const {
     collaborators,
     isConnected,
     broadcastContentChange,
     broadcastCursorUpdate
   } = useRealtimeCollaboration(ideaId);
   ```

## Database Schema

### `idea_editing_sessions`
```sql
CREATE TABLE idea_editing_sessions (
    id UUID PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id),
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_name TEXT,
    cursor_position INTEGER,
    selection_start INTEGER,
    selection_end INTEGER,
    last_activity TIMESTAMP,
    created_at TIMESTAMP
);
```

### `idea_content_changes`
```sql
CREATE TABLE idea_content_changes (
    id UUID PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id),
    user_id UUID REFERENCES auth.users(id),
    content_delta JSONB,
    cursor_position INTEGER,
    timestamp TIMESTAMP
);
```

## Security

### Row Level Security (RLS)

1. **Editing Sessions**
   - Users can only see sessions for ideas they own or collaborate on
   - Users can only manage their own editing sessions

2. **Content Changes**
   - Users can only view changes for accessible ideas
   - Users can only insert changes for ideas they can edit

### Permission Checks

1. **Edit Access**
   - Requires `edit` or `manage` permission level
   - Read-only users cannot participate in real-time editing

2. **Collaboration Validation**
   - Validates user permissions before allowing real-time access
   - Automatically handles permission changes

## Performance Optimizations

1. **Debounced Updates**
   - Content changes are debounced to reduce network traffic
   - Cursor updates are throttled for smooth performance

2. **Automatic Cleanup**
   - Inactive editing sessions are cleaned up after 5 minutes
   - Database triggers handle automatic maintenance

3. **Efficient Queries**
   - Indexed database queries for fast presence lookups
   - Optimized real-time subscriptions

## Testing

### Manual Testing Steps

1. **Basic Collaboration**
   - User A shares idea with User B (edit permissions)
   - Both users open the idea simultaneously
   - Verify real-time content synchronization

2. **Presence Indicators**
   - Check that user names appear in editor header
   - Verify cursor positions are shown correctly
   - Test connection status indicators

3. **Permission Handling**
   - Test with view-only permissions (should not show real-time features)
   - Verify edit permissions work correctly
   - Test permission changes during active editing

### Automated Testing

```bash
# Run collaboration tests
npm test -- --grep "collaboration"

# Test real-time features
npm test -- --grep "realtime"
```

## Troubleshooting

### Common Issues

1. **Connection Problems**
   - Check Supabase Realtime is enabled
   - Verify network connectivity
   - Check browser console for errors

2. **Cursor Not Showing**
   - Ensure proper permissions (edit/manage)
   - Check if user is authenticated
   - Verify idea ID is correct

3. **Content Not Syncing**
   - Check RLS policies are correct
   - Verify user has edit permissions
   - Check for JavaScript errors

### Debug Mode

Enable debug logging:
```tsx
// In useRealtimeCollaboration hook
console.log('Collaboration debug:', {
  collaborators,
  isConnected,
  currentUser
});
```

## Future Enhancements

1. **Operational Transform**
   - More sophisticated conflict resolution
   - Better handling of simultaneous edits

2. **Voice/Video Integration**
   - Add voice chat during collaboration
   - Screen sharing capabilities

3. **Advanced Presence**
   - Show what section users are viewing
   - Highlight recently edited areas

4. **Collaboration Analytics**
   - Track editing patterns
   - Show collaboration statistics
