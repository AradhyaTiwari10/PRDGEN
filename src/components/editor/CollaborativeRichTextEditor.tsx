import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Table as TableIcon,
  Plus,
  Minus,
  Trash2,
  CheckSquare,
  Underline as UnderlineIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Strikethrough,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useCallback, useRef, useState } from "react";
import { useRealtimeCollaboration, CollaboratorPresence } from "@/hooks/use-realtime-collaboration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CollaborativeRichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  ideaId: string;
}

// Component to show collaborator cursors with enhanced visibility and Google Docs-like styling
function CollaboratorCursor({ collaborator, position }: { collaborator: CollaboratorPresence; position: { top: number; left: number } }) {
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-2px)'
      }}
    >
      {/* Animated cursor line with glow effect */}
      <div
        className="w-0.5 h-5 absolute animate-pulse"
        style={{
          backgroundColor: collaborator.color,
          boxShadow: `0 0 4px ${collaborator.color}60, 0 0 8px ${collaborator.color}30`
        }}
      />

      {/* User label with enhanced styling and avatar */}
      <div
        className="absolute -top-9 left-0 px-2 py-1 rounded-md text-xs text-white whitespace-nowrap flex items-center gap-1 font-medium shadow-lg"
        style={{
          backgroundColor: collaborator.color,
          boxShadow: `0 2px 8px ${collaborator.color}40`
        }}
      >
        <Avatar className="w-4 h-4 ring-1 ring-white/30">
          <AvatarFallback className="text-xs font-bold text-white" style={{ backgroundColor: collaborator.color }}>
            {collaborator.user_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{collaborator.user_name}</span>
        {collaborator.is_typing ? (
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        )}

        {/* Small arrow pointing down to cursor */}
        <div
          className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent"
          style={{ borderTopColor: collaborator.color }}
        />
      </div>
    </div>
  );
}

