# AI Assistant Setup Guide

This guide explains how to set up the new AI Assistant feature for individual ideas in PRD Genie Pro.

## Features Added

### 🤖 AI Assistant for Ideas
- **Contextual AI Assistant**: Each idea now has its own dedicated AI assistant that knows the full context of the idea
- **Persistent Chat History**: All conversations are stored and persist across sessions
- **Smart Responses**: The AI provides tailored advice based on the idea's details, status, category, and previous conversations
- **Welcome Messages**: Automatic welcome message when first opening an idea's assistant
- **Resizable Interface**: Split-panel layout with resizable editor and chat sections

### 🎯 AI Capabilities
- Product strategy and positioning advice
- Market analysis suggestions
- User experience guidance
- Technical feasibility assessment
- Business model recommendations
- Feature prioritization help
- Risk assessment and mitigation strategies

## Setup Instructions

### 1. Database Setup (REQUIRED)

**Step 1: Check your current database schema**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the diagnostic script from `debug_database_schema.sql` to check your current schema

**Step 2: Create the conversations table**
1. Copy the contents of `create_conversations_table.sql`
2. Paste it into your Supabase SQL Editor
3. Execute the script

The script creates:
- `idea_conversations` table for storing chat history
- Row Level Security (RLS) policies
- Proper indexes for performance
- Safe foreign key constraints

**If you get errors:**
- The script includes error handling for missing tables
- Check the diagnostic output to understand your schema
- The AI Assistant will show a setup message if the table doesn't exist

### 2. Environment Variables
Make sure you have both Gemini API keys in your `.env` file:

```env
VITE_GEMINI_API_KEY=your_first_gemini_key_here
VITE_GEMINI_API_KEY_2=your_second_gemini_key_here  # Used for AI Assistant
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Usage
1. Navigate to any idea detail page (`/idea/:id`)
2. You'll see a split-panel interface:
   - Left panel: Rich text editor for idea content
   - Right panel: AI Assistant chat interface
3. The AI assistant will automatically greet you with a contextual welcome message
4. Start chatting to get personalized advice for your idea

## Technical Implementation

### New Components
- `IdeaAssistant.tsx` - Main chat interface component
- `use-idea-conversations.ts` - Hook for managing chat data
- `idea-assistant.ts` - AI service using second Gemini API key

### Database Schema
```sql
CREATE TABLE idea_conversations (
    id UUID PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id),
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')),
    created_at TIMESTAMP WITH TIME ZONE
);
```

### Key Features
- **Context Awareness**: AI knows idea title, description, category, status, priority, market size, competition, notes, and content
- **Conversation Memory**: AI remembers previous conversations (last 10 messages for token efficiency)
- **Auto-save**: Idea content auto-saves as you type
- **Responsive Design**: Works on desktop and mobile devices
- **Markdown Support**: AI responses support markdown formatting

## API Usage
The AI assistant uses the second Gemini API key (`VITE_GEMINI_API_KEY_2`) to:
- Generate contextual welcome messages
- Provide expert product development advice
- Maintain conversation context
- Offer actionable recommendations

## Troubleshooting

### Common Issues
1. **AI not responding**: Check that `VITE_GEMINI_API_KEY_2` is set correctly
2. **Chat history not saving**: Ensure the database table was created successfully
3. **Permission errors**: Verify RLS policies are properly configured

### Database Verification
To verify the table was created correctly:
```sql
SELECT * FROM idea_conversations LIMIT 1;
```

## Future Enhancements
- Export chat conversations
- AI-suggested action items
- Integration with PRD generation
- Voice input/output
- Custom AI personality settings
