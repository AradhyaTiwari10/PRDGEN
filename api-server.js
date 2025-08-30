import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 8081;

// Initialize Gemini AI after environment variables are loaded
let genAI;
try {
  if (process.env.GEMINI_API_TOKEN) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_TOKEN);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.log('⚠️ GEMINI_API_TOKEN not found - Gemini features will be disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
}

// Middleware
app.use(cors());
app.use(express.json());

const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Generate a detailed, implementation-ready PRD structured with these 8 sections: Executive Summary, Product Overview, User Stories & Use Cases, Functional Requirements, Technical Requirements, Non-Functional Requirements, Implementation Phases, and Success Criteria. Each section must be comprehensive, specific, and actionable for developers/AI coding assistants, with technical detail, concrete examples, and clear KPIs.`;

// PRD Generation endpoint using Gemini
app.post('/api/generate-prd', async (req, res) => {
  try {
    const { idea, category, targetAudience } = req.body;

    if (!idea) {
      return res.status(400).json({
        error: 'Missing required field: idea'
      });
    }

    // Check if Gemini AI is available
    if (!genAI) {
      console.error('❌ Gemini AI not initialized');
      return res.status(500).json({
        error: 'Gemini AI not configured. Please check GEMINI_API_TOKEN environment variable.'
      });
    }

    console.log('🚀 Generating PRD with Gemini for:', idea.substring(0, 50) + '...');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = `Generate a comprehensive PRD (Product Requirements Document) for the following startup idea:

Idea: ${idea}
Category: ${category || 'To be determined'}
Target Audience: ${targetAudience || 'To be determined'}

Structure the PRD with the following sections:
1. Executive Summary
2. Product Overview
3. User Stories & Use Cases
4. Functional Requirements
5. Technical Requirements
6. Non-Functional Requirements
7. Implementation Phases
8. Success Criteria

Make sure each section is detailed, specific, and actionable for developers and product managers. Use clear formatting with headers, bullet points, and numbered lists where appropriate. Format in clean Markdown with clear hierarchical structure.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const prdContent = response.text();

    console.log('✅ PRD generated successfully with Gemini');
    
    res.json({ prd: prdContent });
  } catch (error) {
    console.error('❌ Error generating PRD with Gemini:', error);
    
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later or check your Gemini API limits.'
      });
    }
    if (error.message && error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      });
    }
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        error: 'Invalid API key. Please check your Gemini API configuration.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to generate PRD. Please try again.'
    });
  }
});

