"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  LogOut,
  Bot,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Idea Storage",
      description:
        "Safely store and organize all your product ideas in one place.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Prompt Generation",
      description:
        "Transform your raw ideas into high-quality Lovable, Bolt.new, and Cursor prompts using advanced AI.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Rapid Prompt Creation",
      description:
        "Quickly generate polished prompts in minutes, saving you valuable time.",
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Meet Nexi - Your AI Assistant",
      description:
        "Chat with Nexi, your intelligent AI companion that helps refine ideas, suggests improvements, and guides you through the PRD creation process.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-col items-center justify-center flex-1 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
            {[...Array(4)].map((_, i) => (
              <Card className="bg-card" key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-8 mb-2 rounded-full" />
                  <Skeleton className="h-6 w-32 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-1">
              <img
                src="/icon.png"
                alt="IdeaVault Icon"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-foreground">
                IdeaVault
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                  <InteractiveHoverButton
                    text="Dashboard"
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2"
                  />
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <InteractiveHoverButton
                    text="Sign In"
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="px-4 py-2"
                  />
                  <InteractiveHoverButton
                    text="Get Started"
                    variant="default"
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Turn Your Ideas into Powerful, Marketable{" "}
              <span className="text-blue-500">Lovable</span>,
              <span className="text-green-500"> Bolt.new</span>, and{" "}
              <span className="text-purple-500">Cursor</span> Prompts
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Securely store and organize your product ideas, then generate
              comprehensive and effective prompts in minutes using AI. Perfect
              for solo founders and entrepreneurs.
            </p>
            <a
              href="https://www.producthunt.com/products/ideavault-store-ideas-make-prompts?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ideavault&#0045;store&#0045;ideas&#0045;make&#0045;prompts"
              target="_blank"
              style={{
                marginBottom: "2rem",
                display: "inline-block",
                margin: "0 auto",
              }}
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=972541&theme=light&t=1748766981827"
                alt="IdeaVault&#0032;&#0045;&#0032;Store&#0032;Ideas&#0032;&#0038;&#0032;Make&#0032;Prompts - Your&#0032;AI&#0045;powered&#0032;idea&#0032;companion | Product Hunt"
                style={{ width: "250px", height: "54px" }}
                width="250"
                height="54"
              />
            </a>
            <div className="flex justify-center space-x-4 mt-4">
              {isAuthenticated ? (
                <InteractiveHoverButton
                  text="Go to Dashboard"
                  variant="default"
                  onClick={() => navigate("/dashboard")}
                  className="mb-4 px-8 py-4 text-lg"
                />
              ) : (
                <>
                  <InteractiveHoverButton
                    text="Start Generating PRDs"
                    variant="default"
                    onClick={() => navigate("/signup")}
                    className="px-8 py-4 text-lg"
                  />
                  <InteractiveHoverButton
                    text="Sign In"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 text-lg"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose IdeaVault?
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to create professional PRDs quickly and
              efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-12 text-center border shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Streamline Your PRD Process?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of product managers who are saving time and
              creating better PRDs with AI.
            </p>
            <div className="flex justify-center">
              {isAuthenticated ? (
                <InteractiveHoverButton
                  text="Go to Dashboard"
                  variant="default"
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 text-lg"
                />
              ) : (
                <InteractiveHoverButton
                  text="Get Started"
                  variant="default"
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 text-lg"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                IdeaVault
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IdeaVault. All rights reserved.
            </p>
            <a
              href="https://www.producthunt.com/products/ideavault-store-ideas-make-prompts?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ideavault&#0045;store&#0045;ideas&#0045;make&#0045;prompts"
              target="_blank"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=972541&theme=light&t=1748766981827"
                alt="IdeaVault&#0032;&#0045;&#0032;Store&#0032;Ideas&#0032;&#0038;&#0032;Make&#0032;Prompts - Your&#0032;AI&#0045;powered&#0032;idea&#0032;companion | Product Hunt"
                style={{ width: "250px", height: "54px" }}
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
