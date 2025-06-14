"use client";

import { useState } from "react";
import { PRD } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Heart, Trash2, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePRDs } from "@/hooks/use-prds";

interface PRDViewerProps {
  prd: PRD;
  onDelete?: () => void;
}

export function PRDViewer({ prd, onDelete }: PRDViewerProps) {
  const [isFavorite, setIsFavorite] = useState(prd.is_favorite);
  const navigate = useNavigate();
  const { deletePRD } = usePRDs();

  const handleExport = async (format: "markdown" | "txt") => {
    try {
      let content = "";
      let fileExtension = "";

      if (format === "markdown") {
        content = `# ${prd.title}\n\n## Original Idea\n\n${prd.original_idea}\n\n## Product Requirements Document\n\n${prd.generated_prd}`;
        fileExtension = "md";
      } else {
        // For txt format, use plain text conversion
        const plainTextPRD = markdownToPlainText(prd.generated_prd);
        content = `${prd.title}\n\nOriginal Idea:\n${prd.original_idea}\n\nProduct Requirements Document:\n${plainTextPRD}`;
        fileExtension = "txt";
      }

      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${prd.title}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `PRD exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PRD. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to convert markdown to plain text
  const markdownToPlainText = (markdown: string): string => {
    return markdown
      // Remove headers (# ## ###) but keep the text
      .replace(/^#{1,6}\s+(.+)$/gm, '$1')
      // Remove bold/italic (**text** *text*) but keep the text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove links [text](url) but keep the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Convert code blocks ``` to plain text (preserve content)
      .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
      // Remove inline code backticks `code` but keep the text
      .replace(/`([^`]+)`/g, '$1')
      // Remove blockquotes > but keep the text
      .replace(/^>\s+(.+)$/gm, '$1')
      // Convert bullet points to readable format
      .replace(/^\*\s+(.+)$/gm, '• $1')
      .replace(/^-\s+(.+)$/gm, '• $1')
      // Convert numbered lists to readable format
      .replace(/^\d+\.\s+(.+)$/gm, '$1')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  const handleCopyPlainText = async () => {
    try {
      const plainText = markdownToPlainText(prd.generated_prd);
      await navigator.clipboard.writeText(plainText);
      toast({
        title: "Copied to Clipboard",
        description: "Product Requirements Document copied as plain text",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy PRD content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(prd.generated_prd);
      toast({
        title: "Copied to Clipboard",
        description: "Product Requirements Document copied as markdown",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy PRD content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async () => {
    try {
      const { error } = await supabase
        .from("prds")
        .update({ is_favorite: !isFavorite })
        .eq("id", prd.id);

      if (error) throw error;

      setIsFavorite(!isFavorite);

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite
          ? "PRD removed from your favorites"
          : "PRD added to your favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePRD(prd.id);
      if (onDelete) {
        onDelete();
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete PRD:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-foreground">
                {prd.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {prd.category && (
                  <Badge variant="secondary">{prd.category}</Badge>
                )}
                <Badge variant={prd.status === "final" ? "default" : "outline"}>
                  {prd.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(prd.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFavorite}
                className={isFavorite ? "text-destructive" : ""}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("markdown")}
              >
                <Download className="h-4 w-4 mr-2" />
                Markdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("txt")}
              >
                <Download className="h-4 w-4 mr-2" />
                Text
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete PRD</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this PRD? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Original Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {prd.original_idea}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">
              Product Requirements Document
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPlainText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy as Markdown
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {markdownToPlainText(prd.generated_prd)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
