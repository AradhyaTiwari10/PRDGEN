import { GoogleGenerativeAI } from "@google/generative-ai";
import { Idea, IdeaConversation } from "@/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY_2!);

const ASSISTANT_SYSTEM_PROMPT = `You are an expert Product Development Assistant helping entrepreneurs refine and enhance product ideas into market-ready concepts. Provide actionable, specific advice on strategy, market fit, UX, technical feasibility, business model, GTM, and risk. Be professional, conversational, focused (2-3 short paragraphs), and encourage while being realistic. Ask clarifying questions, suggest next steps, and consider full idea context and history.`;

export const generateAssistantResponse = async (
  idea: Idea,
  userMessage: string,
  conversationHistory: IdeaConversation[] = []
) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
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

Please provide a helpful response based on the idea context and conversation history.`;
  
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
      maxOutputTokens: 512,
    }
  });

  const prompt = `${ASSISTANT_SYSTEM_PROMPT}

IDEA CONTEXT:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'Not specified'}
Status: ${idea.status}
Priority: ${idea.priority}

Generate a brief, welcoming introduction message for this idea. Acknowledge the specific idea, highlight 1-2 key aspects that seem promising, and ask 1-2 thoughtful questions to help the user think deeper about their idea. Keep it conversational and encouraging, around 2-3 sentences.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
};
