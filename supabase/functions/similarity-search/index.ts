// @ts-ignore - Deno environment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore - Deno environment  
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Deno global types declaration
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SimilarIdea {
  rank: number;
  id: string;
  name: string;
  description: string;
  similarity: number;
  similarityPercentage: string;
  upvotes?: number;
  category_tags?: string;
  websites?: string;
  makers?: string;
}

/**
 * Calculate similarity score between query and idea
 */
function calculateSimilarity(query: string, title: string, description: string, category: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  
  let score = 0;
  
  // Exact matches get highest score
  if (titleLower === queryLower) score += 10;
  else if (titleLower.includes(queryLower)) score += 7;
  else if (queryLower.includes(titleLower) && titleLower.length > 3) score += 6;
  
  // Description matching
  if (descLower.includes(queryLower)) score += 5;
  
  // Category matching
  if (categoryLower.includes(queryLower)) score += 4;
  
  // Word-level matching
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  let wordMatches = 0;
  
  for (const word of queryWords) {
    if (titleLower.includes(word)) wordMatches += 2;
    if (descLower.includes(word)) wordMatches += 1;
    if (categoryLower.includes(word)) wordMatches += 1;
  }
  
  score += Math.min(wordMatches, 8);
  
  // Convert to 0-1 scale
  return Math.max(0, Math.min(1, score / 15));
}

/**
 * Generate embedding using Google Gemini API
 */
async function generateGeminiEmbedding(text: string): Promise<number[]> {
  const GEMINI_API_KEY = Deno.env.get('VITE_GEMINI_API_TOKEN_3');
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{ text: text }]
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  
  if (data?.embedding?.values) {
    const embedding = data.embedding.values;
    
    // Gemini embeddings are 768-dimensional, pad to 1536
    if (embedding.length === 768) {
      return [...embedding, ...new Array(768).fill(0)];
    }
    
    return embedding;
  } else {
    throw new Error('Invalid response format from Gemini API');
  }
}

/**
 * Create a simple fallback embedding
 */
function createSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1536).fill(0);
  
  words.forEach((word, index) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const pos = Math.abs(hash) % 1536;
    embedding[pos] += 1;
    
    const lengthPos = (pos + word.length) % 1536;
    embedding[lengthPos] += 0.5;
    
    const positionPos = (pos + index) % 1536;
    embedding[positionPos] += 0.3;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders 
    });
  }

  try {
    const { query, limit = 10, minSimilarity = 0.1 } = await req.json();

    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    console.log(`🔍 Searching for: "${query}" with limit: ${limit}, minSimilarity: ${minSimilarity}`);

    // Get Product Hunt database connection (Supabase 2)
    const productHuntUrl = Deno.env.get('VITE_SUPABASE_URL_2');
    const productHuntKey = Deno.env.get('VITE_SUPABASE_ANON_KEY_2');
    
    if (!productHuntUrl || !productHuntKey) {
      throw new Error('Product Hunt database credentials not configured');
    }

    const productHuntSupabase = createClient(productHuntUrl, productHuntKey);

    // Search in the Product Hunt products table
    const searchQuery = query.substring(0, 100); // Limit query length
    const { data: products, error } = await productHuntSupabase
        .from('product_hunt_products')
        .select('id, name, product_description, category_tags, upvotes, websites, makers')
        .or(`name.ilike.%${searchQuery}%,product_description.ilike.%${searchQuery}%,category_tags.ilike.%${searchQuery}%`)
        .limit(Math.min(limit * 3, 50)); // Get more results for better filtering

    if (error) {
      console.error('Database search error:', error);
      throw new Error(`Search failed: ${error.message}`);
      }

    console.log(`📊 Found ${products?.length || 0} potential matches from Product Hunt`);

    // Calculate similarity scores and filter
    const results = (products || [])
      .map((product: any, index: number) => {
        const similarity = calculateSimilarity(query, product.name, product.product_description, product.category_tags);
         
         return {
           rank: index + 1,
           id: product.id,
           name: product.name,
           description: product.product_description,
           similarity: Math.round(similarity * 100) / 100,
           similarityPercentage: `${Math.round(similarity * 100)}%`,
          upvotes: product.upvotes || 0,
          category_tags: product.category_tags,
          websites: product.websites,
          makers: product.makers
        };
      })
      .filter((idea: any) => idea.similarity >= minSimilarity)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((idea: any, index: number) => ({
        ...idea,
        rank: index + 1
      }));

    console.log(`✅ Returning ${results.length} similar ideas`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        query,
        totalFound: results.length,
        searchParams: { limit, minSimilarity },
        fallback: false,
        message: 'Searching Product Hunt database for similar products'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Similarity search error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Search failed',
        results: [],
        query: '',
        totalFound: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}); 