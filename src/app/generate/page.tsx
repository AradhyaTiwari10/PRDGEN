import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PRDGeneratorTab } from "@/components/prd/prd-generator-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Idea } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function GeneratePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ideaDescription, setIdeaDescription] = useState("");
  const [createdIdea, setCreatedIdea] = useState<Idea | null>(null);
  
  // Check if an idea was passed via navigation state
  const passedIdea = location.state?.idea as Idea | undefined;

  useEffect(() => {
    if (passedIdea) {
      setCreatedIdea(passedIdea);
    }
  }, [passedIdea]);

  const createIdeaAndGeneratePRD = async () => {
    if (!ideaDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe your idea first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to create ideas and generate PRDs",
          variant: "destructive",
        });
        return;
      }

      // Create a basic idea first
      const { data: idea, error: ideaError } = await supabase
        .from("ideas")
        .insert({
          user_id: user.id,
          title: ideaDescription.split('\n')[0].slice(0, 60) || "New Product Idea",
          description: ideaDescription,
          category: "Other", // Will be determined by AI in PRD generation
          status: "active",
          priority: "medium",
        })
        .select()
        .single();

      if (ideaError) throw ideaError;

      setCreatedIdea(idea);
      toast({
        title: "Idea Created!",
        description: "Now you can generate a PRD for your idea",
      });
    } catch (error) {
      console.error("Error creating idea:", error);
      toast({
        title: "Error",
        description: "Failed to create idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Generate PRD for Lovable, Bolt and Cursor with IdeaVault
            </h1>
            <p className="text-muted-foreground">
              Transform your product idea into a comprehensive Product
              Requirements Document
            </p>
          </div>
        </div>

        {!createdIdea ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Describe Your Product Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea">Product Idea</Label>
                <Textarea
                  id="idea"
                  placeholder="Describe your product idea in detail. What problem does it solve? Who is it for? What makes it unique?

Examples:
• A mobile app for tracking daily water intake with personalized reminders
• A web platform for remote team collaboration with AI-powered meeting summaries
• A browser extension that helps developers find and manage code snippets"
                  className="min-h-[200px]"
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The AI will automatically understand the product category and target audience from your description.
                </p>
              </div>

              <Button 
                onClick={createIdeaAndGeneratePRD}
                disabled={loading || !ideaDescription.trim()}
                size="lg"
                className="w-full"
              >
                {loading ? "Creating Idea..." : "Create Idea & Continue to PRD"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate PRD for: "{createdIdea.title}"</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <PRDGeneratorTab idea={createdIdea} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
