import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './use-auth';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export interface BlockNoteCollaborator {
  id: string;
  name: string;
  email: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface CollaborationState {
  collaborators: BlockNoteCollaborator[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  currentUser: BlockNoteCollaborator | null;
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F06292', '#26A69A', '#42A5F5', '#66BB6A', '#FFEE58',
  '#AB47BC', '#5C6BC0', '#FF7043', '#8D6E63', '#78909C'
];

export function useBlockNoteCollaboration(ideaId: string) {
  const [state, setState] = useState<CollaborationState>({
    collaborators: [],
    isConnected: false,
    connectionStatus: 'disconnected',
    currentUser: null,
  });

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const initRef = useRef(false);

  // Generate consistent color for user
  const getUserColor = useCallback((userId: string): string => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }, []);

  const { user } = useAuth();

  // Initialize current user
  useEffect(() => {
    if (user) {
      const currentUser: BlockNoteCollaborator = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        email: user.email || '',
        color: getUserColor(user.id),
        isOnline: true,
        lastSeen: new Date(),
      };

      setState(prev => ({ ...prev, currentUser }));
    }
  }, [user, getUserColor]);

  // Initialize Yjs and collaboration
  useEffect(() => {
    if (!ideaId || !state.currentUser || initRef.current) return;

    console.log('🚀 Initializing BlockNote collaboration for idea:', ideaId);
    initRef.current = true;

    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    try {
      // Create WebSocket provider
      const provider = new WebsocketProvider(
        'ws://localhost:1234',
        `blocknote-${ideaId}`,
        ydoc
      );
      providerRef.current = provider;

      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

      // Handle connection status
      provider.on('status', (event: { status: string }) => {
        const isConnected = event.status === 'connected';
        setState(prev => ({
          ...prev,
          isConnected,
          connectionStatus: isConnected ? 'connected' : 'disconnected'
        }));
        console.log('🌐 WebSocket status:', event.status);
      });

      // Handle sync status
      provider.on('sync', (isSynced: boolean) => {
        console.log('🔄 Document sync status:', isSynced);
      });

      // Set user awareness
      if (state.currentUser) {
        provider.awareness.setLocalStateField('user', {
          name: state.currentUser.name,
          email: state.currentUser.email,
          color: state.currentUser.color,
          id: state.currentUser.id,
        });
      }

      // Handle awareness changes (other users joining/leaving)
      provider.awareness.on('change', () => {
        const states = provider.awareness.getStates();
        const collaborators: BlockNoteCollaborator[] = [];

        states.forEach((state, clientId) => {
          if (state.user && state.user.id !== state.currentUser?.id) {
            collaborators.push({
              id: state.user.id,
              name: state.user.name,
              email: state.user.email,
              color: state.user.color,
              isOnline: true,
              lastSeen: new Date(),
            });
          }
        });

        setState(prev => ({
          ...prev,
          collaborators: collaborators.filter((collab, index, self) =>
            index === self.findIndex(c => c.id === collab.id)
          )
        }));
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket provider:', error);
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
    }

    return () => {
      console.log('🧹 Cleaning up BlockNote collaboration');
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      initRef.current = false;
    };
  }, [ideaId, state.currentUser]);

  // Set up Supabase real-time channel for additional collaboration features
  useEffect(() => {
    if (!ideaId || !state.currentUser) return;

    const channelName = `blocknote-collaboration-${ideaId}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Handle presence for additional user tracking
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      console.log('👥 Presence sync:', presenceState);
      
      // Update last seen times for users
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.map(collab => ({
          ...collab,
          lastSeen: new Date(),
        }))
      }));
    });

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: state.currentUser.id,
          user_name: state.currentUser.name,
          user_email: state.currentUser.email,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [ideaId, state.currentUser]);

  // Get Yjs document for BlockNote
  const getYjsDocument = useCallback(() => {
    return ydocRef.current;
  }, []);

  // Get WebSocket provider for BlockNote
  const getProvider = useCallback(() => {
    return providerRef.current;
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Manual cleanup called');
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    initRef.current = false;
  }, []);

  return {
    ...state,
    getYjsDocument,
    getProvider,
    cleanup,
  };
} 