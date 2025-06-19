"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { prdGenerationSchema, PRDGenerationData } from "@/lib/validations";
import { PRODUCT_CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Idea } from "@/types";

export function PRDGeneratorForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const idea = location.state?.idea as Idea | undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PRDGenerationData>({
    resolver: zodResolver(prdGenerationSchema),
  });

  useEffect(() => {
    if (idea) {
      setValue("idea", idea.description);
      setValue("category", idea.category);
      if (idea.target_audience) {
        setValue("targetAudience", idea.target_audience);
      }
    }
  }, [idea, setValue]);

  const category = watch("category");

  const generatePRDContent = async (data: PRDGenerationData) => {
    const prompt = `You are a senior product manager and technical architect creating a comprehensive, implementation-ready Product Requirements Document (PRD) for AI website builders like Bolt.new, Cursor AI, and Lovable.dev.

Product Idea: ${data.idea}
Category: ${data.category}
Target Audience: ${data.targetAudience}

Create a PRD that generates fully functional, feature-rich websites with every detail specified for immediate development.

## Required PRD Structure:

### 1. PRODUCT VISION & POSITIONING
- Vision statement and value proposition
- Market positioning and success definition

### 2. PROBLEM ANALYSIS
- Specific pain points and current solution gaps
- Problem validation and opportunity size

### 3. DETAILED TARGET AUDIENCE
- Primary persona with demographics, goals, pain points, behaviors
- Device usage context and technical proficiency

### 4. COMPLETE USER JOURNEY
- Map every interaction: Discovery → Onboarding → Core Usage → Advanced Features
- Define user intent, required features, data flow, and edge cases for each stage

### 5. EXHAUSTIVE FEATURE SPECIFICATIONS
For EVERY feature, specify:
- Exact UI components needed (buttons, forms, modals, cards, etc.)
- Complete data requirements (inputs, outputs, validation, storage)
- Detailed interaction design (clicks, hovers, loading states)
- Responsive behavior across breakpoints
- Accessibility requirements (ARIA, keyboard nav, screen readers)

### 6. TECHNICAL ARCHITECTURE
- Frontend framework choice with justification
- State management and data flow patterns
- Complete data models and schemas
- External integrations and APIs needed
- Authentication and security requirements

### 7. DETAILED UI/UX SPECIFICATIONS
- Complete design system: colors (hex codes), typography, spacing, components
- Layout specifications: navigation, grids, breakpoints (specific pixels)
- Interactive elements: animations, transitions, hover effects

### 8. USER STORIES WITH ACCEPTANCE CRITERIA
Structure as: "As a [user], I want to [action] so that [benefit]"
Include technical implementation notes for each story

### 9. COMPREHENSIVE EDGE CASES
- Error states, loading states, empty states
- Offline behavior and data validation
- Mobile-specific interactions

### 10. IMPLEMENTATION-READY SPECIFICATIONS
- Component-level breakdown
- Exact styling requirements
- Data validation rules
- API integration details

## Critical Requirements:
- Every feature must be detailed enough for immediate coding
- Include specific technical specifications (breakpoints, colors, spacing)
- Define all UI states (normal, loading, error, empty)
- Specify responsive behavior for all screen sizes
- Include accessibility requirements
- Focus on modern web standards and best practices
- NO timelines or project management sections
- Assume React/modern JavaScript framework

Generate a PRD so comprehensive that a developer could build the entire application using only this specification, without needing any additional design decisions or clarifications.

Format in clean Markdown with clear hierarchical structure.`;

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('Deepseek API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            content: 'Generate a detailed, implementation-ready PRD structured with comprehensive sections. Each section must be specific and actionable for developers/AI coding assistants, with technical detail, concrete examples, and clear specifications.'
          },
          {
            role: 'user',
            content: prompt
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
      throw new Error(error.error?.message || `Deepseek API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid response format from Deepseek API');
    }

    return result.choices[0].message.content;
  };

  const onSubmit = async (data: PRDGenerationData) => {
    setIsGenerating(true);

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to generate a PRD");

      // Generate PRD content first
      const generatedContent = await generatePRDContent(data);

      // Create a new PRD record
      const { data: prd, error: insertError } = await supabase
        .from("prds")
        .insert({
          user_id: user.id,
          title: data.idea.split("\n")[0].slice(0, 100), // Use first line as title
          original_idea: data.idea,
          generated_prd: generatedContent,
          category: data.category,
          status: "final",
          is_favorite: false,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "PRD Generated!",
        description:
          "Your Product Requirements Document has been created successfully.",
      });

      navigate(`/prd/${prd.id}`);
    } catch (error) {
      console.error("Error generating PRD:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate PRD. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4 w-full">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground text-lg">
              Generating your PRD...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate PRD</CardTitle>
        <CardDescription>
          Transform your product idea into a comprehensive Product Requirements
          Document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idea">Product Idea *</Label>
            <Textarea
              id="idea"
              placeholder="Describe your product idea in detail. What problem does it solve? Who is it for? What makes it unique?"
              className="min-h-[120px]"
              {...register("idea")}
            />
            {errors.idea && (
              <p className="text-sm text-red-600">{errors.idea.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Product Category *</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Small business owners, Students, Developers"
              {...register("targetAudience")}
            />
            {errors.targetAudience && (
              <p className="text-sm text-red-600">
                {errors.targetAudience.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Generate PRD
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
