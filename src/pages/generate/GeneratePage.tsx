import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/navbar";
import { Idea } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const PRODUCT_CATEGORIES = [
  "SaaS",
  "Mobile App",
  "Web Application",
  "E-commerce",
  "Enterprise Software",
  "Consumer Product",
  "IoT Device",
  "AI/ML Solution",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Other",
];

export default function GeneratePage() {
  const [productIdea, setProductIdea] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const idea = location.state?.idea as Idea | undefined;

  useEffect(() => {
    if (idea) {
      setProductIdea(idea.description);
      setProductCategory(idea.category || "");
      // Target audience is now stored in the notes field, but we'll let users fill this manually
    }
  }, [idea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: prd, error } = await supabase
        .from("prds")
        .insert([
          {
            title: productIdea.split("\n")[0].slice(0, 100) || "New PRD",
            original_idea: `${productIdea}\n\nCategory: ${productCategory}\nTarget Audience: ${targetAudience}`,
            generated_prd: "PRD content will be generated...",
            category: productCategory,
            user_id: user.id,
            status: "draft",
            is_favorite: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      navigate(`/prd/${prd.id}`);
    } catch (error) {
      console.error("Error creating PRD:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Generate New PRD
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="lg" />
              <p className="mt-4 text-muted-foreground text-lg">
                Generating your PRD...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="productIdea">Product Idea</Label>
                <Textarea
                  id="productIdea"
                  value={productIdea}
                  onChange={(e) => setProductIdea(e.target.value)}
                  placeholder="Describe your product idea in detail..."
                  required
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Provide a detailed description of your product idea, including
                  its purpose and key features.
                </p>
              </div>

              <div>
                <Label htmlFor="productCategory">Product Category</Label>
                <Select
                  value={productCategory}
                  onValueChange={setProductCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the category that best describes your product.
                </p>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Describe your target audience..."
                  required
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Describe who your product is for, including demographics,
                  needs, and pain points.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Generate PRD"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