// Legacy DeepSeek PRD Generation endpoint (kept for backward compatibility)
app.post('/api/generate-prd-deepseek', async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({
        error: 'Missing required field: idea'
      });
    }

    // Use the DEEPSEEK_API_TOKEN from environment variables
    const apiKey = process.env.DEEPSEEK_API_TOKEN;
    
    if (!apiKey || apiKey === 'your_deepseek_api_token_here') {
      console.error('❌ DEEPSEEK_API_TOKEN not found or not configured properly');
      console.log('📝 Please set DEEPSEEK_API_TOKEN environment variable');
      console.log('🔗 Get your API key from: https://openrouter.ai/');
      return res.status(500).json({
        error: 'Deepseek API key not configured. Please set DEEPSEEK_API_TOKEN environment variable.'
      });
    }

    console.log('🚀 Generating PRD for:', idea.substring(0, 50) + '...');

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Product Idea: ${idea}\n\nPlease analyze this idea and automatically determine the most appropriate product category and target audience. Then generate a comprehensive PRD following the 8-section structure. Format in clean Markdown with clear hierarchical structure.`
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('❌ Deepseek API error:', error);
      return res.status(500).json({
        error: error.error?.message || `Deepseek API error: ${response.status}`
      });
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      console.error('❌ No response from Deepseek API');
      return res.status(500).json({
        error: 'No response from Deepseek API'
      });
    }

    const prdContent = result.choices[0].message.content;
    console.log('✅ PRD generated successfully');
    
    res.json({ prd: prdContent });
  } catch (error) {
    console.error('❌ Error generating PRD with Deepseek:', error);
    res.status(500).json({
      error: 'Failed to generate PRD. Please try again.'
    });
  }
});

// Idea Enhancement endpoint using Gemini
app.post('/api/enhance-idea', async (req, res) => {
  try {
    const { rawIdea } = req.body;

    if (!rawIdea || !rawIdea.trim()) {
      return res.status(400).json({
        error: 'Missing required field: rawIdea'
      });
    }

    // Check if Gemini AI is available
    if (!genAI) {
      console.error('❌ Gemini AI not initialized');
      return res.status(500).json({
        error: 'Gemini AI not configured. Please check GEMINI_API_TOKEN environment variable.'
      });
    }

    console.log('🚀 Enhancing idea with Gemini:', rawIdea.substring(0, 50) + '...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert product manager and idea evaluator. Take the following raw product idea and enhance it by providing structured, professional information.

Raw Idea: "${rawIdea}"

Please analyze this idea and return a JSON response with the following structure:
{
  "title": "Create a professional, branded-style product title that includes both a memorable brand name and a descriptive subtitle. Examples: 'SiteSpark AI: Website Builder', 'FocusFlow: Student Productivity', 'TaskMaster Pro: Project Management', 'CodeVault: Developer Portfolio'. Format: '[BrandName]: [Clear Description]' (max 60 characters total)",
  "description": "An improved, detailed description (2-3 sentences that clearly explain what the product does, who it's for, and what problem it solves)",
  "category": "Choose the most appropriate category from: Web Application, Mobile App, SaaS Platform, E-commerce, AI/ML Product, Developer Tool, Consumer App, Enterprise Software, API/Service, Other",
  "target_audience": "Who would use this product (be specific - e.g., 'Small business owners', 'Software developers', 'College students')",
  "market_size": "Estimated market size or potential user base",
  "competition": "Brief overview of existing solutions or competitors",
  "priority": "high, medium, or low - based on market demand and feasibility",
  "key_features": ["List", "3-5", "core", "features"],
  "problem_statement": "What specific problem does this solve?",
  "value_proposition": "Why would users choose this over alternatives?"
}

IMPORTANT: The title should be a professional, branded product name that sounds like a real startup/company name, followed by a colon and clear description of what it does. Make it memorable and professional. Examples:
- "StudySync: Academic Planner" 
- "BuildForge: Construction Manager"
- "DataPulse: Analytics Dashboard"
- "CreativeCast: Content Creator Hub"

Make sure your response is valid JSON only. Be realistic but optimistic in your assessment. Focus on making the idea clearer and more marketable while staying true to the original concept.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();

    // Try to parse the JSON response
    let enhancedIdea;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanContent = enhancedContent.replace(/```json|```/g, '').trim();
      enhancedIdea = JSON.parse(cleanContent);
      console.log('✅ Idea enhanced successfully');
    } catch (parseError) {
      console.error('❌ Error parsing Gemini response:', parseError);
      // Fallback response if JSON parsing fails
      enhancedIdea = {
        title: "Enhanced Product Idea",
        description: rawIdea,
        category: "Other",
        target_audience: "General users",
        market_size: "To be determined",
        competition: "Various existing solutions",
        priority: "medium",
        key_features: ["Core functionality", "User-friendly interface", "Reliable performance"],
        problem_statement: "Addresses user needs in the market",
        value_proposition: "Provides unique value to users"
      };
    }

    res.json({ enhancedIdea });
  } catch (error) {
    console.error('❌ Error enhancing idea with Gemini:', error);
    
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later or check your Gemini API limits.'
      });
    }
    if (error.message && error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      });
    }
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        error: 'Invalid API key. Please check your Gemini API configuration.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to enhance idea. Please try again.'
    });
  }
});

// Idea Assistant endpoint using Gemini
app.post('/api/idea-assistant', async (req, res) => {
  try {
    const { action, ideaContext, conversationHistory, userMessage } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'Missing action parameter'
      });
    }

    // Check if Gemini AI is available
    if (!genAI) {
      console.error('❌ Gemini AI not initialized for idea assistant');
      return res.status(500).json({
        error: 'Gemini AI not configured. Please check GEMINI_API_TOKEN environment variable.'
      });
    }

    console.log(`🤖 Processing idea assistant ${action}:`, userMessage ? userMessage.substring(0, 50) + '...' : 'welcome message');

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300, // Reduced for concise responses
      }
    });

    const ASSISTANT_SYSTEM_PROMPT = `You are Nexi, an expert Product Development Assistant who gives sharp, actionable advice.

COMMUNICATION STYLE:
• Keep responses under 100 words when possible
• Use bullet points and structured formats
• Be direct and on-point - no fluff
• Focus on 2-3 key insights max per response
• Always end with 1 clear next step
• Use emojis sparingly but effectively

