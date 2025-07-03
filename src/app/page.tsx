import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Zap,
  Users,
  Download,
  Shield,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Clock,
  TrendingUp,
  Award,
  Quote,
  LogOut,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { IdeaVaultLogo } from "@/components/ui/idea-vault-logo";

export default function HomePage() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState("");

  const handlePromptSubmit = () => {
    if (promptText.trim()) {
      navigate(`/signup?prompt=${encodeURIComponent(promptText.trim())}`);
    } else {
      navigate("/signup");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  return (
    <>
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1.85);
          }
          50% {
            transform: scale(1.50);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen w-full relative overflow-hidden scroll-smooth">
        {/* Background SVG */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 scale-125 transform"
            style={{
              animation: 'breathe 8s ease-in-out infinite'
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
              <rect x="2143" y="455" width="1690" height="1690" rx="710.009" transform="rotate(90 2143 455)" fill="#84AE92" opacity="0.65" />
            </g>
            <g filter="url(#filter1_f)">
              <rect x="2126" y="474.675" width="1655.58" height="1653.6" rx="710.009" transform="rotate(90 2126 474.675)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter_common_f)">
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#5A827E" />
              <rect x="2057" y="576.304" width="1452.32" height="1515.8" rx="710.009" transform="rotate(90 2057 576.304)" fill="#FAFFCA" />
              <rect x="2018" y="582.866" width="1439.21" height="1437.8" rx="710.009" transform="rotate(90 2018 582.866)" fill="#B9D4AA" opacity="0.65" />
            </g>
            <g filter="url(#filter5_f)">
              <rect x="1858" y="766.034" width="1084.79" height="1117.93" rx="483.146" transform="rotate(90 1858 766.034)" fill="#84AE92" />
            </g>
            <g filter="url(#filter6_f)">
              <rect x="1779" y="698.622" width="1178.25" height="962.391" rx="481.196" transform="rotate(90 1779 698.622)" fill="#5A827E" />
            </g>
            <defs>
              <filter id="filter0_f" x="0.074" y="2.074" width="2595.85" height="2595.85" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="140" />
              </filter>
              <filter id="filter1_f" x="250.311" y="252.587" width="2097.78" height="2099.76" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="60" />
              </filter>
              <filter id="filter_common_f" x="393" y="428" width="1812" height="1748" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="58" />
              </filter>
              <filter id="filter5_f" x="443.964" y="469.927" width="1710.14" height="1677" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
              <filter id="filter6_f" x="520.502" y="402.515" width="1554.6" height="1770.46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="115" />
              </filter>
            </defs>
          </svg>
          </div>
        </div>
        
        {/* Gradient overlay for smoother fade like Lovable */}
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/1 via-transparent to-black/15"></div>
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)'
          }}></div>
        </div>
        
        {/* Header */}
        <header className="relative z-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div 
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => navigate("/")}
                >
                  <IdeaVaultLogo 
                    size="lg" 
                    variant="light" 
                  />
                </div>
          </div>
          <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Sign In
            </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  Get Started
            </Button>
              </div>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="relative z-20 px-4 sm:px-6 lg:px-8 py-8 max-w-full mx-auto">
      {/* Hero Section */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Build something
                  <span className="ml-4 inline-flex items-center">
                    <IdeaVaultLogo 
                      size="xl" 
                      variant="gradient" 
                      className="mr-2"
                    />
                    <span className="bg-gradient-to-r from-[#5A827E] via-[#84AE92] to-[#B9D4AA] bg-clip-text text-transparent">
                      IdeaVault
                    </span>
                  </span>
          </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Create apps and websites by chatting with AI
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/10 rounded-xl p-3">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ask IdeaVault to create a web app that..."
                      className="flex-1 bg-transparent text-white placeholder-white/60 text-lg border-none outline-none"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center space-x-2">
                      <button className="bg-white/10 hover:bg-white/20 text-white/60 px-3 py-2 rounded-lg text-sm border border-white/20 transition-colors">
                        🌐 Public
                      </button>
                      <button 
                        className="bg-white text-gray-900 hover:bg-gray-100 p-3 rounded-xl transition-colors"
                        onClick={handlePromptSubmit}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Button
                  onClick={() => {
                    if (promptText.trim()) {
                      navigate(`/signup?prompt=${encodeURIComponent(promptText.trim())}`);
                    } else {
                      navigate("/signup");
                    }
                  }}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  Start Building
            </Button>
            <Button
              variant="outline"
                  onClick={() => {
                    if (promptText.trim()) {
                      navigate(`/login?prompt=${encodeURIComponent(promptText.trim())}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  Sign In
            </Button>
              </motion.div>
            </div>
          </div>

      {/* Features Section */}
          <section className="py-20 bg-[#1C1C1C] rounded-2xl mx-4 my-20 border-t-4 border-[#5A827E]">
            <div className="px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#FAFFCA]">
            Why Choose IdeaVault?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <Zap className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Lightning Fast</CardTitle>
                    <CardDescription className="text-white/80">
                  Generate complete Lovable, Bolt.new and Cursor Prompts in
                  under 2 minutes. No more spending hours on documentation.
                </CardDescription>
              </CardHeader>
            </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <FileText className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Industry Standard</CardTitle>
                    <CardDescription className="text-white/80">
                  8-section structure that AI coding assistants understand
                  perfectly for accurate implementation.
                </CardDescription>
              </CardHeader>
            </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <Users className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Team Collaboration</CardTitle>
                    <CardDescription className="text-white/80">
                  Share PRDs with your team, export in multiple formats, and
                  track implementation progress.
                </CardDescription>
              </CardHeader>
            </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <Download className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Multiple Exports</CardTitle>
                    <CardDescription className="text-white/80">
                  Export as Markdown, PDF, or plain text. Perfect for any
                  workflow or documentation system.
                </CardDescription>
              </CardHeader>
            </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <Shield className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Secure & Private</CardTitle>
                    <CardDescription className="text-white/80">
                  Your ideas are protected with enterprise-grade security. Only
                  you can access your PRDs.
                </CardDescription>
              </CardHeader>
            </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
              <CardHeader>
                    <Rocket className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">AI-Optimized</CardTitle>
                    <CardDescription className="text-white/80">
                  Specifically designed for AI coding assistants like Cursor and
                  GitHub Copilot.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

          {/* Use Cases Section */}
          <section className="py-20 bg-[#1C1C1C] rounded-2xl mx-4 my-20 border-t-4 border-[#5A827E]">
            <div className="px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#FAFFCA]">
                Perfect For Every Builder
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <Rocket className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Solo Founders</CardTitle>
                    <CardDescription className="text-white/80">
                      Turn your startup ideas into detailed PRDs that AI can understand and implement quickly.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <Users className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Product Managers</CardTitle>
                    <CardDescription className="text-white/80">
                      Create comprehensive documentation that bridges the gap between ideas and development.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <FileText className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Developers</CardTitle>
                    <CardDescription className="text-white/80">
                      Generate clear requirements for your AI coding assistants to build better applications.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <TrendingUp className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Agencies</CardTitle>
                    <CardDescription className="text-white/80">
                      Streamline client projects with professional PRDs that speed up development cycles.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <Award className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Students</CardTitle>
                    <CardDescription className="text-white/80">
                      Learn product development by creating structured documentation for your projects.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <Clock className="h-12 w-12 text-[#B9D4AA] mb-4" />
                    <CardTitle className="text-[#FAFFCA]">Consultants</CardTitle>
                    <CardDescription className="text-white/80">
                      Deliver professional documentation that impresses clients and accelerates projects.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 bg-[#1C1C1C] rounded-2xl mx-4 my-20 border-t-4 border-[#5A827E]">
            <div className="px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#FAFFCA]">
                What Our Users Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">SM</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">Sarah Martinez</h4>
                        <p className="text-white/60 text-sm">Solo Founder</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "IdeaVault turned my vague app idea into a comprehensive PRD that Cursor understood perfectly. Built my MVP in 2 days!"
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">DJ</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">David Johnson</h4>
                        <p className="text-white/60 text-sm">Product Manager</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "Game-changer for our team. The AI-generated PRDs are so detailed that our developers can focus on coding instead of requirements clarification."
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">ER</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">Emily Rodriguez</h4>
                        <p className="text-white/60 text-sm">Full-stack Developer</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "Perfect for working with Bolt.new and Lovable. The structured format helps AI tools understand exactly what I want to build."
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">MC</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">Michael Chen</h4>
                        <p className="text-white/60 text-sm">Startup Founder</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "Saved me weeks of work. What used to take me days of documentation now takes minutes. The quality is consistently professional."
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">LT</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">Lisa Thompson</h4>
                        <p className="text-white/60 text-sm">Agency Owner</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "Our clients love the detailed PRDs. It sets clear expectations and helps us deliver exactly what they envisioned."
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-[#B9D4AA] rounded-full flex items-center justify-center">
                        <span className="text-[#1C1C1C] font-bold">RK</span>
                      </div>
                      <div>
                        <h4 className="text-[#FAFFCA] font-semibold">Ryan Kumar</h4>
                        <p className="text-white/60 text-sm">CS Student</p>
                      </div>
                    </div>
                    <Quote className="h-8 w-8 text-[#B9D4AA] mb-4" />
                    <CardDescription className="text-white/80">
                      "As a student learning development, IdeaVault helps me structure my project ideas professionally. Great learning tool!"
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-[#1C1C1C] rounded-2xl mx-4 my-20 border-t-4 border-[#5A827E]">
            <div className="px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#FAFFCA]">
                Frequently Asked Questions
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">How does IdeaVault work with AI coding assistants?</CardTitle>
                    <CardDescription className="text-white/80">
                      IdeaVault generates PRDs in a structured format that AI tools like Cursor, GitHub Copilot, Bolt.new, and Lovable can easily understand. The 8-section format provides all the context needed for accurate code generation.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">Can I export my PRDs to different formats?</CardTitle>
                    <CardDescription className="text-white/80">
                      Yes! You can export your PRDs as Markdown, PDF, or plain text. This makes it easy to integrate with your existing workflow or share with team members and stakeholders.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">Is there a free tier available?</CardTitle>
                    <CardDescription className="text-white/80">
                      Yes! We offer a generous free tier that includes unlimited PRD generation using the Gemini API, basic exports, and access to all core features. No credit card required to get started.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">How detailed are the generated PRDs?</CardTitle>
                    <CardDescription className="text-white/80">
                      Our PRDs include 8 comprehensive sections: Project Overview, Technical Requirements, User Stories, Architecture, Features, Timeline, Resources, and Success Metrics. Each section is tailored to your specific project.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">Can I collaborate with my team on PRDs?</CardTitle>
                    <CardDescription className="text-white/80">
                      Absolutely! You can share PRDs with team members, add collaborators, and track changes. Real-time collaboration features help teams stay aligned throughout the development process.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-[#5A827E]/20 backdrop-blur-md border border-[#5A827E] hover:border-[#84AE92] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-[#FAFFCA]">What types of projects work best with IdeaVault?</CardTitle>
                    <CardDescription className="text-white/80">
                      IdeaVault works great for web apps, mobile apps, SaaS platforms, e-commerce sites, APIs, and more. Whether you're building a simple landing page or a complex multi-user platform, our PRDs provide the structure you need.
                    </CardDescription>
                  </CardHeader>
                </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
          <section className="py-20 bg-[#1C1C1C] rounded-2xl mx-4 my-20 border-t-4 border-[#5A827E]">
            <div className="px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#FAFFCA] mb-6">
            Ready to Transform Your Ideas?
          </h2>
              <p className="text-xl text-[#B9D4AA] mb-8 max-w-2xl mx-auto">
                Join thousands of builders who use IdeaVault to create better products faster with AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Building for Free
                </Button>
          <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  Sign In
          </Button>
              </div>
              <p className="text-white/60 mt-4 text-sm">
                No credit card required • Free Gemini API usage • Export unlimited PRDs
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 bg-black border-t border-[#5A827E]/30 transition-all duration-300">
          <div className="max-w-full mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-4 md:space-y-0">
              <div className="flex items-center">
                <IdeaVaultLogo 
                  size="sm" 
                  variant="dark" 
                />
              </div>
              <div className="flex items-center space-x-6">
                <span>© 2024 IdeaVault. All rights reserved.</span>
                <div className="flex items-center space-x-4">
                  <Link to="/privacy" className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Privacy</Link>
                  <Link to="/terms" className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Terms</Link>
                  <span className="hover:text-[#B9D4AA] cursor-pointer transition-colors duration-300">Contact</span>
            </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
