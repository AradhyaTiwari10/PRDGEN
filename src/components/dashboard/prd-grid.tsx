"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { PRD } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Search, FileText, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

interface PRDGridProps {
  prds: PRD[];
  onDelete?: () => void;
  deletePRD: (id: string) => Promise<void>;
}

export function PRDGrid({ prds, onDelete, deletePRD }: PRDGridProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPRDs = prds.filter((prd) => {
    const matchesSearch =
      prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.original_idea.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || prd.category === filterCategory;
    const matchesStatus = filterStatus === "all" || prd.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(
    new Set(prds.map((prd) => prd.category).filter(Boolean))
  );

  const handleDelete = async (prdId: string) => {
    try {
      await deletePRD(prdId);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete PRD:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search PRDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category!}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPRDs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No Prompts found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {prds.length === 0
              ? "Get started by creating your first PRD"
              : "Try adjusting your search or filters"}
          </p>
          {prds.length === 0 && (
            <div className="mt-6">
              <Button asChild>
                <Link to="/generate">Create PRD</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPRDs.map((prd) => (
            <Card key={prd.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {prd.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {prd.is_favorite && (
                      <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this Prompt? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(prd.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {prd.original_idea}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {prd.category && (
                      <Badge variant="secondary" className="text-xs">
                        {prd.category}
                      </Badge>
                    )}
                    <Badge
                      variant={prd.status === "final" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {prd.status}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(prd.created_at).toLocaleDateString()}
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/prd/${prd.id}`}>View Prompt</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
