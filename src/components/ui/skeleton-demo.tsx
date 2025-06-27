import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SkeletonDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">IdeaVault Skeleton UI Demo</h1>
          <p className="text-white/70">Themed loading states that match the app's aesthetic</p>
        </div>

        {/* Dashboard Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2 bg-[#5A827E]/30 border border-[#B9D4AA]/30" />
              <Skeleton className="h-4 w-24 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-3/4 mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-1/2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2 bg-[#5A827E]/30 border border-[#B9D4AA]/30" />
              <Skeleton className="h-4 w-20 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-5/6 mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-2/3 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-36 mb-2 bg-[#5A827E]/30 border border-[#B9D4AA]/30" />
              <Skeleton className="h-4 w-28 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-4/5 mb-2 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-3/5 bg-[#5A827E]/20 border border-[#B9D4AA]/20" />
            </CardContent>
          </Card>
        </div>

        {/* Header Style Skeletons */}
        <div className="space-y-4">
          <CardTitle className="text-white">Header & Navigation</CardTitle>
          <div className="flex justify-between items-center p-4 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/10 border border-white/20" />
              <Skeleton className="h-6 w-32 bg-white/10 border border-white/20" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20 bg-white/10 border border-white/20" />
              <Skeleton className="h-8 w-24 bg-white/10 border border-white/20" />
            </div>
          </div>
        </div>

        {/* Content Area Skeletons */}
        <div className="space-y-4">
          <CardTitle className="text-white">Content Areas</CardTitle>
          <div className="space-y-6">
            <Skeleton className="h-10 w-48 bg-[#5A827E]/20 border border-[#5A827E]/30" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-4/5 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
              <Skeleton className="h-4 w-3/4 bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
            </div>
          </div>
        </div>

        {/* Form Style Skeletons */}
        <div className="space-y-4">
          <CardTitle className="text-white">Form Elements</CardTitle>
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-[#5A827E]/20 border border-[#5A827E]/30" />
                  <Skeleton className="h-10 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-[#5A827E]/20 border border-[#5A827E]/30" />
                  <Skeleton className="h-24 w-full bg-[#5A827E]/15 border border-[#B9D4AA]/20" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-9 w-20 bg-[#5A827E]/20 border border-[#5A827E]/30" />
                  <Skeleton className="h-9 w-24 bg-[#5A827E]/25 border border-[#B9D4AA]/30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Different Opacity Variants */}
        <div className="space-y-4">
          <CardTitle className="text-white">Opacity Variants</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/60">Light (10%)</p>
              <Skeleton className="h-8 w-full bg-[#5A827E]/10 border border-[#B9D4AA]/15" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Medium (20%)</p>
              <Skeleton className="h-8 w-full bg-[#5A827E]/20 border border-[#B9D4AA]/25" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Bold (30%)</p>
              <Skeleton className="h-8 w-full bg-[#5A827E]/30 border border-[#B9D4AA]/35" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/60">Strong (40%)</p>
              <Skeleton className="h-8 w-full bg-[#5A827E]/40 border border-[#B9D4AA]/45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 