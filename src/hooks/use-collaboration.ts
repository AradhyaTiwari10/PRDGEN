import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface CollaborationRequest {
  id: string;
  idea_id: string;
  requester_id: string;
  recipient_id: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  idea_title?: string;
  requester_email?: string;
}

export interface SharedIdea {
  id: string;
  idea_id: string;
  owner_id: string;
  collaborator_id: string;
  permission_level: 'read' | 'write';
  created_at: string;
  // Joined data
  idea_title?: string;
  owner_email?: string;
}

export function useCollaboration() {
  const [pendingRequests, setPendingRequests] = useState<CollaborationRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<CollaborationRequest[]>([]);
  const [sharedIdeas, setSharedIdeas] = useState<SharedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending collaboration requests (received)
  const fetchPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, check if collaboration_requests table exists
      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          setPendingRequests([]);
          return;
        }
        throw error;
      }

      // Fetch related data separately
      const requestsWithDetails = await Promise.all(
        (data || []).map(async (req) => {
          // Get idea title
          const { data: ideaData, error: ideaError } = await supabase
            .from('ideas')
            .select('title')
            .eq('id', req.idea_id)
            .maybeSingle();

          if (ideaError && ideaError.code !== 'PGRST116') {
            console.error('Failed to fetch idea details for request:', req.id, ideaError);
          }

          // Get requester email if not available
          let requesterEmail = req.requester_email || 'Unknown User';
          if (!req.requester_email || req.requester_email === 'Unknown') {
            try {
              const { data: emailData } = await supabase
                .rpc('get_user_by_email_reverse', { user_id: req.requester_id });
              if (emailData) {
                requesterEmail = emailData;
              }
            } catch (error) {
              console.error('Failed to get requester email:', error);
            }
          }

          return {
            ...req,
            idea_title: ideaData?.title || 'Untitled Idea',
            requester_email: requesterEmail
          };
        })
      );

      setPendingRequests(requestsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
      setPendingRequests([]); // Set empty array on error
    }
  };

  // Fetch sent collaboration requests
  const fetchSentRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          setSentRequests([]);
          return;
        }
        throw error;
      }

      // Fetch related data separately
      const requestsWithDetails = await Promise.all(
        (data || []).map(async (req) => {
          // Get idea title
          const { data: ideaData, error: ideaError } = await supabase
            .from('ideas')
            .select('title')
            .eq('id', req.idea_id)
            .maybeSingle();

          if (ideaError && ideaError.code !== 'PGRST116') {
            console.error('Failed to fetch idea details for request:', req.id, ideaError);
          }

          return {
            ...req,
            idea_title: ideaData?.title || 'Untitled Idea'
          };
        })
      );

      setSentRequests(requestsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sent requests');
      setSentRequests([]); // Set empty array on error
    }
  };

  // Fetch shared ideas
  const fetchSharedIdeas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shared_ideas')
        .select('*')
        .eq('collaborator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          setSharedIdeas([]);
          return;
        }
        throw error;
      }

      // Fetch related data separately
      const sharedIdeasWithDetails = await Promise.all(
        (data || []).map(async (shared) => {
          // Get idea title
          const { data: ideaData, error: ideaError } = await supabase
            .from('ideas')
            .select('title')
            .eq('id', shared.idea_id)
            .maybeSingle();

          if (ideaError && ideaError.code !== 'PGRST116') {
            console.error('Failed to fetch idea details for shared idea:', shared.id, ideaError);
          }

          // Get owner email
          let ownerEmail = 'Unknown Owner';
          try {
            const { data: emailData } = await supabase
              .rpc('get_user_by_email_reverse', { user_id: shared.owner_id });
            if (emailData) {
              ownerEmail = emailData;
            }
          } catch (error) {
            console.error('Failed to get owner email:', error);
          }

          return {
            ...shared,
            idea_title: ideaData?.title || 'Untitled Idea',
            owner_email: ownerEmail
          };
        })
      );

      setSharedIdeas(sharedIdeasWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shared ideas');
      setSharedIdeas([]); // Set empty array on error
    }
  };

  // Send collaboration request with enhanced validation
  const sendCollaborationRequest = async (ideaId: string, recipientEmail: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is trying to collaborate with themselves
      if (recipientEmail === user.email) {
        throw new Error('You cannot send a collaboration request to yourself');
      }

      // Check if collaboration_requests table exists
      const { error: tableCheckError } = await supabase
        .from('collaboration_requests')
        .select('id')
        .limit(1);

      if (tableCheckError && (tableCheckError.code === 'PGRST106' || tableCheckError.message.includes('does not exist'))) {
        throw new Error('Collaboration feature is not yet set up. Please apply the database migration first.');
      }

      // Step 1: Check if user exists in auth.users
      const { data: recipientId, error: userError } = await supabase
        .rpc('get_user_id_by_email', { user_email: recipientEmail });

      if (userError) {
        console.error('User lookup error:', userError);
        throw new Error('Failed to look up user. Please ensure the email address is correct and the user has an account.');
      }

      if (!recipientId) {
        throw new Error(`User with email "${recipientEmail}" not found. Please ensure they have an account on this platform.`);
      }

      // Double-check if user is trying to collaborate with themselves
      if (recipientId === user.id) {
        throw new Error('You cannot send a collaboration request to yourself');
      }

      // Step 2: Check if user is already a collaborator on this idea
      const { data: existingCollaborator, error: collaboratorError } = await supabase
        .from('shared_ideas')
        .select('id')
        .eq('idea_id', ideaId)
        .eq('collaborator_id', recipientId)
        .maybeSingle();

      if (collaboratorError && collaboratorError.code !== 'PGRST116') {
        console.error('Collaborator check error:', collaboratorError);
      }

      if (existingCollaborator) {
        throw new Error(`${recipientEmail} is already a collaborator on this idea.`);
      }

      // Step 3: Check if there's already a pending request
      const { data: existingRequest, error: requestError } = await supabase
        .from('collaboration_requests')
        .select('id, status')
        .eq('idea_id', ideaId)
        .eq('recipient_id', recipientId)
        .maybeSingle();

      if (requestError && requestError.code !== 'PGRST116') {
        console.error('Request check error:', requestError);
      }

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          throw new Error(`A collaboration request is already pending for ${recipientEmail}.`);
        } else if (existingRequest.status === 'accepted') {
          // Double-check if they're actually still a collaborator
          // They might have been removed but the request wasn't cleaned up
          const { data: stillCollaborating } = await supabase
            .from('shared_ideas')
            .select('id')
            .eq('idea_id', ideaId)
            .eq('collaborator_id', recipientId)
            .maybeSingle();

          if (stillCollaborating) {
            throw new Error(`${recipientEmail} is already collaborating on this idea.`);
          } else {
            // They were removed but request wasn't cleaned up - clean it up now
            await supabase
              .from('collaboration_requests')
              .delete()
              .eq('id', existingRequest.id);
          }
        } else if (existingRequest.status === 'declined') {
          // If previously declined, delete the old request so we can send a new one
          await supabase
            .from('collaboration_requests')
            .delete()
            .eq('id', existingRequest.id);
        }
      }

      // Step 4: Get idea title for the invitation
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('title')
        .eq('id', ideaId)
        .single();

      if (ideaError) {
        console.error('Idea lookup error:', ideaError);
        throw new Error('Failed to get idea details.');
      }

      // Step 5: Create collaboration request with idea title in message
      const enhancedMessage = message
        ? `${message}\n\nIdea: "${ideaData.title}"`
        : `You've been invited to collaborate on the idea: "${ideaData.title}"`;

      const { error: insertError } = await supabase
        .from('collaboration_requests')
        .insert({
          idea_id: ideaId,
          requester_id: user.id,
          recipient_id: recipientId,
          requester_email: user.email || 'Unknown',
          recipient_email: recipientEmail,
          message: enhancedMessage,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: 'Invitation Sent!',
        description: `Collaboration request sent to ${recipientEmail} for "${ideaData.title}"`,
      });

      // Refresh sent requests
      await fetchSentRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send collaboration request';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Accept collaboration request with enhanced backend access
  const acceptCollaborationRequest = async (requestId: string, permissionLevel: 'read' | 'write' = 'read') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Accepting collaboration request:', { requestId, userId: user.id, permissionLevel });

      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('collaboration_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', user.id)
        .maybeSingle();

      console.log('Request lookup result:', { request, requestError });

      if (requestError && requestError.code !== 'PGRST116') {
        console.error('Request lookup error:', requestError);
        throw new Error('Collaboration request not found or you do not have permission to accept it');
      }

      if (!request) {
        throw new Error('Collaboration request not found or you do not have permission to accept it');
      }

      // Get idea information - we'll get it from the request message since RLS might block direct access
      console.log('Looking up idea:', request.idea_id);

      // First try to get the idea directly
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('title, user_id')
        .eq('id', request.idea_id)
        .maybeSingle();

      console.log('Idea lookup result:', { ideaData, ideaError });

      let ideaTitle = 'Untitled Idea';

      if (ideaData) {
        ideaTitle = ideaData.title;
      } else {
        // If we can't access the idea directly (due to RLS), try database function
        console.log('Idea not directly accessible, trying database function');
        try {
          const { data: titleFromFunction, error: functionError } = await supabase
            .rpc('get_idea_title_for_collaboration', { request_id: requestId });

          if (!functionError && titleFromFunction) {
            ideaTitle = titleFromFunction;
            console.log('Got idea title from database function:', ideaTitle);
          } else {
            // Fallback: extract title from message
            console.log('Database function failed, extracting from message:', request.message);
            const messageMatch = request.message?.match(/Idea: "([^"]+)"/);
            if (messageMatch) {
              ideaTitle = messageMatch[1];
            } else {
              // Try alternative message format
              const altMatch = request.message?.match(/collaborate on the idea: "([^"]+)"/);
              if (altMatch) {
                ideaTitle = altMatch[1];
              }
            }
            console.log('Extracted idea title from message:', ideaTitle);
          }
        } catch (funcError) {
          console.error('Database function error:', funcError);
          // Fallback to message extraction
          const messageMatch = request.message?.match(/Idea: "([^"]+)"/);
          if (messageMatch) {
            ideaTitle = messageMatch[1];
          }
        }
      }

      if (request.status !== 'pending') {
        throw new Error('This collaboration request has already been processed');
      }

      // Check if user is already a collaborator (safety check)
      const { data: existingCollaboration, error: existingError } = await supabase
        .from('shared_ideas')
        .select('id')
        .eq('idea_id', request.idea_id)
        .eq('collaborator_id', user.id)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Existing collaboration check error:', existingError);
      }

      if (existingCollaboration) {
        // Update the request status even if already collaborating
        await supabase
          .from('collaboration_requests')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', requestId);

        toast({
          title: 'Already Collaborating',
          description: 'You are already a collaborator on this idea',
        });

        await Promise.all([fetchPendingRequests(), fetchSharedIdeas()]);
        return;
      }

      // Step 1: Update request status to accepted
      const { error: updateError } = await supabase
        .from('collaboration_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Request update error:', updateError);
        throw new Error('Failed to update collaboration request status');
      }

      // Step 2: Create shared idea entry to grant backend access
      const { error: shareError } = await supabase
        .from('shared_ideas')
        .insert({
          idea_id: request.idea_id,
          owner_id: request.requester_id,
          collaborator_id: user.id,
          permission_level: permissionLevel
        });

      if (shareError) {
        console.error('Share creation error:', shareError);

        // Rollback the request status if sharing fails
        await supabase
          .from('collaboration_requests')
          .update({
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        throw new Error('Failed to create collaboration access. Please try again.');
      }

      toast({
        title: 'Collaboration Accepted!',
        description: `You now have ${permissionLevel} access to "${ideaTitle}"`,
      });

      // Refresh all collaboration data
      await Promise.all([
        fetchPendingRequests(),
        fetchSharedIdeas(),
        fetchSentRequests()
      ]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept collaboration request';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Decline collaboration request
  const declineCollaborationRequest = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('collaboration_requests')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('recipient_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collaboration request declined',
      });

      // Refresh pending requests
      await fetchPendingRequests();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline collaboration request';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Initialize data and set up real-time subscriptions
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPendingRequests(),
          fetchSentRequests(),
          fetchSharedIdeas()
        ]);
      } catch (err) {
        console.error('Failed to initialize collaboration data:', err);
      } finally {
        setLoading(false);
      }
    };

    const setupSubscriptions = async () => {
      // Set up real-time subscriptions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to collaboration requests where user is recipient
      const requestsSubscription = supabase
        .channel('collaboration_requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'collaboration_requests',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            fetchPendingRequests();
          }
        )
        .subscribe();

      // Subscribe to shared ideas where user is collaborator
      const sharedIdeasSubscription = supabase
        .channel('shared_ideas')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'shared_ideas',
            filter: `collaborator_id=eq.${user.id}`,
          },
          () => {
            fetchSharedIdeas();
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        requestsSubscription.unsubscribe();
        sharedIdeasSubscription.unsubscribe();
      };
    };

    initializeData();
    const cleanupPromise = setupSubscriptions();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, []);

  // Force cleanup of inconsistent collaboration data
  const cleanupCollaborationData = async (ideaId: string, recipientEmail: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recipient ID
      const { data: recipientId } = await supabase
        .rpc('get_user_id_by_email', { user_email: recipientEmail });

      if (!recipientId) return;

      // Remove any accepted requests that don't have corresponding shared_ideas
      await supabase
        .from('collaboration_requests')
        .delete()
        .eq('idea_id', ideaId)
        .eq('recipient_id', recipientId)
        .eq('status', 'accepted')
        .not('id', 'in', `(
          SELECT cr.id
          FROM collaboration_requests cr
          INNER JOIN shared_ideas si
          ON cr.idea_id = si.idea_id
          AND cr.recipient_id = si.collaborator_id
          WHERE cr.status = 'accepted'
        )`);

      // Also remove any declined requests to allow re-invitation
      await supabase
        .from('collaboration_requests')
        .delete()
        .eq('idea_id', ideaId)
        .eq('recipient_id', recipientId)
        .eq('status', 'declined');

      console.log('Cleaned up inconsistent collaboration data');
    } catch (error) {
      console.error('Failed to cleanup collaboration data:', error);
    }
  };

  return {
    pendingRequests,
    sentRequests,
    sharedIdeas,
    loading,
    error,
    sendCollaborationRequest,
    acceptCollaborationRequest,
    declineCollaborationRequest,
    cleanupCollaborationData,
    refreshData: async () => {
      await Promise.all([
        fetchPendingRequests(),
        fetchSentRequests(),
        fetchSharedIdeas()
      ]);
    }
  };
}
