"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { prdGenerationSchema, PRDGenerationData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Idea } from "@/types";
import { FileText } from "lucide-react";

// PRD generator component for the idea page
interface PRDGeneratorTabProps {
  idea: Idea;
}

export function PRDGeneratorTab({ idea }: PRDGeneratorTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingPRD, setExistingPRD] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PRDGenerationData>({
    resolver: zodResolver(prdGenerationSchema),
    defaultValues: {
      idea: idea.description,
    },
  });

  // Check for existing PRD on component mount
  useEffect(() => {
    const checkExistingPRD = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsLoading(false);
          return;
        }

        const { data: prd, error: fetchError } = await supabase
          .from("prds")
          .select("*")
          .eq("idea_id", idea.id)
          .eq("user_id", user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected if no PRD exists
          console.error("Error fetching existing PRD:", fetchError);
        } else if (prd) {
          setExistingPRD(prd);
        }
      } catch (error) {
        console.error("Error checking for existing PRD:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingPRD();
  }, [idea.id]);

  const generatePRDContent = async (data: PRDGenerationData) => {
    const response = await fetch('http://localhost:8081/api/generate-prd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea: data.idea,
        category: idea.category,
        targetAudience: idea.target_audience
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.prd) {
      throw new Error('No PRD content received');
    }

    return result.prd;
  };

  const onSubmit = async (data: PRDGenerationData) => {
    console.log('PRDGeneratorTab submission data:', data);
    setIsGenerating(true);

    try {
      // Validate required fields
      if (!data.idea) {
        throw new Error('Please describe your idea');
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to generate a PRD");

      const generatedContent = await generatePRDContent(data);

      const { data: prd, error: insertError } = await supabase
        .from("prds")
        .insert({
          user_id: user.id,
          idea_id: idea.id, // Link the PRD to this idea
          title: data.idea.split("\n")[0].slice(0, 100),
          original_idea: data.idea,
          generated_prd: generatedContent,
          category: idea.category, // Use the idea's category
          status: "final",
          is_favorite: false,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setExistingPRD(prd);

      toast({
        title: "PRD Generated!",
        description: "Your Product Requirements Document has been created successfully.",
      });

      // Don't navigate away, show the PRD in this tab
    } catch (error) {
      console.error("Error generating PRD:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PRD. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Checking for existing PRD...</p>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Generating your PRD...</p>
      </div>
    );
  }

  // If PRD exists, show it
  if (existingPRD) {
    return (
      <div className="p-4 space-y-4 bg-[#1C1C1C] rounded-lg border border-[#5A827E]/40 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">PRD for "{idea.title}"</h3>
            <p className="text-sm text-white">
              Created on {new Date(existingPRD.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/prd/${existingPRD.id}`)}
              className="border-[#5A827E]/40 text-[#5A827E]"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full PRD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExistingPRD(null)}
              className="border-[#5A827E]/40 text-[#5A827E]"
            >
              Generate New
            </Button>
          </div>
        </div>
        {/* PRD Preview */}
        <div className="bg-[#232e2b] rounded-lg p-4 max-h-96 overflow-y-auto border border-[#5A827E]/20">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-white"
            dangerouslySetInnerHTML={{
              __html: existingPRD.generated_prd
                ?.replace(/\n/g, '<br>')
                ?.replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
                ?.replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
                ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                ?.replace(/\*(.*?)\*/g, '<em>$1</em>')
            }}
          />
        </div>
      </div>
    );
  }

  // Show PRD generation form
  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idea">Product Idea</Label>
          <Textarea
            id="idea"
            placeholder="Describe your product idea in detail..."
            className="min-h-[120px] text-sm"
            {...register("idea")}
          />
          {errors.idea && (
            <p className="text-xs text-red-600">{errors.idea.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            The AI will automatically understand the product category and target audience from your description.
          </p>
        </div>

        <Button type="submit" className="w-full" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Generate PRD
        </Button>
      </form>
    </div>
  );
}
