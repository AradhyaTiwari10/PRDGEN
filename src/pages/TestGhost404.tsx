import { NotFound } from "@/components/ui/ghost-404-page";
import { FlowButton } from "@/components/ui/flow-button";
import { Link } from "react-router-dom";

const TestGhost404 = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-foreground">404 Component Test</h1>
          <div className="flex gap-4">
            <Link to="/" className="text-primary hover:text-primary/80">
              Home
            </Link>
            <Link to="/dashboard" className="text-primary hover:text-primary/80">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="p-8 text-center border-b border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Test Components</h2>
        <div className="flex gap-4 justify-center">
          <FlowButton text="Test Flow Button" />
          <Link to="/non-existent-route">
            <FlowButton text="Trigger 404" />
          </Link>
        </div>
      </div>

      {/* 404 Component */}
      <NotFound />
    </div>
  );
};

export default TestGhost404;
