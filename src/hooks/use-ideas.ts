import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Idea, IdeaCollection } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [collections, setCollections] = useState<IdeaCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchIdeas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch user's own ideas
      const { data: ownIdeas, error: ownError } = await supabase
        .from('ideas')
        .select('id, title, description, content, category, status, priority, market_size, competition, notes, is_favorite, user_id, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ownError) throw ownError;

      // Fetch shared ideas (ideas shared with this user)
      const { data: sharedIdeasData, error: sharedError } = await supabase
        .from('shared_ideas')
        .select(`
          idea_id,
          permission_level,
          ideas!inner(id, title, description, content, category, status, priority, market_size, competition, notes, is_favorite, user_id, created_at, updated_at)
        `)
        .eq('collaborator_id', user.id);

      let sharedIdeas: Idea[] = [];
      if (!sharedError && sharedIdeasData) {
        sharedIdeas = sharedIdeasData.map(shared => ({
          ...shared.ideas,
          // Add a flag to indicate this is a shared idea
          is_shared: true,
          permission_level: shared.permission_level
        })) as Idea[];
      }

      // Combine own ideas and shared ideas
      const allIdeas = [...(ownIdeas || []), ...sharedIdeas];

      // Sort by created_at descending
      allIdeas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setIdeas(allIdeas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
      toast({
        title: 'Error',
        description: 'Failed to fetch ideas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('idea_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
      toast({
        title: 'Error',
        description: 'Failed to fetch collections',
        variant: 'destructive',
      });
    }
  };

  const createIdea = async (idea: Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create initial content template for the BlockNote editor
      const initialContentTemplate = [
        {
          id: "title",
          type: "heading",
          props: { level: 1 },
          content: idea.title || "Your Idea Title"
        },
        {
          id: "overview",
          type: "heading",
          props: { level: 2 },
          content: "📝 Idea Overview"
        },
        {
          id: "description",
          type: "paragraph",
          content: idea.description || "Describe your idea in detail here..."
        },
        {
          id: "problem",
          type: "heading",
          props: { level: 2 },
          content: "❗ Problem Statement"
        },
        {
          id: "problem-content",
          type: "paragraph",
          content: "What specific problem does your idea solve? Who experiences this problem and how often?"
        },
        {
          id: "solution",
          type: "heading",
          props: { level: 2 },
          content: "💡 Proposed Solution"
        },
        {
          id: "solution-content",
          type: "paragraph",
          content: "How does your idea solve the problem? What makes it unique or better than existing solutions?"
        },
        {
          id: "target-audience",
          type: "heading",
          props: { level: 2 },
          content: "🎯 Target Audience"
        },
        {
          id: "target-content",
          type: "paragraph",
          content: "Who are your primary users? Demographics, behaviors, needs, and pain points."
        },
        {
          id: "key-features",
          type: "heading",
          props: { level: 2 },
          content: "⭐ Key Features"
        },
        {
          id: "features-list",
          type: "bulletListItem",
          content: "Core feature 1"
        },
        {
          id: "features-list-2",
          type: "bulletListItem",
          content: "Core feature 2"
        },
        {
          id: "features-list-3",
          type: "bulletListItem",
          content: "Core feature 3"
        },
        {
          id: "market",
          type: "heading",
          props: { level: 2 },
          content: "📊 Market Analysis"
        },
        {
          id: "market-content",
          type: "paragraph",
          content: `Market Size: ${idea.market_size || "Research and define your total addressable market (TAM)"}`
        },
        {
          id: "competition-content",
          type: "paragraph",
          content: `Competition: ${idea.competition || "Identify direct and indirect competitors, their strengths and weaknesses"}`
        },
        {
          id: "next-steps",
          type: "heading",
          props: { level: 2 },
          content: "🚀 Next Steps"
        },
        {
          id: "steps-list",
          type: "numberedListItem",
          content: "Validate the problem with potential users"
        },
        {
          id: "steps-list-2",
          type: "numberedListItem",
          content: "Create a minimum viable product (MVP)"
        },
        {
          id: "steps-list-3",
          type: "numberedListItem",
          content: "Test with early adopters and gather feedback"
        },
        {
          id: "notes",
          type: "heading",
          props: { level: 2 },
          content: "📋 Additional Notes"
        },
        {
          id: "notes-content",
          type: "paragraph",
          content: idea.notes || "Add any additional thoughts, resources, or considerations here..."
        }
      ];

      // Convert template to JSON string for storage
      const contentString = JSON.stringify(initialContentTemplate);

      const { data, error } = await supabase
        .from('ideas')
        .insert([{ 
          ...idea, 
          user_id: user.id,
          content: contentString // Add the pre-written template
        }])
        .select()
        .single();

      if (error) throw error;
      setIdeas(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Idea created successfully',
      });
      return data;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create idea',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user owns the idea or has write permission
      const currentIdea = ideas.find(idea => idea.id === id);
      if (!currentIdea) {
        throw new Error('Idea not found');
      }

      // If it's a shared idea, check write permission
      if (currentIdea.is_shared && currentIdea.permission_level === 'view') {
        throw new Error('You do not have edit permission for this idea');
      }

      // Build the query
      let query = supabase
        .from('ideas')
        .update(updates)
        .eq('id', id);

      // Only add user_id check if it's not a shared idea
      if (!currentIdea.is_shared) {
        query = query.eq('user_id', user.id);
      }

      // Use maybeSingle() instead of single() to handle cases where no rows are updated
      const { data, error } = await query.select().maybeSingle();

      if (error) throw error;

      // If no data returned, it means the update didn't affect any rows
      if (!data) {
        throw new Error('Failed to update idea - no rows affected');
      }

      setIdeas(prev => prev.map(idea => idea.id === id ? { ...data, is_shared: idea.is_shared, permission_level: idea.permission_level } : idea));
      toast({
        title: 'Success',
        description: 'Idea updated successfully',
      });
      return data;
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update idea',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      toast({
        title: 'Success',
        description: 'Idea deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete idea',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const createCollection = async (collection: Omit<IdeaCollection, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('idea_collections')
        .insert([{ ...collection, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCollections(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Collection created successfully',
      });
      return data;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchIdeas();
    fetchCollections();
  }, []);

  return {
    ideas,
    collections,
    loading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
    createCollection,
    refreshIdeas: fetchIdeas,
    refreshCollections: fetchCollections,
  };
} 