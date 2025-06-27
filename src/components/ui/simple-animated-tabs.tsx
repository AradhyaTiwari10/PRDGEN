"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SimpleAnimatedTabsProps {
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

export function SimpleAnimatedTabs({ tabs, activeTab, onTabChange, className }: SimpleAnimatedTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 })

  React.useEffect(() => {
    const activeTabElement = tabRefs.current[activeIndex]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeIndex])

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div className="relative">
        <div className="flex rounded-lg bg-[#5A827E] border border-[#84AE92] p-1 relative">
          {/* Animated background indicator */}
                      <motion.div
              className="absolute top-1 bottom-1 bg-[#B9D4AA] rounded-md shadow-sm border border-[#FAFFCA]"
            animate={indicatorStyle}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.3
            }}
          />

          {/* Tab Triggers */}
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "hover:text-white",
                activeTab === tab.id
                  ? "text-[#1C1C1C] font-semibold"
                  : "text-white"
              )}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
              >
                {tab.icon && (
                  <motion.div
                    animate={{ 
                      rotate: activeTab === tab.id ? 180 : 0
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    {tab.icon}
                  </motion.div>
                )}
                <span>{tab.label}</span>
              </motion.div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => 
            tab.id === activeTab ? (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.25,
                  ease: "easeInOut"
                }}
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