YOUR EXPERTISE:
Product strategy • Market analysis • UX design • Business models • Go-to-market • Risk assessment

Be engaging, concise, and immediately actionable. Users want valuable insights, not lengthy explanations.`;

    if (action === 'welcome') {
      const welcomePrompt = `${ASSISTANT_SYSTEM_PROMPT}

IDEA CONTEXT:
${ideaContext}

Generate a brief, energetic welcome message (60-80 words max). Be:
• Encouraging and specific to their idea
• Mention 2 key areas I can help with
• End with an engaging question to start conversation

Format: Greeting → Quick insight → 2 help areas → Question to engage`;

      const result = await model.generateContent(welcomePrompt);
      const response = await result.response;
      console.log('✅ Welcome message generated successfully');
      return res.json({ message: response.text() });
    }

    if (action === 'chat') {
      if (!userMessage || !ideaContext) {
        return res.status(400).json({
          error: 'Missing userMessage or ideaContext for chat'
        });
      }

      const conversationContext = conversationHistory && conversationHistory.length > 0
        ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-10).map((msg) => `${msg.role}: ${msg.message}`).join('\n')}`
        : '';

      const chatPrompt = `${ASSISTANT_SYSTEM_PROMPT}

IDEA CONTEXT:
${ideaContext}${conversationContext}

USER QUESTION: "${userMessage}"

Give a sharp, focused response (60-100 words):
• Address their specific question directly
• Provide 2-3 bullet points with actionable insights
• End with 1 clear next step
• Reference their idea context when relevant

Be concise, valuable, and engaging - no lengthy explanations!`;

      const result = await model.generateContent(chatPrompt);
      const response = await result.response;
      console.log('✅ Chat response generated successfully');
      return res.json({ message: response.text() });
    }

    return res.status(400).json({
      error: 'Invalid action. Use "welcome" or "chat"'
    });
  } catch (error) {
    console.error('❌ Error in idea assistant:', error);
    
    // Handle specific Gemini API errors
    if (error.message && error.message.includes('quota')) {
      return res.status(429).json({
        error: 'API quota exceeded. Please try again later or check your Gemini API limits.'
      });
    }
    if (error.message && error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      });
    }
    if (error.message && error.message.includes('API key')) {
      return res.status(401).json({
        error: 'Invalid API key. Please check your Gemini API configuration.'
      });
    }
    
    res.status(500).json({
      error: 'Failed to generate response. Please try again.'
    });
  }
});

