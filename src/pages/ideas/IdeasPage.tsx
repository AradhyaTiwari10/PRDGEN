import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIdeas } from "@/hooks/use-ideas";
import { Idea, IdeaStatus, IdeaPriority } from "@/types";
import {
  Plus,
  Search,
  Filter,
  Star,
  StarOff,
  FileText,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function IdeasPage() {
  const navigate = useNavigate();
  const { ideas, collections, loading, createIdea, updateIdea, deleteIdea } =
    useIdeas();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<IdeaPriority | "all">(
    "all"
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    status: "new" as IdeaStatus,
    priority: "medium" as IdeaPriority,
    market_size: "",
    competition: "",
    notes: "",
    is_favorite: false,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

  const handleCreateIdea = async () => {
    try {
      await createIdea(newIdea);
      setIsCreateDialogOpen(false);
      setNewIdea({
        title: "",
        description: "",
        content: "",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">My Ideas</h1>
          </div>
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
                      setNewIdea({ ...newIdea, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="ready_for_prd">
                          Ready for PRD
                        </SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="market_size">Market Size</Label>
                  <Input
                    id="market_size"
                    value={newIdea.market_size}
                    onChange={(e) =>
                      setNewIdea({ ...newIdea, market_size: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="competition">Competition</Label>
                  <Textarea
                    id="competition"
                    value={newIdea.competition}
                    onChange={(e) =>
                      setNewIdea({ ...newIdea, competition: e.target.value })
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
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateIdea}>Create Idea</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: IdeaStatus | "all") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="ready_for_prd">Ready for PRD</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(value: IdeaPriority | "all") =>
              setPriorityFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <Card
              key={idea.id}
              className="relative cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
              onClick={() => navigate(`/idea/${idea.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {idea.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(idea);
                  }}
                >
                  {idea.is_favorite ? (
                    <Star className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{idea.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      idea.status === "new"
                        ? "bg-blue-100 text-blue-800"
                        : idea.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : idea.status === "ready_for_prd"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {idea.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      idea.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : idea.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {idea.priority} priority
                  </span>
                </div>
                {idea.market_size && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Market Size:</span>{" "}
                    {idea.market_size}
                  </p>
                )}
                {idea.competition && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Competition:</span>{" "}
                    {idea.competition}
                  </p>
                )}
              </CardContent>
              <CardFooter className="mt-auto flex justify-end">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/idea/${idea.id}`);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Prompt
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
