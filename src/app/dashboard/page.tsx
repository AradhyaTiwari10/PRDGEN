"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PRDGrid } from "@/components/dashboard/prd-grid";
import { Star, StarOff, Trash2, FileText, Zap } from "lucide-react";

import { usePRDs } from "@/hooks/use-prds";
import { useIdeas } from "@/hooks/use-ideas";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { SimpleAnimatedTabs } from "@/components/ui/simple-animated-tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedSearch, SearchFilters } from "@/components/ui/enhanced-search";
import {
  filterIdeas,
  getIdeaCategories,
  sortByRelevance,
} from "@/lib/search-utils";
import { QuickSearch } from "@/components/ui/quick-search";
import { Idea, IdeaStatus, IdeaPriority } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";
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

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CollaborationRequestModal } from "@/components/ui/collaboration-request-modal";
import { CollaboratorsManagement } from "@/components/ui/collaborators-management";
import { SharedIdeasGrid } from "@/components/ui/shared-ideas-grid";

import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ArrowUp, Square } from "lucide-react";
import { enhanceIdea } from "@/lib/gemini";
import { toast } from "@/hooks/use-toast";

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace("_", " ");
};

export default function DashboardPage() {
  const {
    prds,
    loading: prdsLoading,
    error: prdsError,
    refreshPRDs,
    deletePRD,
  } = usePRDs();
  const {
    ideas,
    loading: ideasLoading,
    createIdea,
    updateIdea,
    deleteIdea,
  } = useIdeas();
  const { user, isAuthenticated, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ideas");

  // Check URL parameters for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(
      "🔍 Dashboard URL params:",
      Object.fromEntries(urlParams.entries())
    );

    const tabParam = urlParams.get("tab");
    if (tabParam && ["ideas", "shared", "prds"].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Handle prompt parameter from landing page
    const promptParam = urlParams.get("prompt");
    if (promptParam) {
      setPromptInput(decodeURIComponent(promptParam));
      // Auto-focus the prompt input after a short delay
      setTimeout(() => {
        const promptTextarea = document.querySelector(
          'textarea[placeholder*="With Nexi"]'
        ) as HTMLTextAreaElement;
        if (promptTextarea) {
          promptTextarea.focus();
          promptTextarea.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);

      // Clean up URL to remove the prompt parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("prompt");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, []);

  // Listen for URL changes (for when navigating from notification dropdown)
  useEffect(() => {
    const handleLocationChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["ideas", "shared", "prds"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    priority: "all",
    category: "all",
    dateRange: { from: null, to: null },
    tags: [],
    favorites: false,
    recentlyModified: false,
  });

  // Phase 1 features state
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Dashboard: Checking authentication...");
      console.log("👤 Current user from useAuth:", user?.email);
      console.log("✅ Is authenticated:", isAuthenticated);

      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams =
        urlParams.has("access_token") ||
        urlParams.has("refresh_token") ||
        urlParams.has("error");

      if (hasOAuthParams) {
        console.log("🔄 OAuth callback detected, handling...");
        console.log(
          "📋 OAuth params:",
          Object.fromEntries(urlParams.entries())
        );

        try {
          // Handle OAuth callback by setting the session
          const { data, error } = await supabase.auth.setSession({
            access_token: urlParams.get("access_token") || "",
            refresh_token: urlParams.get("refresh_token") || "",
          });

          console.log("📡 OAuth setSession result:", { data, error });

          if (error) {
            console.error("❌ OAuth setSession error:", error);
          } else if (data.session) {
            console.log(
              "✅ OAuth session established for:",
              data.session.user.email
            );
            // Clean up URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.search = "";
            window.history.replaceState({}, "", newUrl.toString());
          }
        } catch (error) {
          console.error("💥 OAuth callback handling failed:", error);
        }
      }

      // Also check URL hash for OAuth tokens (alternative callback method)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasHashTokens =
        hashParams.has("access_token") || hashParams.has("refresh_token");

      if (hasHashTokens) {
        console.log("🔄 OAuth hash tokens detected, handling...");
        console.log(
          "📋 Hash params:",
          Object.fromEntries(hashParams.entries())
        );

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashParams.get("access_token") || "",
            refresh_token: hashParams.get("refresh_token") || "",
          });

          console.log("📡 OAuth hash setSession result:", { data, error });

          if (data.session) {
            console.log(
              "✅ OAuth hash session established for:",
              data.session.user.email
            );
            // Clean up URL hash
            window.location.hash = "";
          }
        } catch (error) {
          console.error("💥 OAuth hash callback handling failed:", error);
        }
      }

      // If we don't have a user but we're on the dashboard (possibly after OAuth redirect)
      if (!user && !isAuthenticated) {
        console.log("🔄 No user found, attempting to refresh session...");
        await refreshSession();

        // Check again after refresh
        const {
          data: { user: refreshedUser },
          error,
        } = await supabase.auth.getUser();

        if (error || !refreshedUser) {
          console.log("❌ Still no user after refresh, redirecting to login");
          navigate("/login");
          return;
        } else {
          console.log("✅ User found after refresh:", refreshedUser.email);
        }
      } else if (user) {
        console.log("✅ User already authenticated:", user.email);
      }

      // Debug: Check localStorage for Supabase session data
      const supabaseKeys = Object.keys(localStorage).filter((key) =>
        key.includes("supabase")
      );
      console.log("🔍 Supabase localStorage keys:", supabaseKeys);
      if (supabaseKeys.length > 0) {
        supabaseKeys.forEach((key) => {
          try {
            const value = localStorage.getItem(key);
            console.log(`📦 ${key}:`, value ? JSON.parse(value) : null);
          } catch (e) {
            console.log(`📦 ${key}:`, localStorage.getItem(key));
          }
        });
      }
    };

    checkAuth();
  }, [navigate, user, isAuthenticated, refreshSession]);

  const handleCreateIdea = async () => {
    if (!promptInput.trim()) {
      return;
    }

    setIsEnhancing(true);

    try {
      // Enhance the idea using Gemini
      const enhancedIdea = await enhanceIdea(promptInput);

      // Create the idea with enhanced data
      const newIdeaData = {
        title: enhancedIdea.title,
        description: enhancedIdea.description,
        category: enhancedIdea.category,
        status: "new" as IdeaStatus,
        priority: enhancedIdea.priority as IdeaPriority,
        market_size: enhancedIdea.market_size,
        competition: enhancedIdea.competition,
        notes: `Original Idea: "${promptInput}"\n\nTarget Audience: ${
          enhancedIdea.target_audience
        }\n\nProblem: ${enhancedIdea.problem_statement}\n\nValue Proposition: ${
          enhancedIdea.value_proposition
        }\n\nKey Features: ${enhancedIdea.key_features.join(", ")}`,
        attachments: [],
        is_favorite: false,
      };

      const newIdea = await createIdea(newIdeaData);

      toast({
        title: "Idea Created Successfully!",
        description: `"${enhancedIdea.title}" has been enhanced and added to your ideas.`,
      });

      setPromptInput("");

      // Navigate to the newly created idea
      navigate(`/idea/${newIdea.id}`);
    } catch (error) {
      console.error("Failed to create idea:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";
      let actionMessage = "";

      if (error instanceof Error) {
        if (
          error.message.includes("quota") ||
          error.message.includes("rate limit")
        ) {
          errorMessage = "Gemini API limit reached. Creating idea manually...";
          actionMessage =
            "Your idea has been saved, but you'll need to edit the details manually.";

          // Create a basic idea without AI enhancement as fallback
          try {
            const basicIdeaData = {
              title:
                promptInput.slice(0, 60) +
                (promptInput.length > 60 ? "..." : ""),
              description: promptInput,
              category: "Other",
              status: "new" as IdeaStatus,
              priority: "medium" as IdeaPriority,
              market_size: "",
              competition: "",
              notes: `Original Idea: "${promptInput}"\n\nCreated manually due to API limits. Please enhance the details.`,
              attachments: [],
              is_favorite: false,
            };

            const newBasicIdea = await createIdea(basicIdeaData);

            toast({
              title: "Idea Created (Manual Mode)",
              description:
                "Your idea has been saved. You can edit and enhance it manually from the Ideas page.",
            });

            setPromptInput("");

            // Navigate to the newly created idea
            navigate(`/idea/${newBasicIdea.id}`);
            return;
          } catch (fallbackError) {
            console.error("Fallback creation failed:", fallbackError);
          }
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Failed to Create Idea",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGeneratePRD = async (idea: Idea) => {
    navigate("/generate", { state: { idea } });
  };

  const toggleFavorite = async (idea: Idea) => {
    await updateIdea(idea.id, { is_favorite: !idea.is_favorite });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await deleteIdea(ideaId);
    } catch (error) {
      console.error("Failed to delete idea:", error);
    }
  };

  // Enhanced filtering with search utilities
  const filteredIdeas = sortByRelevance(
    filterIdeas(ideas, searchFilters),
    searchFilters.query
  );

  // Get unique categories for filter dropdown
  const ideaCategories = getIdeaCategories(ideas);

  if (prdsLoading || ideasLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-4 bg-[#5A827E]/20 border border-[#5A827E]/30" />
            <div className="flex space-x-4 mb-4">
              <Skeleton className="h-8 w-24 bg-[#5A827E]/20 border border-[#5A827E]/30" />
              <Skeleton className="h-8 w-24 bg-[#5A827E]/20 border border-[#5A827E]/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                className="bg-black/40 backdrop-blur-md border border-white/10"
                key={i}
              >
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2 bg-[#5A827E]/30 border border-[#B9D4AA]/30" />
                  <Skeleton className="h-4 w-24 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-3/4 mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-1/2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (prdsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{prdsError.message}</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleNewIdea = () => {
    setPromptInput("");
    // Focus on the prompt input
    const promptInput = document.querySelector(
      'textarea[placeholder*="Describe your product idea"]'
    ) as HTMLTextAreaElement;
    if (promptInput) {
      promptInput.focus();
      promptInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Quick Search Dialog */}
      <QuickSearch
        isOpen={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
        ideas={ideas}
        prds={prds}
        onCreateIdea={handleNewIdea}
        onCreatePRD={() => navigate("/generate")}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Centered Prompt Input Section */}
        <div className="max-w-2xl mx-auto text-center space-y-6 mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Describe Your Idea
            </h2>
            <p className="text-muted-foreground">
              Tell Nexi about your product idea and Nexi will help structure and
              enhance it
            </p>
          </div>

          <div className="w-full">
            <PromptInput
              value={promptInput}
              onValueChange={setPromptInput}
              isLoading={isEnhancing}
              onSubmit={handleCreateIdea}
              className="w-full"
              maxHeight={200}
            >
              <PromptInputTextarea
                animatedPlaceholder={{
                  texts: [
                    "create a mobile app that helps students find study groups nearby",
                    "build a SaaS platform for small businesses to manage their inventory",
                    "design an AI-powered tool that creates personalized workout plans",
                    "develop a web app that connects freelancers with local businesses",
                    "invent a smart home device that optimizes energy consumption",
                    "launch a social platform for pet owners to arrange playdates",
                    "make an educational app that gamifies learning coding",
                    "start a marketplace for sustainable and eco-friendly products",
                    "help me brainstorm a revolutionary tech startup idea",
                    "analyze the market potential for my product concept",
                  ],
                  prefix: "",
                }}
              />
              <PromptInputActions className="justify-end pt-2">
                <PromptInputAction
                  tooltip={
                    isEnhancing
                      ? "AI is enhancing your idea..."
                      : "Create idea with AI enhancement"
                  }
                >
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCreateIdea}
                    disabled={!promptInput.trim() || isEnhancing}
                  >
                    {isEnhancing ? (
                      <Square className="size-5 fill-current animate-pulse" />
                    ) : (
                      <ArrowUp className="size-5" />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>

            {isEnhancing && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  AI is analyzing and enhancing your idea...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Your Workspace</h1>
        </div>

        <SimpleAnimatedTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            {
              id: "ideas",
              label: "Ideas",
              icon: <FileText className="h-4 w-4" />,
              content: (
                <div className="space-y-6">
                  {/* Enhanced Search Component */}
                  <EnhancedSearch
                    onFiltersChange={setSearchFilters}
                    placeholder="Search ideas by title, description, category..."
                    categories={ideaCategories}
                    className="mb-6"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIdeas.map((idea) => (
                      <Card
                        key={idea.id}
                        className="group relative cursor-pointer hover:shadow-xl transition-all duration-300 ease-out flex flex-col h-full min-h-[280px] hover:scale-105 hover:-translate-y-2 transform-gpu overflow-hidden border hover:border-primary/20"
                        onClick={() => navigate(`/idea/${idea.id}`)}
                      >
                        {/* Hover Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Subtle Border Glow */}
                        <div className="absolute inset-0 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <CardHeader className="pb-2 relative z-10">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                              {idea.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(idea);
                                }}
                              >
                                {idea.is_favorite ? (
                                  <Star className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Idea
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this idea?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteIdea(idea.id)}
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
                        <CardContent className="flex flex-col flex-1 relative z-10">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                              {idea.description}
                            </p>
                          </div>
                          <div className="mt-auto space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                                {capitalizeFirst(idea.status)}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                                {capitalizeFirst(idea.priority)}
                              </span>
                              {idea.is_shared && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 group-hover:scale-105 transition-all duration-300">
                                  <svg
                                    className="h-3 w-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  Shared ({idea.permission_level})
                                </span>
                              )}
                            </div>
                            {/* <div className="flex flex-col gap-4 mt-6">
                              <InteractiveHoverButton
                                text="Generate PRD for AI Tools"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGeneratePRD(idea);
                                }}
                                className="text-sm px-4 py-3 w-full min-h-[44px] flex items-center justify-center font-medium"
                              />
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex gap-3"
                              >
                                <CollaborationRequestModal
                                  idea={idea}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-1 text-sm px-4 py-2.5 min-h-[40px] flex items-center justify-center gap-2 font-medium"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                        />
                                      </svg>
                                      Invite
                                    </Button>
                                  }
                                />
                                <CollaboratorsManagement
                                  idea={idea}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-1 text-sm px-4 py-2.5 min-h-[40px] flex items-center justify-center gap-2 font-medium"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      Manage
                                    </Button>
                                  }
                                />
                              </div>
                            </div> */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              id: "shared",
              label: "Shared with Me",
              icon: (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              ),
              content: (
                <div className="space-y-4">
                  <SharedIdeasGrid />
                </div>
              ),
            },

            {
              id: "prds",
              label: "PRDs",
              icon: <Zap className="h-4 w-4" />,
              content: (
                <div className="space-y-4">
                  <PRDGrid
                    prds={prds}
                    onDelete={refreshPRDs}
                    deletePRD={deletePRD}
                  />
                </div>
              ),
            },
          ]}
        />

        {/* Idea Detail Dialog */}
        <Dialog
          open={!!selectedIdea}
          onOpenChange={() => setSelectedIdea(null)}
        >
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedIdea?.title}</DialogTitle>
            </DialogHeader>
            {selectedIdea && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 text-foreground">
                    Description
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedIdea.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">Status</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {capitalizeFirst(selectedIdea.status)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Priority
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {capitalizeFirst(selectedIdea.priority)}
                    </span>
                  </div>
                </div>

                {selectedIdea.market_size && (
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Market Size
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedIdea.market_size}
                    </p>
                  </div>
                )}

                {selectedIdea.competition && (
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Competition
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedIdea.competition}
                    </p>
                  </div>
                )}

                {selectedIdea.notes && (
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">Notes</h3>
                    <p className="text-muted-foreground">
                      {selectedIdea.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIdea(null)}
                    className="px-4 py-2.5 min-h-[40px] font-medium"
                  >
                    Close
                  </Button>
                  <CollaborationRequestModal idea={selectedIdea} />
                  <CollaboratorsManagement idea={selectedIdea} />
                  <InteractiveHoverButton
                    text="Generate PRD for AI Tools"
                    variant="default"
                    onClick={() => handleGeneratePRD(selectedIdea)}
                    className="px-4 py-2.5 min-h-[40px] text-sm flex items-center justify-center font-medium"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
