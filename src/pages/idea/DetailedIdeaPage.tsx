import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { IdeaAssistant } from "@/components/idea/IdeaAssistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Save, ArrowLeft, Bot, FileText } from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";
import { Idea } from "@/types";
import { useEffect, useCallback } from "react";

export default function DetailedIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ideas, updateIdea, loading } = useIdeas();
  const idea = ideas.find((idea) => idea.id === id);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (idea) {
      setContent(idea.content || "");
    }
  }, [idea]);

  // Optional: You can still keep a manual save button if needed,
  // but the auto-save handles the primary saving as the user types.
  const handleManualSave = async () => {
    if (id) {
      try {
        await updateIdea(id, { content }); // Save the current content immediately
        console.log("Manual save triggered and completed.");
      } catch (error) {
        console.error("Manual save failed:", error);
        // Consider showing an error toast here as well
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p>Idea not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleManualSave();
              navigate(-1);
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{idea.title}</h1>
            <Badge variant="secondary">{idea.category}</Badge>
            <Badge variant={
              idea.status === 'new' ? 'default' :
              idea.status === 'in_progress' ? 'secondary' :
              idea.status === 'ready_for_prd' ? 'success' : 'outline'
            }>
              {idea.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <Button onClick={handleManualSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Idea Content</span>
              </div>
              <div className="flex-1 bg-card">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50 flex-shrink-0">
                <Bot className="h-4 w-4" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="flex-1 min-h-0 p-4">
                <IdeaAssistant idea={idea} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
