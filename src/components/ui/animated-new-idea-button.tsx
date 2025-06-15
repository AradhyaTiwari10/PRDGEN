import React from "react";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedNewIdeaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
}

const AnimatedNewIdeaButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedNewIdeaButtonProps
>(({ text = "New Idea", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base button styles with InteractiveHoverButton influence (maintaining original shape)
        "group relative cursor-pointer overflow-hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-lg transform-gpu inline-flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {/* Spinning Plus Icon with Scale Effect */}
      <Plus className="h-4 w-4 transition-all duration-1000 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110 relative z-20" />

      {/* Button Text with InteractiveHoverButton text animation */}
      <span className="relative z-20 inline-flex items-center transition-all duration-300 group-hover:text-primary-foreground text-center leading-tight">
        {text}
      </span>

      {/* InteractiveHoverButton Arrow Animation */}
      <div className="relative z-20 w-0 overflow-hidden transition-all duration-300 group-hover:w-4">
        <ArrowRight className="h-4 w-4 text-primary-foreground" />
      </div>

      {/* InteractiveHoverButton Background Sweep Animation */}
      <div className="absolute left-0 top-0 h-full w-0 rounded-md bg-primary/10 transition-all duration-300 group-hover:w-full"></div>

      {/* Additional Shimmer Effect */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-pulse"></div>

      {/* Subtle Border Glow */}
      <div className="absolute inset-0 rounded-md border border-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </button>
  );
});

AnimatedNewIdeaButton.displayName = "AnimatedNewIdeaButton";

export { AnimatedNewIdeaButton };
