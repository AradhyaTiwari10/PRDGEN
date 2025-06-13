
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Generate a detailed, implementation-ready PRD structured with these 8 sections: Executive Summary, Product Overview, User Stories & Use Cases, Functional Requirements, Technical Requirements, Non-Functional Requirements, Implementation Phases, and Success Criteria. Each section must be comprehensive, specific, and actionable for developers/AI coding assistants, with technical detail, concrete examples, and clear KPIs.`;

export const generatePRD = async (idea: string, category: string, targetAudience: string) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  });
  
  const prompt = `${SYSTEM_PROMPT}

Product Idea: ${idea}
Category: ${category}
Target Audience: ${targetAudience}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  
  return response.text();
};
