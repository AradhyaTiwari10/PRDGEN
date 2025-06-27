import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader>
                <Skeleton className="h-8 w-48 bg-[#5A827E]/20 border border-[#5A827E]/30" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-3/4 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                  <Skeleton className="h-4 w-5/6 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                </div>
              </CardContent>
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
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
