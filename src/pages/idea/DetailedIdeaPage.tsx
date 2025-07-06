import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BlockNoteCollaborativeEditorV2 } from "@/components/editor/BlockNoteCollaborativeEditorV2";
import { BlockNoteEditorGuide } from "@/components/editor/BlockNoteEditorGuide";
import { IdeaAssistant } from "@/components/idea/IdeaAssistant";
import { SimilaritySearch } from "@/components/idea/SimilaritySearch";
import { PRDGeneratorTab } from "@/components/prd/prd-generator-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Save,
  ArrowLeft,
  Bot,
  FileText,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useIdeas } from "@/hooks/use-ideas";

import { Idea } from "@/types";
import { useCallback, useRef } from "react";
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
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
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

  const performSave = useCallback(
    async (contentToSave: string, isAutoSave = false) => {
      if (!id) return;
      setIsSaving(true);
      try {
        // Simplified - just use the updateIdea function
        await updateIdea(id, { content: contentToSave });

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        initialContentRef.current = contentToSave;
      } catch (error) {
        console.error("Save failed:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [id, updateIdea]
  );

  useEffect(() => {
    if (content !== initialContentRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [content]);

  useEffect(() => {
    if (
      !isAutoSaveEnabled ||
      !hasUnsavedChanges ||
      !idea ||
      content === initialContentRef.current
    ) {
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
      case "new":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "ready_for_prd":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    // Clear any existing redirect timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
      setRedirectTimeout(null);
    }

    // Only redirect if we've finished loading AND the idea doesn't exist AND we have an ID
    // Add a small delay to prevent race conditions
    if (!loading && !idea && id) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 1000); // 1 second delay
      setRedirectTimeout(timeout);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [loading, idea, navigate, id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#232e2b] border border-[#5A827E] rounded-lg">
        <div className="w-10 h-10 border-4 border-[#5A827E] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-white">Loading your idea...</h2>
      </div>
    );
  }

  // Add null check for idea
  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#232e2b] border border-[#5A827E] rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Idea not found</h2>
          <p className="text-[#B9D4AA] mb-6">
            The idea you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-[#5A827E] hover:bg-[#84AE92] text-[#FAFFCA]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1.85);
          }
          50% {
            transform: scale(1.50);
          }
        }
      `}</style>
      <div className="h-screen w-screen flex flex-col relative overflow-hidden">
        {/* Background SVG */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 scale-125 transform"
            style={{
              animation: "breathe 8s ease-in-out infinite",
            }}
          >
            <svg
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
              width="4000"
              height="4000"
              viewBox="-900 -900 4400 4400"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <g filter="url(#filter0_f)">
                <rect
                  x="2143"
                  y="455"
                  width="1690"
                  height="1690"
                  rx="710.009"
                  transform="rotate(90 2143 455)"
                  fill="#84AE92"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter1_f)">
                <rect
                  x="2126"
                  y="474.675"
                  width="1655.58"
                  height="1653.6"
                  rx="710.009"
                  transform="rotate(90 2126 474.675)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter_common_f)">
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#5A827E"
                />
                <rect
                  x="2057"
                  y="576.304"
                  width="1452.32"
                  height="1515.8"
                  rx="710.009"
                  transform="rotate(90 2057 576.304)"
                  fill="#FAFFCA"
                />
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter5_f)">
                <rect
                  x="1858"
                  y="766.034"
                  width="1084.79"
                  height="1117.93"
                  rx="483.146"
                  transform="rotate(90 1858 766.034)"
                  fill="#84AE92"
                />
              </g>
              <g filter="url(#filter6_f)">
                <rect
                  x="1779"
                  y="698.622"
                  width="1178.25"
                  height="962.391"
                  rx="481.196"
                  transform="rotate(90 1779 698.622)"
                  fill="#5A827E"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f"
                  x="0.074"
                  y="2.074"
                  width="2595.85"
                  height="2595.85"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="140" />
                </filter>
                <filter
                  id="filter1_f"
                  x="250.311"
                  y="252.587"
                  width="2097.78"
                  height="2099.76"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="60" />
                </filter>
                <filter
                  id="filter_common_f"
                  x="393"
                  y="428"
                  width="1812"
                  height="1748"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="58" />
                </filter>
                <filter
                  id="filter5_f"
                  x="443.964"
                  y="469.927"
                  width="1710.14"
                  height="1677"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
                <filter
                  id="filter6_f"
                  x="520.502"
                  y="402.515"
                  width="1554.6"
                  height="1770.46"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
            }}
          ></div>
        </div>

        {/* Merged Fullscreen Header */}
        <div className="flex-shrink-0 bg-[#1C1C1C]/80 backdrop-blur-md border-b border-[#5A827E]/30 relative z-20">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleManualSave();
                  navigate(-1);
                }}
                className="flex items-center gap-2 hover:bg-[#5A827E]/20 text-[#FAFFCA] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#FAFFCA] tracking-tight">
                    {idea?.title || "Untitled Idea"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Compact Action Bar */}
            <div className="flex items-center gap-2">
              {/* Auto-save Status */}
              {isAutoSaveEnabled && (
                <div className="flex items-center gap-2 text-xs text-[#B9D4AA] bg-[#5A827E]/20 px-2 py-1 rounded border border-[#5A827E]/30">
                  {isSaving ? (
                    <>
                      <Clock className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : lastSaved && !hasUnsavedChanges ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-[#84AE92]" />
                      <span className="text-[#84AE92]">Saved</span>
                    </>
                  ) : hasUnsavedChanges ? (
                    <>
                      <Clock className="h-3 w-3 text-[#B9D4AA]" />
                      <span className="text-[#B9D4AA]">Unsaved</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 text-[#B9D4AA]" />
                      <span className="text-[#B9D4AA]">Saved</span>
                    </>
                  )}
                </div>
              )}

              {/* Save Button - Always Visible */}
              <Button
                onClick={handleManualSave}
                size="sm"
                className="flex items-center justify-center gap-2 bg-[#5A827E] hover:bg-[#84AE92] text-[#FAFFCA] border border-[#B9D4AA]/30 whitespace-nowrap"
                disabled={isSaving}
              >
                <Save className="h-4 w-4" />
                Save Now
              </Button>
            </div>
          </div>
        </div>

        {/* Fullscreen Content Area */}
        <div className="flex-1 min-h-0 relative z-20">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Editor */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full flex flex-col bg-[#1C1C1C]/80 backdrop-blur-md">
                {/* Compact Editor Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#5A827E]/30 bg-[#5A827E]/10 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#B9D4AA]" />
                    <span className="font-medium text-[#FAFFCA] text-sm">
                      Idea Content
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BlockNoteEditorGuide />
                    <Switch
                      id="auto-save"
                      checked={isAutoSaveEnabled}
                      onCheckedChange={setIsAutoSaveEnabled}
                      className="data-[state=checked]:bg-[#84AE92] scale-75"
                    />
                    <label
                      htmlFor="auto-save"
                      className="text-xs font-medium cursor-pointer text-[#B9D4AA]"
                    >
                      Auto-Save
                    </label>
                    {isAutoSaveEnabled && (
                      <div className="text-xs text-[#B9D4AA]">
                        {lastSaved && !hasUnsavedChanges ? (
                          <CheckCircle className="h-3 w-3 text-[#84AE92]" />
                        ) : (
                          <span className="text-[#84AE92]">On</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor - Full Height */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <BlockNoteCollaborativeEditorV2
                    key={`editor-${idea?.id || "loading"}`}
                    content={content}
                    onChange={setContent}
                    readOnly={false}
                    ideaId={idea?.id || ""}
                    ideaTitle={idea?.title || ""}
                    ideaDescription={idea?.description || ""}
                    ideaMarketSize={idea?.market_size || ""}
                    ideaCompetition={idea?.competition || ""}
                    ideaNotes={idea?.notes || ""}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="hover:bg-[#5A827E]/40 transition-colors w-1 bg-[#5A827E]/20"
            />

            {/* Right Panel - Tools */}
            <ResizablePanel defaultSize={40} minSize={25}>
              <div className="h-full bg-[#1C1C1C]/80 backdrop-blur-md">
                <Tabs defaultValue="assistant" className="h-full flex flex-col">
                  {/* Compact Tab Navigation */}
                  <div className="flex-shrink-0 px-3 py-2 border-b border-[#5A827E]/30 bg-[#5A827E]/10">
                    <TabsList className="grid w-full grid-cols-3 bg-[#5A827E]/20 p-0.5 rounded h-8 border border-[#5A827E]/30">
                      <TabsTrigger
                        value="assistant"
                        className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-[#1C1C1C] data-[state=active]:text-[#FAFFCA] text-[#B9D4AA] transition-all py-1"
                      >
                        <Bot className="h-3 w-3" />
                        Nexi
                      </TabsTrigger>
                      <TabsTrigger
                        value="similarity"
                        className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-[#1C1C1C] data-[state=active]:text-[#FAFFCA] text-[#B9D4AA] transition-all py-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Similar
                      </TabsTrigger>
                      <TabsTrigger
                        value="prd"
                        className="flex items-center gap-1 text-xs font-medium data-[state=active]:bg-[#1C1C1C] data-[state=active]:text-[#FAFFCA] text-[#B9D4AA] transition-all py-1"
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
                        {idea && <IdeaAssistant idea={idea} />}
                      </div>
                    </TabsContent>

                    <TabsContent value="similarity" className="h-full m-0 p-0">
                      <div className="h-full overflow-auto p-3">
                        {idea && <SimilaritySearch currentIdea={idea} />}
                      </div>
                    </TabsContent>

                    <TabsContent value="prd" className="h-full m-0 p-0">
                      <div className="h-full overflow-auto">
                        {idea && <PRDGeneratorTab idea={idea} />}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </>
  );
}
