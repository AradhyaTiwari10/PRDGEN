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

      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, description, content, category, status, priority, market_size, competition, notes, is_favorite, user_id, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
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

      const { data, error } = await supabase
        .from('ideas')
        .insert([{ ...idea, user_id: user.id }])
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
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setIdeas(prev => prev.map(idea => idea.id === id ? data : idea));
      toast({
        title: 'Success',
        description: 'Idea updated successfully',
      });
      return data;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update idea',
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