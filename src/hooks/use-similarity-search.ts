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
  totalFound: number;
  filteredOut: number;
}

// New interface for storing search results in backend
export interface SavedSimilaritySearch {
  id: string;
  idea_id: string;
  search_query: string;
  results: SimilarIdea[];
  created_at: string;
  total_found: number;
  filtered_out: number;
}

export function useSimilaritySearch() {
  const [results, setResults] = useState<SimilaritySearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<SavedSimilaritySearch | null>(null);

  // Load saved search results for an idea
  const loadSavedResults = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from('similarity_searches')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading saved similarity search:', error);
        return;
      }

      if (data) {
        setSavedResults(data);
        setResults({
          ideas: data.results,
          query: data.search_query,
          searchTime: 0,
          totalFound: data.total_found,
          filteredOut: data.filtered_out
        });
      }
    } catch (error) {
      console.error('Failed to load saved similarity search:', error);
    }
  };

  // Save search results to backend
  const saveSearchResults = async (
    ideaId: string,
    searchQuery: string,
    searchResults: SimilaritySearchResult
  ) => {
    try {
      const { error } = await supabase
        .from('similarity_searches')
        .upsert({
          idea_id: ideaId,
          search_query: searchQuery,
          results: searchResults.ideas,
          total_found: searchResults.totalFound,
          filtered_out: searchResults.filteredOut
        }, {
          onConflict: 'idea_id'
        });

      if (error) {
        console.error('Error saving similarity search:', error);
      }
    } catch (error) {
      console.error('Failed to save similarity search:', error);
    }
  };

  const searchSimilarIdeas = async (
    query: string, 
    ideaId?: string,
    limit: number = 15,
    minSimilarity: number = 0.5 // Set to 50% compatibility threshold
  ) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    const startTime = Date.now();

    try {
      // First try the Supabase edge function
      const { data, error } = await supabase.functions.invoke('similarity-search', {
        body: { 
          query: query.trim(),
          limit: 100, // Request more results for better filtering
          minSimilarity: 0.2 // Slightly higher base threshold
        }
      });

      if (error) {
        console.warn('Supabase edge function failed, trying local API:', error);
        throw new Error('Edge function failed');
      }

      // Enhanced result processing with improved scoring
      const allResults = data?.results || [];
      
      // Apply enhanced filtering and ranking
      const processedResults = allResults
        .filter((result: SimilarIdea) => result.similarity >= minSimilarity)
        .map((result: SimilarIdea) => ({
          ...result,
          // Boost score based on upvotes and category relevance
          adjustedSimilarity: result.similarity + 
            (result.upvotes ? Math.min(result.upvotes / 10000, 0.1) : 0)
        }))
        .sort((a: any, b: any) => b.adjustedSimilarity - a.adjustedSimilarity);
      
      // Take top results after enhanced sorting
      const finalResults = processedResults.slice(0, limit);
      
      const searchTime = Date.now() - startTime;
      const searchResult: SimilaritySearchResult = {
        ideas: finalResults,
        query: query.trim(),
        searchTime,
        fallback: data?.fallback,
        message: data?.message,
        totalFound: allResults.length,
        filteredOut: allResults.length - finalResults.length
      };

      setResults(searchResult);

      // Save results to backend if ideaId is provided
      if (ideaId && finalResults.length > 0) {
        await saveSearchResults(ideaId, query.trim(), searchResult);
      }

    } catch (edgeFunctionError) {
      console.log('🔄 Edge function failed, trying local API fallback...');
      
      try {
        // Fallback to local API server
        const response = await fetch('http://localhost:8081/api/similarity-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            limit: 50, // Request more for filtering
            minSimilarity: 0.1
          }),
        });

        if (!response.ok) {
          throw new Error(`Local API error: ${response.status}`);
        }

        const data = await response.json();
        const allResults = data.results || [];
        
        // Apply 50% similarity filter
        const highQualityResults = allResults.filter(
          (result: SimilarIdea) => result.similarity >= minSimilarity
        );
        
        const finalResults = highQualityResults.slice(0, limit);
        const searchTime = Date.now() - startTime;

        const searchResult: SimilaritySearchResult = {
          ideas: finalResults,
          query: query.trim(),
          searchTime,
          fallback: true,
          message: data.message || 'Using local similarity search',
          totalFound: allResults.length,
          filteredOut: allResults.length - finalResults.length
        };

        setResults(searchResult);

        // Save results to backend if ideaId is provided
        if (ideaId && finalResults.length > 0) {
          await saveSearchResults(ideaId, query.trim(), searchResult);
        }

      } catch (localApiError) {
        console.error('Both edge function and local API failed:', localApiError);
        setError('Similarity search is currently unavailable. Please try again later.');
        setResults(null);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
    setSavedResults(null);
  };

  return {
    results,
    isSearching,
    error,
    savedResults,
    searchSimilarIdeas,
    clearResults,
    loadSavedResults,
  };
} 