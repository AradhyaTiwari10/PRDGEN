"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  FileText, 
  Lightbulb, 
  Plus, 
  Clock, 
  Star,
  ArrowRight,
  Command
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Idea, PRD } from "@/types"

interface QuickSearchResult {
  id: string
  title: string
  description: string
  type: "idea" | "prd" | "action"
  category?: string
  status?: string
  icon: React.ReactNode
  action: () => void
}

interface QuickSearchProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ideas: Idea[]
  prds: PRD[]
  onCreateIdea?: () => void
  onCreatePRD?: () => void
}

export function QuickSearch({
  isOpen,
  onOpenChange,
  ideas,
  prds,
  onCreateIdea,
  onCreatePRD,
}: QuickSearchProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentItems, setRecentItems] = useState<string[]>([])
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  // Load recent items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("quick-search-recent")
    if (saved) {
      setRecentItems(JSON.parse(saved))
    }
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Save recent item
  const saveRecentItem = (id: string) => {
    const updated = [id, ...recentItems.filter(item => item !== id)].slice(0, 5)
    setRecentItems(updated)
    localStorage.setItem("quick-search-recent", JSON.stringify(updated))
  }

  // Generate search results
  const getSearchResults = (): QuickSearchResult[] => {
    const results: QuickSearchResult[] = []

    // Add action items first
    if (query.length === 0 || "new idea".includes(query.toLowerCase())) {
      results.push({
        id: "action-new-idea",
        title: "Create New Idea",
        description: "Start brainstorming a new product idea",
        type: "action",
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          onCreateIdea?.()
          onOpenChange(false)
        },
      })
    }

    if (query.length === 0 || "new prd".includes(query.toLowerCase()) || "generate".includes(query.toLowerCase())) {
      results.push({
        id: "action-new-prd",
        title: "Generate New PRD",
        description: "Create a Product Requirements Document",
        type: "action",
        icon: <FileText className="h-4 w-4" />,
        action: () => {
          onCreatePRD?.()
          onOpenChange(false)
        },
      })
    }

    // Search ideas
    if (query.length === 0) {
      // Show recent ideas when no query
      const recentIdeas = ideas
        .filter(idea => recentItems.includes(idea.id))
        .sort((a, b) => recentItems.indexOf(a.id) - recentItems.indexOf(b.id))
        .slice(0, 3)

      recentIdeas.forEach(idea => {
        results.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          type: "idea",
          category: idea.category,
          status: idea.status,
          icon: <Clock className="h-4 w-4" />,
          action: () => {
            navigate(`/idea/${idea.id}`)
            saveRecentItem(idea.id)
            onOpenChange(false)
          },
        })
      })

      // Show favorite ideas
      const favoriteIdeas = ideas
        .filter(idea => idea.is_favorite && !recentItems.includes(idea.id))
        .slice(0, 3)

      favoriteIdeas.forEach(idea => {
        results.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          type: "idea",
          category: idea.category,
          status: idea.status,
          icon: <Star className="h-4 w-4 text-yellow-500" />,
          action: () => {
            navigate(`/idea/${idea.id}`)
            saveRecentItem(idea.id)
            onOpenChange(false)
          },
        })
      })
    } else {
      // Search through ideas
      const matchingIdeas = ideas
        .filter(idea => 
          idea.title.toLowerCase().includes(query.toLowerCase()) ||
          idea.description.toLowerCase().includes(query.toLowerCase()) ||
          (idea.category && idea.category.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)

      matchingIdeas.forEach(idea => {
        results.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          type: "idea",
          category: idea.category,
          status: idea.status,
          icon: <Lightbulb className="h-4 w-4" />,
          action: () => {
            navigate(`/idea/${idea.id}`)
            saveRecentItem(idea.id)
            onOpenChange(false)
          },
        })
      })
    }

    // Search PRDs
    if (query.length > 0) {
      const matchingPRDs = prds
        .filter(prd => 
          prd.title.toLowerCase().includes(query.toLowerCase()) ||
          prd.original_idea.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)

      matchingPRDs.forEach(prd => {
        results.push({
          id: prd.id,
          title: prd.title,
          description: prd.original_idea,
          type: "prd",
          category: prd.category,
          status: prd.status,
          icon: <FileText className="h-4 w-4" />,
          action: () => {
            navigate(`/prd/${prd.id}`)
            onOpenChange(false)
          },
        })
      })
    }

    return results
  }

  const results = getSearchResults()

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % results.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
          break
        case "Enter":
          e.preventDefault()
          if (results[selectedIndex]) {
            results[selectedIndex].action()
          }
          break
        case "Escape":
          onOpenChange(false)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, results, selectedIndex, onOpenChange])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            placeholder="Search ideas, PRDs, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
          <div className="flex items-center gap-1 ml-3">
            <kbd className="px-2 py-1 text-xs bg-muted border rounded flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
              {query && (
                <p className="text-sm mt-1">
                  Try searching for ideas, PRDs, or commands
                </p>
              )}
            </div>
          ) : (
            <div className="p-2">
              {query.length === 0 && (
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Actions
                </div>
              )}
              
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    index === selectedIndex 
                      ? "bg-accent text-accent-foreground" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={result.action}
                >
                  <div className="flex-shrink-0">
                    {result.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {result.title}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {result.category && (
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                    )}
                    {result.status && (
                      <Badge variant="outline" className="text-xs">
                        {result.status}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </DialogContent>
    </Dialog>
  )
}
