import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function TestInteractiveButton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-bold">Interactive Hover Button Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl mb-4">Default Button</h2>
            <InteractiveHoverButton />
          </div>
          
          <div>
            <h2 className="text-xl mb-4">Custom Text</h2>
            <InteractiveHoverButton text="Get Started" />
          </div>
          
          <div>
            <h2 className="text-xl mb-4">Large Button</h2>
            <InteractiveHoverButton 
              text="Go to Dashboard" 
              className="w-auto px-6 py-3 text-lg"
            />
          </div>
          
          <div>
            <h2 className="text-xl mb-4">With Click Handler</h2>
            <InteractiveHoverButton 
              text="Start Generating PRDs" 
              onClick={() => alert("Button clicked!")}
              className="w-auto px-6 py-3 text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
