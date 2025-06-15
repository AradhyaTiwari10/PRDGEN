import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", variant = "default", className, ...props }, ref) => {
  const baseClasses = "group relative cursor-pointer overflow-hidden rounded-full px-6 py-3 text-center font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm leading-tight";

  const variantClasses = {
    default: "border bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent text-foreground hover:text-primary-foreground",
    ghost: "border-transparent bg-transparent text-foreground hover:text-primary-foreground",
    secondary: "border bg-secondary text-secondary-foreground hover:text-primary-foreground"
  };

  const backgroundClasses = {
    default: "bg-primary/10",
    outline: "bg-primary",
    ghost: "bg-primary",
    secondary: "bg-primary"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="relative z-20 inline-flex items-center transition-all duration-300 group-hover:text-primary-foreground text-center leading-tight">
        {text}
      </span>
      <div className="relative z-20 w-0 overflow-hidden transition-all duration-300 group-hover:w-4">
        <ArrowRight className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className={cn("absolute left-0 top-0 h-full w-0 rounded-full transition-all duration-300 group-hover:w-full", backgroundClasses[variant])}></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
