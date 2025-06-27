"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PRDGrid } from "@/components/dashboard/prd-grid";
import {
  Star,
  StarOff,
  Trash2,
  FileText,
  Zap,
  Sparkles,
  ArrowRight,
  LogOut,

} from "lucide-react";

import { usePRDs } from "@/hooks/use-prds";
import { useIdeas } from "@/hooks/use-ideas";
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
import { filterIdeas, getIdeaCategories, sortByRelevance } from "@/lib/search-utils";
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
import { useAuth } from "@/hooks/use-auth";

import { motion } from "framer-motion";
import { IdeaVaultLogo } from "@/components/ui/idea-vault-logo";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { CollaborationNotificationBanner } from "@/components/ui/collaboration-notification-banner";

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();

  const [promptText, setPromptText] = useState("");

  // Dashboard functionality
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
  const [activeTab, setActiveTab] = useState("ideas");

  // Check URL parameters for tab selection and prompt
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['ideas', 'shared', 'prds'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Handle prompt parameter from URL
    const promptParam = urlParams.get('prompt');
    if (promptParam) {
      setPromptText(decodeURIComponent(promptParam));
      // Auto-focus the prompt input after a short delay
      setTimeout(() => {
        const promptTextarea = document.querySelector('textarea[placeholder*="With Nexi"]') as HTMLTextAreaElement;
        if (promptTextarea) {
          promptTextarea.focus();
          promptTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Clean up URL to remove the prompt parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('prompt');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  // Search and filter state
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
  const [isEnhancing, setIsEnhancing] = useState(false);



  // Dashboard functions
  const handleCreateIdea = async () => {
    if (!promptText.trim()) {
      return;
    }

    setIsEnhancing(true);

    try {
      // Enhance the idea using Gemini
      const enhancedIdea = await enhanceIdea(promptText);
      
      // Create the idea with enhanced data
      const newIdeaData = {
        title: enhancedIdea.title,
        description: enhancedIdea.description,
        category: enhancedIdea.category,
        status: "new" as IdeaStatus,
        priority: enhancedIdea.priority as IdeaPriority,
        market_size: enhancedIdea.market_size,
        competition: enhancedIdea.competition,
        notes: `Original Idea: "${promptText}"\n\nTarget Audience: ${enhancedIdea.target_audience}\n\nProblem: ${enhancedIdea.problem_statement}\n\nValue Proposition: ${enhancedIdea.value_proposition}\n\nKey Features: ${enhancedIdea.key_features.join(", ")}`,
        attachments: [],
        is_favorite: false
      };

      const newIdea = await createIdea(newIdeaData);
      
      toast({
        title: "Idea Created Successfully!",
        description: `"${enhancedIdea.title}" has been enhanced and added to your ideas.`,
      });

      // Navigate to the detailed idea page
      navigate(`/idea/${newIdea.id}`);
      
      // Clear prompt
      setPromptText("");
    } catch (error) {
      console.error("Error creating idea:", error);
      
      // Fallback: create basic idea
      try {
        const basicIdeaData = {
          title: promptText.slice(0, 100), // Use first 100 chars as title
          description: promptText,
          category: "general",
          status: "new" as IdeaStatus,
          priority: "medium" as IdeaPriority,
          market_size: "Unknown",
          competition: "Unknown", 
          notes: `Original Idea: "${promptText}"`,
          attachments: [],
          is_favorite: false
        };

        const newIdea = await createIdea(basicIdeaData);
        
        toast({
          title: "Idea Created!",
          description: "Your idea has been saved. AI enhancement failed, but you can edit it manually.",
        });

        // Navigate to the detailed idea page
        navigate(`/idea/${newIdea.id}`);
        
        // Clear prompt
        setPromptText("");
      } catch (fallbackError) {
        toast({
          title: "Error Creating Idea",
          description: "Failed to create idea. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGeneratePRD = async (idea: Idea) => {
    navigate(`/generate?ideaId=${idea.id}`);
  };

  const toggleFavorite = async (idea: Idea) => {
    await updateIdea(idea.id, { is_favorite: !idea.is_favorite });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
  };

  const handleNewIdea = () => {
    const promptInput = document.querySelector('textarea[placeholder*="With Nexi"]') as HTMLTextAreaElement;
    if (promptInput) {
      promptInput.focus();
      promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Filter ideas based on search criteria
  const filteredIdeas = filterIdeas(ideas, searchFilters);
  const ideaCategories = getIdeaCategories(ideas);

  const handlePromptSubmit = () => {
    if (isAuthenticated) {
      handleCreateIdea();
    } else {
      if (promptText.trim()) {
        navigate(`/signup?prompt=${encodeURIComponent(promptText.trim())}`);
      } else {
        navigate("/signup");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background SVG */}
        <div className="fixed inset-0 z-0">
          <svg 
            className="w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg" 
            width="2596" 
            height="2600" 
            viewBox="0 200 2596 2600" 
            fill="none" 
            preserveAspectRatio="xMidYMid slice"
          >
            <g filter="url(#filter0_f)">
              <rect x="2143" y="455" width="1690" height="1690" rx="710.009" transform="rotate(90 2143 455)" fill="#84AE92" opacity="0.65" />
            </g>
            <g filter="url(#filter1_f)">
              <rect x="2126" y="474.675" width="1655.58" height="1653.6" rx="710.009" transform="rotate(90 2126 474.675)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter_common_f)">
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#5A827E" />
              <rect x="2057" y="576.304" width="1452.32" height="1515.8" rx="710.009" transform="rotate(90 2057 576.304)" fill="#FAFFCA" />
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter5_f)">
              <rect x="1858" y="766.034" width="1084.79" height="1117.93" rx="483.146" transform="rotate(90 1858 766.034)" fill="#84AE92" />
            </g>
            <g filter="url(#filter6_f)">
              <rect x="1779" y="698.622" width="1178.25" height="962.391" rx="481.196" transform="rotate(90 1779 698.622)" fill="#5A827E" />
            </g>
            <defs>
              <filter id="filter0_f" x="0.074" y="2.074" width="2595.85" height="2595.85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="140" />
              </filter>
              <filter id="filter1_f" x="250.311" y="252.587" width="2097.78" height="2099.76" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="60" />
              </filter>
              <filter id="filter_common_f" x="393" y="428" width="1812" height="1748" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="58" />
              </filter>
              <filter id="filter5_f" x="443.964" y="469.927" width="1710.14" height="1677" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
              <filter id="filter6_f" x="520.502" y="402.515" width="1554.6" height="1770.46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
            </defs>
          </svg>
        </div>
        
        {/* Dark overlay for better text readability */}
        <div className="fixed inset-0 z-10 bg-black/40"></div>
        
        <header className="relative z-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg bg-white/10 border border-white/20" />
                <Skeleton className="h-6 w-32 bg-white/10 border border-white/20" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-20 bg-white/10 border border-white/20" />
                <Skeleton className="h-8 w-24 bg-white/10 border border-white/20" />
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-20 flex flex-col items-center justify-center flex-1 py-12">
          <div className="text-center space-y-6">
            <Skeleton className="h-16 w-96 bg-white/10 border border-white/20 mx-auto" />
            <Skeleton className="h-6 w-80 bg-white/10 border border-white/20 mx-auto" />
            <Skeleton className="h-12 w-64 bg-white/10 border border-white/20 mx-auto mt-8" />
          </div>
        </main>
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
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen w-full relative overflow-hidden scroll-smooth">
      {/* Background SVG */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 scale-125 transform"
          style={{
            animation: 'breathe 8s ease-in-out infinite'
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
            <rect x="2143" y="455" width="1690" height="1690" rx="710.009" transform="rotate(90 2143 455)" fill="#84AE92" opacity="0.65" />
          </g>
          <g filter="url(#filter1_f)">
            <rect x="2126" y="474.675" width="1655.58" height="1653.6" rx="710.009" transform="rotate(90 2126 474.675)" fill="#B9D4AA" opacity="0.65" />
          </g>
          <g filter="url(#filter_common_f)">
            <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#5A827E" />
            <rect x="2057" y="576.304" width="1452.32" height="1515.8" rx="710.009" transform="rotate(90 2057 576.304)" fill="#FAFFCA" />
            <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#B9D4AA" opacity="0.65" />
          </g>
          <g filter="url(#filter5_f)">
            <rect x="1858" y="766.034" width="1084.79" height="1117.93" rx="483.146" transform="rotate(90 1858 766.034)" fill="#84AE92" />
          </g>
          <g filter="url(#filter6_f)">
            <rect x="1779" y="698.622" width="1178.25" height="962.391" rx="481.196" transform="rotate(90 1779 698.622)" fill="#5A827E" />
          </g>
          <defs>
            <filter id="filter0_f" x="0.074" y="2.074" width="2595.85" height="2595.85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="140" />
            </filter>
            <filter id="filter1_f" x="250.311" y="252.587" width="2097.78" height="2099.76" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="60" />
            </filter>
            <filter id="filter_common_f" x="393" y="428" width="1812" height="1748" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="58" />
            </filter>
            <filter id="filter5_f" x="443.964" y="469.927" width="1710.14" height="1677" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="115" />
            </filter>
            <filter id="filter6_f" x="520.502" y="402.515" width="1554.6" height="1770.46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="115" />
            </filter>
          </defs>
        </svg>
        </div>
      </div>
      
      {/* Gradient overlay for smoother fade like Lovable */}
      <div className="fixed inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div 
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => navigate("/")}
              >
                <IdeaVaultLogo 
                  size="lg" 
                  variant="light" 
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">

              {isAuthenticated ? (
                <>
                  <span className="text-sm text-white/70">
                    {user?.email}
                  </span>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={signOut}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Dialog */}
      {isAuthenticated && (
        <QuickSearch
          isOpen={isQuickSearchOpen}
          onOpenChange={setIsQuickSearchOpen}
          ideas={ideas}
          prds={prds}
          onCreateIdea={handleNewIdea}
          onCreatePRD={() => navigate("/generate")}
        />
      )}

      {/* Main Content */}
      <main className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 max-w-full mx-auto">
        {!isAuthenticated ? (
          /* Landing Page Content for Non-Authenticated Users */
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Build something
                  <span className="ml-4 inline-flex items-center">
                    <IdeaVaultLogo 
                      size="xl" 
                      variant="gradient" 
                      className="mr-2"
                    />
                    <span className="bg-gradient-to-r from-[#5A827E] via-[#84AE92] to-[#B9D4AA] bg-clip-text text-transparent">
                      IdeaVault
                    </span>
                  </span>
              </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Create apps and websites by chatting with AI
                </p>
            </motion.div>

              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ask IdeaVault to create a web app that..."
                      className="flex-1 bg-transparent text-white placeholder-white/60 text-lg border-none outline-none"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center space-x-2">
                      <button className="bg-white/10 hover:bg-white/20 text-white/60 px-3 py-2 rounded-lg text-sm border border-white/20 transition-colors">
                        🌐 Public
                      </button>
                      <button 
                        className="bg-white text-gray-900 hover:bg-gray-100 p-3 rounded-xl transition-colors"
                        onClick={handlePromptSubmit}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
          </div>
        </div>
          </div>
              </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Button
                  onClick={() => {
                    if (promptText.trim()) {
                      navigate(`/signup?prompt=${encodeURIComponent(promptText.trim())}`);
                    } else {
                      navigate("/signup");
                    }
                  }}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  Start Building
                </Button>
                <Button
                    variant="outline"
                  onClick={() => {
                    if (promptText.trim()) {
                      navigate(`/login?prompt=${encodeURIComponent(promptText.trim())}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  Sign In
                </Button>
            </motion.div>
          </div>
        </div>
        ) : (
          /* Dashboard Content for Authenticated Users */
          <>
            {/* Centered Prompt Input Section */}
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 mb-20">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-[#FAFFCA]">Let's Build Your Next Billion Dollar Idea</h2>
                <p className="text-[#B9D4AA] text-lg ">
                  Tell Nexi about your product idea and Nexi will help structure and enhance it
            </p>
          </div>
          
              <div className="w-full max-w-4xl">
                <PromptInput
                  value={promptText}
                  onValueChange={setPromptText}
                  isLoading={isEnhancing}
                  onSubmit={handleCreateIdea}
                  className="w-full bg-[#1C1C1C]/80 backdrop-blur-md border-[#5A827E] text-lg min-h-[120px]"
                  maxHeight={400}
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
                        "analyze the market potential for my product concept"
                      ],
                      prefix: "With Nexi "
                    }}
                    className="text-[#FAFFCA] placeholder-[#B9D4AA]/80 bg-transparent"
                  />
                  <PromptInputActions className="justify-end pt-2">
                    <PromptInputAction
                      tooltip={isEnhancing ? "AI is enhancing your idea..." : "Create idea with AI enhancement"}
                    >
                      <Button
                        variant="default"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={handleCreateIdea}
                        disabled={!promptText.trim() || isEnhancing}
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
                  <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-md">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      AI is analyzing and enhancing your idea...
                    </div>
                    </div>
                )}
          </div>
          </div>
          
            {/* Workspace Section */}
            <div className="bg-[#1C1C1C] rounded-2xl p-8 mx-4 space-y-6 min-h-screen border-t-4 border-[#5A827E]">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Your Workspace</h1>
                <div className="flex items-center gap-4">
                  {/* Collaboration Notifications */}
                  <NotificationDropdown />
                  
                  {/* Sign Out Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                        </div>
                      </div>
                      
            {/* Collaboration Notification Banner */}
            <CollaborationNotificationBanner />
            
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
                        className="mb-6 bg-[#5A827E]/30 border-[#84AE92]"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIdeas.map((idea) => (
                          <Card
                            key={idea.id}
                            className="group relative cursor-pointer hover:shadow-xl transition-all duration-300 ease-out flex flex-col h-full min-h-[280px] hover:scale-105 hover:-translate-y-2 transform-gpu overflow-hidden border border-[#5A827E] hover:border-[#84AE92] bg-[#5A827E]/20 backdrop-blur-md"
                            onClick={() => navigate(`/idea/${idea.id}`)}
                          >
                            {/* Hover Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#B9D4AA]/10 via-transparent to-[#84AE92]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Subtle Border Glow */}
                            <div className="absolute inset-0 rounded-lg border border-[#B9D4AA]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <CardHeader className="pb-2 relative z-10">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg text-white group-hover:text-[#B9D4AA] transition-colors duration-300">{idea.title}</CardTitle>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#B9D4AA] hover:text-[#FAFFCA] hover:bg-[#84AE92]/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(idea);
                                    }}
                                  >
                                    {idea.is_favorite ? (
                                      <Star className="h-4 w-4 text-yellow-400" />
                                    ) : (
                                      <StarOff className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-300 hover:bg-[#84AE92]/20"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-900/95 backdrop-blur-md border-white/20">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Idea</AlertDialogTitle>
                                        <AlertDialogDescription className="text-white/70">
                                          Are you sure you want to delete this idea? This
                                          action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteIdea(idea.id)}
                                          className="bg-red-600 text-white hover:bg-red-700"
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
                                <p className="text-sm text-white/80 line-clamp-3 group-hover:text-white transition-colors duration-300">
                                  {idea.description}
                            </p>
                          </div>
                              <div className="mt-auto space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                                    {capitalizeFirst(idea.status)}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white group-hover:bg-white/30 group-hover:scale-105 transition-all duration-300">
                                    {capitalizeFirst(idea.priority)}
                                  </span>
                                  {idea.is_shared && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/30 text-blue-200 group-hover:bg-blue-500/40 group-hover:scale-105 transition-all duration-300">
                                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                      Shared ({idea.permission_level})
                                    </span>
                                  )}
                            </div>
                                <div className="flex flex-col gap-4 mt-6">
                                  <InteractiveHoverButton
                                    text="Generate PRD for AI Tools"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGeneratePRD(idea);
                                    }}
                                    className="text-sm px-4 py-3 w-full min-h-[44px] flex items-center justify-center font-medium border-white/30 text-white hover:bg-white/10"
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
                                          className="flex-1 text-sm px-4 py-2.5 min-h-[40px] flex items-center justify-center gap-2 font-medium text-white/70 hover:text-white hover:bg-white/10"
                                        >
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
                                          className="flex-1 text-sm px-4 py-2.5 min-h-[40px] flex items-center justify-center gap-2 font-medium text-white/70 hover:text-white hover:bg-white/10"
                                        >
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                          </svg>
                                          Manage
                                        </Button>
                                      }
                                    />
                          </div>
                        </div>
                </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                },
                {
                  id: "shared",
                  label: "Shared with Me",
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>,
                  content: (
                    <SharedIdeasGrid />
                  )
                },
                                 {
                   id: "prds",
                   label: "PRDs",
                   icon: <Zap className="h-4 w-4" />,
                  content: (
                     <PRDGrid 
                       prds={prds}
                       deletePRD={deletePRD}
                     />
                   )
                 }
              ]}
            />
          </div>
          </>
        )}
      </main>
      

      
      {/* Footer - At bottom of page content */}
      <footer className="mt-16 py-8 bg-black border-t border-[#5A827E]/30 transition-all duration-300">
        <div className="max-w-full mx-auto px-8">
                      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
              <div className="flex items-center">
                <IdeaVaultLogo 
                  size="sm" 
                  variant="dark" 
                />
            </div>
            <div className="flex items-center space-x-6">
              <span>© 2024 IdeaVault. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Privacy</span>
                <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Terms</span>
                <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Contact</span>
          </div>
        </div>
            </div>
        </div>
      </footer>
    </div>
    </>
  );
}