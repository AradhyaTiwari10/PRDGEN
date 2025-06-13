import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const navigate = useNavigate();

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
            <img src="/icon.png" alt="IdeaVault Icon" className="h-8 w-auto" />
            <span className="text-xl font-bold text-foreground">IdeaVault</span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
