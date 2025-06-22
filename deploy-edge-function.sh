#!/bin/bash

echo "🚀 Deploying Similarity Search Edge Function to Supabase..."

# Make sure you have Supabase CLI installed
# If not, install it: npm install -g supabase

# Deploy the function
supabase functions deploy similarity-search --project-ref YOUR_PROJECT_REF

echo "✅ Edge Function deployed successfully!"
echo ""
echo "📝 Don't forget to set the environment variables in Supabase Dashboard:"
echo "   - GEMINI_API_KEY_3: Your Gemini API key"
echo "   - SUPABASE_URL: Your Supabase URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY: Your service role key"
echo ""
echo "🔗 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions" 