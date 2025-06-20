"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  LogOut,
  Bot,
  Keyboard,
  Star,
  Users,
  TrendingUp,
  CheckCircle,
  Play,
  Target,
  Lightbulb,
  Rocket,
  Globe,
  Award,
  Clock,
  BarChart3,
  MessageSquare,
  Palette,
  Code,
  Database,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { useTheme } from "@/components/theme-provider";
import { motion } from "framer-motion";
import { ShinyText } from "@/components/ui/shiny-text";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("capture");
  const { theme } = useTheme();

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Secure Idea Storage",
      description:
        "Safely store and organize all your product ideas in one place with enterprise-grade security.",
      details: [
        "End-to-end encryption",
        "SOC 2 compliance",
        "Regular security audits",
        "GDPR compliant"
      ],
      color: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI-Powered Prompt Generation",
      description:
        "Transform your raw ideas into high-quality Lovable, Bolt.new, and Cursor prompts using advanced AI.",
      details: [
        "Platform-specific optimization",
        "Context-aware generation",
        "Continuous learning",
        "Quality assurance"
      ],
      color: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Rapid Prompt Creation",
      description:
        "Quickly generate polished prompts in minutes, saving you valuable time and effort.",
      details: [
        "Sub-minute generation",
        "Batch processing",
        "Template library",
        "Quick iterations"
      ],
      color: "from-yellow-500/10 to-orange-500/10"
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Meet Nexi - Your AI Assistant",
      description:
        "Chat with Nexi, your intelligent AI companion that helps refine ideas and guides you through the PRD creation process.",
      details: [
        "Natural conversation",
        "Contextual suggestions",
        "24/7 availability",
        "Learning from feedback"
      ],
      color: "from-green-500/10 to-emerald-500/10"
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
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{
      background:
        "linear-gradient(135deg, #18181b 0%, #23272f 60%, #101014 100%)",
      backgroundColor: "#101014",
    }}>
      {/* Glassy, glossy, dark overlays for depth and shine */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-slate-400/5 to-black/60" style={{backdropFilter: 'blur(16px)'}}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vw] bg-gradient-to-br from-slate-200/10 via-slate-400/10 to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-[40vw] h-[30vw] bg-gradient-to-tr from-slate-500/10 via-slate-700/10 to-transparent rounded-full blur-2xl opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      {/* Header */}
      <header className="bg-transparent border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-1">
              <img
                src={theme === "dark" ? "https://i.postimg.cc/DwVdb9NB/image.png" : "/icon.png"}
                alt="IdeaVault Icon"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-foreground">
                IdeaVault
              </span>
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
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <ShinyText
                  text="Turn Your Ideas into Powerful Marketable Lovable, Bolt.new, and Cursor Prompts"
                  speed={3}
                  className="[text-shadow:0_1px_2px_rgba(255,255,255,0.2)]"
                />
              </h1>
            </motion.div>
            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Securely store and organize your product ideas, then generate
              comprehensive and effective prompts in minutes using AI. Perfect
              for solo founders and entrepreneurs.
            </motion.p>
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
            <motion.div
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {isAuthenticated ? (
                <InteractiveHoverButton
                  text="Go to Dashboard"
                  variant="default"
                  onClick={() => navigate("/dashboard")}
                  className="mb-4 px-8 py-4 text-lg shadow-lg hover:shadow-xl"
                />
              ) : (
                <>
                  <InteractiveHoverButton
                    text="Start Generating PRDs"
                    variant="default"
                    onClick={() => navigate("/signup")}
                    className="px-8 py-4 text-lg shadow-lg hover:shadow-xl"
                  />
                  <InteractiveHoverButton
                    text="Sign In"
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 text-lg"
                  />
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-10 shadow-lg backdrop-blur-xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 relative inline-block">
              Why Choose IdeaVault?
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-primary/30 rounded-full"></span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to create professional PRDs quickly and
              efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform-gpu bg-black/60 backdrop-blur-xl h-full relative overflow-hidden">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <CardHeader className="relative z-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                    <div className="mt-auto">
                      <ul className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-10 shadow-lg backdrop-blur-xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 relative inline-block">
              What Our Users Say
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-primary/30 rounded-full"></span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users who've transformed their ideas into reality
            </p>
          </div>
          <div className="relative z-10">
            <Carousel>
              <CarouselContent>
                {[
                  {
                    name: "Sarah Chen",
                    role: "Product Manager at TechCorp",
                    content: "IdeaVault has revolutionized how I create PRDs. What used to take days now takes hours, and the quality is consistently excellent.",
                    rating: 5,
                    avatar: "SC"
                  },
                  {
                    name: "Marcus Rodriguez",
                    role: "Solo Founder",
                    content: "As a solo founder, IdeaVault is my secret weapon. The AI-powered prompts help me articulate my vision clearly to developers.",
                    rating: 5,
                    avatar: "MR"
                  },
                  {
                    name: "Emily Watson",
                    role: "Startup CEO",
                    content: "The collaboration features are game-changing. My team can now work together seamlessly on product requirements.",
                    rating: 5,
                    avatar: "EW"
                  },
                  {
                    name: "David Kim",
                    role: "Engineering Lead",
                    content: "The prompts generated by IdeaVault are incredibly detailed and actionable. It's like having a senior PM on the team.",
                    rating: 5,
                    avatar: "DK"
                  }
                ].map((testimonial, index) => (
                  <CarouselItem key={index} className="px-2">
                    <Card className="border-none bg-black/60 backdrop-blur-xl shadow-lg">
                      <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4">
                          <span className="text-3xl font-bold text-primary">
                            {testimonial.avatar}
                          </span>
                        </div>
                        <p className="text-lg text-foreground font-medium mb-2 text-center">
                          "{testimonial.content}"
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-primary">
                              {testimonial.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
<section className="py-20 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-[#1f1f23] backdrop-blur-none border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold text-foreground mb-4 relative inline-block text-center w-full">
        How It Works
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-primary/30 rounded-full"></span>
      </h2>
      <p className="text-xl text-muted-foreground text-center mb-8">
        Transform your ideas into professional PRDs in just 3 simple steps
      </p>
            <AnimatedTabs
              tabs={[
                {
                  id: "capture",
                  label: "Capture Ideas",
                  icon: <Lightbulb className="h-4 w-4" />,
                  content: (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          Capture & Organize Your Ideas
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Securely store all your product ideas in one centralized location. Add descriptions, tags, and collaborate with team members to refine your concepts.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Secure cloud storage
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Team collaboration
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Smart organization
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-8 border border-white/10">
                        <div className="space-y-4">
                          <div className="bg-[#23272f] rounded-lg p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="font-medium text-foreground">Mobile App Idea</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              A fitness tracking app with social features...
                            </p>
                          </div>
                          <div className="bg-[#23272f] rounded-lg p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span className="font-medium text-foreground">SaaS Platform</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Project management tool for remote teams...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: "generate",
                  label: "Generate PRDs",
                  icon: <Rocket className="h-4 w-4" />,
                  content: (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          AI-Powered PRD Generation
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Our advanced AI analyzes your ideas and generates comprehensive, professional PRDs tailored for Lovable, Bolt.new, and Cursor platforms.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Platform-specific prompts
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Comprehensive requirements
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Technical specifications
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-8 border border-white/10">
                        <div className="bg-[#23272f] rounded-lg p-4 shadow-sm">
                          <div className="flex items-center mb-3">
                            <Bot className="h-5 w-5 text-primary mr-2" />
                            <span className="font-medium text-foreground">Generated PRD</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">User Stories:</span>
                              <span className="text-green-500">✓ Complete</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Technical Specs:</span>
                              <span className="text-green-500">✓ Complete</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">UI/UX Guidelines:</span>
                              <span className="text-green-500">✓ Complete</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: "deploy",
                  label: "Deploy & Iterate",
                  icon: <Target className="h-4 w-4" />,
                  content: (
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          Deploy & Iterate Quickly
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Use your generated PRDs directly in your favorite development platforms. Track progress, gather feedback, and iterate rapidly.
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            One-click deployment
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Progress tracking
                          </li>
                          <li className="flex items-center text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            Continuous iteration
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-8 border border-white/10">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[#23272f] rounded-lg p-3 text-center shadow-sm">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <Code className="h-4 w-4 text-blue-500" />
                            </div>
                            <span className="text-xs font-medium text-foreground">Lovable</span>
                          </div>
                          <div className="bg-[#23272f] rounded-lg p-3 text-center shadow-sm">
                            <div className="w-8 h-8 bg-green-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <Zap className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-xs font-medium text-foreground">Bolt.new</span>
                          </div>
                          <div className="bg-[#23272f] rounded-lg p-3 text-center shadow-sm">
                            <div className="w-8 h-8 bg-purple-500/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <Palette className="h-4 w-4 text-purple-500" />
                            </div>
                            <span className="text-xs font-medium text-foreground">Cursor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-12 text-center shadow-lg backdrop-blur-xl">
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
                  className="px-8 py-4 text-lg shadow-md hover:shadow-lg"
                />
              ) : (
                <InteractiveHoverButton
                  text="Get Started"
                  variant="default"
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 text-lg shadow-md hover:shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/60 border border-white/10 rounded-2xl p-10 shadow-lg backdrop-blur-xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4 relative inline-block">
                Frequently Asked Questions
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-primary/30 rounded-full"></span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about IdeaVault
              </p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="what-is-ideavault" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  What is IdeaVault and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  IdeaVault is an AI-powered platform that helps you transform raw product ideas into comprehensive,
                  professional PRDs (Product Requirements Documents). Simply input your idea, and our AI generates
                  detailed prompts optimized for platforms like Lovable, Bolt.new, and Cursor.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="platforms-supported" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  Which development platforms are supported?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We currently support Lovable, Bolt.new, and Cursor. Each platform receives specially optimized
                  prompts that match their specific requirements and capabilities. We're constantly adding support
                  for new platforms based on user feedback.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="collaboration" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I collaborate with my team on ideas?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! IdeaVault includes powerful collaboration features. You can share ideas with team members,
                  work together on refining concepts, and manage permissions. Team members can comment, suggest
                  improvements, and contribute to the PRD generation process.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="security" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  How secure is my data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Security is our top priority. All data is encrypted in transit and at rest using industry-standard
                  encryption. We're SOC 2 compliant and follow strict data protection protocols. Your ideas and
                  generated PRDs are never shared with third parties or used to train AI models.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ai-quality" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  How accurate and detailed are the AI-generated PRDs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our AI is trained on thousands of successful PRDs and continuously improved based on user feedback.
                  The generated PRDs include user stories, technical specifications, UI/UX guidelines, and acceptance
                  criteria. While the AI provides an excellent starting point, we recommend reviewing and customizing
                  the output to match your specific needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support" className="border rounded-lg px-6 bg-background/50">
                <AccordionTrigger className="text-left hover:no-underline">
                  What kind of support do you provide?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We provide email support for all users, with priority support for Pro subscribers. Enterprise
                  customers get dedicated support with guaranteed response times. We also have comprehensive
                  documentation, video tutorials, and a community forum where users share tips and best practices.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-[#18181b] bg-opacity-95 border-t border-white/10 shadow-2xl z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={theme === 'dark' ? 'https://i.postimg.cc/DwVdb9NB/image.png' : '/icon.png'} alt="IdeaVault Icon" className="h-8 w-auto" />
            <span className="text-lg font-bold text-foreground">IdeaVault</span>
          </div>
          <div className="flex space-x-6 text-muted-foreground text-sm">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/signup" className="hover:text-primary transition-colors">Sign Up</a>
            <a href="/login" className="hover:text-primary transition-colors">Login</a>
          </div>
          <div className="text-xs text-muted-foreground mt-4 md:mt-0">&copy; {new Date().getFullYear()} IdeaVault. All rights reserved.</div>
        </div>
      </footer>
      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </div>
  );
}
