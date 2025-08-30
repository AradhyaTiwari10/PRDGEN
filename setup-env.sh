#!/bin/bash

# =============================================================================
# 🚀 PRDGEN - Environment Setup Script
# =============================================================================

echo "🚀 Setting up PRDGEN environment variables..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Your existing .env file is preserved."
        exit 1
    fi
fi

# Copy the example file
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
else
    echo "❌ env.example file not found!"
    exit 1
fi

echo ""
echo "🎉 Environment file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and add your actual API keys and URLs"
echo "2. Get your API keys from:"
echo "   - Gemini: https://aistudio.google.com/app/apikey"
echo "   - OpenAI: https://platform.openai.com/api-keys (optional)"
echo "   - Supabase: https://supabase.com/dashboard"
echo ""
echo "3. For Supabase Edge Functions, also set these in your Supabase Dashboard"
echo "4. Run 'npm run dev' to start development"
echo ""
echo "🔒 Remember: Never commit .env files to version control!" 