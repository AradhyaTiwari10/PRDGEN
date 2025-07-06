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
  CardFooter,
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
import { Heart, Search, FileText, Calendar, Trash2, Share } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface SpecificationGridProps {
  specifications: PRD[];
  onDelete: () => void;
  deleteSpecification: (id: string) => Promise<void>;
}

export function SpecificationGrid({
  specifications,
  onDelete,
  deleteSpecification,
}: SpecificationGridProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSpecifications = specifications.filter((specification) => {
    const matchesSearch =
      specification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specification.original_idea
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || specification.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || specification.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(
    new Set(
      specifications
        .map((specification) => specification.category)
        .filter(Boolean)
    )
  );

  const handleDeleteClick = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSpecification(id);
      onDelete();
    } catch (error) {
      console.error("Failed to delete Specification:", error);
      toast({
        title: "Error",
        description: "Failed to delete specification.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (deletingId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32 bg-[#232e2b] border border-[#5A827E]" />
          <Skeleton className="h-10 w-32 bg-[#232e2b] border border-[#5A827E]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#1C1C1C]/80 backdrop-blur-md border border-[#5A827E]/30">
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2 bg-[#232e2b] border border-[#5A827E]" />
                <Skeleton className="h-4 w-24 bg-[#232e2b] border border-[#5A827E]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-[#232e2b] border border-[#5A827E]" />
                <Skeleton className="h-4 w-3/4 mb-2 bg-[#232e2b] border border-[#5A827E]" />
                <Skeleton className="h-4 w-1/2 bg-[#232e2b] border border-[#5A827E]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Specifications..."
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

      {filteredSpecifications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No Specifications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {specifications.length === 0
              ? "Get started by creating your first Specification"
              : "Try adjusting your search or filters"}
          </p>
          {specifications.length === 0 && (
            <div className="mt-6">
              <Button asChild>
                <Link to="/generate">Create Specification</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecifications.map((specification) => (
            <Card
              key={specification.id}
              className="relative flex flex-col h-full"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold line-clamp-1">
                    {specification.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {specification.is_favorite && (
                      <Heart className="h-4 w-4 text-red-500 fill-current flex-shrink-0" />
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={deletingId === specification.id}
                        >
                          {deletingId === specification.id ? (
                            <Skeleton className="h-8 w-32 bg-[#232e2b] border border-[#5A827E] text-white" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Specification
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this Specification?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClick(specification.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription className="max-h-[120px] overflow-y-auto">
                  {specification.original_idea}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow min-h-[150px]">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {specification.category && (
                      <Badge variant="secondary" className="text-xs">
                        {specification.category}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        specification.status === "final" ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {specification.status}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(specification.created_at).toLocaleDateString()}
                  </div>

                  <Button asChild className="w-full">
                    <Link to={`/specification/${specification.id}`}>
                      View Specification
                    </Link>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
