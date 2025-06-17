import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IdeaConversation, Idea } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { generateAssistantResponse, generateWelcomeMessage } from '@/lib/idea-assistant';

export function useIdeaConversations(ideaId: string, idea?: Idea) {
  const [conversations, setConversations] = useState<IdeaConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('idea_conversations')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('idea_conversations table does not exist yet. Please run the database migration.');
          setError('Database table not found. Please contact support.');
          toast({
            title: 'Setup Required',
            description: 'AI Assistant database table needs to be created. Please contact support.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      setConversations(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch conversation history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (message: string, role: 'user' | 'assistant') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('idea_conversations')
        .insert([{
          idea_id: ideaId,
          user_id: user.id,
          message,
          role
        }])
        .select()
        .single();

      if (error) {
        // Check if it's a table not found error
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.warn('idea_conversations table does not exist yet.');
          toast({
            title: 'Setup Required',
            description: 'AI Assistant database table needs to be created.',
            variant: 'destructive',
          });
          return null;
        }
        throw error;
      }

      setConversations(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding message:', err);
      toast({
        title: 'Error',
        description: 'Failed to save message',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const sendMessage = async (userMessage: string, onTypingStart?: (response: string) => void) => {
    if (!idea) {
      toast({
        title: 'Error',
        description: 'Idea context not available',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Add user message
      await addMessage(userMessage, 'user');

      // Generate AI response
      const assistantResponse = await generateAssistantResponse(
        idea,
        userMessage,
        conversations
      );

      // Start typing animation if callback provided
      if (onTypingStart) {
        onTypingStart(assistantResponse);
      } else {
        // Add assistant message directly if no typing animation
        await addMessage(assistantResponse, 'assistant');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const addTypedMessage = async (message: string) => {
    try {
      await addMessage(message, 'assistant');
    } catch (err) {
      console.error('Error adding typed message:', err);
    }
  };

  const initializeConversation = async (onWelcomeTypingStart?: (message: string) => void) => {
    if (!idea || conversations.length > 0) return;

    try {
      const welcomeMessage = await generateWelcomeMessage(idea);

      // Start typing animation for welcome message if callback provided
      if (onWelcomeTypingStart) {
        onWelcomeTypingStart(welcomeMessage);
      } else {
        await addMessage(welcomeMessage, 'assistant');
      }
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
    }
  };

  const clearConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('idea_conversations')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations([]);

      // Don't reinitialize here - let the component handle it with typing animation
      // The useEffect in IdeaAssistant will handle reinitialization

      toast({
        title: 'Success',
        description: 'Conversation cleared',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to clear conversation',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (ideaId) {
      fetchConversations();
    }
  }, [ideaId]);

  // Note: Initialization is now handled by the component with typing animation
  // This prevents duplicate welcome messages

  return {
    conversations,
    loading,
    sending,
    error,
    sendMessage,
    addTypedMessage,
    initializeConversation,
    clearConversation,
    refreshConversations: fetchConversations,
  };
}
