import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
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
}

export function RichTextEditor({
  content = "",
  onChange,
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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse w-full",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
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
      <div className="border-b p-2 flex gap-2 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
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
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <TableIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              }}
            >
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
      <div className="flex-1 overflow-auto bg-card border-x rounded-md shadow-sm">
        <EditorContent
          editor={editor}
          className="prose max-w-none p-8 h-full focus:outline-none"
        />
      </div>
    </div>
  );
}
