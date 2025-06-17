"use client"

import { cn } from "@/lib/utils"

interface ShortcutBadgeProps {
  keys: string[]
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ShortcutBadge({ keys, className, size = "sm" }: ShortcutBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm", 
    lg: "px-3 py-1.5 text-base"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {keys.map((key, index) => (
        <div key={index} className="flex items-center gap-1">
          <kbd
            className={cn(
              "font-semibold text-muted-foreground bg-muted border border-border rounded",
              sizeClasses[size]
            )}
          >
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Predefined shortcut badges for common combinations
export const ShortcutBadges = {
  newIdea: () => <ShortcutBadge keys={["Ctrl", "N"]} />,
  search: () => <ShortcutBadge keys={["Ctrl", "K"]} />,
  save: () => <ShortcutBadge keys={["Ctrl", "S"]} />,
  focusSearch: () => <ShortcutBadge keys={["Ctrl", "F"]} />,
  toggleSidebar: () => <ShortcutBadge keys={["Ctrl", "B"]} />,
  help: () => <ShortcutBadge keys={["Ctrl", "/"]} />,
  goHome: () => <ShortcutBadge keys={["Ctrl", "1"]} />,
  goDashboard: () => <ShortcutBadge keys={["Ctrl", "2"]} />,
  escape: () => <ShortcutBadge keys={["Esc"]} />,
}
