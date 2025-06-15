import { Idea, PRD } from "@/types"
import { SearchFilters } from "@/components/ui/enhanced-search"

// Enhanced search function for ideas
export function filterIdeas(ideas: Idea[], filters: SearchFilters): Idea[] {
  return ideas.filter((idea) => {
    // Text search - search in title, description, content, category, notes
    const searchText = filters.query.toLowerCase()
    const matchesSearch = !searchText || 
      idea.title.toLowerCase().includes(searchText) ||
      idea.description.toLowerCase().includes(searchText) ||
      (idea.content && idea.content.toLowerCase().includes(searchText)) ||
      (idea.category && idea.category.toLowerCase().includes(searchText)) ||
      (idea.notes && idea.notes.toLowerCase().includes(searchText)) ||
      (idea.market_size && idea.market_size.toLowerCase().includes(searchText)) ||
      (idea.competition && idea.competition.toLowerCase().includes(searchText))

    // Status filter
    const matchesStatus = filters.status === "all" || idea.status === filters.status

    // Priority filter
    const matchesPriority = filters.priority === "all" || idea.priority === filters.priority

    // Category filter
    const matchesCategory = filters.category === "all" || idea.category === filters.category

    // Favorites filter
    const matchesFavorites = !filters.favorites || idea.is_favorite

    // Recently modified filter (last 7 days)
    const matchesRecentlyModified = !filters.recentlyModified || (() => {
      const updatedAt = new Date(idea.updated_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return updatedAt > sevenDaysAgo
    })()

    // Date range filter
    const matchesDateRange = (() => {
      if (!filters.dateRange.from && !filters.dateRange.to) return true
      
      const ideaDate = new Date(idea.created_at)
      const fromDate = filters.dateRange.from
      const toDate = filters.dateRange.to

      if (fromDate && toDate) {
        return ideaDate >= fromDate && ideaDate <= toDate
      } else if (fromDate) {
        return ideaDate >= fromDate
      } else if (toDate) {
        return ideaDate <= toDate
      }
      return true
    })()

    return matchesSearch && 
           matchesStatus && 
           matchesPriority && 
           matchesCategory && 
           matchesFavorites && 
           matchesRecentlyModified && 
           matchesDateRange
  })
}

// Enhanced search function for PRDs
export function filterPRDs(prds: PRD[], filters: SearchFilters): PRD[] {
  return prds.filter((prd) => {
    // Text search - search in title, original_idea, content
    const searchText = filters.query.toLowerCase()
    const matchesSearch = !searchText || 
      prd.title.toLowerCase().includes(searchText) ||
      prd.original_idea.toLowerCase().includes(searchText) ||
      (prd.content && prd.content.toLowerCase().includes(searchText)) ||
      (prd.category && prd.category.toLowerCase().includes(searchText))

    // Status filter
    const matchesStatus = filters.status === "all" || prd.status === filters.status

    // Category filter
    const matchesCategory = filters.category === "all" || prd.category === filters.category

    // Recently modified filter (last 7 days)
    const matchesRecentlyModified = !filters.recentlyModified || (() => {
      const updatedAt = new Date(prd.updated_at)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return updatedAt > sevenDaysAgo
    })()

    // Date range filter
    const matchesDateRange = (() => {
      if (!filters.dateRange.from && !filters.dateRange.to) return true
      
      const prdDate = new Date(prd.created_at)
      const fromDate = filters.dateRange.from
      const toDate = filters.dateRange.to

      if (fromDate && toDate) {
        return prdDate >= fromDate && prdDate <= toDate
      } else if (fromDate) {
        return prdDate >= fromDate
      } else if (toDate) {
        return prdDate <= toDate
      }
      return true
    })()

    return matchesSearch && 
           matchesStatus && 
           matchesCategory && 
           matchesRecentlyModified && 
           matchesDateRange
  })
}

// Get unique categories from ideas
export function getIdeaCategories(ideas: Idea[]): string[] {
  const categories = ideas
    .map(idea => idea.category)
    .filter((category): category is string => Boolean(category))
  
  return Array.from(new Set(categories)).sort()
}

// Get unique categories from PRDs
export function getPRDCategories(prds: PRD[]): string[] {
  const categories = prds
    .map(prd => prd.category)
    .filter((category): category is string => Boolean(category))
  
  return Array.from(new Set(categories)).sort()
}

// Search suggestions based on content
export function getSearchSuggestions(ideas: Idea[], query: string): string[] {
  if (!query || query.length < 2) return []

  const suggestions = new Set<string>()
  const queryLower = query.toLowerCase()

  ideas.forEach(idea => {
    // Add matching words from titles
    const titleWords = idea.title.toLowerCase().split(' ')
    titleWords.forEach(word => {
      if (word.includes(queryLower) && word !== queryLower) {
        suggestions.add(word)
      }
    })

    // Add matching categories
    if (idea.category && idea.category.toLowerCase().includes(queryLower)) {
      suggestions.add(idea.category)
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

// Sort ideas by relevance
export function sortByRelevance(ideas: Idea[], query: string): Idea[] {
  if (!query) return ideas

  const queryLower = query.toLowerCase()

  return ideas.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    // Title matches get highest score
    if (a.title.toLowerCase().includes(queryLower)) scoreA += 10
    if (b.title.toLowerCase().includes(queryLower)) scoreB += 10

    // Exact title matches get even higher score
    if (a.title.toLowerCase() === queryLower) scoreA += 20
    if (b.title.toLowerCase() === queryLower) scoreB += 20

    // Description matches get medium score
    if (a.description.toLowerCase().includes(queryLower)) scoreA += 5
    if (b.description.toLowerCase().includes(queryLower)) scoreB += 5

    // Category matches get lower score
    if (a.category && a.category.toLowerCase().includes(queryLower)) scoreA += 3
    if (b.category && b.category.toLowerCase().includes(queryLower)) scoreB += 3

    // Favorites get slight boost
    if (a.is_favorite) scoreA += 1
    if (b.is_favorite) scoreB += 1

    // Recently updated get slight boost
    const aUpdated = new Date(a.updated_at).getTime()
    const bUpdated = new Date(b.updated_at).getTime()
    if (aUpdated > bUpdated) scoreA += 1
    else if (bUpdated > aUpdated) scoreB += 1

    return scoreB - scoreA
  })
}
