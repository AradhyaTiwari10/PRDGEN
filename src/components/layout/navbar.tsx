import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { FileText, LogOut, Keyboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { useTheme } from "@/components/theme-provider";

export function Navbar() {
  const navigate = useNavigate();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { theme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src={theme === "dark" ? "https://i.postimg.cc/DwVdb9NB/image.png" : "/icon.png"}
              alt="IdeaVault Icon"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">IdeaVault</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShortcutsOpen(true)}
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Shortcuts
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </header>
  );
}
