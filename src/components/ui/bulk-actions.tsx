"use client"

import { useState } from "react"
import { 
  Check, 
  X, 
  Trash2, 
  Star, 
  StarOff, 
  Archive, 
  Download, 
  Tag,
  MoreHorizontal,
  CheckSquare,
  Square
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Idea, IdeaStatus, IdeaPriority } from "@/types"

interface BulkActionsProps {
  selectedItems: string[]
  allItems: Idea[]
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkStatusUpdate: (ids: string[], status: IdeaStatus) => Promise<void>
  onBulkPriorityUpdate: (ids: string[], priority: IdeaPriority) => Promise<void>
  onBulkFavoriteToggle: (ids: string[], favorite: boolean) => Promise<void>
  onBulkDelete: (ids: string[]) => Promise<void>
  onBulkExport: (ids: string[]) => void
  className?: string
}

export function BulkActions({
  selectedItems,
  allItems,
  onSelectAll,
  onDeselectAll,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  onBulkFavoriteToggle,
  onBulkDelete,
  onBulkExport,
  className,
}: BulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectedCount = selectedItems.length
  const totalCount = allItems.length
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount

  const handleBulkAction = async (action: () => Promise<void>) => {
    setIsLoading(true)
    try {
      await action()
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (status: IdeaStatus) => {
    await handleBulkAction(() => onBulkStatusUpdate(selectedItems, status))
  }

  const handlePriorityUpdate = async (priority: IdeaPriority) => {
    await handleBulkAction(() => onBulkPriorityUpdate(selectedItems, priority))
  }

  const handleFavoriteToggle = async (favorite: boolean) => {
    await handleBulkAction(() => onBulkFavoriteToggle(selectedItems, favorite))
  }

  const handleDelete = async () => {
    await handleBulkAction(() => onBulkDelete(selectedItems))
    setIsDeleteDialogOpen(false)
  }

  if (selectedCount === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          className="h-8 px-2"
        >
          {isAllSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          <span className="ml-2 text-sm">
            Select All ({totalCount})
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-lg border", className)}>
      {/* Selection Info */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={isAllSelected ? onDeselectAll : onSelectAll}
          className="h-8 px-2"
        >
          {isAllSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : isPartiallySelected ? (
            <CheckSquare className="h-4 w-4 opacity-50" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
        
        <Badge variant="secondary" className="font-medium">
          {selectedCount} selected
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-1 ml-4">
        {/* Status Update */}
        <Select onValueChange={handleStatusUpdate}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="ready_for_prd">Ready for PRD</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Update */}
        <Select onValueChange={handlePriorityUpdate}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Favorite Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFavoriteToggle(true)}
          className="h-8 px-2"
          disabled={isLoading}
        >
          <Star className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFavoriteToggle(false)}
          className="h-8 px-2"
          disabled={isLoading}
        >
          <StarOff className="h-4 w-4" />
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onBulkExport(selectedItems)}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Ideas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected idea{selectedCount > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
