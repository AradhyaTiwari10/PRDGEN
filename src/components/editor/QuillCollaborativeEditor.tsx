import { useEffect, useCallback, useRef, useState } from "react";
import Quill from "quill";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import { useRealtimeCollaboration } from "@/hooks/use-realtime-collaboration";

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
  const [activeUsers, setActiveUsers] = useState<Array<{id: string, name: string, color: string}>>([]);
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
    // Only connect if WebSocket server is available
    let provider: any = null;
    try {
      provider = new WebsocketProvider(
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

      // Handle connection errors gracefully
      provider.on('connection-error', () => {
        console.warn('WebSocket collaboration server not available');
        setIsConnected(false);
      });
    } catch (error) {
      console.warn('Failed to initialize WebSocket provider:', error);
      setIsConnected(false);
    }

    // Configure Quill with advanced Magic Write-style toolbar
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      readOnly,
      modules: {
        toolbar: !readOnly ? [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': ['serif', 'monospace', 'arial', 'helvetica', 'times', 'courier', 'georgia', 'verdana'] }],
          [{ 'size': ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'align': ['', 'center', 'right', 'justify'] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video', 'formula'],
          [{ 'direction': 'rtl' }],
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
    const binding = new QuillBinding(ytext, quill, provider?.awareness);
    bindingRef.current = binding;

    // Get cursors module for manual cursor management
    const cursors = quill.getModule('cursors');

    // Generate unique colors for users
    const getUserColor = (userId: string) => {
      const colors = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#f97316', // Orange
        '#84cc16', // Lime
        '#ec4899', // Pink
        '#6366f1'  // Indigo
      ];
      const hash = userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return colors[Math.abs(hash) % colors.length];
    };

    // Update local user info in awareness
    if (currentUser && provider?.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: getUserColor(currentUser.id),
        id: currentUser.id
      });
    }

    // Handle awareness changes to show/hide cursors and track active users
    const updateCursors = () => {
      if (!provider?.awareness) return;
      const states = provider.awareness.getStates();
      const currentCursors = new Set();
      const users: Array<{id: string, name: string, color: string}> = [];

      states.forEach((state, clientId) => {
        if (clientId !== provider.awareness.clientID && state.user) {
          const user = state.user;
          const cursor = state.cursor;

          // Add user to active users list
          users.push({
            id: user.id,
            name: user.name,
            color: user.color
          });

          if (cursor && cursor.anchor !== undefined && cursor.head !== undefined) {
            currentCursors.add(clientId.toString());

            // Create or update cursor
            cursors.createCursor(
              clientId.toString(),
              user.name,
              user.color
            );

            // Move cursor to position
            cursors.moveCursor(clientId.toString(), {
              index: cursor.anchor,
              length: cursor.head - cursor.anchor
            });
          }
        }
      });

      // Update active users state
      setActiveUsers(users);

      // Remove cursors for users who left
      cursors.cursors().forEach((cursor: any) => {
        if (!currentCursors.has(cursor.id)) {
          cursors.removeCursor(cursor.id);
        }
      });
    };

    // Listen for awareness changes
    if (provider?.awareness) {
      provider.awareness.on('change', updateCursors);
    }

    // Update cursors when selection changes
    quill.on('selection-change', (range, oldRange, source) => {
      if (source === 'user' && range && provider?.awareness) {
        provider.awareness.setLocalStateField('cursor', {
          anchor: range.index,
          head: range.index + range.length
        });
      }
    });

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



    // Enhanced dropdown positioning for better accessibility
    const handleDropdownPositioning = () => {
      const pickers = editorRef.current?.querySelectorAll('.ql-picker.ql-expanded');
      pickers?.forEach((picker) => {
        const options = picker.querySelector('.ql-picker-options') as HTMLElement;
        const label = picker.querySelector('.ql-picker-label') as HTMLElement;
        if (options && label) {
          const rect = label.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const dropdownHeight = 300; // Estimated max dropdown height
          
          // Position dropdown
          options.style.position = 'fixed';
          options.style.zIndex = '9999999';
          options.style.minWidth = '160px';
          options.style.maxWidth = '200px';
          options.style.maxHeight = '250px';
          options.style.overflowY = 'auto';
          options.style.pointerEvents = 'auto';
          
          // Check if dropdown would go below viewport
          if (rect.bottom + dropdownHeight > viewportHeight) {
            // Position above the button
            options.style.top = `${rect.top - dropdownHeight}px`;
            options.style.bottom = 'auto';
          } else {
            // Position below the button
            options.style.top = `${rect.bottom + 4}px`;
            options.style.bottom = 'auto';
          }
          
          options.style.left = `${rect.left}px`;
          options.style.right = 'auto';
        }
      });
    };

    // Enhanced dropdown event handling
    const setupDropdownEvents = () => {
      if (!quill) return;
      
      const toolbar = quill.getModule('toolbar');
      if (toolbar && (toolbar as any).container) {
        const toolbarElement = (toolbar as any).container as HTMLElement;
        
        // Handle dropdown opening
        toolbarElement.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.ql-picker-label')) {
            setTimeout(handleDropdownPositioning, 50);
          }
        });
        
        // Handle dropdown state changes
        const observer = new MutationObserver(() => {
          setTimeout(handleDropdownPositioning, 10);
        });
        
        observer.observe(toolbarElement, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class']
        });
        
        // Store observer for cleanup
        (quill as any)._dropdownObserver = observer;
      }
    };

    setupDropdownEvents();

    // Cleanup function
    return () => {
      if (binding) binding.destroy();
      if (provider) provider.destroy();
      if (ydoc) ydoc.destroy();
    };
  }, [ideaId, readOnly]);

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Quill Editor Container with Notebook Background */}
      <div className="flex-1 min-h-0 overflow-hidden bg-card relative">
        <div
          ref={editorRef}
          className="h-full quill-container notebook-background"
          style={{
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            border: 'none',
            outline: 'none'
          }}
        />
      </div>

      {/* Enhanced Custom CSS for Quill editor styling with notebook background */}
      <style>{`
        /* Enhanced Notebook Grid Background with Larger Squares */
        .notebook-background {
          background-color: hsl(var(--card));
          background-image:
            linear-gradient(to right, hsl(var(--border)/0.2) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)/0.2) 1px, transparent 1px),
            radial-gradient(circle at 15px 15px, hsl(var(--primary)/0.03) 1px, transparent 1px);
          background-size: 30px 30px, 30px 30px, 30px 30px;
          background-position: 0 0, 0 0, 0 0;
          position: relative;
        }

        .notebook-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, hsl(var(--primary)/0.02) 50%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        .quill-container .ql-editor {
          padding: 3rem 2.5rem;
          min-height: calc(100% - 42px);
          font-size: 16px;
          line-height: 1.8;
          color: hsl(var(--foreground));
          background-color: transparent;
          position: relative;
          z-index: 1;
        }

        /* Magic Write Style Advanced Toolbar */
        .quill-container .ql-toolbar {
          border: none;
          background: hsl(var(--background));
          backdrop-filter: blur(10px);
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border-radius: 12px 12px 0 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .quill-container .ql-toolbar .ql-formats {
          margin-right: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 8px;
          border-right: none;
        }

        .quill-container .ql-toolbar .ql-formats:last-child {
          border-right: none;
        }

        .quill-container .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
          transition: stroke 0.2s ease;
        }

        .quill-container .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
          transition: fill 0.2s ease;
        }

        .quill-container .ql-toolbar button {
          border: none;
          border-radius: 6px;
          margin: 0 1px;
          padding: 8px 10px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          font-weight: 500;
          min-width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .quill-container .ql-toolbar button:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          transform: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          scale: 1;
        }

        .quill-container .ql-toolbar button.ql-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transform: none;
        }

        .quill-container .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary-foreground));
        }

        .quill-container .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary-foreground));
        }

        /* Enhanced Typography and Content Styling - Clean and Minimal */
        .quill-container .ql-editor h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 2rem 0 1.5rem 0;
          color: hsl(var(--foreground));
          position: relative;
        }

        .quill-container .ql-editor h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.8rem 0 1rem 0;
          color: hsl(var(--foreground));
        }

        .quill-container .ql-editor h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.8rem 0;
          color: hsl(var(--foreground));
        }

        .quill-container .ql-editor p {
          margin: 1rem 0;
          color: hsl(var(--foreground));
          text-align: justify;
        }

        .quill-container .ql-editor ul, .quill-container .ql-editor ol {
          margin: 1.2rem 0;
          padding-left: 2rem;
        }

        .quill-container .ql-editor li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .quill-container .ql-editor blockquote {
          border-left: 4px solid hsl(var(--primary));
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: hsl(var(--muted)/0.3);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          position: relative;
        }

        .quill-container .ql-editor blockquote::before {
          content: '"';
          font-size: 4rem;
          color: hsl(var(--primary)/0.3);
          position: absolute;
          top: -10px;
          left: 10px;
          font-family: serif;
        }

        .quill-container .ql-editor code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
          border: 1px solid hsl(var(--border));
        }

        .quill-container .ql-editor pre {
          background: hsl(var(--muted));
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid hsl(var(--border));
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Enhanced Cursor Styling */
        .ql-cursor-flag {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          position: absolute;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          animation: cursorPulse 2s infinite;
        }

        .ql-cursor-caret {
          background: hsl(var(--primary));
          width: 2px;
          animation: cursorBlink 1s infinite;
        }

        @keyframes cursorPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Enhanced Selection Styling */
        .quill-container .ql-editor ::selection {
          background: hsl(var(--primary)/0.2);
          color: hsl(var(--foreground));
        }

        /* Focus Enhancement */
        .quill-container .ql-editor:focus {
          outline: none;
        }

        .quill-container:focus-within {
          box-shadow: 0 0 0 2px hsl(var(--primary)/0.2);
          border-radius: 8px;
        }

        /* Magic Write Style Dropdown Menu - Fixed Z-Index Issues */
        .quill-container .ql-toolbar .ql-picker {
          border-radius: 6px;
          position: relative;
          z-index: 9999;
        }

        .quill-container .ql-toolbar .ql-picker-label {
          border: none;
          border-radius: 6px;
          padding: 8px 12px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          transition: all 0.2s ease;
          font-weight: 500;
          min-width: 60px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .quill-container .ql-toolbar .ql-picker-label:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .quill-container .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .quill-container .ql-toolbar .ql-picker-options {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 999999;
          margin-top: 4px;
          overflow: visible;
          max-height: none;
          overflow-y: visible;
          position: fixed;
          min-width: 160px;
          max-width: 200px;
        }

        .quill-container .ql-toolbar .ql-picker-item {
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          white-space: nowrap;
          pointer-events: auto;
          user-select: none;
          position: relative;
          z-index: 9999999;
        }

        .quill-container .ql-toolbar .ql-picker-item:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .quill-container .ql-toolbar .ql-picker-item.ql-selected {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        /* Ensure dropdown items are always clickable */
        .quill-container .ql-toolbar .ql-picker.ql-expanded .ql-picker-options,
        .quill-container .ql-toolbar .ql-picker.ql-expanded .ql-picker-item {
          pointer-events: auto !important;
          position: relative;
          z-index: 9999999 !important;
        }

        /* Specific styling for font and header dropdowns */
        .quill-container .ql-toolbar .ql-header .ql-picker-label {
          min-width: 80px;
        }

        .quill-container .ql-toolbar .ql-font .ql-picker-label {
          min-width: 100px;
        }

        .quill-container .ql-toolbar .ql-size .ql-picker-label {
          min-width: 60px;
        }

        /* Header dropdown items styling */
        .quill-container .ql-toolbar .ql-header .ql-picker-item[data-value="1"]::before {
          content: 'Heading 1';
          font-size: 18px;
          font-weight: bold;
        }

        .quill-container .ql-toolbar .ql-header .ql-picker-item[data-value="2"]::before {
          content: 'Heading 2';
          font-size: 16px;
          font-weight: bold;
        }

        .quill-container .ql-toolbar .ql-header .ql-picker-item[data-value="3"]::before {
          content: 'Heading 3';
          font-size: 14px;
          font-weight: bold;
        }

        .quill-container .ql-toolbar .ql-header .ql-picker-item:not([data-value])::before {
          content: 'Normal';
          font-size: 14px;
        }

        /* Font dropdown styling */
        .quill-container .ql-toolbar .ql-font .ql-picker-item[data-value="serif"]::before {
          content: 'Serif';
          font-family: serif;
        }

        .quill-container .ql-toolbar .ql-font .ql-picker-item[data-value="monospace"]::before {
          content: 'Monospace';
          font-family: monospace;
        }

        .quill-container .ql-toolbar .ql-font .ql-picker-item:not([data-value])::before {
          content: 'Sans Serif';
          font-family: sans-serif;
        }

        /* Enhanced Scrollbar */
        .quill-container .ql-editor::-webkit-scrollbar {
          width: 8px;
        }

        .quill-container .ql-editor::-webkit-scrollbar-track {
          background: hsl(var(--muted)/0.3);
          border-radius: 4px;
        }

        .quill-container .ql-editor::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground)/0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .quill-container .ql-editor::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground)/0.5);
        }

        /* Floating Effect for Editor - No borders */
        .quill-container {
          box-shadow:
            0 1px 3px rgba(0,0,0,0.1),
            0 1px 2px rgba(0,0,0,0.06);
          border-radius: 12px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
          border: none !important;
        }

        .quill-container:hover {
          box-shadow:
            0 4px 6px rgba(0,0,0,0.1),
            0 2px 4px rgba(0,0,0,0.06);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .quill-container .ql-editor {
            padding: 1.5rem 1rem;
            font-size: 14px;
          }

          .notebook-background {
            background-size: 25px 25px, 25px 25px, 25px 25px;
          }

          .quill-container .ql-toolbar {
            padding: 8px 12px;
          }

          .quill-container .ql-toolbar .ql-formats {
            margin-right: 12px;
          }
        }

        /* Print Styles */
        @media print {
          .notebook-background {
            background: white !important;
          }

          .quill-container .ql-toolbar {
            display: none !important;
          }
        }

        .quill-container .ql-container {
          border: none !important;
          font-family: inherit;
        }

        /* Remove all borders from Quill elements */
        .quill-container .ql-toolbar,
        .quill-container .ql-container,
        .quill-container .ql-editor {
          border: none !important;
        }

        /* Override any default Quill borders - Complete removal */
        .ql-snow .ql-toolbar {
          border: none !important;
          border-bottom: none !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
        }

        .ql-snow .ql-container {
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
          border-left: none !important;
          border-right: none !important;
        }

        /* Force remove all borders from any Quill elements */
        .ql-snow,
        .ql-snow *,
        .quill-container,
        .quill-container * {
          border: none !important;
          outline: none !important;
        }

        /* Specifically target the editor div */
        .quill-container .ql-editor {
          border: none !important;
          outline: none !important;
        }

        /* Fix dropdown z-index and positioning issues - Ensure dropdowns are always on top */
        .quill-container .ql-toolbar .ql-picker {
          position: relative;
          z-index: 99999;
        }

        .quill-container .ql-toolbar .ql-picker-options {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 999999;
          min-width: 140px;
        }

        /* Ensure dropdown is above all other content */
        .quill-container .ql-toolbar .ql-picker.ql-expanded {
          z-index: 999999;
        }

        /* Force dropdown to appear above resizable panels and other components */
        .quill-container .ql-toolbar .ql-picker.ql-expanded .ql-picker-options {
          position: fixed;
          z-index: 9999999;
        }

        /* Ensure dropdowns are clickable */
        .quill-container .ql-toolbar .ql-picker-label,
        .quill-container .ql-toolbar .ql-picker-item {
          pointer-events: auto;
          user-select: none;
        }

        /* Clean button styling without ripple effects */

        /* Smooth transitions for all interactive elements */
        .quill-container .ql-toolbar * {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom toolbar icons and text styling */
        .quill-container .ql-toolbar .ql-bold {
          font-weight: bold;
        }

        .quill-container .ql-toolbar .ql-italic {
          font-style: italic;
        }

        .quill-container .ql-toolbar .ql-underline {
          text-decoration: underline;
        }

        /* Remove toolbar separator styling - no visual lines */
        .quill-container .ql-toolbar .ql-formats::after {
          display: none;
        }

        .quill-container .ql-toolbar .ql-formats:last-child::after {
          display: none;
        }

        /* Enhanced toolbar layout */
        .quill-container .ql-toolbar {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
