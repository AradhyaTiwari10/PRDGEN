#!/bin/bash

echo "🚀 Deploying Similarity Search Edge Function to Supabase..."

# Make sure you have Supabase CLI installed
# If not, install it: npm install -g supabase

# Deploy the function
supabase functions deploy similarity-search --project-ref YOUR_PROJECT_REF

echo "✅ Edge Function deployed successfully!"
echo ""
echo "📝 Don't forget to set the environment variables in Supabase Dashboard:"
echo "   - VITE_GEMINI_API_TOKEN_3: Your Gemini API key"
echo "   - VITE_SUPABASE_URL_2: Product Hunt database URL"
echo "   - VITE_SUPABASE_ANON_KEY_2: Product Hunt database anon key"
echo ""
echo "🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions" 