// Component to show active collaborators with enhanced real-time editing display
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
  // Create a list of all active editors (including current user)
  const allActiveEditors = [
    ...(currentUser ? [{
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      color: '#3b82f6', // Blue for current user
      isCurrentUser: true,
      is_typing: false // Current user typing status handled separately
    }] : []),
    ...collaborators.map(collab => ({
      ...collab,
      isCurrentUser: false
    }))
  ];

  console.log('👥 CollaboratorsList render:', {
    currentUser,
    collaborators,
    allActiveEditors,
    isConnected
  });

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
      <div className="flex items-center gap-3">
        {/* Live Status with Active Editors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
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

        {/* Active Editors Display - Always show if we have current user or collaborators */}
        {(currentUser || collaborators.length > 0) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {allActiveEditors.length === 1 ? 'Editing:' : `${allActiveEditors.length} editing:`}
            </span>
            <div className="flex items-center gap-1">
              {/* Always show current user first if available */}
              {currentUser && (
                <div className="flex items-center gap-1 group">
                  <Avatar className="w-6 h-6 ring-2 ring-offset-1 transition-all duration-200 hover:scale-110" style={{ ringColor: '#3b82f6' }}>
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
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                </div>
              )}

              {/* Show collaborators */}
              {collaborators.map((editor) => (
                <div key={editor.user_id} className="flex items-center gap-1 group">
                  <Avatar className="w-6 h-6 ring-2 ring-offset-1 transition-all duration-200 hover:scale-110" style={{ ringColor: editor.color }}>
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
                  {editor.is_typing && (
                    <div className="flex gap-0.5 ml-1">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connection Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isConnected && (currentUser ? collaborators.length + 1 : collaborators.length) > 1 && (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Real-time collaboration active
          </span>
        )}
      </div>
    </div>
  );
}

export function CollaborativeRichTextEditor({
  content = "",
  onChange,
  readOnly = false,
  ideaId
}: CollaborativeRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromRemoteRef = useRef(false);
  const isTypingRef = useRef(false);
  const {
    collaborators,
    isConnected,
    currentUser,
    broadcastContentChange,
    broadcastCursorUpdate,
    broadcastTypingStatus,
    setOnRemoteContentChange
  } = useRealtimeCollaboration(ideaId);

  // Debounced broadcast function
  const debouncedBroadcast = useCallback((content: string, cursorPosition: number) => {
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
    }

    broadcastTimeoutRef.current = setTimeout(() => {
      console.log('📤 Debounced broadcast triggered');
      broadcastContentChange(content, cursorPosition);
    }, 300); // 300ms delay
  }, [broadcastContentChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse w-full",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'neon-highlight',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (!readOnly && !isUpdatingFromRemoteRef.current) {
        const newContent = editor.getHTML();
        console.log('📝 MAIN EDITOR: Local content updated, calling onChange');
        onChange?.(newContent);

        // Show typing indicator
        if (!isTypingRef.current) {
          isTypingRef.current = true;
          broadcastTypingStatus(true);
          console.log('⌨️ Started typing');
        }

        // Clear existing typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          if (isTypingRef.current) {
            isTypingRef.current = false;
            broadcastTypingStatus(false);
            console.log('⌨️ Stopped typing');
          }
        }, 1000); // Stop typing after 1 second of inactivity

        // Broadcast content changes to other collaborators
        const { from } = editor.state.selection;
        console.log('📤 MAIN EDITOR: Broadcasting LOCAL content change with cursor at:', from);
        broadcastContentChange(newContent, from);
      } else if (isUpdatingFromRemoteRef.current) {
        console.log('📝 MAIN EDITOR: Skipping broadcast - updating from remote');
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (!readOnly && !isUpdatingFromRemoteRef.current) {
        const { from, to } = editor.state.selection;
        console.log('🖱️ MAIN EDITOR: Local selection updated:', { from, to });
        broadcastCursorUpdate(from, from, to);
      } else if (isUpdatingFromRemoteRef.current) {
        console.log('🖱️ MAIN EDITOR: Skipping cursor broadcast - updating from remote');
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${readOnly ? 'cursor-default' : ''}`,
      },
    },
  });

  // Handle remote content changes
  useEffect(() => {
    if (!editor) return;

    console.log('🔧 MAIN EDITOR: Setting up remote content change handler');

    setOnRemoteContentChange((change) => {
      console.log('📥 MAIN EDITOR: ===== REMOTE CHANGE RECEIVED =====');
      console.log('📥 MAIN EDITOR: Change from user:', change.user_email);
      console.log('📥 MAIN EDITOR: Content length:', change.content.length);
      console.log('📥 MAIN EDITOR: Content preview:', change.content.substring(0, 100));

      const currentContent = editor.getHTML();
      console.log('📝 MAIN EDITOR: Current content length:', currentContent.length);
      console.log('📝 MAIN EDITOR: Current content preview:', currentContent.substring(0, 100));

      // Always apply remote changes (don't skip even if they seem the same)
      console.log('📝 MAIN EDITOR: Applying remote change...');

      // Set flag to prevent broadcasting this update
      isUpdatingFromRemoteRef.current = true;
      console.log('📝 MAIN EDITOR: Set remote update flag to TRUE');

      // Show syncing indicator
      setIsSyncing(true);

      // Preserve cursor position when updating from remote
      const { from, to } = editor.state.selection;
      console.log('📝 MAIN EDITOR: Current cursor position:', { from, to });

      // Temporarily disable the editor to prevent conflicts
      editor.setEditable(false);

      // Set content without triggering onUpdate
      console.log('📝 MAIN EDITOR: Setting content...');
      editor.commands.setContent(change.content, false);

      // Verify content was set
      const afterSetContent = editor.getHTML();
      console.log('📝 MAIN EDITOR: Content after setContent:', afterSetContent.substring(0, 100));
      console.log('📝 MAIN EDITOR: Content matches expected:', afterSetContent === change.content);

      // Trigger onChange to update parent component
      console.log('📝 MAIN EDITOR: Calling onChange with new content');
      onChange?.(change.content);

      // Re-enable the editor
      setTimeout(() => {
        editor.setEditable(!readOnly);

        // Try to restore cursor position
        try {
          const docSize = editor.state.doc.content.size;
          console.log('📝 MAIN EDITOR: Document size after update:', docSize);

          if (from <= docSize && to <= docSize) {
            editor.commands.setTextSelection({ from, to });
            console.log('📝 MAIN EDITOR: Cursor position restored');
          } else {
            // If position is invalid, place cursor at end
            editor.commands.focus('end');
            console.log('📝 MAIN EDITOR: Cursor placed at end');
          }
        } catch (e) {
          console.log('🔧 MAIN EDITOR: Could not restore cursor position, focusing at end');
          editor.commands.focus('end');
        }

        // Hide syncing indicator and reset flag
        setTimeout(() => {
          setIsSyncing(false);
          isUpdatingFromRemoteRef.current = false;
          setLastSyncTime(new Date().toLocaleTimeString());
          console.log('📝 MAIN EDITOR: ===== REMOTE UPDATE COMPLETE =====');
          console.log('📝 MAIN EDITOR: Final content:', editor.getHTML().substring(0, 100));
        }, 100);
      }, 50);
    });
  }, [editor, setOnRemoteContentChange, readOnly, onChange]);

  // Update editor content when prop changes (initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('📝 Updating editor content from props');
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Calculate cursor positions for collaborators
  const getCursorPosition = useCallback((position: number) => {
    if (!editor || !editorRef.current) return { top: 0, left: 0 };

    try {
      const resolved = editor.state.doc.resolve(position);
      const coords = editor.view.coordsAtPos(position);
      const editorRect = editorRef.current.getBoundingClientRect();
      
      return {
        top: coords.top - editorRect.top,
        left: coords.left - editorRect.left
      };
    } catch (e) {
      return { top: 0, left: 0 };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Show active collaborators */}
      <CollaboratorsList
        collaborators={collaborators}
        isConnected={isConnected}
        isSyncing={isSyncing}
        currentUser={currentUser}
      />

      {/* Toolbar - same as original RichTextEditor */}
      {!readOnly && (
        <div className="border-b bg-card flex-shrink-0">
          <div className="p-2 flex gap-1 items-center overflow-x-auto">
            {/* Basic Formatting Group */}
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-muted" : ""}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-muted" : ""}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? "bg-muted" : ""}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-muted" : ""}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-muted" : ""}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-muted" : ""}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            {/* Headings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content with Collaborator Cursors */}
      <div className="flex-1 min-h-0 overflow-hidden bg-card relative" ref={editorRef}>
        <div className="h-full overflow-y-auto">
          <EditorContent
            editor={editor}
            className="h-full focus:outline-none"
          />
          
          {/* Render collaborator cursors */}
          {collaborators.map((collaborator) => {
            if (typeof collaborator.cursor_position === 'number') {
              const position = getCursorPosition(collaborator.cursor_position);
              return (
                <CollaboratorCursor
                  key={collaborator.user_id}
                  collaborator={collaborator}
                  position={position}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Custom CSS for enhanced editor styling */}
      <style>{`
        .ProseMirror {
          padding: 2rem;
          min-height: 100%;
          outline: none;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 2rem 0 1rem 0;
          color: hsl(var(--foreground));
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          color: hsl(var(--foreground));
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }

        .ProseMirror ul, .ProseMirror ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .ProseMirror code {
          background-color: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        .ProseMirror pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }

        .ProseMirror table td, .ProseMirror table th {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }

        .ProseMirror table th {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }

        .ProseMirror .task-list {
          list-style: none;
          padding-left: 0;
        }

        .ProseMirror .task-item {
          display: flex;
          align-items: flex-start;
          margin: 0.25rem 0;
        }

        .ProseMirror .task-item input[type="checkbox"] {
          margin-right: 0.5rem;
          margin-top: 0.25rem;
        }

        .neon-highlight {
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
          background-size: 200% 200%;
          animation: neon-glow 3s ease-in-out infinite;
          padding: 0.1rem 0.2rem;
          border-radius: 0.25rem;
          color: white;
          font-weight: 500;
        }

        @keyframes neon-glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
