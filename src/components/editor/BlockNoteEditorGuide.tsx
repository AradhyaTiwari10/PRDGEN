import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Sparkles, Users, Zap, FileText, Code, Table, Quote, List, Hash } from "lucide-react";

export function BlockNoteEditorGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      icon: <Zap className="h-4 w-4" />,
      title: "Type '/' for commands",
      description: "Get a menu of block types, headings, lists, and more",
      color: "bg-blue-500"
    },
    {
      icon: <Hash className="h-4 w-4" />,
      title: "Headings",
      description: "Type '# ' for H1, '## ' for H2, etc.",
      color: "bg-purple-500"
    },
    {
      icon: <List className="h-4 w-4" />,
      title: "Lists",
      description: "Type '- ' for bullets, '1. ' for numbered lists",
      color: "bg-green-500"
    },
    {
      icon: <Quote className="h-4 w-4" />,
      title: "Blockquotes",
      description: "Type '> ' to create beautiful quotes",
      color: "bg-orange-500"
    },
    {
      icon: <Code className="h-4 w-4" />,
      title: "Code blocks",
      description: "Type '```' for syntax-highlighted code",
      color: "bg-gray-500"
    },
    {
      icon: <Table className="h-4 w-4" />,
      title: "Tables",
      description: "Create and edit tables with intuitive controls",
      color: "bg-cyan-500"
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "Real-time collaboration",
      description: "See live cursors and edits from team members",
      color: "bg-pink-500"
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: "Rich formatting",
      description: "Bold, italic, underline, links, and more",
      color: "bg-yellow-500"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Editor Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#1C1C1C]/90 border border-[#5A827E]/30 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FAFFCA]">
            <FileText className="h-5 w-5 text-[#5A827E]" />
            BlockNote Editor Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center p-4 bg-gradient-to-br from-[#5A827E]/20 to-[#B9D4AA]/10 border border-[#5A827E]/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#B9D4AA]" />
              <span className="font-semibold text-[#B9D4AA]">Notion-style Editor</span>
            </div>
            <p className="text-sm text-[#FAFFCA]/80">
              Experience the power of blocks with real-time collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-[#5A827E]/10 rounded-lg hover:bg-[#B9D4AA]/10 transition-colors border border-[#5A827E]/20"
              >
                <div className={`p-2 rounded-md ${feature.color} text-white flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#FAFFCA] mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-[#B9D4AA]/80">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>



          <div className="bg-gradient-to-r from-[#5A827E]/10 to-[#B9D4AA]/10 border border-[#5A827E]/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-[#5A827E]">Pro Tip</h4>
            <p className="text-sm text-[#B9D4AA]/80">
              Start typing anywhere and use the '/' command to quickly insert any block type. 
              The editor automatically saves your changes and syncs with your collaborators in real-time!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 