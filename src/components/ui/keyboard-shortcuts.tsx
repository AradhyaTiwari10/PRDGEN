"use client"

import { useEffect, useState } from "react"
import { Command, Search, Plus, Save, HelpCircle, Keyboard, Sidebar, Home, LayoutDashboard } from "lucide-react"
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
  icon?: React.ReactNode
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

  // Detect platform for proper key display
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? "⌘" : "Ctrl";

  const shortcuts: KeyboardShortcut[] = [
    {
      key: `Ctrl+N`,
      windowsKey: "Ctrl+N",
      description: "Create new idea",
      category: "Actions",
      action: onNewIdea,
      icon: <Plus className="h-4 w-4" />,
    },
    {
      key: `Ctrl+K`,
      windowsKey: "Ctrl+K",
      description: "Quick search (Command Palette)",
      category: "Navigation",
      action: onQuickSearch,
      icon: <Search className="h-4 w-4" />,
    },
    {
      key: `Ctrl+S`,
      windowsKey: "Ctrl+S",
      description: "Save current item",
      category: "Actions",
      action: onSave,
      icon: <Save className="h-4 w-4" />,
    },
    {
      key: `Ctrl+F`,
      windowsKey: "Ctrl+F",
      description: "Focus search",
      category: "Navigation",
      action: onSearch,
      icon: <Search className="h-4 w-4" />,
    },
    {
      key: `Ctrl+/`,
      windowsKey: "Ctrl+/",
      description: "Show keyboard shortcuts",
      category: "Help",
      action: () => setDialogOpen(true),
      icon: <HelpCircle className="h-4 w-4" />,
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
      description: "Show keyboard shortcuts (alternative)",
      category: "Help",
      action: () => setDialogOpen(true),
      icon: <HelpCircle className="h-4 w-4" />,
    },
    {
      key: `Ctrl+B`,
      windowsKey: "Ctrl+B",
      description: "Toggle sidebar",
      category: "Navigation",
      icon: <Sidebar className="h-4 w-4" />,
    },
    {
      key: "Ctrl+1",
      windowsKey: "Ctrl+1",
      description: "Go to home",
      category: "Navigation",
      icon: <Home className="h-4 w-4" />,
    },
    {
      key: "Ctrl+2",
      windowsKey: "Ctrl+2",
      description: "Go to dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ]

  // Note: Keyboard event handling is now managed by the centralized useKeyboardShortcuts hook
  // This component only displays the shortcuts dialog

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  const formatKey = (key: string) => {
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
      <div className="flex items-center justify-end min-w-[100px]">
        {keyElements}
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
                        <div className="flex items-center gap-3 flex-1">
                          {shortcut.icon && (
                            <div className="text-muted-foreground">
                              {shortcut.icon}
                            </div>
                          )}
                          <span className="text-sm font-medium">{shortcut.description}</span>
                        </div>
                        <div className="flex-shrink-0">
                          {formatKey(shortcut.key)}
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
              <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">/</kbd> to open this dialog
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              Familiar shortcuts: Ctrl+N (New), Ctrl+S (Save), Ctrl+F (Find), Ctrl+K (Search)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Note: The useKeyboardShortcuts hook has been moved to @/hooks/use-keyboard-shortcuts
// This component now focuses only on displaying the keyboard shortcuts dialog
