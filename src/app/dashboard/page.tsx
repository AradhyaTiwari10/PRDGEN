"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { PRDGrid } from "@/components/dashboard/prd-grid";
import {
  Plus,
  Search,
  Filter,
  Star,
  StarOff,
  FileText,
  Trash2,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { usePRDs } from "@/hooks/use-prds";
import { useIdeas } from "@/hooks/use-ideas";
import { Navbar } from "@/components/layout/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/components/ui/use-toast";

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
    refreshIdeas,
  } = useIdeas();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ideas");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<IdeaPriority | "all">(
    "all"
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
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
  });

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

      setUser(user);
    };

    checkAuth();
  }, [navigate]);

  const handleCreateIdea = async () => {
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

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || idea.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || idea.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="prds">Prompts</TabsTrigger>
            </TabsList>

            {activeTab === "prds" ? (
              <Button onClick={() => navigate("/generate")}>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Prompt
              </Button>
            ) : (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Idea
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Idea</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newIdea.title}
                        onChange={(e) =>
                          setNewIdea({ ...newIdea, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newIdea.description}
                        onChange={(e) =>
                          setNewIdea({
                            ...newIdea,
                            description: e.target.value,
                          })
                        }
                      />
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
                  <div className="flex justify-end">
                    <Button onClick={handleCreateIdea}>Create Idea</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="prds" className="space-y-4">
            <PRDGrid prds={prds} onDelete={refreshPRDs} deletePRD={deletePRD} />
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value: IdeaStatus | "all") =>
                    setStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={(value: IdeaPriority | "all") =>
                    setPriorityFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.map((idea) => (
                <Card
                  key={idea.id}
                  className="relative cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/idea/${idea.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
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
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {idea.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {idea.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {idea.priority}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGeneratePRD(idea);
                        }}
                      >
                        Generate Prompt for Lovable, Bolt.new and Cursor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

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
                      {selectedIdea.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">
                      Priority
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {selectedIdea.priority}
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
                  <Button onClick={() => handleGeneratePRD(selectedIdea)}>
                    Generate Prompt for Lovable, Bolt.new and Cursor
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
