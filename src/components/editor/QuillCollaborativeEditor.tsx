import { useEffect, useCallback, useRef, useState } from "react";
import Quill from "quill";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import { useRealtimeCollaboration, CollaboratorPresence } from "@/hooks/use-realtime-collaboration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Users,
  Wifi,
  WifiOff,
  Type,
  FileText
} from "lucide-react";

// Import Quill styles
import "quill/dist/quill.snow.css";

// Register QuillCursors module
Quill.register('modules/cursors', QuillCursors);

interface QuillCollaborativeEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  ideaId: string;
}

// Component to show active collaborators
function CollaboratorsList({
  collaborators,
  isConnected,
  isSyncing,
  currentUser
}: {
  collaborators: CollaboratorPresence[];
  isConnected: boolean;
  isSyncing: boolean;
  currentUser?: { id: string; email: string; name: string };
}) {
  const allActiveEditors = [
    ...(currentUser ? [{
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      color: '#3b82f6',
      isCurrentUser: true,
      is_typing: false
    }] : []),
    ...collaborators.map(collab => ({
      ...collab,
      isCurrentUser: false
    }))
  ];

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
      <div className="flex items-center gap-3">
        {/* Editor Type and Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Rich Text Editor
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3 text-green-500" /> : <WifiOff className="h-3 w-3 text-gray-400" />}
            <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {isSyncing && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Syncing...
            </Badge>
          )}
        </div>

        {/* Active Editors Display */}
        {(currentUser || collaborators.length > 0) && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {allActiveEditors.length === 1 ? '1 editor' : `${allActiveEditors.length} editors`}
            </span>
            <div className="flex items-center gap-1">
              {/* Current user */}
              {currentUser && (
                <div className="flex items-center gap-1 group">
                  <Avatar className="w-5 h-5 ring-1 ring-offset-1 transition-all duration-200 hover:scale-110" style={{ ringColor: '#3b82f6' }}>
                    <AvatarFallback
                      className="text-xs text-white font-medium"
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    You
                  </span>
                </div>
              )}

              {/* Collaborators */}
              {collaborators.map((editor) => (
                <div key={editor.user_id} className="flex items-center gap-1 group">
                  <Avatar className="w-5 h-5 ring-1 ring-offset-1 transition-all duration-200 hover:scale-110" style={{ ringColor: editor.color }}>
                    <AvatarFallback
                      className="text-xs text-white font-medium"
                      style={{ backgroundColor: editor.color }}
                    >
                      {editor.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {editor.user_name}
                    {editor.is_typing && (
                      <span className="ml-1 text-green-500 animate-pulse">typing...</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isConnected && allActiveEditors.length > 1 && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Collaborative editing active
          </span>
        )}
      </div>
    </div>
  );
}

export function QuillCollaborativeEditor({
  content = "",
  onChange,
  readOnly = false,
  ideaId
}: QuillCollaborativeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<QuillBinding | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    collaborators,
    currentUser,
    broadcastContentChange,
    broadcastCursorUpdate,
    broadcastTypingStatus,
    setOnRemoteContentChange
  } = useRealtimeCollaboration(ideaId);

  // Initialize Quill editor with Yjs collaboration
  useEffect(() => {
    if (!editorRef.current) return;



    // Create Yjs document and WebSocket provider
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');
    ydocRef.current = ydoc;

    // Create WebSocket provider for real-time collaboration
    const provider = new WebsocketProvider(
      'ws://localhost:1234', // WebSocket server URL
      `idea-${ideaId}`, // Room name
      ydoc
    );
    providerRef.current = provider;

    // Handle connection status
    provider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected');
    });

    provider.on('sync', (isSynced: boolean) => {
      setIsSyncing(!isSynced);
    });

    // Configure Quill with toolbar and cursors
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      readOnly,
      modules: {
        toolbar: !readOnly ? [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean']
        ] : false,
        cursors: {
          transformOnTextChange: true,
          autoRegisterListener: false,
          hideDelayMs: 5000,
          hideSpeedMs: 0,
          selectionChangeSource: null,
          template: '<span class="ql-cursor-flag">{{name}}</span><span class="ql-cursor-caret"></span>',
          positionFlag: (cursor: any, flag: HTMLElement) => {
            // Position the cursor flag above the cursor
            flag.style.top = '-28px';
            flag.style.left = '0px';
          }
        },
        history: false
      }
    });

    quillRef.current = quill;

    // Create Yjs binding with awareness for collaborative cursors
    const binding = new QuillBinding(ytext, quill, provider.awareness);
    bindingRef.current = binding;

    // Update local user info in awareness
    if (currentUser) {
      provider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: '#3b82f6', // Blue color for current user
        id: currentUser.id
      });
    }

    // Set initial content if provided - let Yjs handle it naturally
    if (content && ytext.length === 0) {
      // Convert HTML to plain text to avoid cursor positioning issues
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      if (plainText.trim()) {
        ytext.insert(0, plainText);
      }
    }

    // Handle text changes - only for local updates, Yjs handles sync
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        const newContent = quill.root.innerHTML;
        onChange?.(newContent);

        // Broadcast typing status
        broadcastTypingStatus(true);

        // Clear existing typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          broadcastTypingStatus(false);
        }, 1000);
      }
    });

    // Handle selection changes for cursor updates - let QuillBinding handle this
    // The QuillBinding automatically manages cursor awareness

    // Cleanup function
    return () => {
      if (binding) binding.destroy();
      if (provider) provider.destroy();
      if (ydoc) ydoc.destroy();
    };
  }, [ideaId, readOnly]);

  return (
    <div className="h-full flex flex-col">
      {/* Show active collaborators */}
      <CollaboratorsList
        collaborators={collaborators}
        isConnected={isConnected}
        isSyncing={isSyncing}
        currentUser={currentUser}
      />

      {/* Quill Editor Container */}
      <div className="flex-1 min-h-0 overflow-hidden bg-card">
        <div
          ref={editorRef}
          className="h-full quill-container"
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
          }}
        />
      </div>

      {/* Custom CSS for Quill editor styling */}
      <style>{`
        .quill-container .ql-editor {
          padding: 2rem;
          min-height: calc(100% - 42px);
          font-size: 16px;
          line-height: 1.6;
          color: hsl(var(--foreground));
          background-color: hsl(var(--card));
        }

        .quill-container .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid hsl(var(--border));
          background-color: hsl(var(--card));
        }

        .quill-container .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }

        .quill-container .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }

        .quill-container .ql-toolbar button:hover {
          background-color: hsl(var(--muted));
        }

        .quill-container .ql-toolbar button.ql-active {
          background-color: hsl(var(--muted));
        }

        .quill-container .ql-container {
          border: none;
          font-family: inherit;
        }

        .quill-container .ql-editor h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: hsl(var(--foreground));
        }

        .quill-container .ql-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: hsl(var(--foreground));
        }

        .quill-container .ql-editor p {
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }

        .quill-container .ql-editor ul,
        .quill-container .ql-editor ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .quill-container .ql-editor li {
          margin: 0.25rem 0;
          color: hsl(var(--foreground));
        }

        /* Cursor styling */
        .ql-cursor {
          position: absolute;
          width: 2px;
          background-color: currentColor;
          pointer-events: none;
          z-index: 1000;
        }

        .ql-cursor-flag {
          position: absolute;
          top: -24px;
          left: -1px;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1001;
        }

        .ql-cursor-caret {
          position: absolute;
          width: 2px;
          height: 20px;
          background-color: currentColor;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
