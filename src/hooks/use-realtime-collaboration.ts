import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaboratorPresence {
  user_id: string;
  user_email: string;
  user_name: string;
  cursor_position?: number;
  selection_start?: number;
  selection_end?: number;
  last_seen: string;
  color: string;
  is_typing?: boolean;
  typing_timeout?: NodeJS.Timeout;
}

export interface ContentChange {
  content: string;
  user_id: string;
  user_email: string;
  timestamp: string;
  cursor_position?: number;
}

const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export function useRealtimeCollaboration(ideaId: string) {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userColorRef = useRef<string>('');
  const lastContentRef = useRef<string>('');
  const isUpdatingFromRemoteRef = useRef(false);
  const onRemoteContentChangeRef = useRef<((change: ContentChange) => void) | null>(null);

  // Get a consistent color for the current user
  const getUserColor = useCallback((userId: string) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length];
  }, []);

  // Initialize current user
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
          setCurrentUser({
            id: user.id,
            email: user.email || '',
            name: userName
          });
          userColorRef.current = getUserColor(user.id);
          console.log('🔧 User initialized:', { id: user.id, name: userName });
        }
      } catch (error) {
        console.error('❌ Failed to initialize user:', error);
      }
    };
    initUser();
  }, [getUserColor]);

  // Set up real-time channel
  useEffect(() => {
    if (!ideaId || !currentUser) {
      console.log('🔧 Skipping channel setup - missing ideaId or currentUser:', { ideaId, currentUser });
      return;
    }

    console.log('🚀 Setting up collaboration channel for idea:', ideaId);

    const channelName = `idea-collaboration-${ideaId}`;
    const channel = supabase.channel(channelName);

    channelRef.current = channel;

    // Handle presence changes (users joining/leaving)
    channel.on('presence', { event: 'sync' }, () => {
      console.log('👥 Presence sync event');
      const presenceState = channel.presenceState();
      console.log('👥 Current presence state:', presenceState);

      const activeCollaborators: CollaboratorPresence[] = [];

      Object.entries(presenceState).forEach(([userId, presences]) => {
        const presence = presences[0] as any;
        if (userId !== currentUser.id && presence) {
          console.log('👤 Adding collaborator:', presence);
          activeCollaborators.push({
            user_id: userId,
            user_email: presence.user_email || '',
            user_name: presence.user_name || 'Anonymous',
            cursor_position: presence.cursor_position,
            selection_start: presence.selection_start,
            selection_end: presence.selection_end,
            last_seen: new Date().toISOString(),
            color: getUserColor(userId),
            is_typing: presence.is_typing || false
          });
        }
      });

      console.log('👥 Setting collaborators:', activeCollaborators);
      setCollaborators(activeCollaborators);
    });

    // Handle real-time content changes
    channel.on('broadcast', { event: 'content-change' }, (payload) => {
      console.log('📝 Content change received:', payload);
      const change = payload.payload as ContentChange;
      if (change.user_id !== currentUser.id) {
        console.log('📝 Applying remote content change from:', change.user_email);
        console.log('📝 Content preview:', change.content.substring(0, 100) + '...');

        // Set flag to prevent echo
        isUpdatingFromRemoteRef.current = true;

        // Apply the change immediately
        if (onRemoteContentChangeRef.current) {
          onRemoteContentChangeRef.current(change);
        }

        // Reset flag after a short delay
        setTimeout(() => {
          isUpdatingFromRemoteRef.current = false;
          console.log('📝 Remote update flag reset');
        }, 200);
      } else {
        console.log('📝 Ignoring own content change');
      }
    });

    // Handle cursor position updates
    channel.on('broadcast', { event: 'cursor-update' }, (payload) => {
      console.log('🖱️ Cursor update received:', payload);
      const update = payload.payload as {
        user_id: string;
        cursor_position: number;
        selection_start?: number;
        selection_end?: number;
        is_typing?: boolean;
      };

      if (update.user_id !== currentUser.id) {
        setCollaborators(prev =>
          prev.map(collab =>
            collab.user_id === update.user_id
              ? {
                  ...collab,
                  cursor_position: update.cursor_position,
                  selection_start: update.selection_start,
                  selection_end: update.selection_end,
                  is_typing: update.is_typing || false,
                  last_seen: new Date().toISOString()
                }
              : collab
          )
        );
      }
    });

    // Handle typing status updates
    channel.on('broadcast', { event: 'typing-update' }, (payload) => {
      console.log('⌨️ Typing update received:', payload);
      const update = payload.payload as {
        user_id: string;
        is_typing: boolean;
      };

      if (update.user_id !== currentUser.id) {
        setCollaborators(prev =>
          prev.map(collab =>
            collab.user_id === update.user_id
              ? {
                  ...collab,
                  is_typing: update.is_typing,
                  last_seen: new Date().toISOString()
                }
              : collab
          )
        );
      }
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      console.log('📡 Channel subscription status:', status);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('✅ Connected to collaboration channel');

        // Track current user's presence
        const presenceData = {
          user_id: currentUser.id,
          user_email: currentUser.email,
          user_name: currentUser.name,
          cursor_position: 0,
          online_at: new Date().toISOString(),
        };

        console.log('👤 Tracking presence:', presenceData);
        await channel.track(presenceData);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error');
        setIsConnected(false);
      }
    });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
      setCollaborators([]);
    };
  }, [ideaId, currentUser, getUserColor]);

  // Broadcast content changes with debouncing
  const broadcastContentChange = useCallback((content: string, cursorPosition?: number) => {
    if (!channelRef.current || !currentUser) {
      return;
    }

    if (isUpdatingFromRemoteRef.current) {
      return;
    }

    // Only broadcast if content actually changed
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;

      const changePayload: ContentChange = {
        content,
        user_id: currentUser.id,
        user_email: currentUser.email,
        timestamp: new Date().toISOString(),
        cursor_position: cursorPosition
      };

      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'content-change',
          payload: changePayload
        });
      } catch (error) {
        console.error('Failed to broadcast content change:', error);
      }
    } else {
      console.log('🔧 Content unchanged, skipping broadcast');
    }
  }, [currentUser]);

  // Broadcast cursor position updates
  const broadcastCursorUpdate = useCallback((cursorPosition: number, selectionStart?: number, selectionEnd?: number) => {
    if (!channelRef.current || !currentUser) {
      console.log('🔧 Cannot broadcast cursor - missing channel or user');
      return;
    }

    try {
      const presenceData = {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: currentUser.name,
        cursor_position: cursorPosition,
        selection_start: selectionStart,
        selection_end: selectionEnd,
        online_at: new Date().toISOString(),
        is_typing: false // Reset typing when cursor moves
      };

      // Update presence with cursor position
      channelRef.current.track(presenceData);

      // Also broadcast cursor update
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor-update',
        payload: {
          user_id: currentUser.id,
          cursor_position: cursorPosition,
          selection_start: selectionStart,
          selection_end: selectionEnd,
          is_typing: false
        }
      });
    } catch (error) {
      console.error('❌ Failed to broadcast cursor update:', error);
    }
  }, [currentUser]);

  // Broadcast typing status
  const broadcastTypingStatus = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !currentUser) {
      console.log('🔧 Cannot broadcast typing - missing channel or user');
      return;
    }

    try {
      const presenceData = {
        user_id: currentUser.id,
        user_email: currentUser.email,
        user_name: currentUser.name,
        is_typing: isTyping,
        online_at: new Date().toISOString(),
      };

      // Update presence with typing status
      channelRef.current.track(presenceData);

      // Also broadcast typing update
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing-update',
        payload: {
          user_id: currentUser.id,
          is_typing: isTyping
        }
      });
    } catch (error) {
      console.error('Failed to broadcast typing status:', error);
    }
  }, [currentUser]);

  // Set callback for handling remote content changes
  const setOnRemoteContentChange = useCallback((callback: (change: ContentChange) => void) => {
    console.log('🔧 Setting remote content change callback');
    onRemoteContentChangeRef.current = callback;
  }, []);

  return {
    collaborators,
    isConnected,
    currentUser,
    userColor: userColorRef.current,
    broadcastContentChange,
    broadcastCursorUpdate,
    broadcastTypingStatus,
    setOnRemoteContentChange
  };
}
