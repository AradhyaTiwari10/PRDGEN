import { Idea, IdeaConversation } from "@/types";

export const generateAssistantResponse = async (
  idea: Idea,
  userMessage: string,
  conversationHistory: IdeaConversation[] = []
) => {
  try {
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
    const historyData = conversationHistory.length > 0 
      ? conversationHistory
          .slice(-10) // Only include last 10 messages to avoid token limits
          .map(msg => ({ role: msg.role, message: msg.message }))
      : [];

    const response = await fetch('http://localhost:8081/api/idea-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        ideaContext,
        conversationHistory: historyData,
        userMessage
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate response');
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error generating assistant response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
};

export const generateWelcomeMessage = async (idea: Idea) => {
  try {
    const ideaContext = `
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category || 'Not specified'}
Status: ${idea.status}
Priority: ${idea.priority}
Market Size: ${idea.market_size || 'Not specified'}
Competition: ${idea.competition || 'Not specified'}
Notes: ${idea.notes || 'None'}
Content: ${idea.content || 'None'}
`.trim();

    const response = await fetch('http://localhost:8081/api/idea-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'welcome',
        ideaContext
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate welcome message');
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    throw new Error('Failed to generate welcome message. Please try again.');
  }
};
