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
} from "lucide-react";

import { usePRDs } from "@/hooks/use-prds";
import { useIdeas } from "@/hooks/use-ideas";
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
import { filterIdeas, getIdeaCategories, sortByRelevance } from "@/lib/search-utils";
import { QuickSearch } from "@/components/ui/quick-search";
import { Idea, IdeaStatus, IdeaPriority } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { AnimatedNewIdeaButton } from "@/components/ui/animated-new-idea-button";
import { useKeyboardShortcuts, commonShortcuts } from "@/hooks/use-keyboard-shortcuts";

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ideas");
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [formErrors, setFormErrors] = useState<{title?: string; description?: string}>({});
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    category: "",
    status: "new" as IdeaStatus,
    priority: "medium" as IdeaPriority,
    market_size: "",
    competition: "",
    notes: "",
    is_favorite: false,
    content: "",
  });

  // Global keyboard shortcuts - must be called before any conditional returns
  useKeyboardShortcuts([
    commonShortcuts.search(() => setIsQuickSearchOpen(true)),
    commonShortcuts.newItem(() => setIsCreateDialogOpen(true)),
    commonShortcuts.escape(() => {
      if (isQuickSearchOpen) {
        setIsQuickSearchOpen(false);
      } else if (isCreateDialogOpen) {
        setIsCreateDialogOpen(false);
      }
    }),
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/login");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCreateIdea = async () => {
    // Validate required fields
    const errors: {title?: string; description?: string} = {};

    if (!newIdea.title.trim()) {
      errors.title = "Title is required";
    }

    if (!newIdea.description.trim()) {
      errors.description = "Description is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear any previous errors
    setFormErrors({});

    try {
      await createIdea(newIdea);
      setIsCreateDialogOpen(false);
      setNewIdea({
        title: "",
        description: "",
        category: "",
        status: "new",
        priority: "medium",
        market_size: "",
        competition: "",
        notes: "",
        is_favorite: false,
        content: "",
      });
    } catch (error) {
      console.error("Failed to create idea:", error);
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
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="flex space-x-4 mb-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card className="bg-card" key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
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

  // Keyboard shortcut handlers
  const handleNewIdea = () => {
    setIsCreateDialogOpen(true);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

          {activeTab === "prds" ? (
            <InteractiveHoverButton
              text="Generate New Prompt"
              variant="default"
              onClick={() => navigate("/generate")}
              className="px-4 py-2"
            />
          ) : (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  // Clear form errors when dialog is closed
                  setFormErrors({});
                }
              }}
            >
              <DialogTrigger asChild>
                <AnimatedNewIdeaButton />
              </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Idea</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Fields marked with <span className="text-destructive">*</span> are required
                    </p>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={newIdea.title}
                        onChange={(e) => {
                          setNewIdea({ ...newIdea, title: e.target.value });
                          // Clear error when user starts typing
                          if (formErrors.title) {
                            setFormErrors({ ...formErrors, title: undefined });
                          }
                        }}
                        className={formErrors.title ? "border-destructive" : ""}
                        placeholder="Enter idea title..."
                      />
                      {formErrors.title && (
                        <p className="text-sm text-destructive">{formErrors.title}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={newIdea.description}
                        onChange={(e) => {
                          setNewIdea({
                            ...newIdea,
                            description: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (formErrors.description) {
                            setFormErrors({ ...formErrors, description: undefined });
                          }
                        }}
                        className={formErrors.description ? "border-destructive" : ""}
                        placeholder="Describe your idea in detail..."
                        rows={3}
                      />
                      {formErrors.description && (
                        <p className="text-sm text-destructive">{formErrors.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={newIdea.category}
                          onChange={(e) =>
                            setNewIdea({ ...newIdea, category: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newIdea.status}
                          onValueChange={(value: IdeaStatus) =>
                            setNewIdea({ ...newIdea, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newIdea.priority}
                          onValueChange={(value: IdeaPriority) =>
                            setNewIdea({ ...newIdea, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="market_size">Market Size</Label>
                        <Input
                          id="market_size"
                          value={newIdea.market_size}
                          onChange={(e) =>
                            setNewIdea({
                              ...newIdea,
                              market_size: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="competition">Competition</Label>
                      <Textarea
                        id="competition"
                        value={newIdea.competition}
                        onChange={(e) =>
                          setNewIdea({
                            ...newIdea,
                            competition: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newIdea.notes}
                        onChange={(e) =>
                          setNewIdea({ ...newIdea, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateIdea}
                      disabled={!newIdea.title.trim() || !newIdea.description.trim()}
                    >
                      Create Idea
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
                <div className="space-y-4">
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
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{idea.title}</CardTitle>
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
                              <AlertDialogTitle>Delete Idea</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this idea? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                          {capitalizeFirst(idea.status)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                          {capitalizeFirst(idea.priority)}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <InteractiveHoverButton
                          text="Generate Prompt for AI Tools"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePRD(idea);
                          }}
                          className="text-sm px-3 py-2 w-full min-h-[40px] flex items-center justify-center"
                        />
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
              id: "prds",
              label: "Prompts",
              icon: <Zap className="h-4 w-4" />,
              content: (
                <div className="space-y-4">
                  <PRDGrid prds={prds} onDelete={refreshPRDs} deletePRD={deletePRD} />
                </div>
              )
            }
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

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedIdea(null)}
                  >
                    Close
                  </Button>
                  <InteractiveHoverButton
                    text="Generate Prompt for AI Tools"
                    variant="default"
                    onClick={() => handleGeneratePRD(selectedIdea)}
                    className="px-4 py-2 text-sm flex items-center justify-center"
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
