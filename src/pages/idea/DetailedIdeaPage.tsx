import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuillCollaborativeEditor } from "@/components/editor/QuillCollaborativeEditor";
import { IdeaAssistant } from "@/components/idea/IdeaAssistant";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Save, ArrowLeft, Bot, FileText, Clock, CheckCircle } from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";
import { useKeyboardShortcuts, commonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Idea } from "@/types";
import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { CollaborationRequestModal } from "@/components/ui/collaboration-request-modal";
import { CollaboratorsManagement } from "@/components/ui/collaborators-management";

export default function DetailedIdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ideas, updateIdea, loading, refreshIdeas } = useIdeas();
  const idea = ideas.find((idea) => idea.id === id);
  const [content, setContent] = useState("");
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialContentRef = useRef<string>("");

  useEffect(() => {
    if (idea) {
      const initialContent = idea.content || "";
      setContent(initialContent);
      initialContentRef.current = initialContent;
      setHasUnsavedChanges(false);
      setLastSaved(null);
    }
  }, [idea]);

  // Auto-save functionality with debouncing
  const performSave = useCallback(async (contentToSave: string, isAutoSave = false) => {
    if (!id) return;

    setIsSaving(true);
    try {
      if (isAutoSave) {
        // For auto-save, use direct Supabase call without toast but with proper permission handling
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Check if user owns the idea or has edit permission
        const currentIdea = ideas.find(idea => idea.id === id);
        if (!currentIdea) {
          throw new Error('Idea not found');
        }

        // If it's a shared idea, check edit permission
        if (currentIdea.is_shared && currentIdea.permission_level === 'view') {
          throw new Error('You do not have edit permission for this idea');
        }

        // Build the query with proper permission handling
        let query = supabase
          .from('ideas')
          .update({ content: contentToSave })
          .eq('id', id);

        // Only add user_id check if it's not a shared idea
        if (!currentIdea.is_shared) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query.select().maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Failed to update idea - no rows affected');

        // Refresh ideas to get updated data without showing toast
        await refreshIdeas();
      } else {
        // For manual save, use updateIdea which shows toast
        await updateIdea(id, { content: contentToSave });
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      initialContentRef.current = contentToSave;
    } catch (error) {
      console.error("Save failed:", error);
      // For auto-save, we don't want to show error toasts to avoid spam
      // The error will be logged and the user can manually save if needed
    } finally {
      setIsSaving(false);
    }
  }, [id, updateIdea, ideas, refreshIdeas]);

  // Track content changes and mark as unsaved
  useEffect(() => {
    if (content !== initialContentRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [content]);

  // Debounced auto-save effect - only when content actually changes
  useEffect(() => {
    if (!isAutoSaveEnabled || !hasUnsavedChanges || !idea || content === initialContentRef.current) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (3 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave(content, true); // true indicates auto-save
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, isAutoSaveEnabled, hasUnsavedChanges, idea, performSave]);

  // Manual save function
  const handleManualSave = async () => {
    if (id) {
      await performSave(content, false); // false indicates manual save (with toast)
    }
  };

  // Keyboard shortcuts for the idea page
  useKeyboardShortcuts([
    // Cmd/Ctrl + Shift + S to save (avoids browser save page)
    commonShortcuts.save(() => {
      handleManualSave();
    }),
    // Escape to go back
    commonShortcuts.escape(() => {
      handleManualSave();
      navigate(-1);
    }),
  ]);

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
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleManualSave();
                  navigate(-1);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{idea.title}</h1>
                <Badge variant="secondary">{idea.category}</Badge>
                <Badge variant={
                  idea.status === 'new' ? 'default' :
                  idea.status === 'in_progress' ? 'secondary' :
                  idea.status === 'ready_for_prd' ? 'secondary' : 'outline'
                }>
                  {idea.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto-save status indicator */}
              {isAutoSaveEnabled && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : lastSaved && !hasUnsavedChanges ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : null}
                </div>
              )}

              <CollaborationRequestModal idea={idea} />
              <CollaboratorsManagement idea={idea} />

              <Button
                onClick={handleManualSave}
                className="flex items-center justify-center gap-2"
                disabled={isSaving}
                variant={isAutoSaveEnabled ? "outline" : "default"}
              >
                <Save className="h-4 w-4" />
                {isAutoSaveEnabled ? "Save Now" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 py-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border bg-background">
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col bg-card">
              <div className="flex items-center justify-between p-3 border-b bg-muted/50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Idea Content</span>
                </div>

                {/* Auto-Save Toggle positioned in Idea Content header */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-save"
                    checked={isAutoSaveEnabled}
                    onCheckedChange={setIsAutoSaveEnabled}
                  />
                  <label
                    htmlFor="auto-save"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Auto-Save
                  </label>
                  {isAutoSaveEnabled && (
                    <div className="text-xs text-muted-foreground ml-1">
                      {isSaving ? "Saving..." : lastSaved && !hasUnsavedChanges ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : "Enabled"}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <QuillCollaborativeEditor
                  content={content}
                  onChange={setContent}
                  readOnly={idea?.is_shared && idea?.permission_level === 'view'}
                  ideaId={id!}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col bg-card">
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50 flex-shrink-0">
                <Bot className="h-4 w-4" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <IdeaAssistant idea={idea} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>


      </div>
    </div>
  );
}
