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
  id: number;
  name: string;
  description: string;
  similarity: number;
  similarityPercentage: string;
}

/**
 * Advanced similarity calculation for fallback mode
 */
function calculateAdvancedSimilarity(query: string, title: string, description: string, category: string): number {
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
  
  score += Math.min(wordMatches, 5);
  
  return Math.max(0, Math.min(10, score));
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
    const { query, limit = 10, minSimilarity = 0.7 } = await req.json();

    if (!query || typeof query !== 'string') {
      throw new Error('Query is required and must be a string');
    }

    console.log(`Searching for: "${query}" with limit: ${limit}, minSimilarity: ${minSimilarity}`);

    // Debug environment variables
    console.log('Available environment variables:');
    console.log('VITE_SUPABASE_URL_2:', Deno.env.get('VITE_SUPABASE_URL_2') ? 'SET' : 'NOT SET');
    console.log('VITE_SUPABASE_ANON_TOKEN_2:', Deno.env.get('VITE_SUPABASE_ANON_TOKEN_2') ? 'SET' : 'NOT SET');
    console.log('VITE_GEMINI_API_TOKEN_3:', Deno.env.get('VITE_GEMINI_API_TOKEN_3') ? 'SET' : 'NOT SET');

    // Initialize Supabase client for the 2nd database (120k Product Hunt ideas)
    const supabaseUrl2 = Deno.env.get('VITE_SUPABASE_URL_2')
    const supabaseKey2 = Deno.env.get('VITE_SUPABASE_ANON_TOKEN_2')
    
    if (!supabaseUrl2 || !supabaseKey2) {
      console.log('Second database credentials not available, using fallback to main database');
      
      // Fallback to main database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Search in the main ideas table as fallback
      const { data: fallbackIdeas, error: fallbackError } = await supabase
        .from('ideas')
        .select('id, title, description, category, user_id, created_at')
        .or(`title.ilike.%${query.substring(0, 50)}%,description.ilike.%${query.substring(0, 50)}%`)
        .limit(Math.min(limit, 20));

      if (fallbackError) {
        throw new Error(`Fallback search failed: ${fallbackError.message}`);
      }

             // Enhanced semantic similarity scoring for fallback
       const results = (fallbackIdeas || []).map((idea: any, index: number) => {
         const advancedScore = calculateAdvancedSimilarity(query, idea.title, idea.description, idea.category);
         const similarity = Math.min(advancedScore / 10.0, 1.0); // Convert 0-10 to 0-1 scale
         
         return {
           rank: index + 1,
           id: idea.id,
           name: idea.title,
           description: idea.description,
           similarity: Math.round(similarity * 100) / 100,
           similarityPercentage: `${Math.round(similarity * 100)}%`,
           upvotes: 0,
           category_tags: idea.category,
           websites: null,
           makers: null
         };
       })
       .filter((idea: any) => idea.similarity >= Math.max(minSimilarity, 0.3)) // Higher threshold for better results
       .sort((a: any, b: any) => b.similarity - a.similarity);

      console.log(`Fallback search found ${results.length} results`);

      return new Response(
        JSON.stringify({
          success: true,
          results,
          query,
          totalFound: results.length,
          searchParams: { limit, minSimilarity },
          fallback: true,
          message: 'Using fallback search - configure second database for Product Hunt data'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const supabase2 = createClient(supabaseUrl2, supabaseKey2)
    console.log('Using 2nd Supabase database for Product Hunt ideas:', supabaseUrl2.substring(0, 30) + '...');

    // Use Gemini AI to understand the idea and create intelligent search strategy
    const GEMINI_API_KEY = Deno.env.get('VITE_GEMINI_API_TOKEN_3');
    
    if (!GEMINI_API_KEY) {
      console.log('⚠️  Gemini API key not configured, using basic Product Hunt search');
      
      // Basic fallback - fetch some Product Hunt data for simple search
      const { data: basicIdeas, error: basicError } = await supabase2
        .from('product_hunt_products')
        .select('id, name, product_description, upvotes, category_tags, websites, makers')
        .limit(200);

      if (basicError || !basicIdeas?.length) {
        console.error('Failed to fetch basic Product Hunt ideas:', basicError);
        // Final fallback to main database
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: fallbackIdeas, error: fallbackError } = await supabase
          .from('ideas')
          .select('id, title, description, category, user_id, created_at')
          .or(`title.ilike.%${query.substring(0, 50)}%,description.ilike.%${query.substring(0, 50)}%`)
          .limit(Math.min(limit, 20));

        const results = (fallbackIdeas || []).map((idea: any, index: number) => ({
          rank: index + 1,
          id: idea.id,
          name: idea.title,
          description: idea.description,
          similarity: 0.5,
          similarityPercentage: "50%",
          upvotes: 0,
          category_tags: idea.category,
          websites: null,
          makers: null
        }));

        return new Response(JSON.stringify({
          success: true,
          results,
          query,
          totalFound: results.length,
          fallback: true,
          message: 'Using fallback search - configure environment variables for full Product Hunt access'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Basic Product Hunt search without Gemini
      const basicResults = basicIdeas.map((idea: any, index: number) => {
        const queryLower = query.toLowerCase();
        const nameLower = (idea.name || '').toLowerCase();
        const descLower = (idea.product_description || '').toLowerCase();
        const tagsLower = (idea.category_tags || '').toLowerCase();
        
        let score = 0;
        
        // Basic text matching
        if (nameLower.includes(queryLower)) score += 3;
        if (descLower.includes(queryLower)) score += 2;
        if (tagsLower.includes(queryLower)) score += 2;
        
        // Word matching
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        for (const word of queryWords) {
          if (nameLower.includes(word)) score += 1;
          if (descLower.includes(word)) score += 0.5;
          if (tagsLower.includes(word)) score += 0.5;
        }
        
        return {
          rank: index + 1,
          id: idea.id,
          name: idea.name,
          description: idea.product_description,
          similarity: Math.min(score / 10.0, 1.0),
          similarityPercentage: `${Math.round((score / 10.0) * 100)}%`,
          upvotes: idea.upvotes || 0,
          category_tags: idea.category_tags,
          websites: idea.websites,
          makers: idea.makers
        };
      })
      .filter((idea: any) => idea.similarity >= 0.1)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit);

      return new Response(
        JSON.stringify({
          success: true,
          results: basicResults,
          query,
          totalFound: basicResults.length,
          searchParams: { limit, minSimilarity },
          fallback: true,
          message: 'Using basic Product Hunt search - configure Gemini API key for AI-powered analysis'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 🤖 GEMINI-FIRST APPROACH - Deep Understanding & Intelligent Search
    console.log('🧠 STEP 1: Sending idea to Gemini for deep understanding...');
    
    const understandingPrompt = `
You are an expert startup analyst with deep knowledge of 120,000+ Product Hunt products. 

STARTUP IDEA TO ANALYZE: "${query}"

Please provide a comprehensive analysis in JSON format:

{
  "concept_understanding": "Deep analysis of what this idea is about",
  "core_keywords": ["primary keyword 1", "primary keyword 2", "primary keyword 3"],
  "related_categories": ["category1", "category2", "category3", "category4"],
  "search_terms": ["search term 1", "search term 2", "search term 3", "search term 4", "search term 5"],
  "technology_stack": ["tech1", "tech2", "tech3"],
  "target_audience": ["audience1", "audience2"],
  "business_model": "description of likely business model",
  "competitive_landscape": "what types of products would compete",
  "search_strategy": {
    "must_have_keywords": ["essential word 1", "essential word 2"],
    "should_have_keywords": ["nice word 1", "nice word 2", "nice word 3"],
    "category_filters": ["cat1", "cat2", "cat3"],
    "exclude_keywords": ["avoid1", "avoid2"]
  }
}

Be comprehensive and strategic - this will guide searching through 120,000 Product Hunt products.
`;

    let understandingResponse;
    try {
      understandingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: understandingPrompt }] }],
          generationConfig: { temperature: 0.2 }
        })
      });

      if (!understandingResponse.ok) {
        throw new Error(`Gemini understanding failed: ${understandingResponse.status}`);
      }
    } catch (error) {
      console.error('⚠️  Gemini understanding failed, using basic search:', error);
      
      // Fallback to basic Product Hunt search
      const { data: basicIdeas, error: basicError } = await supabase2
        .from('product_hunt_products')
        .select('id, name, product_description, upvotes, category_tags, websites, makers')
        .or(`name.ilike.%${query}%,product_description.ilike.%${query}%,category_tags.ilike.%${query}%`)
        .limit(limit * 2);

      const basicResults = (basicIdeas || []).map((idea: any, index: number) => ({
        rank: index + 1,
        id: idea.id,
        name: idea.name,
        description: idea.product_description || 'No description available',
        similarity: 0.5,
        similarityPercentage: "50%",
        upvotes: idea.upvotes || 0,
        category_tags: idea.category_tags,
        websites: idea.websites,
        makers: idea.makers,
        geminiAnalysis: 'Basic search - Gemini analysis failed'
      })).slice(0, limit);

      return new Response(JSON.stringify({
        success: true,
        results: basicResults,
        query,
        totalFound: basicResults.length,
        fallback: true,
        message: 'Using basic search - Gemini AI analysis failed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const understandingResult = await understandingResponse.json();
    const understandingText = understandingResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🧠 Gemini understanding response:', understandingText);

    // Parse Gemini's understanding
    let geminiAnalysis;
    try {
      const jsonMatch = understandingText.match(/\{[\s\S]*\}/);
      geminiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        core_keywords: query.split(' '),
        search_terms: query.split(' '),
        search_strategy: {
          must_have_keywords: query.split(' '),
          should_have_keywords: [],
          category_filters: [],
          exclude_keywords: []
        }
      };
    } catch (e) {
      console.warn('Failed to parse Gemini understanding, using fallback');
      geminiAnalysis = {
        core_keywords: query.split(' '),
        search_terms: query.split(' '),
        search_strategy: {
          must_have_keywords: query.split(' '),
          should_have_keywords: [],
          category_filters: [],
          exclude_keywords: []
        }
      };
    }

    console.log('🎯 Gemini Analysis:', geminiAnalysis);

    // STEP 2: Intelligent Product Hunt Database Search based on Gemini Analysis
    console.log('🔍 STEP 2: Performing intelligent search across Product Hunt database...');
    
    // Build comprehensive search query based on Gemini's strategy
    const { search_strategy } = geminiAnalysis;
    let searchQueries: string[] = [];
    
    // Must-have keywords - critical terms
    if (search_strategy.must_have_keywords?.length) {
      for (const keyword of search_strategy.must_have_keywords) {
        searchQueries.push(`name.ilike.%${keyword}%,product_description.ilike.%${keyword}%,category_tags.ilike.%${keyword}%`);
      }
    }
    
    // Core search terms from analysis
    if (geminiAnalysis.search_terms?.length) {
      for (const term of geminiAnalysis.search_terms) {
        searchQueries.push(`name.ilike.%${term}%,product_description.ilike.%${term}%,category_tags.ilike.%${term}%`);
      }
    }
    
    // Core keywords
    if (geminiAnalysis.core_keywords?.length) {
      for (const keyword of geminiAnalysis.core_keywords) {
        searchQueries.push(`name.ilike.%${keyword}%,product_description.ilike.%${keyword}%,category_tags.ilike.%${keyword}%`);
      }
    }
    
    // If no specific strategy, use original query
    if (searchQueries.length === 0) {
      searchQueries.push(`name.ilike.%${query}%,product_description.ilike.%${query}%,category_tags.ilike.%${query}%`);
    }
    
    console.log(`🎯 Executing ${searchQueries.length} intelligent search queries...`);
    
    // Execute multiple strategic searches across Product Hunt database
    let allMatchingProducts: any[] = [];
    
    for (let i = 0; i < searchQueries.length; i++) {
      const searchQuery = searchQueries[i];
      console.log(`📊 Search ${i + 1}/${searchQueries.length}: ${searchQuery.substring(0, 100)}...`);
      
      try {
        const { data: matchingProducts, error: searchError } = await supabase2
          .from('product_hunt_products')
          .select('id, name, product_description, upvotes, category_tags, websites, makers')
          .or(searchQuery)
          .limit(500); // Get good coverage for each search
        
        if (searchError) {
          console.warn(`Search ${i + 1} failed:`, searchError);
          continue;
        }
        
        if (matchingProducts?.length) {
          allMatchingProducts.push(...matchingProducts);
          console.log(`✅ Search ${i + 1} found ${matchingProducts.length} products`);
        }
      } catch (searchError) {
        console.warn(`Search ${i + 1} error:`, searchError);
      }
    }
    
    // Remove duplicates
    const uniqueProducts = allMatchingProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log(`🎯 Total unique products found: ${uniqueProducts.length}`);
    
    if (uniqueProducts.length === 0) {
      console.log('❌ No products found with Gemini search strategy');
      return new Response(JSON.stringify({
        success: true,
        results: [],
        query,
        totalFound: 0,
        message: 'No matching products found in Product Hunt database using Gemini AI analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // STEP 3: Send all matched products to Gemini for final intelligent ranking
    console.log('🏆 STEP 3: Sending matched products to Gemini for final ranking...');
    
    // Take top products for Gemini analysis (limit due to token constraints)
    const topProducts = uniqueProducts
      .sort((a: any, b: any) => (b.upvotes || 0) - (a.upvotes || 0)) // Pre-sort by upvotes
      .slice(0, Math.min(50, uniqueProducts.length)); // Analyze top 50 products
    
    const rankingPrompt = `
You are an expert startup analyst. You previously analyzed this startup idea: "${query}"

Your analysis was: ${JSON.stringify(geminiAnalysis, null, 2)}

Now rank these Product Hunt products by how well they resonate with the original idea. Consider:
1. Concept similarity and market overlap
2. Business model alignment  
3. Target audience overlap
4. Competitive positioning
5. Innovation level
6. Market validation (upvotes)

PRODUCTS TO RANK:
${topProducts.map((product, index) => 
  `${index + 1}. "${product.name}" (${product.upvotes || 0} upvotes)
   Description: ${(product.product_description || '').substring(0, 300)}...
   Category: ${product.category_tags || 'Unknown'}
   Website: ${product.websites || 'None'}`
).join('\n\n')}

Return a JSON array with your ranking and reasoning:
[
  {
    "product_name": "exact product name",
    "resonance_score": 0.95,
    "reasoning": "why this product resonates with the original idea",
    "market_fit": "assessment of market alignment"
  }
]

Rank by how well each product resonates with "${query}".
`;

    let rankingResponse;
    try {
      rankingResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: rankingPrompt }] }],
          generationConfig: { temperature: 0.2 }
        })
      });
    } catch (error) {
      console.warn('⚠️  Gemini ranking failed, using basic sorting:', error);
      rankingResponse = null;
    }

    let finalResults = topProducts.slice(0, limit);

    if (rankingResponse?.ok) {
      const rankingResult = await rankingResponse.json();
      const rankingText = rankingResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('🤖 Gemini ranking response:', rankingText);
      
      try {
        const jsonMatch = rankingText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const geminiRanking = JSON.parse(jsonMatch[0]);
          console.log('✅ Final Gemini ranking received');
          
          // Reorder based on Gemini's detailed ranking
          const reorderedResults: any[] = [];
          for (const rankingItem of geminiRanking) {
            const productName = rankingItem.product_name || rankingItem.name;
            const product = topProducts.find((p: any) => p.name === productName);
            if (product) {
              reorderedResults.push({
                ...product,
                gemini_score: rankingItem.resonance_score || 0.5,
                gemini_reasoning: rankingItem.reasoning || 'No reasoning provided',
                market_fit: rankingItem.market_fit || 'No assessment provided'
              });
            }
          }
          
          // Add any remaining products not ranked by Gemini
          const rankedNames = geminiRanking.map((r: any) => r.product_name || r.name);
          const remaining = topProducts.filter((p: any) => !rankedNames.includes(p.name));
          reorderedResults.push(...remaining.map((p: any) => ({
            ...p,
            gemini_score: 0.3,
            gemini_reasoning: 'Not specifically analyzed by Gemini',
            market_fit: 'Basic match'
          })));
          
          finalResults = reorderedResults.slice(0, limit);
        } else {
          console.warn('Could not parse Gemini ranking JSON');
        }
      } catch (e) {
        console.warn('Failed to parse Gemini ranking, using upvote sorting:', e);
      }
    } else {
      console.warn('Gemini ranking request failed, using upvote sorting');
    }

    console.log(`🎯 Gemini AI pipeline completed: ${finalResults.length} final results`);
    const filteredResults = finalResults;

        // Format results for frontend
    const results = filteredResults.map((idea: any, index: number) => {
      // Convert gemini_score to similarity for frontend compatibility
      const similarity = Math.min((idea.gemini_score || 0.5), 1.0);
      
      return {
        rank: index + 1,
        id: idea.id,
        name: idea.name,
        description: idea.product_description || 'No description available',
        similarity: Math.round(similarity * 100) / 100,
        similarityPercentage: `${Math.round(similarity * 100)}%`,
        upvotes: idea.upvotes || 0,
        category_tags: idea.category_tags,
        websites: idea.websites,
        makers: idea.makers,
        geminiAnalysis: idea.gemini_reasoning || idea.market_fit || 'Gemini AI analysis'
      };
    });

    console.log(`Found ${results.length} similar ideas`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        query,
        totalFound: results.length,
        searchParams: {
          limit,
          minSimilarity
        }
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('Error in similarity search:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        results: []
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
}); 