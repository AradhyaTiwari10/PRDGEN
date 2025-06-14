import { GoogleGenerativeAI } from "@google/generative-ai";
import { Idea, IdeaConversation } from "@/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY_2!);

const ASSISTANT_SYSTEM_PROMPT = `You are an expert Product Development Assistant specializing in helping entrepreneurs and product managers refine, develop, and enhance their product ideas.

Your expertise includes:
- Product strategy and positioning
- Market analysis and competitive research
- User experience and design thinking
- Technical feasibility assessment
- Business model development
- Go-to-market strategies
- Feature prioritization
- Risk assessment and mitigation

Guidelines for your responses:
1. **Keep responses concise** - aim for 2-3 short paragraphs maximum (4-6 sentences total)
2. **Use bullet points sparingly** - only 2-4 key points when needed
3. **Be conversational and friendly** - write like a helpful mentor
4. **Provide specific, actionable advice** rather than generic suggestions
5. **Ask 1 focused question** to keep the conversation engaging
6. **Reference the user's idea** to show you understand their context
7. **Suggest 1-2 concrete next steps** they can take immediately
8. **Be encouraging but realistic** about challenges
9. **Format with proper spacing** - use line breaks between paragraphs
10. **Avoid overwhelming the user** - quality over quantity in advice

Always consider the full context of the user's idea including:
- The idea title and description
- Current status and priority
- Market size and competition notes
- Any additional notes or content
- Previous conversation history

Your goal is to help the user develop their idea into a successful product by providing expert guidance, asking the right questions, and suggesting practical next steps.`;

export const generateAssistantResponse = async (
  idea: Idea,
  userMessage: string,
  conversationHistory: IdeaConversation[] = []
) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512, // Reduced for shorter responses
    }
  });

  // Build context about the idea
  const ideaContext = `
IDEA CONTEXT:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'Not specified'}
Status: ${idea.status}
Priority: ${idea.priority}
Market Size: ${idea.market_size || 'Not specified'}
Competition: ${idea.competition || 'Not specified'}
Notes: ${idea.notes || 'None'}
Content: ${idea.content || 'No additional content'}
Created: ${new Date(idea.created_at).toLocaleDateString()}
Last Updated: ${new Date(idea.updated_at).toLocaleDateString()}
`;

  // Build conversation history
  const historyContext = conversationHistory.length > 0 
    ? `\nCONVERSATION HISTORY:\n${conversationHistory
        .slice(-10) // Only include last 10 messages to avoid token limits
        .map(msg => `${msg.role.toUpperCase()}: ${msg.message}`)
        .join('\n')}\n`
    : '';

  const prompt = `${ASSISTANT_SYSTEM_PROMPT}

${ideaContext}
${historyContext}

USER MESSAGE: ${userMessage}

Please provide a helpful, concise response based on the idea context and conversation history.

RESPONSE REQUIREMENTS:
- Keep it SHORT: Maximum 2-3 paragraphs (4-6 sentences total)
- Use bullet points ONLY when essential (max 2-4 points)
- Start each bullet point on a NEW LINE with proper spacing
- Ask ONE focused question to engage the user
- Provide 1-2 specific, actionable next steps
- Be encouraging but realistic
- Make it easy to read and not overwhelming`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
};

export const generateWelcomeMessage = async (idea: Idea) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 256, // Even shorter for welcome messages
    }
  });

  const prompt = `${ASSISTANT_SYSTEM_PROMPT}

IDEA CONTEXT:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'Not specified'}
Status: ${idea.status}
Priority: ${idea.priority}

Generate a brief, welcoming introduction message for this idea.

REQUIREMENTS:
- Keep it SHORT: Maximum 2-3 sentences
- Acknowledge the specific idea by name
- Highlight 1 key aspect that seems promising
- Ask 1 focused question to start the conversation
- Be conversational, encouraging, and friendly
- Use proper spacing between sentences`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
};
