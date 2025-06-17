"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function AnimatedTabs({ tabs, activeTab, onTabChange, className }: AnimatedTabsProps) {
  const [hoveredTab, setHoveredTab] = React.useState<string | null>(null)
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div className="relative">
        <div className="flex rounded-lg bg-muted p-1 relative">
          {/* Animated background indicator */}
          <motion.div
            className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm border"
            layoutId="activeTab"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            style={{
              left: `calc(${(activeIndex / tabs.length) * 100}% + 4px)`,
              width: `calc(${100 / tabs.length}% - 8px)`
            }}
          />

          {/* Tab Triggers */}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <motion.div
                    animate={{
                      rotate: activeTab === tab.id ? 180 : 0
                    }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    {tab.icon}
                  </motion.div>
                )}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with smooth animations */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {tabs.map((tab) =>
            tab.id === activeTab ? (
              <motion.div
                key={tab.id}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.23, 1, 0.32, 1]
                }}
                className="w-full"
              >
                {tab.content}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
