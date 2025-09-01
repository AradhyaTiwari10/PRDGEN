"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
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

  const { user: authUser, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login");
      return;
    }

    if (authUser) {
      setUser(authUser);
      fetchPRD(authUser.id);
    }
  }, [authUser, isAuthenticated, loading, navigate, id]);

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
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background SVG */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 scale-125 transform"
            style={{
              animation: "breathe 8s ease-in-out infinite",
            }}
          >
            <svg
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
              width="4000"
              height="4000"
              viewBox="-900 -900 4400 4400"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <g filter="url(#filter0_f)">
                <rect
                  x="2143"
                  y="455"
                  width="1690"
                  height="1690"
                  rx="710.009"
                  transform="rotate(90 2143 455)"
                  fill="#84AE92"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter1_f)">
                <rect
                  x="2126"
                  y="474.675"
                  width="1655.58"
                  height="1653.6"
                  rx="710.009"
                  transform="rotate(90 2126 474.675)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter_common_f)">
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#5A827E"
                />
                <rect
                  x="2057"
                  y="576.304"
                  width="1452.32"
                  height="1515.8"
                  rx="710.009"
                  transform="rotate(90 2057 576.304)"
                  fill="#FAFFCA"
                />
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter5_f)">
                <rect
                  x="1858"
                  y="766.034"
                  width="1084.79"
                  height="1117.93"
                  rx="483.146"
                  transform="rotate(90 1858 766.034)"
                  fill="#84AE92"
                />
              </g>
              <g filter="url(#filter6_f)">
                <rect
                  x="1779"
                  y="698.622"
                  width="1178.25"
                  height="962.391"
                  rx="481.196"
                  transform="rotate(90 1779 698.622)"
                  fill="#5A827E"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f"
                  x="0.074"
                  y="2.074"
                  width="2595.85"
                  height="2595.85"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="140" />
                </filter>
                <filter
                  id="filter1_f"
                  x="250.311"
                  y="252.587"
                  width="2097.78"
                  height="2099.76"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="60" />
                </filter>
                <filter
                  id="filter_common_f"
                  x="393"
                  y="428"
                  width="1812"
                  height="1748"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="58" />
                </filter>
                <filter
                  id="filter5_f"
                  x="443.964"
                  y="469.927"
                  width="1710.14"
                  height="1677"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
                <filter
                  id="filter6_f"
                  x="520.502"
                  y="402.515"
                  width="1554.6"
                  height="1770.46"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        {/* Gradient overlay */}
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
            }}
          ></div>
        </div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
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
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background SVG */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 scale-125 transform"
            style={{
              animation: "breathe 8s ease-in-out infinite",
            }}
          >
            <svg
              className="w-full h-full object-cover"
              xmlns="http://www.w3.org/2000/svg"
              width="4000"
              height="4000"
              viewBox="-900 -900 4400 4400"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
            >
              <g filter="url(#filter0_f)">
                <rect
                  x="2143"
                  y="455"
                  width="1690"
                  height="1690"
                  rx="710.009"
                  transform="rotate(90 2143 455)"
                  fill="#84AE92"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter1_f)">
                <rect
                  x="2126"
                  y="474.675"
                  width="1655.58"
                  height="1653.6"
                  rx="710.009"
                  transform="rotate(90 2126 474.675)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter_common_f)">
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#5A827E"
                />
                <rect
                  x="2057"
                  y="576.304"
                  width="1452.32"
                  height="1515.8"
                  rx="710.009"
                  transform="rotate(90 2057 576.304)"
                  fill="#FAFFCA"
                />
                <rect
                  x="2018"
                  y="582.866"
                  width="1439.21"
                  height="1437.8"
                  rx="710.009"
                  transform="rotate(90 2018 582.866)"
                  fill="#B9D4AA"
                  opacity="0.65"
                />
              </g>
              <g filter="url(#filter5_f)">
                <rect
                  x="1858"
                  y="766.034"
                  width="1084.79"
                  height="1117.93"
                  rx="483.146"
                  transform="rotate(90 1858 766.034)"
                  fill="#84AE92"
                />
              </g>
              <g filter="url(#filter6_f)">
                <rect
                  x="1779"
                  y="698.622"
                  width="1178.25"
                  height="962.391"
                  rx="481.196"
                  transform="rotate(90 1779 698.622)"
                  fill="#5A827E"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f"
                  x="0.074"
                  y="2.074"
                  width="2595.85"
                  height="2595.85"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="140" />
                </filter>
                <filter
                  id="filter1_f"
                  x="250.311"
                  y="252.587"
                  width="2097.78"
                  height="2099.76"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="60" />
                </filter>
                <filter
                  id="filter_common_f"
                  x="393"
                  y="428"
                  width="1812"
                  height="1748"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="58" />
                </filter>
                <filter
                  id="filter5_f"
                  x="443.964"
                  y="469.927"
                  width="1710.14"
                  height="1677"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
                <filter
                  id="filter6_f"
                  x="520.502"
                  y="402.515"
                  width="1554.6"
                  height="1770.46"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="115" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
        {/* Gradient overlay */}
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
            }}
          ></div>
        </div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-[#1C1C1C]/80 backdrop-blur-md border border-[#5A827E]/30 rounded-lg p-8 max-w-md mx-4">
            <h1 className="text-2xl font-bold text-[#FAFFCA] mb-2">
              PRD Not Found
            </h1>
            <p className="text-[#B9D4AA] mb-4">
              The PRD you're looking for doesn't exist.
            </p>
            <Button
              asChild
              className="bg-[#5A827E] hover:bg-[#84AE92] text-[#FAFFCA]"
            >
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background SVG */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 scale-125 transform"
          style={{
            animation: "breathe 8s ease-in-out infinite",
          }}
        >
          <svg
            className="w-full h-full object-cover"
            xmlns="http://www.w3.org/2000/svg"
            width="4000"
            height="4000"
            viewBox="-900 -900 4400 4400"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g filter="url(#filter0_f)">
              <rect
                x="2143"
                y="455"
                width="1690"
                height="1690"
                rx="710.009"
                transform="rotate(90 2143 455)"
                fill="#84AE92"
                opacity="0.65"
              />
            </g>
            <g filter="url(#filter1_f)">
              <rect
                x="2126"
                y="474.675"
                width="1655.58"
                height="1653.6"
                rx="710.009"
                transform="rotate(90 2126 474.675)"
                fill="#B9D4AA"
                opacity="0.65"
              />
            </g>
            <g filter="url(#filter_common_f)">
              <rect
                x="2018"
                y="582.866"
                width="1439.21"
                height="1437.8"
                rx="710.009"
                transform="rotate(90 2018 582.866)"
                fill="#5A827E"
              />
              <rect
                x="2057"
                y="576.304"
                width="1452.32"
                height="1515.8"
                rx="710.009"
                transform="rotate(90 2057 576.304)"
                fill="#FAFFCA"
              />
              <rect
                x="2018"
                y="582.866"
                width="1439.21"
                height="1437.8"
                rx="710.009"
                transform="rotate(90 2018 582.866)"
                fill="#B9D4AA"
                opacity="0.65"
              />
            </g>
            <g filter="url(#filter5_f)">
              <rect
                x="1858"
                y="766.034"
                width="1084.79"
                height="1117.93"
                rx="483.146"
                transform="rotate(90 1858 766.034)"
                fill="#84AE92"
              />
            </g>
            <g filter="url(#filter6_f)">
              <rect
                x="1779"
                y="698.622"
                width="1178.25"
                height="962.391"
                rx="481.196"
                transform="rotate(90 1779 698.622)"
                fill="#5A827E"
              />
            </g>
            <defs>
              <filter
                id="filter0_f"
                x="0.074"
                y="2.074"
                width="2595.85"
                height="2595.85"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="140" />
              </filter>
              <filter
                id="filter1_f"
                x="250.311"
                y="252.587"
                width="2097.78"
                height="2099.76"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="60" />
              </filter>
              <filter
                id="filter_common_f"
                x="393"
                y="428"
                width="1812"
                height="1748"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="58" />
              </filter>
              <filter
                id="filter5_f"
                x="443.964"
                y="469.927"
                width="1710.14"
                height="1677"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="115" />
              </filter>
              <filter
                id="filter6_f"
                x="520.502"
                y="402.515"
                width="1554.6"
                height="1770.46"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="115" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)",
          }}
        ></div>
      </div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
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
