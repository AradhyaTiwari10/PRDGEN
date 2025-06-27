import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BlockNoteCollaborativeEditorV2 } from "@/components/editor/BlockNoteCollaborativeEditorV2";
import { BlockNoteEditorGuide } from "@/components/editor/BlockNoteEditorGuide";
import { IdeaAssistant } from "@/components/idea/IdeaAssistant";
import { SimilaritySearch } from "@/components/idea/SimilaritySearch";
import { PRDGeneratorTab } from "@/components/prd/prd-generator-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Save, ArrowLeft, Bot, FileText, Clock, CheckCircle, Sparkles, Users, Settings } from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'ready_for_prd': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Idea Not Found</h2>
            <p className="text-muted-foreground mb-4">The idea you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Merged Fullscreen Header */}
      <div className="flex-shrink-0 bg-background border-b border-border">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { handleManualSave(); navigate(-1); }} 
              className="flex items-center gap-2 hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> 
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">{idea.title}</h1>
                {idea.is_shared && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Shared
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Compact Action Bar */}
          <div className="flex items-center gap-2">
            {/* Auto-save Status */}
            {isAutoSaveEnabled && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {isSaving ? (
                  <>
                    <Clock className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved && !hasUnsavedChanges ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">Saved</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-600">Unsaved</span>
                  </>
                ) : null}
              </div>
            )}
            
            {/* Collaboration Controls */}
            <CollaborationRequestModal idea={idea} />
            <CollaboratorsManagement idea={idea} />
            
            {/* Save Button - Always Visible */}
            <Button 
              onClick={handleManualSave} 
              size="sm"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap" 
              disabled={isSaving}
            >
              <Save className="h-4 w-4" /> 
              Save Now
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Content Area */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full bg-background">
          {/* Left Panel - Editor */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col bg-background">
              {/* Compact Editor Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground text-sm">Idea Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <BlockNoteEditorGuide />
                  <Switch 
                    id="auto-save" 
                    checked={isAutoSaveEnabled} 
                    onCheckedChange={setIsAutoSaveEnabled}
                    className="data-[state=checked]:bg-green-500 scale-75"
                  />
                  <label htmlFor="auto-save" className="text-xs font-medium cursor-pointer text-muted-foreground">
                    Auto-Save
                  </label>
                  {isAutoSaveEnabled && (
                    <div className="text-xs text-muted-foreground">
                      {isSaving ? (
                        <span className="text-amber-600">Saving...</span>
                      ) : lastSaved && !hasUnsavedChanges ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <span className="text-green-600">On</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Editor - Full Height */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <BlockNoteCollaborativeEditorV2
                  key={`editor-${idea.id}`}
                  content={content}
                  onChange={setContent}
                  readOnly={idea?.is_shared && idea?.permission_level === 'view'}
                  ideaId={idea.id}
                  ideaTitle={idea.title}
                  ideaDescription={idea.description}
                  ideaMarketSize={idea.market_size}
                  ideaCompetition={idea.competition}
                  ideaNotes={idea.notes}
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="hover:bg-primary/20 transition-colors w-1" />
          
          {/* Right Panel - Tools */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <div className="h-full bg-background">
              <Tabs defaultValue="assistant" className="h-full flex flex-col">
                {/* Compact Tab Navigation */}
                <div className="flex-shrink-0 px-3 py-2 border-b border-border">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-0.5 rounded h-8">
                    <TabsTrigger 
                      value="assistant" 
                      className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground transition-all py-1"
                    >
                      <Bot className="h-3 w-3" />
                      Nexi
                    </TabsTrigger>
                    <TabsTrigger 
                      value="similarity" 
                      className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground transition-all py-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Similar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prd" 
                      className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground transition-all py-1"
                    >
                      <FileText className="h-3 w-3" />
                      PRD
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Tab Content - Full Height */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent value="assistant" className="h-full m-0 p-0">
                    <div className="h-full overflow-hidden">
                      <IdeaAssistant idea={idea} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="similarity" className="h-full m-0 p-0">
                    <div className="h-full overflow-auto p-3">
                      <SimilaritySearch currentIdea={idea} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prd" className="h-full m-0 p-0">
                    <div className="h-full overflow-auto">
                      <PRDGeneratorTab idea={idea} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
