"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  FileText, 
  MessageSquare,
  Clock,
  User,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Idea, PRD } from "@/types"

export interface ActivityItem {
  id: string
  type: "idea_created" | "idea_updated" | "idea_deleted" | "prd_created" | "prd_updated" | "idea_favorited" | "idea_unfavorited"
  title: string
  description: string
  timestamp: Date
  itemId?: string
  itemTitle?: string
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
  showHeader?: boolean
  className?: string
  onItemClick?: (activity: ActivityItem) => void
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  showHeader = true,
  className,
  onItemClick,
}: ActivityFeedProps) {
  const [displayedActivities, setDisplayedActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Sort activities by timestamp (newest first) and limit
    const sorted = [...activities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems)
    
    setDisplayedActivities(sorted)
  }, [activities, maxItems])

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "idea_created":
        return <Plus className="h-4 w-4 text-green-500" />
      case "idea_updated":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "idea_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "prd_created":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "prd_updated":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "idea_favorited":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "idea_unfavorited":
        return <Star className="h-4 w-4 text-gray-400" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "idea_created":
      case "prd_created":
        return "border-l-green-500"
      case "idea_updated":
      case "prd_updated":
        return "border-l-blue-500"
      case "idea_deleted":
        return "border-l-red-500"
      case "idea_favorited":
        return "border-l-yellow-500"
      case "idea_unfavorited":
        return "border-l-gray-400"
      default:
        return "border-l-gray-300"
    }
  }

  if (displayedActivities.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Your actions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/20 transition-colors",
                  getActivityColor(activity.type),
                  onItemClick && "cursor-pointer hover:bg-muted/40"
                )}
                onClick={() => onItemClick?.(activity)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm leading-tight">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      {activity.itemTitle && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {activity.itemTitle}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Utility function to generate activity items from ideas and PRDs
export function generateActivitiesFromData(
  ideas: Idea[], 
  prds: PRD[], 
  previousIdeas?: Idea[], 
  previousPRDs?: PRD[]
): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Generate activities for new ideas
  ideas.forEach(idea => {
    const wasNew = !previousIdeas?.find(prev => prev.id === idea.id)
    if (wasNew) {
      activities.push({
        id: `idea-created-${idea.id}`,
        type: "idea_created",
        title: "New idea created",
        description: `Created "${idea.title}"`,
        timestamp: new Date(idea.created_at),
        itemId: idea.id,
        itemTitle: idea.title,
        metadata: { category: idea.category, status: idea.status }
      })
    } else {
      // Check for updates
      const previous = previousIdeas?.find(prev => prev.id === idea.id)
      if (previous && previous.updated_at !== idea.updated_at) {
        activities.push({
          id: `idea-updated-${idea.id}-${idea.updated_at}`,
          type: "idea_updated",
          title: "Idea updated",
          description: `Updated "${idea.title}"`,
          timestamp: new Date(idea.updated_at),
          itemId: idea.id,
          itemTitle: idea.title,
          metadata: { category: idea.category, status: idea.status }
        })
      }

      // Check for favorite changes
      if (previous && previous.is_favorite !== idea.is_favorite) {
        activities.push({
          id: `idea-favorite-${idea.id}-${idea.updated_at}`,
          type: idea.is_favorite ? "idea_favorited" : "idea_unfavorited",
          title: idea.is_favorite ? "Idea favorited" : "Idea unfavorited",
          description: `${idea.is_favorite ? "Added" : "Removed"} "${idea.title}" ${idea.is_favorite ? "to" : "from"} favorites`,
          timestamp: new Date(idea.updated_at),
          itemId: idea.id,
          itemTitle: idea.title,
        })
      }
    }
  })

  // Generate activities for new PRDs
  prds.forEach(prd => {
    const wasNew = !previousPRDs?.find(prev => prev.id === prd.id)
    if (wasNew) {
      activities.push({
        id: `prd-created-${prd.id}`,
        type: "prd_created",
        title: "PRD generated",
        description: `Generated PRD for "${prd.title}"`,
        timestamp: new Date(prd.created_at),
        itemId: prd.id,
        itemTitle: prd.title,
        metadata: { category: prd.category, status: prd.status }
      })
    } else {
      // Check for updates
      const previous = previousPRDs?.find(prev => prev.id === prd.id)
      if (previous && previous.updated_at !== prd.updated_at) {
        activities.push({
          id: `prd-updated-${prd.id}-${prd.updated_at}`,
          type: "prd_updated",
          title: "PRD updated",
          description: `Updated PRD "${prd.title}"`,
          timestamp: new Date(prd.updated_at),
          itemId: prd.id,
          itemTitle: prd.title,
          metadata: { category: prd.category, status: prd.status }
        })
      }
    }
  })

  // Check for deleted ideas (if previous data is available)
  if (previousIdeas) {
    previousIdeas.forEach(prevIdea => {
      const stillExists = ideas.find(idea => idea.id === prevIdea.id)
      if (!stillExists) {
        activities.push({
          id: `idea-deleted-${prevIdea.id}`,
          type: "idea_deleted",
          title: "Idea deleted",
          description: `Deleted "${prevIdea.title}"`,
          timestamp: new Date(), // Use current time since we don't have deletion timestamp
          itemTitle: prevIdea.title,
        })
      }
    })
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}
