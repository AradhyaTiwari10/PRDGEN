import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from './use-notifications';

export interface CollaboratorDetails {
  id: string;
  idea_id: string;
  owner_id: string;
  collaborator_id: string;
  collaborator_email: string;
  permission_level: 'view' | 'edit' | 'manage';
  created_at: string;
  // Additional fields
  idea_title?: string;
  is_owner?: boolean;
}

export function useCollaborators(ideaId?: string) {
  const [collaborators, setCollaborators] = useState<CollaboratorDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createNotification } = useNotifications();

  // Fetch collaborators for a specific idea
  const fetchCollaborators = async (targetIdeaId?: string) => {
    if (!targetIdeaId && !ideaId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shared_ideas')
        .select(`
          *,
          ideas!shared_ideas_idea_id_fkey(title, user_id)
        `)
        .eq('idea_id', targetIdeaId || ideaId);

      if (error) throw error;

      // Enhanced collaborator data with proper email lookup
      const enhancedCollaborators = await Promise.all(
        (data || []).map(async (collab) => {
          // Try to get the actual email using our RPC function
          let collaboratorEmail = `user-${collab.collaborator_id.slice(0, 8)}@example.com`;
          
          try {
            const { data: emailData } = await supabase
              .rpc('get_user_by_email_reverse', { user_id: collab.collaborator_id });
            
            if (emailData) {
              collaboratorEmail = emailData;
            }
          } catch (emailError) {
            // Fallback to stored email or placeholder
            console.warn('Could not fetch collaborator email:', emailError);
          }

          return {
            ...collab,
            collaborator_email: collaboratorEmail,
            idea_title: collab.ideas?.title,
            is_owner: collab.ideas?.user_id === user.id
          };
        })
      );

      setCollaborators(enhancedCollaborators);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch collaborators';
      setError(errorMessage);
      console.error('Failed to fetch collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove a collaborator
  const removeCollaborator = async (collaboratorId: string, targetIdeaId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentIdeaId = targetIdeaId || ideaId;

      // Get idea title and collaborator email for notification
      const { data: ideaData } = await supabase
        .from('ideas')
        .select('title')
        .eq('id', currentIdeaId)
        .single();

      const { data: collaboratorData } = await supabase
        .rpc('get_user_by_email_reverse', { user_id: collaboratorId });

      // Step 1: Remove from shared_ideas table
      const { error: sharedError } = await supabase
        .from('shared_ideas')
        .delete()
        .eq('idea_id', currentIdeaId)
        .eq('collaborator_id', collaboratorId);

      if (sharedError) throw sharedError;

      // Step 2: Also remove any accepted collaboration requests to clean up
      const { error: requestError } = await supabase
        .from('collaboration_requests')
        .delete()
        .eq('idea_id', currentIdeaId)
        .eq('recipient_id', collaboratorId)
        .eq('status', 'accepted');

      // Don't throw error if request cleanup fails, just log it
      if (requestError) {
        console.warn('Failed to clean up collaboration request:', requestError);
      }

      // Step 3: Send notification to removed collaborator
      try {
        await createNotification(
          collaboratorId,
          'collaboration_removed',
          'Removed from Collaboration',
          `You have been removed from collaboration on "${ideaData?.title || 'an idea'}" by ${user.email}`,
          { idea_id: currentIdeaId, idea_title: ideaData?.title }
        );
      } catch (notificationError) {
        console.error('Failed to send removal notification:', notificationError);
      }

      toast({
        title: 'Success',
        description: `${collaboratorData || 'Collaborator'} removed successfully`,
      });

      // Refresh the list
      await fetchCollaborators(targetIdeaId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove collaborator';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update collaborator permission
  const updateCollaboratorPermission = async (
    collaboratorId: string,
    newPermission: 'view' | 'edit' | 'manage',
    targetIdeaId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentIdeaId = targetIdeaId || ideaId;

      // Get idea title for notification
      const { data: ideaData } = await supabase
        .from('ideas')
        .select('title')
        .eq('id', currentIdeaId)
        .single();

      const { error } = await supabase
        .from('shared_ideas')
        .update({ permission_level: newPermission })
        .eq('idea_id', currentIdeaId)
        .eq('collaborator_id', collaboratorId);

      if (error) throw error;

      // Send notification about permission change
      try {
        await createNotification(
          collaboratorId,
          'permission_changed',
          'Permission Updated',
          `Your permission for "${ideaData?.title || 'an idea'}" has been updated to ${newPermission} by ${user.email}`,
          { idea_id: currentIdeaId, idea_title: ideaData?.title, new_permission: newPermission }
        );
      } catch (notificationError) {
        console.error('Failed to send permission change notification:', notificationError);
      }

      toast({
        title: 'Success',
        description: `Permission updated to ${newPermission}`,
      });

      // Refresh the list
      await fetchCollaborators(targetIdeaId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permission';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Get collaborator count for an idea
  const getCollaboratorCount = async (targetIdeaId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('shared_ideas')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', targetIdeaId);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error('Failed to get collaborator count:', err);
      return 0;
    }
  };

  // Check if current user is owner of an idea
  const checkIsOwner = async (targetIdeaId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('ideas')
        .select('user_id')
        .eq('id', targetIdeaId)
        .single();

      if (error) throw error;
      return data.user_id === user.id;
    } catch (err) {
      console.error('Failed to check ownership:', err);
      return false;
    }
  };

  // Auto-fetch when ideaId changes
  useEffect(() => {
    if (ideaId) {
      fetchCollaborators();
    }
  }, [ideaId]);

  return {
    collaborators,
    loading,
    error,
    fetchCollaborators,
    removeCollaborator,
    updateCollaboratorPermission,
    getCollaboratorCount,
    checkIsOwner,
    refreshCollaborators: () => fetchCollaborators()
  };
}
