import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client with _2 env variables
const supabase = createClient(
  process.env.VITE_SUPABASE_URL_2,
  process.env.VITE_SUPABASE_ANON_KEY_2
);

// API configuration - multiple options
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY_2;
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY;

// Use OpenAI's embedding API since DeepSeek embeddings are not available
const EMBEDDING_API_URL = 'https://api.openai.com/v1/embeddings';

/**
 * Generate embedding for text using available API (Gemini, OpenAI, or fallback)
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    // Priority: Gemini > OpenAI > DeepSeek > Fallback
    if (GEMINI_API_KEY) {
      return await generateGeminiEmbedding(text);
    } else if (OPENAI_API_KEY) {
      return await generateOpenAIEmbedding(text);
    } else if (DEEPSEEK_API_KEY) {
      return await generateDeepSeekEmbedding(text);
    } else {
      console.log('  🔄 No API key found, using fallback embedding...');
      return createSimpleEmbedding(text);
    }
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    
    // Fallback to simple embedding if all APIs fail
    console.log('  🔄 Falling back to simple embedding...');
    return createSimpleEmbedding(text);
  }
}

/**
 * Generate embedding using Google Gemini API
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateGeminiEmbedding(text) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      model: 'models/embedding-001',
      content: {
        parts: [{ text: text }]
      }
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data?.embedding?.values) {
    const embedding = response.data.embedding.values;
    
    // Gemini embeddings are 768-dimensional, we need to pad to 1536
    if (embedding.length === 768) {
      // Pad with zeros to reach 1536 dimensions
      const paddedEmbedding = [...embedding, ...new Array(768).fill(0)];
      return paddedEmbedding;
    }
    
    return embedding;
  } else {
    throw new Error('Invalid response format from Gemini API');
  }
}

/**
 * Generate embedding using OpenAI API
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateOpenAIEmbedding(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/embeddings',
    {
      model: 'text-embedding-ada-002',
      input: text,
      encoding_format: 'float'
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data?.data?.[0]?.embedding) {
    return response.data.data[0].embedding;
  } else {
    throw new Error('Invalid response format from OpenAI API');
  }
}

/**
 * Generate embedding using DeepSeek API (fallback method)
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateDeepSeekEmbedding(text) {
  // DeepSeek embedding endpoint seems to have issues, so we'll use fallback
  console.log('  ⚠️ DeepSeek embeddings unavailable, using fallback...');
  return createSimpleEmbedding(text);
}

/**
 * Create a simple embedding based on text characteristics
 * This is a fallback when API embedding services are not available
 * @param {string} text - Text to embed
 * @returns {number[]} - Simple 1536-dimensional embedding
 */
function createSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1536).fill(0);
  
  // Create features based on text characteristics
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    const pos = Math.abs(hash) % 1536;
    embedding[pos] += 1;
    
    // Add word length feature
    const lengthPos = (pos + word.length) % 1536;
    embedding[lengthPos] += 0.5;
    
    // Add position feature
    const positionPos = (pos + index) % 1536;
    embedding[positionPos] += 0.3;
  });
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

/**
 * Simple hash function for strings
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Find similar startup ideas based on user input
 * @param {string} userInput - User's idea description or search query
 * @param {number} matchCount - Number of similar ideas to return (default: 5)
 * @returns {Promise<Array>} - Array of similar startup ideas with similarity scores
 */
