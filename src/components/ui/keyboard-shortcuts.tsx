"use client"

import { useEffect, useState } from "react"
import { Command, Search, Plus, Save, HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KeyboardShortcut {
  key: string
  windowsKey: string
  description: string
  category: string
  action?: () => void
}

interface KeyboardShortcutsProps {
  onNewIdea?: () => void
  onSearch?: () => void
  onSave?: () => void
  onQuickSearch?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function KeyboardShortcuts({
  onNewIdea,
  onSearch,
  onSave,
  onQuickSearch,
  isOpen = false,
  onOpenChange,
}: KeyboardShortcutsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Use external control if provided, otherwise use internal state
  const dialogOpen = onOpenChange ? isOpen : isHelpOpen
  const setDialogOpen = onOpenChange || setIsHelpOpen

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "Ctrl+N",
      windowsKey: "Ctrl+N",
      description: "Create new idea",
      category: "Actions",
      action: onNewIdea,
    },
    {
      key: "Ctrl+K",
      windowsKey: "Ctrl+K",
      description: "Quick search",
      category: "Navigation",
      action: onQuickSearch,
    },
    {
      key: "Ctrl+S",
      windowsKey: "Ctrl+S",
      description: "Save current item",
      category: "Actions",
      action: onSave,
    },
    {
      key: "Ctrl+F",
      windowsKey: "Ctrl+F",
      description: "Focus search",
      category: "Navigation",
      action: onSearch,
    },
    {
      key: "Ctrl+/",
      windowsKey: "Ctrl+/",
      description: "Show keyboard shortcuts",
      category: "Help",
      action: () => setDialogOpen(true),
    },
    {
      key: "Escape",
      windowsKey: "Escape",
      description: "Close dialogs/clear selection",
      category: "Navigation",
    },
    {
      key: "Ctrl+A",
      windowsKey: "Ctrl+A",
      description: "Select all text",
      category: "Selection",
    },
    {
      key: "Delete",
      windowsKey: "Delete",
      description: "Delete selected items",
      category: "Actions",
    },
    {
      key: "Enter",
      windowsKey: "Enter",
      description: "Open selected item",
      category: "Navigation",
    },
    {
      key: "Tab",
      windowsKey: "Tab",
      description: "Navigate between elements",
      category: "Navigation",
    },
    {
      key: "?",
      windowsKey: "?",
      description: "Show keyboard shortcuts",
      category: "Help",
      action: () => setDialogOpen(true),
    },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key, target } = event
      const isModifierPressed = ctrlKey || metaKey
      
      // Don't trigger shortcuts when typing in inputs
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        // Allow Ctrl+A in text inputs
        if (key === "a" && isModifierPressed) return
        // Allow Ctrl+S for save
        if (key === "s" && isModifierPressed) {
          event.preventDefault()
          onSave?.()
          return
        }
        // Allow Ctrl+/ for help
        if (key === "/" && isModifierPressed) {
          event.preventDefault()
          setDialogOpen(true)
          return
        }
        return
      }

      // Handle keyboard shortcuts
      if (isModifierPressed) {
        switch (key.toLowerCase()) {
          case "n":
            event.preventDefault()
            onNewIdea?.()
            break
          case "k":
            event.preventDefault()
            onQuickSearch?.()
            break
          case "s":
            event.preventDefault()
            onSave?.()
            break
          case "f":
            event.preventDefault()
            onSearch?.()
            break
          case "/":
            event.preventDefault()
            setDialogOpen(true)
            break
        }
      } else {
        switch (key) {
          case "Escape":
            // Let components handle their own escape logic
            break
          case "?":
            if (!isModifierPressed) {
              event.preventDefault()
              setDialogOpen(true)
            }
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onNewIdea, onSearch, onSave, onQuickSearch])

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const formatKey = (macKey: string, windowsKey: string) => {
    const formatSingleKey = (key: string, label: string) => {
      const parts = key.split("+").map((k, index) => (
        <kbd
          key={`${k}-${index}`}
          className="px-1.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted border border-border rounded"
        >
          {k}
        </kbd>
      ))

      const keyElements = parts.reduce((acc, curr, index) => {
        if (index > 0) {
          acc.push(
            <span key={`plus-${index}`} className="mx-0.5 text-muted-foreground text-xs">
              +
            </span>
          )
        }
        acc.push(curr)
        return acc
      }, [] as React.ReactNode[])

      return (
        <div className="flex items-center gap-1.5 text-right">
          <span className="text-xs text-muted-foreground font-medium min-w-[50px] text-right">
            {label}:
          </span>
          <div className="flex items-center">
            {keyElements}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-1 min-w-[140px]">
        {formatSingleKey(macKey, "Mac")}
        {formatSingleKey(windowsKey, "Win")}
      </div>
    )
  }

  return (
    <>
      {/* Shortcuts Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[50vh] pr-2 -mr-2">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={shortcut.key}
                        className="flex items-start justify-between py-2 px-3 rounded-lg hover:bg-muted/50 gap-4"
                      >
                        <span className="text-sm font-medium flex-1">{shortcut.description}</span>
                        <div className="flex-shrink-0">
                          {formatKey(shortcut.key, shortcut.windowsKey)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Ctrl</kbd> +{" "}
              <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">/</kbd> or{" "}
              <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">?</kbd> to open this dialog
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Shortcuts work on both Mac and Windows systems
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key, target } = event
      const isModifierPressed = ctrlKey || metaKey
      
      // Don't trigger shortcuts when typing in inputs
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return
      }

      const shortcutKey = isModifierPressed ? `Ctrl+${key.toLowerCase()}` : key
      const action = shortcuts[shortcutKey]
      
      if (action) {
        event.preventDefault()
        action()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
