import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SimilarIdea {
  rank: number;
  id: number;
  name: string;
  description: string;
  similarity: number;
  similarityPercentage: string;
  upvotes?: number;
  category_tags?: string;
  websites?: string;
  makers?: string;
}

export interface SimilaritySearchResult {
  ideas: SimilarIdea[];
  query: string;
  searchTime: number;
  fallback?: boolean;
  message?: string;
}

export function useSimilaritySearch() {
  const [results, setResults] = useState<SimilaritySearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSimilarIdeas = async (
    query: string, 
    limit: number = 10,
    minSimilarity: number = 0.7
  ) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('similarity-search', {
        body: { 
          query: query.trim(),
          limit,
          minSimilarity
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to search for similar ideas');
      }

      // Filter results by minimum similarity threshold
      const filteredResults = data?.results?.filter(
        (result: SimilarIdea) => result.similarity >= minSimilarity
      ) || [];

      const searchTime = Date.now() - startTime;

      setResults({
        ideas: filteredResults,
        query: query.trim(),
        searchTime,
        fallback: data?.fallback,
        message: data?.message
      });
    } catch (err) {
      console.error('Similarity search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search for similar ideas');
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    isSearching,
    error,
    searchSimilarIdeas,
    clearResults,
  };
} 