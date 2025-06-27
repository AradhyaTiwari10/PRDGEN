"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PRD } from "@/types";
import { PRDViewer } from "@/components/prd/prd-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PRDPage() {
  const [prd, setPrd] = useState<PRD | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

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
      fetchPRD(user.id);
    };

    checkAuth();
  }, [navigate, id]);

  const fetchPRD = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("prds")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          navigate("/dashboard");
          return;
        }
        throw error;
      }

      setPrd(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PRD",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 bg-[#5A827E]/20 border border-[#5A827E]/30" />
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-[#5A827E]/30 border border-[#B9D4AA]/30" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                      <Skeleton className="h-6 w-24 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                      <Skeleton className="h-4 w-32 bg-[#5A827E]/15 border border-[#B9D4AA]/15" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-8 w-8 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-8 w-24 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-8 w-24 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-[#5A827E]/20 border border-[#5A827E]/30" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-3/4 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-5/6 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-[#5A827E]/20 border border-[#5A827E]/30" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-[#5A827E]/25 border border-[#B9D4AA]/25" />
                    <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-4 w-5/6 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-2/3 bg-[#5A827E]/25 border border-[#B9D4AA]/25" />
                    <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-4 w-4/5 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-1/2 bg-[#5A827E]/25 border border-[#B9D4AA]/25" />
                    <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                    <Skeleton className="h-4 w-3/4 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!prd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            PRD Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The PRD you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <PRDViewer prd={prd} />
      </main>
    </div>
  );
}
