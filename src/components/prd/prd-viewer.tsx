"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PRD } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Download, Edit, Heart, Share, Trash2, Copy } from "lucide-react";
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
        content = `${prd.title}\n\nOriginal Idea:\n${prd.original_idea}\n\nProduct Requirements Document:\n${prd.generated_prd}`;
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

  const handleCopyMarkdown = async () => {
    try {
      const content = `# ${prd.title}\n\n## Original Idea\n\n${prd.original_idea}\n\n## Product Requirements Document\n\n${prd.generated_prd}`;
      await navigator.clipboard.writeText(content);
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

  const handleShare = () => {
    const url = `${window.location.origin}/prd/${prd.id}`;
    navigator.clipboard.writeText(url);

    toast({
      title: "Link Copied",
      description: "PRD link copied to clipboard",
    });
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
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("markdown")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
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
          <CardTitle className="text-foreground">
            Product Requirements Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-primary">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-muted-foreground leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 ml-6 list-decimal space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-muted-foreground">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
              }}
            >
              {prd.generated_prd}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
