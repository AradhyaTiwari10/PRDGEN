# 🌍 Environment Structure Documentation

## 📋 Overview

This document explains the complete environment structure for the PRDGEN project, including all required environment variables, their purposes, and setup instructions.

## 🚀 Quick Setup

### Option 1: Automated Setup
```bash
./setup-env.sh
```

### Option 2: Manual Setup
```bash
cp env.example .env
# Then edit .env with your actual values
```

## 🔧 Environment Variables Breakdown

### 🔥 Essential Variables (Required for Core Functionality)

#### 🔐 Primary Supabase Configuration
**Purpose**: Main application database for users, PRDs, ideas, and collaboration features.

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Your main Supabase project URL | ✅ | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_TOKEN` | Public anon key for client-side access | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### 🔍 Product Hunt Database (Secondary)
**Purpose**: Separate database containing 120,000 Product Hunt products for similarity search.

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL_2` | Product Hunt database URL | ✅ | `https://vryersltsbjkdqhvorgk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY_2` | Product Hunt database anon key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### 🤖 Gemini AI Configuration
**Purpose**: Google's Gemini AI for various AI-powered features.

| Variable | Description | Required | Used For |
|----------|-------------|----------|----------|
| `GEMINI_API_TOKEN` | Primary Gemini API key | ✅ | General AI features, PRD generation |
| `VITE_GEMINI_API_KEY_2` | Secondary Gemini API key | ✅ | AI Assistant features |
| `VITE_GEMINI_API_KEY_3` | Tertiary Gemini API key | ✅ | Similarity search ranking |
| `VITE_GEMINI_API_TOKEN_3` | Alternative naming for similarity search | ✅ | Supabase Edge Functions |



### 📝 Optional Variables (Not Required for Core Functionality)

#### 🎯 OpenAI Configuration (Optional)
**Purpose**: OpenAI API for embeddings as optional fallback.

| Variable | Description | Required | Used For |
|----------|-------------|----------|----------|
| `OPENAI_API_KEY` | OpenAI API key | ❌ | Embeddings fallback |
| `VITE_OPENAI_API_KEY` | Alternative naming | ❌ | Client-side embeddings |

### 🔧 Development & Server Configuration
**Purpose**: Development environment and server port configuration.

| Variable | Description | Default | Used For |
|----------|-------------|---------|----------|
| `API_PORT` | API server port | `8081` | Express API server |
| `PORT` | WebSocket server port | `1234` | Real-time collaboration |

| `NODE_ENV` | Node environment | `development` | Environment-specific behavior |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRDGEN Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Primary DB    │    │  Product Hunt   │                │
│  │   (Supabase)    │    │     DB          │                │
│  │                 │    │   (Supabase)    │                │
│  │ • Users         │    │                 │                │
│  │ • PRDs          │    │ • 120k products │                │
│  │ • Ideas         │    │ • Categories    │                │
│  │ • Collaboration │    │ • Upvotes       │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Gemini AI     │    │   OpenAI AI     │                │
│  │                 │    │   (Optional)    │                │
│  │ • PRD Generation│    │                 │                │
│  │ • AI Assistant  │    │ • Embeddings    │                │
│  │ • Similarity    │    │   Fallback      │                │
│  │   Ranking       │    └─────────────────┘                │
│  └─────────────────┘                                       │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   OpenAI AI     │    │   WebSocket     │                │
│  │                 │    │   Server        │                │
│  │ • Embeddings    │    │                 │                │
│  │ • Alternative   │    │ • Real-time     │                │
│  │   Features      │    │   Collaboration │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 API Key Sources

### Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)



### OpenAI (Optional - for embeddings fallback)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon key

## 🚀 Deployment Configuration

### 🎯 Minimal Setup for Core Functionality
For basic functionality, you only need these 5 variables:
- `VITE_SUPABASE_URL` - Your main database
- `VITE_SUPABASE_ANON_TOKEN` - Main database access
- `GEMINI_API_TOKEN` - Primary AI features
- `VITE_GEMINI_API_KEY_2` - AI Assistant
- `VITE_GEMINI_API_KEY_3` - Similarity search

### Local Development
- Use `.env` file in project root
- Run `npm run dev` to start development server

### Supabase Edge Functions
Set these in Supabase Dashboard → Functions → similarity-search → Settings:
- `VITE_SUPABASE_URL_2`
- `VITE_SUPABASE_ANON_KEY_2`
- `VITE_GEMINI_API_TOKEN_3`

### Vercel Deployment
Add environment variables in Vercel Dashboard → Project Settings → Environment Variables:
- All `VITE_*` variables for client-side access
- All server-side variables (without `VITE_` prefix)

### Docker Deployment
- Use `docker-compose.yml` for local containerization
- Set environment variables in Docker Compose file or use `.env` file

## 🔒 Security Best Practices

### ✅ Do's
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment-specific configurations
- Keep API keys secure and never expose them in client-side code

### ❌ Don'ts
- Never commit `.env` files to version control
- Don't share API keys in public repositories
- Don't use the same API key across multiple environments
- Don't hardcode API keys in source code

## 🧪 Testing Environment Variables

### Check if variables are loaded:
```bash
# Check if .env file exists
ls -la .env

# Test environment variable loading
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL)"
```

### Validate Supabase connection:
```bash
# Test primary database connection
npm run test:supabase

# Test Product Hunt database connection
npm run test:product-hunt-db
```

## 🆘 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_TOKEN` are set
   - Verify the values are correct in your Supabase dashboard

2. **"Gemini AI not responding"**
   - Ensure `GEMINI_API_TOKEN` or `VITE_GEMINI_API_KEY_2` is set
   - Check if the API key is valid and has sufficient quota

3. **"Similarity search returning 0 results"**
   - Verify Product Hunt database variables are set
   - Check Supabase Edge Function environment variables
   - Ensure `VITE_GEMINI_API_TOKEN_3` is configured

4. **"WebSocket connection failed"**
   - Check if `PORT` is set correctly
   - Ensure the port is not already in use
   - Verify firewall settings

### Debug Commands
```bash
# Check all environment variables
node -e "require('dotenv').config(); Object.keys(process.env).filter(k => k.includes('VITE_') || k.includes('GEMINI') || k.includes('SUPABASE')).forEach(k => console.log(k, ':', process.env[k]))"

# Test API connections
npm run test:connections
```

## 📞 Support

If you encounter issues with environment setup:
1. Check this documentation first
2. Verify all required variables are set
3. Test API connections individually
4. Check the troubleshooting section above
5. Create an issue in the project repository 