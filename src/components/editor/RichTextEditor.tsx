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
import { useEffect } from "react";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export function RichTextEditor({
  content = "",
  onChange,
  readOnly = false,
}: RichTextEditorProps) {
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
      if (!readOnly) {
        onChange?.(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${readOnly ? 'cursor-default' : ''}`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addColumnBefore = () => editor.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor.chain().focus().addRowAfter().run();
  const deleteRow = () => editor.chain().focus().deleteRow().run();
  const deleteTable = () => editor.chain().focus().deleteTable().run();

  return (
    <div className="h-full flex flex-col">
      {/* Compact Toolbar with Better Layout - Hidden in read-only mode */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run()}
            className={editor.isActive("highlight") ? "bg-muted" : ""}
            title="Neon Yellow Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-muted" : ""}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-muted" : ""}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Alignment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? "bg-muted" : ""}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? "bg-muted" : ""}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? "bg-muted" : ""}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive("taskList") ? "bg-muted" : ""}
            title="Task List (Checkboxes)"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Table Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Table">
                <TableIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
                }}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
            {editor.isActive("table") && (
              <>
                <DropdownMenuItem onClick={addColumnBefore}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column Before
                </DropdownMenuItem>
                <DropdownMenuItem onClick={addColumnAfter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column After
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteColumn}>
                  <Minus className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={addRowBefore}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row Before
                </DropdownMenuItem>
                <DropdownMenuItem onClick={addRowAfter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row After
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteRow}>
                  <Minus className="h-4 w-4 mr-2" />
                  Delete Row
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteTable}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Table
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
          </div>
        </div>
      </div>
      )}

      {/* Read-only indicator */}
      {readOnly && (
        <div className="bg-muted/50 border-b px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Read-only mode - You have view-only access to this idea
        </div>
      )}

      {/* Enhanced Editor Content with Custom Styling */}
      <div className="flex-1 min-h-0 overflow-hidden bg-card">
        <div className="h-full overflow-y-auto">
          <EditorContent
            editor={editor}
            className="h-full focus:outline-none"
          />
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
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.875em;
        }

        .ProseMirror pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror pre code {
          background: none;
          padding: 0;
        }

        .ProseMirror mark,
        .ProseMirror .neon-highlight {
          background: #ffff00 !important; /* Neon yellow background */
          color: #000000 !important; /* Black text for better contrast */
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-weight: 600; /* Slightly bolder for better readability */
          box-shadow: 0 0 6px rgba(255, 255, 0, 0.4); /* Enhanced glow */
          border: 1px solid rgba(255, 255, 0, 0.8); /* Subtle border */
        }

        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border: 1px solid hsl(var(--border));
        }

        .ProseMirror th, .ProseMirror td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }

        .ProseMirror th {
          background: hsl(var(--muted));
          font-weight: 600;
        }

        /* Task List Styling - Enhanced Checkboxes */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }

        .ProseMirror li[data-type="taskItem"] {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror li[data-type="taskItem"] > label {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .ProseMirror li[data-type="taskItem"] > div {
          flex: 1;
        }

        .ProseMirror li[data-type="taskItem"][data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .ProseMirror li[data-type="taskItem"] input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: hsl(var(--primary));
          cursor: pointer;
          border-radius: 0.25rem;
        }

        /* Text alignment */
        .ProseMirror [data-text-align="left"] {
          text-align: left;
        }

        .ProseMirror [data-text-align="center"] {
          text-align: center;
        }

        .ProseMirror [data-text-align="right"] {
          text-align: right;
        }

        /* Focus styles */
        .ProseMirror:focus {
          outline: none;
        }

        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Start writing your idea...";
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }

        /* Custom Scrollbar Styling - Inherits from global styles */
        .h-full.overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .h-full.overflow-y-auto::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.1);
          border-radius: 4px;
        }

        .h-full.overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .h-full.overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }

        .h-full.overflow-y-auto::-webkit-scrollbar-thumb:active {
          background: hsl(var(--muted-foreground) / 0.7);
        }

        /* Firefox scrollbar */
        .h-full.overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.3) hsl(var(--muted) / 0.1);
        }

        /* Hide scrollbar on mobile */
        @media (max-width: 768px) {
          .h-full.overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
          .h-full.overflow-y-auto {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
    </div>
  );
}
