import { useEffect, useState, useCallback, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { PartialBlock } from "@blocknote/core";
import { useBlockNoteCollaboration } from "@/hooks/use-blocknote-collaboration";
import { Users, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import BlockNote styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-theme.css";

interface BlockNoteCollaborativeEditorV2Props {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  ideaId: string;
  ideaTitle?: string;
  ideaDescription?: string;
  ideaMarketSize?: string;
  ideaCompetition?: string;
  ideaNotes?: string;
}

// Function to generate template for ideas
const generateIdeaTemplate = (
  title?: string, 
  description?: string, 
  marketSize?: string, 
  competition?: string, 
  notes?: string
): PartialBlock[] => {
  return [
    {
      id: "title",
      type: "heading" as const,
      props: { level: 1 },
      content: [{ type: "text" as const, text: title || "Your Idea Title", styles: {} }]
    },
    {
      id: "overview",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "📝 Idea Overview", styles: {} }]
    },
    {
      id: "description",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: description || "Describe your idea in detail here...", styles: {} }]
    },
    {
      id: "problem",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "❗ Problem Statement", styles: {} }]
    },
    {
      id: "problem-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: "What specific problem does your idea solve? Who experiences this problem and how often?", styles: { italic: true } }]
    },
    {
      id: "solution",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "💡 Proposed Solution", styles: {} }]
    },
    {
      id: "solution-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: "How does your idea solve the problem? What makes it unique or better than existing solutions?", styles: { italic: true } }]
    },
    {
      id: "target-audience",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "🎯 Target Audience", styles: {} }]
    },
    {
      id: "target-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: "Who are your primary users? Demographics, behaviors, needs, and pain points.", styles: { italic: true } }]
    },
    {
      id: "key-features",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "⭐ Key Features", styles: {} }]
    },
    {
      id: "features-list",
      type: "bulletListItem" as const,
      content: [{ type: "text" as const, text: "Core feature 1", styles: { italic: true } }]
    },
    {
      id: "features-list-2",
      type: "bulletListItem" as const,
      content: [{ type: "text" as const, text: "Core feature 2", styles: { italic: true } }]
    },
    {
      id: "features-list-3",
      type: "bulletListItem" as const,
      content: [{ type: "text" as const, text: "Core feature 3", styles: { italic: true } }]
    },
    {
      id: "market",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "📊 Market Analysis", styles: {} }]
    },
    {
      id: "market-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: `Market Size: ${marketSize || "Research and define your total addressable market (TAM)"}`, styles: {} }]
    },
    {
      id: "competition-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: `Competition: ${competition || "Identify direct and indirect competitors, their strengths and weaknesses"}`, styles: {} }]
    },
    {
      id: "next-steps",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "🚀 Next Steps", styles: {} }]
    },
    {
      id: "steps-list",
      type: "numberedListItem" as const,
      content: [{ type: "text" as const, text: "Validate the problem with potential users", styles: { italic: true } }]
    },
    {
      id: "steps-list-2",
      type: "numberedListItem" as const,
      content: [{ type: "text" as const, text: "Create a minimum viable product (MVP)", styles: { italic: true } }]
    },
    {
      id: "steps-list-3",
      type: "numberedListItem" as const,
      content: [{ type: "text" as const, text: "Test with early adopters and gather feedback", styles: { italic: true } }]
    },
    {
      id: "notes",
      type: "heading" as const,
      props: { level: 2 },
      content: [{ type: "text" as const, text: "📋 Additional Notes", styles: {} }]
    },
    {
      id: "notes-content",
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: notes || "Add any additional thoughts, resources, or considerations here...", styles: { italic: true } }]
    }
  ];
};

export function BlockNoteCollaborativeEditorV2({
  content = "",
  onChange,
  readOnly = false,
  ideaId,
  ideaTitle,
  ideaDescription,
  ideaMarketSize,
  ideaCompetition,
  ideaNotes
}: BlockNoteCollaborativeEditorV2Props) {
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  const {
    collaborators,
    isConnected,
    connectionStatus,
    currentUser,
    getYjsDocument,
    getProvider,
    cleanup
  } = useBlockNoteCollaboration(ideaId);

  // Parse initial content
  useEffect(() => {
    if (hasInitialized.current) return;
    
    try {
      if (content && content.trim()) {
        if (content.startsWith('[') || content.startsWith('{')) {
          const blocks = JSON.parse(content);
          setInitialContent(Array.isArray(blocks) ? blocks : [blocks]);
        } else {
          setInitialContent([{
            id: "initial",
            type: "paragraph",
            content: content
          }]);
        }
      } else {
        // Generate template for empty content using idea data
        const template = generateIdeaTemplate(
          ideaTitle,
          ideaDescription,
          ideaMarketSize,
          ideaCompetition,
          ideaNotes
        );
        setInitialContent(template);
      }
    } catch (error) {
      console.error('Error parsing initial content:', error);
      // Fallback to template if parsing fails
      const template = generateIdeaTemplate(
        ideaTitle,
        ideaDescription,
        ideaMarketSize,
        ideaCompetition,
        ideaNotes
      );
      setInitialContent(template);
    } finally {
      setIsLoading(false);
      hasInitialized.current = true;
    }
  }, [content, ideaTitle, ideaDescription, ideaMarketSize, ideaCompetition, ideaNotes]);

  // Create BlockNote editor with collaboration
  const editor = useCreateBlockNote({
    initialContent,
    collaboration: (() => {
      const ydoc = getYjsDocument();
      const provider = getProvider();
      
      if (!ydoc || !provider || !currentUser) {
        return undefined;
      }

      return {
        provider,
        fragment: ydoc.getXmlFragment("document-store"),
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      };
    })(),
  });

  // Handle content changes
  const handleChange = useCallback(() => {
    if (!onChange || !editor) return;

    try {
      const blocks = editor.document;
      const contentString = JSON.stringify(blocks);
      onChange(contentString);
    } catch (error) {
      console.error('Error handling content change:', error);
    }
  }, [editor, onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-background border border-border rounded-lg">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading collaborative editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          theme="dark"
          className="h-full blocknote-ideavault"
        />
      </div>
    </div>
  );
} 