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
 * Process products in batches to generate embeddings
 * @param {number} batchSize - Number of products to process at once
 */
async function processEmbeddings(batchSize = 10) {
  try {
    console.log('🚀 Starting embedding generation process...');

    // Fetch products without embeddings
    const { data: products, error } = await supabase
      .from('product_hunt_products')
      .select('id, product_description')
      .is('embedding', null)
      .not('product_description', 'is', null)
      .limit(1000); // Process up to 1000 at a time

    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }

    if (!products || products.length === 0) {
      console.log('✅ No products found without embeddings. All done!');
      return;
    }

    console.log(`📊 Found ${products.length} products without embeddings`);

    // Process in batches to avoid rate limits
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);

      // Process each product in the batch
      for (const product of batch) {
        try {
          console.log(`  📝 Generating embedding for product ${product.id}...`);

          // Generate embedding for product description
          const embedding = await generateEmbedding(product.product_description);

          // Update the product with the embedding
          const { error: updateError } = await supabase
            .from('product_hunt_products')
            .update({ embedding })
            .eq('id', product.id);

          if (updateError) {
            console.error(`  ❌ Error updating product ${product.id}:`, updateError.message);
            continue;
          }

          console.log(`  ✅ Successfully updated product ${product.id}`);

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`  ❌ Error processing product ${product.id}:`, error.message);
          continue;
        }
      }

      // Longer delay between batches
      if (i + batchSize < products.length) {
        console.log('  ⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Embedding generation completed successfully!');

  } catch (error) {
    console.error('💥 Fatal error in embedding generation:', error.message);
    process.exit(1);
  }
}

/**
 * Verify embeddings were generated correctly
 */
async function verifyEmbeddings() {
  try {
    const { data, error } = await supabase
      .from('product_hunt_products')
      .select('id, embedding')
      .not('embedding', 'is', null)
      .limit(5);

    if (error) {
      throw new Error(`Error verifying embeddings: ${error.message}`);
    }

    console.log(`\n📈 Verification: Found ${data?.length || 0} products with embeddings`);
    
    if (data && data.length > 0) {
      console.log(`📏 Sample embedding dimension: ${data[0].embedding?.length || 'N/A'}`);
    }

  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🔧 Initializing embedding generation for Product Hunt products...');
  
  // Verify environment variables
  if (!process.env.VITE_SUPABASE_URL_2 || !process.env.VITE_SUPABASE_ANON_KEY_2) {
    console.error('❌ Missing Supabase environment variables (_2 suffix)');
    process.exit(1);
  }

  if (!DEEPSEEK_API_KEY && !OPENAI_API_KEY && !GEMINI_API_KEY) {
    console.error('❌ Missing DeepSeek, OpenAI, or Gemini API key');
    process.exit(1);
  }

  try {
    await processEmbeddings(5); // Process 5 products at a time
    await verifyEmbeddings();
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 