"use client"

import { useTypingAnimation } from "@/hooks/use-typing-animation"
import { cn } from "@/lib/utils"

interface TypingPlaceholderProps {
  texts: string[]
  prefix?: string
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  showCursor?: boolean
}

export function TypingPlaceholder({
  texts,
  prefix = "",
  className,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  showCursor = true,
}: TypingPlaceholderProps) {
  const animatedText = useTypingAnimation({
    texts,
    prefix,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  })

  const isEmptyText = animatedText === prefix

  return (
    <>
      <span className={cn("text-muted-foreground select-none", className)}>
        {animatedText}
        {showCursor && (
          <span 
            className={cn(
              "inline-block w-0.5 h-4 bg-muted-foreground ml-0.5",
              isEmptyText && "animate-pulse"
            )}
            style={{
              animation: isEmptyText ? undefined : 'typing-cursor 1s ease-in-out infinite'
            }}
          />
        )}
      </span>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes typing-cursor {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.2; }
          }
        `
      }} />
    </>
  )
} 