// Similarity Search endpoint using Product Hunt database
app.post('/api/similarity-search', async (req, res) => {
  try {
    const { query, limit = 10, minSimilarity = 0.1 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    console.log(`🔍 Product Hunt similarity search for: "${query}"`);

    // Check if Product Hunt database credentials are available
    const productHuntUrl = process.env.VITE_SUPABASE_URL_2;
    const productHuntKey = process.env.VITE_SUPABASE_ANON_KEY_2;

    console.log('🔍 Debug - Product Hunt URL:', productHuntUrl ? 'Set' : 'Not set');
    console.log('🔍 Debug - Product Hunt Key:', productHuntKey ? 'Set' : 'Not set');

    if (!productHuntUrl || !productHuntKey) {
      console.error('❌ Product Hunt database credentials not configured');
      console.error('❌ Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      return res.status(500).json({
        error: 'Product Hunt database not configured. Please set VITE_SUPABASE_URL_2 and VITE_SUPABASE_ANON_KEY_2 environment variables.'
      });
    }

    // Create Product Hunt database client
    const { createClient } = await import('@supabase/supabase-js');
    const productHuntSupabase = createClient(productHuntUrl, productHuntKey);

    // Search in Product Hunt products table with improved query processing
    const searchQuery = query.substring(0, 100);
    
    // Extract key terms for broader search
    const keyTerms = searchQuery.toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .slice(0, 5); // Take first 5 meaningful terms
    
    // Create multiple search patterns
    const searchPatterns = [
      // Full query search
      `name.ilike.%${searchQuery}%,product_description.ilike.%${searchQuery}%,category_tags.ilike.%${searchQuery}%`,
      // Individual term search
      ...keyTerms.map(term => `name.ilike.%${term}%,product_description.ilike.%${term}%,category_tags.ilike.%${term}%`)
    ];
    
    // Try broader search first
    let { data: products, error } = await productHuntSupabase
      .from('product_hunt_products')
      .select('id, name, product_description, category_tags, upvotes, websites, makers')
      .or(searchPatterns.join(','))
      .limit(Math.min(limit * 5, 100)); // Get more results for better filtering
    
    // If no results, try even broader search with common real estate terms
    if (!products || products.length === 0) {
      const realEstateTerms = ['property', 'real estate', 'home', 'house', 'buying', 'selling', 'rental', 'marketplace'];
      const broaderPatterns = realEstateTerms.map(term => 
        `name.ilike.%${term}%,product_description.ilike.%${term}%,category_tags.ilike.%${term}%`
      );
      
      const { data: broaderProducts, error: broaderError } = await productHuntSupabase
        .from('product_hunt_products')
        .select('id, name, product_description, category_tags, upvotes, websites, makers')
        .or(broaderPatterns.join(','))
        .limit(Math.min(limit * 3, 50));
      
      if (broaderProducts && broaderProducts.length > 0) {
        products = broaderProducts;
        error = null;
      }
    }

    if (error) {
      console.error('❌ Product Hunt database search error:', error);
      throw new Error(`Product Hunt search failed: ${error.message}`);
    }

    console.log(`📊 Found ${products?.length || 0} potential matches from Product Hunt`);

    // Calculate similarity scores with improved algorithm
    const calculateSimilarity = (query, title, description, category) => {
      const queryLower = query.toLowerCase();
      const titleLower = (title || '').toLowerCase();
      const descLower = (description || '').toLowerCase();
      const categoryLower = (category || '').toLowerCase();
      
      let score = 0;
      
      // Extract key terms from query
      const queryTerms = queryLower.split(/\s+/).filter(word => word.length > 2);
      
      // Exact matches get highest score
      if (titleLower === queryLower) score += 10;
      else if (titleLower.includes(queryLower)) score += 7;
      else if (queryLower.includes(titleLower) && titleLower.length > 3) score += 6;
      
      // Description matching
      if (descLower.includes(queryLower)) score += 5;
      
      // Category matching
      if (categoryLower.includes(queryLower)) score += 4;
      
      // Word-level matching with improved scoring
      let wordMatches = 0;
      let exactWordMatches = 0;
      
      for (const word of queryTerms) {
        if (titleLower.includes(word)) {
          wordMatches += 3;
          exactWordMatches += 1;
        }
        if (descLower.includes(word)) {
          wordMatches += 2;
        }
        if (categoryLower.includes(word)) {
          wordMatches += 2;
        }
      }
      
      score += Math.min(wordMatches, 12);
      
      // Bonus for multiple word matches
      if (exactWordMatches >= 2) score += 3;
      if (exactWordMatches >= 3) score += 2;
      
      // Bonus for domain relevance (real estate terms)
      const realEstateTerms = ['property', 'real estate', 'home', 'house', 'buying', 'selling', 'rental', 'marketplace', 'agent', 'broker'];
      const domainMatches = realEstateTerms.filter(term => 
        titleLower.includes(term) || descLower.includes(term) || categoryLower.includes(term)
      ).length;
      
      score += Math.min(domainMatches * 2, 6);
      
      // Convert to 0-1 scale
      return Math.max(0, Math.min(1, score / 20));
    };

    // Process results with similarity scoring
    const results = (products || [])
      .map((product, index) => {
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
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((result, index) => ({
        ...result,
        rank: index + 1
      }));

    console.log(`✅ Returning ${results.length} Product Hunt similarity results`);

    res.json({
      success: true,
      results,
      query,
      totalFound: results.length,
      searchParams: { limit, minSimilarity },
      fallback: false,
      message: 'Searching Product Hunt database for similar products'
    });

  } catch (error) {
    console.error('❌ Local similarity search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Similarity search failed',
      results: [],
      query: '',
      totalFound: 0
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log('📡 Endpoints available:');
  console.log(`   POST http://localhost:${PORT}/api/generate-prd (Gemini)`);
console.log(`   POST http://localhost:${PORT}/api/generate-prd-deepseek (Legacy)`);
console.log(`   POST http://localhost:${PORT}/api/enhance-idea`);
console.log(`   POST http://localhost:${PORT}/api/idea-assistant`);
  console.log(`   POST http://localhost:${PORT}/api/similarity-search`);
  console.log(`   GET  http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API server...');
  process.exit(0);
}); 