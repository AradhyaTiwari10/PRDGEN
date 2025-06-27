import { useEffect, useRef, useState, useCallback } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { PartialBlock } from "@blocknote/core";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useRealtimeCollaboration } from "@/hooks/use-realtime-collaboration";

// Import BlockNote styles
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./blocknote-theme.css";

interface BlockNoteCollaborativeEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  ideaId: string;
}

// Helper function to generate user colors
const getUserColor = (userId: string) => {
  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1"
  ];
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

export function BlockNoteCollaborativeEditor({
  content = "",
  onChange,
  readOnly = false,
  ideaId
}: BlockNoteCollaborativeEditorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined>(undefined);
  
  const {
    collaborators,
    currentUser,
    broadcastContentChange,
    setOnRemoteContentChange
  } = useRealtimeCollaboration(ideaId);

  // Initialize Yjs document and WebSocket provider
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    try {
      const provider = new WebsocketProvider(
        'ws://localhost:1234',
        `idea-${ideaId}`,
        ydoc
      );
      providerRef.current = provider;

      provider.on('status', (event: { status: string }) => {
        setIsConnected(event.status === 'connected');
      });

      provider.on('sync', (isSynced: boolean) => {
        setIsSyncing(!isSynced);
      });

      if (currentUser) {
        provider.awareness.setLocalStateField('user', {
          name: currentUser.name,
          color: getUserColor(currentUser.id),
          id: currentUser.id
        });
      }
    } catch (error) {
      console.warn('Failed to initialize WebSocket provider:', error);
      setIsConnected(false);
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, [ideaId, currentUser]);

  // Parse initial content
  useEffect(() => {
    if (content && typeof content === 'string') {
      try {
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
      } catch (error) {
        setInitialContent([{
          id: "initial", 
          type: "paragraph",
          content: content || ""
        }]);
      }
    } else {
      setInitialContent([]);
    }
  }, [content]);

  // Create BlockNote editor with collaboration
  const editor = useCreateBlockNote({
    initialContent: initialContent,
    collaboration: ydocRef.current && providerRef.current ? {
      provider: providerRef.current,
      fragment: ydocRef.current.getXmlFragment("document-store"),
      user: currentUser ? {
        name: currentUser.name,
        color: getUserColor(currentUser.id),
      } : {
        name: "Anonymous",
        color: "#3b82f6",
      },
    } : undefined,
  });

  // Handle content changes
  const handleChange = useCallback(() => {
    if (onChange && editor) {
      const blocks = editor.document;
      const contentString = JSON.stringify(blocks);
      onChange(contentString);
      broadcastContentChange(contentString);
    }
  }, [editor, onChange, broadcastContentChange]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-background border border-border rounded-lg">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading BlockNote editor...</p>
        </div>
      </div>
    );
  }

  // Active collaborators
  const activeCollaborators = collaborators;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
            isConnected 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } ${isSyncing ? 'animate-pulse' : ''}`}></div>
            {isConnected ? (isSyncing ? 'Syncing...' : 'Connected') : 'Offline'}
          </div>

          {/* Active collaborators */}
          {activeCollaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activeCollaborators.length} collaborator{activeCollaborators.length > 1 ? 's' : ''} online
              </span>
              <div className="flex -space-x-1">
                {activeCollaborators.slice(0, 3).map((collaborator) => (
                  <div
                    key={collaborator.user_id}
                    className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: getUserColor(collaborator.user_id) }}
                    title={collaborator.user_email}
                  >
                    {collaborator.user_email.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeCollaborators.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    +{activeCollaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {readOnly && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-400">
              Read Only
            </div>
          )}
          <div className="px-2 py-1 bg-[#5A827E]/10 border border-[#5A827E]/20 rounded-md text-xs text-[#B9D4AA]">
            Notion-style Editor
          </div>
        </div>
      </div>

      {/* Editor with enhanced container */}
      <div className="flex-1 overflow-auto relative">
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          theme="dark"
          className="min-h-full blocknote-ideavault"
        />
        
        {/* Collaboration watermark */}
        {isConnected && (
          <div className="absolute bottom-4 right-4 opacity-40 hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#5A827E]/20 border border-[#B9D4AA]/30 rounded-full text-xs text-[#B9D4AA]">
              <div className="w-2 h-2 bg-[#B9D4AA] rounded-full animate-pulse"></div>
              Live Collaboration
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 