"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">IdeaVault</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
