import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_TOKEN!);

export async function POST(request: NextRequest) {
  try {
    const { idea, category, targetAudience } = await request.json();

    if (!idea || !category || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: idea, category, targetAudience' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a comprehensive PRD (Product Requirements Document) for the following startup idea:

Idea: ${idea}
Category: ${category}
Target Audience: ${targetAudience}

Structure the PRD with the following sections:
1. Executive Summary
2. Product Overview
3. User Stories & Use Cases
4. Functional Requirements
5. Technical Requirements
6. Non-Functional Requirements
7. Implementation Phases
8. Success Criteria

Make sure each section is detailed, specific, and actionable for developers and product managers. Use clear formatting with headers, bullet points, and numbered lists where appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const prdContent = response.text();

    return NextResponse.json({ prd: prdContent });
  } catch (error) {
    console.error('Error generating PRD:', error);
    return NextResponse.json(
      { error: 'Failed to generate PRD. Please try again.' },
      { status: 500 }
    );
  }
} 