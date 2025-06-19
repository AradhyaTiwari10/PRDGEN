import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface EditingPresence {
  user_id: string;
  user_email: string;
  user_name: string;
  cursor_position: number;
  selection_start?: number;
  selection_end?: number;
  last_activity: string;
}

export function useEditingPresence(ideaId: string) {
  const [activeEditors, setActiveEditors] = useState<EditingPresence[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);

  // Initialize current user
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
        setCurrentUser({
          id: user.id,
          email: user.email || '',
          name: userName
        });
      }
    };
    initUser();
  }, []);

  // Fetch active editors
  const fetchActiveEditors = useCallback(async () => {
    if (!ideaId) return;

    try {
      const { data, error } = await supabase
        .from('idea_editing_sessions')
        .select('*')
        .eq('idea_id', ideaId)
        .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes
        .order('last_activity', { ascending: false });

      if (error) throw error;

      // Filter out current user from the list
      const { data: { user } } = await supabase.auth.getUser();
      const filteredEditors = (data || []).filter(editor => editor.user_id !== user?.id);
      
      setActiveEditors(filteredEditors);
    } catch (error) {
      console.error('Failed to fetch active editors:', error);
    }
  }, [ideaId]);

  // Update current user's editing session
  const updateEditingSession = useCallback(async (
    cursorPosition: number,
    selectionStart?: number,
    selectionEnd?: number
  ) => {
    if (!ideaId || !currentUser) return;

    try {
      await supabase.rpc('update_editing_session', {
        p_idea_id: ideaId,
        p_user_id: currentUser.id,
        p_user_email: currentUser.email,
        p_user_name: currentUser.name,
        p_cursor_position: cursorPosition,
        p_selection_start: selectionStart,
        p_selection_end: selectionEnd
      });
    } catch (error) {
      console.error('Failed to update editing session:', error);
    }
  }, [ideaId, currentUser]);

  // Clean up editing session when component unmounts
  const cleanupEditingSession = useCallback(async () => {
    if (!ideaId || !currentUser) return;

    try {
      await supabase
        .from('idea_editing_sessions')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', currentUser.id);
    } catch (error) {
      console.error('Failed to cleanup editing session:', error);
    }
  }, [ideaId, currentUser]);

  // Set up real-time subscription for editing sessions
  useEffect(() => {
    if (!ideaId) return;

    fetchActiveEditors();

    const subscription = supabase
      .channel(`editing-sessions-${ideaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'idea_editing_sessions',
          filter: `idea_id=eq.${ideaId}`,
        },
        () => {
          fetchActiveEditors();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ideaId, fetchActiveEditors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEditingSession();
    };
  }, [cleanupEditingSession]);

  return {
    activeEditors,
    currentUser,
    updateEditingSession,
    cleanupEditingSession
  };
}
