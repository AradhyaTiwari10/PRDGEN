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

// PRD Generation endpoint
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

// Similarity Search endpoint as fallback
app.post('/api/similarity-search', async (req, res) => {
  try {
    const { query, limit = 10, minSimilarity = 0.1 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string'
      });
    }

    console.log(`🔍 Local similarity search for: "${query}"`);

    // Simple mock similarity search for development
    // In a real implementation, this would search a database
    const mockResults = [
      {
        rank: 1,
        id: 'mock-1',
        name: 'StudyFlow: Academic Organizer',
        description: 'A comprehensive study management app that helps students organize their coursework, track assignments, and improve productivity.',
        similarity: 0.85,
        similarityPercentage: '85%',
        upvotes: 234,
        category_tags: 'Education, Productivity',
        websites: 'https://studyflow.app',
        makers: 'StudyFlow Team'
      },
      {
        rank: 2,
        id: 'mock-2',
        name: 'TaskMaster: Student Planner',
        description: 'Digital planner designed specifically for students to manage homework, projects, and exam schedules effectively.',
        similarity: 0.78,
        similarityPercentage: '78%',
        upvotes: 189,
        category_tags: 'Education, Planning',
        websites: 'https://taskmaster.edu',
        makers: 'EduTech Inc'
      },
      {
        rank: 3,
        id: 'mock-3',
        name: 'FocusTime: Study Timer',
        description: 'Pomodoro-based study timer with analytics to help students maintain focus and track study sessions.',
        similarity: 0.65,
        similarityPercentage: '65%',
        upvotes: 156,
        category_tags: 'Productivity, Time Management',
        websites: 'https://focustime.app',
        makers: 'Productivity Labs'
      }
    ];

    // Filter results based on similarity threshold and query relevance
    const filteredResults = mockResults
      .filter(result => result.similarity >= minSimilarity)
      .slice(0, limit);

    console.log(`✅ Returning ${filteredResults.length} mock similarity results`);

    res.json({
      success: true,
      results: filteredResults,
      query,
      totalFound: filteredResults.length,
      searchParams: { limit, minSimilarity },
      fallback: true,
      message: 'Using local mock similarity search - configure Supabase for real data'
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
  console.log(`   POST http://localhost:${PORT}/api/generate-prd-deepseek`);
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