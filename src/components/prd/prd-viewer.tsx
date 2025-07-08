"use client";

import { useState } from "react";
import { PRD } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Download,
  Heart,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Enhanced markdown renderer that cleans and formats content properly
  const renderMarkdown = (markdown: string) => {
    // First, clean up the markdown content
    const cleanedMarkdown = markdown
      // Remove code block markers
      .replace(/```[\w]*\n?/g, "")
      .replace(/```/g, "")
      // Remove horizontal rules
      .replace(/^---+$/gm, "")
      .replace(/^\*\*\*+$/gm, "")
      .replace(/^___+$/gm, "")
      // Remove extra whitespace and empty lines at start/end
      .trim()
      // Clean up multiple consecutive empty lines
      .replace(/\n\s*\n\s*\n/g, "\n\n");

    const lines = cleanedMarkdown.split("\n");
    const elements: JSX.Element[] = [];
    let key = 0;

    // Helper function to process inline markdown formatting
    const processInlineFormatting = (
      text: string
    ): (string | JSX.Element)[] => {
      const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
      return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-[#fff]">
              {part.slice(2, -2)}
            </strong>
          );
        } else if (
          part.startsWith("*") &&
          part.endsWith("*") &&
          !part.startsWith("**")
        ) {
          return (
            <em key={index} className="italic text-[#fff]">
              {part.slice(1, -1)}
            </em>
          );
        } else if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={index}
              className="bg-[#232e2b] px-1 py-0.5 rounded text-sm font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        elements.push(<div key={key++} className="mb-2" />);
        continue;
      }

      // Headers
      if (line.startsWith("### ")) {
        const headerText = line.replace("### ", "");
        elements.push(
          <h3
            key={key++}
            className="text-lg font-semibold text-[#fff] mt-6 mb-3 border-b border-[#5A827E]/30 pb-1"
          >
            {processInlineFormatting(headerText)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        const headerText = line.replace("## ", "");
        elements.push(
          <h2
            key={key++}
            className="text-xl font-bold text-[#fff] mt-8 mb-4 border-b-2 border-[#5A827E]/20 pb-2"
          >
            {processInlineFormatting(headerText)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        const headerText = line.replace("# ", "");
        elements.push(
          <h1 key={key++} className="text-2xl font-bold text-[#fff] mt-8 mb-6">
            {processInlineFormatting(headerText)}
          </h1>
        );
      }
      // Bullet points
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.replace(/^[-*]\s+/, "");
        elements.push(
          <div key={key++} className="flex items-start gap-2 mb-2 ml-4">
            <span className="text-[#5A827E] mt-2 text-xs">•</span>
            <span className="text-[#B9D4AA] flex-1">
              {processInlineFormatting(text)}
            </span>
          </div>
        );
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s/)) {
        const number = line.match(/^(\d+)\./)?.[1];
        const text = line.replace(/^\d+\.\s+/, "");
        elements.push(
          <div key={key++} className="flex items-start gap-3 mb-2 ml-4">
            <span className="text-[#5A827E] font-medium min-w-[1.5rem]">
              {number}.
            </span>
            <span className="text-[#B9D4AA] flex-1">
              {processInlineFormatting(text)}
            </span>
          </div>
        );
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        const text = line.replace(/^>\s+/, "");
        elements.push(
          <div
            key={key++}
            className="border-l-4 border-[#5A827E]/30 pl-4 my-3 bg-[#232e2b]/40 py-2"
          >
            <p className="text-[#B9D4AA] italic">
              {processInlineFormatting(text)}
            </p>
          </div>
        );
      }
      // Regular paragraphs with inline formatting
      else {
        elements.push(
          <p key={key++} className="text-[#B9D4AA] mb-3 leading-relaxed">
            {processInlineFormatting(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Function to convert markdown to plain text (for copying)
  const markdownToPlainText = (markdown: string): string => {
    return (
      markdown
        // Remove code blocks
        .replace(/```[\w]*\n?([\s\S]*?)```/g, "$1")
        // Remove horizontal rules
        .replace(/^---+$/gm, "")
        .replace(/^\*\*\*+$/gm, "")
        .replace(/^___+$/gm, "")
        // Convert headers to plain text
        .replace(/^#{1,6}\s+(.+)$/gm, "$1")
        // Remove bold/italic formatting
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        // Remove inline code formatting
        .replace(/`([^`]+)`/g, "$1")
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Convert blockquotes
        .replace(/^>\s+(.+)$/gm, "$1")
        // Convert bullet points
        .replace(/^\*\s+(.+)$/gm, "• $1")
        .replace(/^-\s+(.+)$/gm, "• $1")
        // Keep numbered lists as-is
        .replace(/^\d+\.\s+(.+)$/gm, "$1")
        // Clean up whitespace
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
    );
  };

  const handleCopyPlainText = async () => {
    try {
      const plainText = markdownToPlainText(prd.generated_prd);
      await navigator.clipboard.writeText(plainText);
      toast({
        title: "Copied to Clipboard",
        description: "PRD content copied as plain text",
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
        description: "PRD content copied as markdown",
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
    } catch (error) {
      console.error("Failed to delete PRD:", error);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-lg font-semibold text-[#fff] leading-tight">
              {prd.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {prd.category && (
                <Badge variant="secondary" className="text-xs">
                  {prd.category}
                </Badge>
              )}
              <Badge
                variant={prd.status === "final" ? "default" : "outline"}
                className="text-xs"
              >
                {prd.status}
              </Badge>
              <span className="text-xs text-[#B9D4AA]">
                {new Date(prd.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className="shrink-0"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-[#B9D4AA]"
              }`}
            />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPlainText}
            className="text-xs text-[#B9D4AA] hover:text-[#FAFFCA]"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="text-xs text-[#B9D4AA] hover:text-[#FAFFCA]"
          >
            <Copy className="h-3 w-3 mr-1" />
            Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("txt")}
            className="text-xs text-[#B9D4AA] hover:text-[#FAFFCA]"
          >
            <Download className="h-3 w-3 mr-1" />
            Text
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-[#FAFFCA] hover:text-[#FAFFCA] bg-[#5A827E]/20 border-[#5A827E]/30"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete PRD</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this PRD? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-[#FAFFCA] text-[#5A827E] hover:bg-[#5A827E]/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Original Idea */}
      <Card className="bg-[#1C1C1C]/80 border border-[#5A827E]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#FAFFCA]">
            Original Idea
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-[#B9D4AA] leading-relaxed">
            {prd.original_idea}
          </p>
        </CardContent>
      </Card>

      {/* PRD Content */}
      <Card className="bg-[#1C1C1C]/80 border border-[#5A827E]/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[#FAFFCA]">
              Product Requirements Document
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-[#B9D4AA] hover:text-[#FAFFCA]"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className={`space-y-3 ${
              !isExpanded ? "max-h-96 overflow-hidden" : ""
            }`}
          >
            {renderMarkdown(prd.generated_prd)}
          </div>
          {!isExpanded && (
            <div className="mt-4 pt-4 border-t border-[#5A827E]/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full text-xs border-[#5A827E]/30 text-[#FAFFCA] hover:bg-[#5A827E]/20"
              >
                Show Full PRD
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
