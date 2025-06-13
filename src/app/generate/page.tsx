import { PRDGeneratorForm } from "@/components/prd/prd-generator-form";

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Generate Prompt for Lovable, Bolt.new and Cursor with IdeaVault
          </h1>
          <p className="text-muted-foreground">
            Transform your product idea into a comprehensive Product
            Requirements Document
          </p>
        </div>

        <PRDGeneratorForm />
      </div>
    </div>
  );
}
