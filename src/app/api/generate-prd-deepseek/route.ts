import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Generate a detailed, implementation-ready PRD structured with these 8 sections: Executive Summary, Product Overview, User Stories & Use Cases, Functional Requirements, Technical Requirements, Non-Functional Requirements, Implementation Phases, and Success Criteria. Each section must be comprehensive, specific, and actionable for developers/AI coding assistants, with technical detail, concrete examples, and clear KPIs.`;

export async function POST(request: NextRequest) {
  try {
    const { idea, category, targetAudience } = await request.json();

    if (!idea || !category || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, category, targetAudience' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_TOKEN;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepseek API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `${SYSTEM_PROMPT}

Product Idea: ${idea}
Category: ${category}
Target Audience: ${targetAudience}

Please generate a comprehensive PRD following the 8-section structure mentioned above. Format in clean Markdown with clear hierarchical structure.`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Product Idea: ${idea}\nCategory: ${category}\nTarget Audience: ${targetAudience}\n\nPlease generate a comprehensive PRD following the 8-section structure. Format in clean Markdown with clear hierarchical structure.`
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return NextResponse.json(
        { error: error.error?.message || `Deepseek API error: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    if (!result.choices || result.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response from Deepseek API' },
        { status: 500 }
      );
    }

    const prdContent = result.choices[0].message.content;
    return NextResponse.json({ prd: prdContent });
  } catch (error) {
    console.error('Error generating PRD with Deepseek:', error);
    return NextResponse.json(
      { error: 'Failed to generate PRD. Please try again.' },
      { status: 500 }
    );
  }
} 