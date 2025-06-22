import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QuillCollaborativeEditor } from "@/components/editor/QuillCollaborativeEditor";
import { IdeaAssistant } from "@/components/idea/IdeaAssistant";
import { SimilaritySearch } from "@/components/idea/SimilaritySearch";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Save, ArrowLeft, Bot, FileText, Clock, CheckCircle, Sparkles } from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";
import { useKeyboardShortcuts, commonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Idea } from "@/types";
import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { CollaborationRequestModal } from "@/components/ui/collaboration-request-modal";
import { CollaboratorsManagement } from "@/components/ui/collaborators-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const performSave = useCallback(async (contentToSave: string, isAutoSave = false) => {
    if (!id) return;
    setIsSaving(true);
    try {
      if (isAutoSave) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const currentIdea = ideas.find(idea => idea.id === id);
        if (!currentIdea) throw new Error('Idea not found');
        if (currentIdea.is_shared && currentIdea.permission_level === 'view') throw new Error('You do not have edit permission for this idea');

        let query = supabase.from('ideas').update({ content: contentToSave }).eq('id', id);
        if (!currentIdea.is_shared) query = query.eq('user_id', user.id);
        const { data, error } = await query.select().maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Failed to update idea - no rows affected');
        await refreshIdeas();
      } else {
        await updateIdea(id, { content: contentToSave });
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      initialContentRef.current = contentToSave;
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [id, updateIdea, ideas, refreshIdeas]);

  useEffect(() => {
    if (content !== initialContentRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [content]);

  useEffect(() => {
    if (!isAutoSaveEnabled || !hasUnsavedChanges || !idea || content === initialContentRef.current) {
      return;
    }
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave(content, true);
    }, 1000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [content, isAutoSaveEnabled, hasUnsavedChanges, idea, performSave]);

  const handleManualSave = async () => {
    if (id) await performSave(content, false);
  };

  useKeyboardShortcuts([
    commonShortcuts.save(() => handleManualSave()),
    commonShortcuts.escape(() => {
      handleManualSave();
      navigate(-1);
    }),
  ]);

  if (loading) {
    return <div className="container mx-auto py-8 flex items-center justify-center h-64">Loading...</div>;
  }

  if (!idea) {
    return <div className="container mx-auto py-8 flex items-center justify-center h-64">Idea not found.</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => { handleManualSave(); navigate(-1); }} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{idea.title}</h1>
                <Badge variant="secondary">{idea.category}</Badge>
                <Badge variant={idea.status === 'new' ? 'default' : idea.status === 'in_progress' ? 'secondary' : idea.status === 'ready_for_prd' ? 'secondary' : 'outline'}>
                  {idea.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAutoSaveEnabled && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isSaving ? <><Clock className="h-4 w-4 animate-spin" /><span>Saving...</span></> : lastSaved && !hasUnsavedChanges ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}
                </div>
              )}
              <CollaborationRequestModal idea={idea} />
              <CollaboratorsManagement idea={idea} />
              <Button onClick={handleManualSave} className="flex items-center justify-center gap-2" disabled={isSaving} variant={isAutoSaveEnabled ? "outline" : "default"}>
                <Save className="h-4 w-4" /> {isAutoSaveEnabled ? "Save Now" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 py-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-border bg-background">
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col bg-card rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50 flex-shrink-0 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Idea Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="auto-save" checked={isAutoSaveEnabled} onCheckedChange={setIsAutoSaveEnabled} />
                  <label htmlFor="auto-save" className="text-sm font-medium cursor-pointer text-muted-foreground">Auto-Save</label>
                  {isAutoSaveEnabled && (
                    <div className="text-xs text-muted-foreground ml-1">
                      {isSaving ? "Saving..." : lastSaved && !hasUnsavedChanges ? <CheckCircle className="h-3 w-3 text-green-500" /> : "Enabled"}
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
          <ResizablePanel defaultSize={30} minSize={25}>
            <div className="h-full flex flex-col bg-card rounded-lg shadow-sm">
              <Tabs defaultValue="assistant" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 m-3 mb-0">
                  <TabsTrigger value="assistant" className="flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="similarity" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Similar Ideas
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="assistant" className="flex-1 min-h-0 overflow-hidden mt-0">
                  <IdeaAssistant idea={idea} />
                </TabsContent>
                <TabsContent value="similarity" className="flex-1 min-h-0 overflow-hidden mt-0 p-3">
                  <SimilaritySearch currentIdea={idea} />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
