import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_TOKEN_2!);

const ASSISTANT_SYSTEM_PROMPT = `You are an expert Product Development Assistant specializing in helping entrepreneurs and product managers refine, develop, and enhance their product ideas.

Your expertise includes:
- Product strategy and positioning
- Market analysis and competitive research
- User experience design principles
- Technical feasibility assessment
- Business model development
- Feature prioritization frameworks
- Go-to-market strategies
- Risk assessment and mitigation

Provide actionable, specific advice tailored to the user's idea context. Be concise but comprehensive, and always suggest concrete next steps.`;

export async function POST(request: NextRequest) {
  try {
    const { action, ideaContext, conversationHistory, userMessage } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    if (action === 'welcome') {
      const welcomePrompt = `${ASSISTANT_SYSTEM_PROMPT}

IDEA CONTEXT:
${ideaContext}

Generate a personalized welcome message for this product idea. Be encouraging, specific to their idea, and suggest 2-3 initial areas where you can help them improve or develop their concept further. Keep it conversational and under 150 words.`;

      const result = await model.generateContent(welcomePrompt);
      const response = await result.response;
      return NextResponse.json({ message: response.text() });
    }

    if (action === 'chat') {
      if (!userMessage || !ideaContext) {
        return NextResponse.json(
          { error: 'Missing userMessage or ideaContext for chat' },
          { status: 400 }
        );
      }

      const conversationContext = conversationHistory && conversationHistory.length > 0
        ? `\n\nPrevious conversation context:\n${conversationHistory.slice(-10).map((msg: any) => `${msg.role}: ${msg.message}`).join('\n')}`
        : '';

      const chatPrompt = `${ASSISTANT_SYSTEM_PROMPT}

CURRENT IDEA CONTEXT:
${ideaContext}${conversationContext}

User message: ${userMessage}

Provide helpful, actionable advice for this startup idea. Be specific, strategic, and focus on practical next steps. Reference the idea context and conversation history when relevant.`;

      const result = await model.generateContent(chatPrompt);
      const response = await result.response;
      return NextResponse.json({ message: response.text() });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "welcome" or "chat"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in idea assistant:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
} 