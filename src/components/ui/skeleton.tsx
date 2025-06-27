import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#5A827E]/20 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-[#B9D4AA]/30 before:to-transparent",
        className
      )}
      {...props}
      style={{
        ...props.style,
      }}
    />
  )
}

export { Skeleton }
