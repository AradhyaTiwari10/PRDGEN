"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PRD } from "@/types";
import { PRDViewer } from "@/components/prd/prd-viewer";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePRDs } from "@/hooks/use-prds";

export default function PRDPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prd, setPrd] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(true);
  const { deletePRD } = usePRDs();

  useEffect(() => {
    const fetchPRD = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("You must be logged in to view PRDs");

        const { data, error } = await supabase
          .from("prds")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Prompt not found");

        setPrd(data);
      } catch (error) {
        console.error("Error fetching Prompts:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPRD();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await deletePRD(id!);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete PRD:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!prd) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8">
        <PRDViewer prd={prd} onDelete={handleDelete} />
      </main>
    </div>
  );
}