export async function findSimilarStartupIdeas(userInput, matchCount = 5) {
  try {
    // Validate input
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      throw new Error('User input is required and must be a non-empty string');
    }

    if (!Number.isInteger(matchCount) || matchCount < 1 || matchCount > 50) {
      throw new Error('Match count must be an integer between 1 and 50');
    }

    console.log(`🔍 Searching for ideas similar to: "${userInput}"`);

    // Step 1: Generate embedding for user input
    console.log('📊 Generating embedding for user input...');
    const queryEmbedding = await generateEmbedding(userInput.trim());

    if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length !== 1536) {
      throw new Error('Failed to generate valid embedding for user input');
    }

    // Step 2: Call Supabase RPC function to find similar ideas
    console.log('🔎 Searching for similar startup ideas...');
    const { data: similarIdeas, error } = await supabase.rpc('match_startup_ideas', {
      query_embedding: queryEmbedding,
      match_count: matchCount
    });

    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`);
    }

    if (!similarIdeas || !Array.isArray(similarIdeas)) {
      console.log('⚠️ No similar ideas found');
      return [];
    }

    // Step 3: Format and return results
    const formattedResults = similarIdeas.map((idea, index) => ({
      rank: index + 1,
      id: idea.id,
      name: idea.name,
      description: idea.product_description,
      similarity: Math.round(idea.similarity * 100) / 100, // Round to 2 decimal places
      similarityPercentage: Math.round(idea.similarity * 100) + '%'
    }));

    console.log(`✅ Found ${formattedResults.length} similar ideas`);
    return formattedResults;

  } catch (error) {
    console.error('💥 Error in findSimilarStartupIdeas:', error.message);
    throw error;
  }
}

/**
 * Batch search for multiple user inputs
 * @param {string[]} userInputs - Array of user input strings
 * @param {number} matchCount - Number of similar ideas to return per input
 * @returns {Promise<Object>} - Object with results for each input
 */
export async function batchFindSimilarIdeas(userInputs, matchCount = 5) {
  try {
    if (!Array.isArray(userInputs) || userInputs.length === 0) {
      throw new Error('User inputs must be a non-empty array');
    }

    console.log(`🔍 Batch searching for ${userInputs.length} inputs...`);

    const results = {};
    
    for (let i = 0; i < userInputs.length; i++) {
      const input = userInputs[i];
      console.log(`\n📝 Processing input ${i + 1}/${userInputs.length}: "${input}"`);
      
      try {
        results[input] = await findSimilarStartupIdeas(input, matchCount);
        
        // Small delay between requests to respect rate limits
        if (i < userInputs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ Error processing input "${input}":`, error.message);
        results[input] = { error: error.message };
      }
    }

    console.log('\n🎉 Batch search completed!');
    return results;

  } catch (error) {
    console.error('💥 Error in batchFindSimilarIdeas:', error.message);
    throw error;
  }
}

/**
 * Get statistics about the similarity search capability
 * @returns {Promise<Object>} - Statistics about the database
 */
export async function getSimilaritySearchStats() {
  try {
    // Get total count of products with embeddings
    const { count: totalWithEmbeddings, error: countError } = await supabase
      .from('product_hunt_products')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (countError) {
      throw new Error(`Error getting count: ${countError.message}`);
    }

    // Get total count of all products
    const { count: totalProducts, error: totalError } = await supabase
      .from('product_hunt_products')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new Error(`Error getting total count: ${totalError.message}`);
    }

    return {
      totalProducts: totalProducts || 0,
      productsWithEmbeddings: totalWithEmbeddings || 0,
      embeddingCoverage: totalProducts > 0 ? Math.round((totalWithEmbeddings / totalProducts) * 100) : 0,
      searchReady: totalWithEmbeddings > 0
    };

  } catch (error) {
    console.error('Error getting similarity search stats:', error.message);
    throw error;
  }
}

// Example usage and testing
async function testSimilaritySearch() {
  try {
    console.log('🧪 Testing similarity search functionality...\n');

    // Test 1: Get stats
    console.log('📊 Getting database statistics...');
    const stats = await getSimilaritySearchStats();
    console.log('Stats:', stats);

    // Test 2: Single search
    console.log('\n🔍 Testing single search...');
    const testQuery = "AI-powered productivity tool for developers";
    const results = await findSimilarStartupIdeas(testQuery, 3);
    console.log(`Results for "${testQuery}":`, results);

    // Test 3: Batch search
    console.log('\n🔍 Testing batch search...');
    const batchQueries = [
      "Social media management platform",
      "E-commerce analytics dashboard"
    ];
    const batchResults = await batchFindSimilarIdeas(batchQueries, 2);
    console.log('Batch results:', batchResults);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Uncomment to run tests
// testSimilaritySearch(); 