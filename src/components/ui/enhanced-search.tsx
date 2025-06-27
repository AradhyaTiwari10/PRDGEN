"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Filter, Calendar, Tag, Star, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

export interface SearchFilters {
  query: string
  status: string
  priority: string
  category: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  tags: string[]
  favorites: boolean
  recentlyModified: boolean
}

interface EnhancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  placeholder?: string
  className?: string
  categories?: string[]
  tags?: string[]
}

export function EnhancedSearch({
  onFiltersChange,
  placeholder = "Search...",
  className,
  categories = [],
  tags = [],
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    priority: "all",
    category: "all",
    dateRange: { from: null, to: null },
    tags: [],
    favorites: false,
    recentlyModified: false,
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent-searches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches
  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updated = [query, ...recentSearches.slice(0, 4)]
      setRecentSearches(updated)
      localStorage.setItem("recent-searches", JSON.stringify(updated))
    }
  }

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  // Handle search query change
  const handleQueryChange = (query: string) => {
    updateFilters({ query })
    if (query.length > 2) {
      saveRecentSearch(query)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      status: "all",
      priority: "all",
      category: "all",
      dateRange: { from: null, to: null },
      tags: [],
      favorites: false,
      recentlyModified: false,
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Count active filters
  const activeFiltersCount = [
    filters.status !== "all",
    filters.priority !== "all",
    filters.category !== "all",
    filters.dateRange.from || filters.dateRange.to,
    filters.tags.length > 0,
    filters.favorites,
    filters.recentlyModified,
  ].filter(Boolean).length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B9D4AA] h-4 w-4" />
        <Input
          ref={searchInputRef}
          placeholder={placeholder}
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 pr-20 bg-[#5A827E]/30 border-[#84AE92] text-[#FAFFCA] placeholder-[#B9D4AA]/80 focus:border-[#B9D4AA]"
        />
        
        {/* Filter Button */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQueryChange("")}
              className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 text-white/60 hover:text-white hover:bg-white/10",
                  activeFiltersCount > 0 && "bg-white/20 text-white"
                )}
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs bg-white/30 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-black/90 backdrop-blur-md border-white/20" align="end">
                              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilters({ status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="ready_for_prd">Ready for PRD</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => updateFilters({ priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilters({ category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quick Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Filters</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filters.favorites ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ favorites: !filters.favorites })}
                      className="h-7"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Favorites
                    </Button>
                    <Button
                      variant={filters.recentlyModified ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ recentlyModified: !filters.recentlyModified })}
                      className="h-7"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Recent
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ status: "all" })}
              />
            </Badge>
          )}
          {filters.priority !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Priority: {filters.priority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ priority: "all" })}
              />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ category: "all" })}
              />
            </Badge>
          )}
          {filters.favorites && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Favorites
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ favorites: false })}
              />
            </Badge>
          )}
          {filters.recentlyModified && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Recent
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilters({ recentlyModified: false })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {filters.query === "" && recentSearches.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Recent: {recentSearches.slice(0, 3).map((search, index) => (
            <button
              key={index}
              onClick={() => handleQueryChange(search)}
              className="ml-2 hover:text-foreground underline"
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
