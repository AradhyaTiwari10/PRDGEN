import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  MessageCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useIdeaConversations } from '@/hooks/use-idea-conversations';
import { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IdeaAssistantProps {
  idea: Idea;
}

export function IdeaAssistant({ idea }: IdeaAssistantProps) {
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    conversations,
    loading,
    sending,
    error,
    sendMessage,
    clearConversation,
  } = useIdeaConversations(idea.id, idea);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const messageToSend = message.trim();
    setMessage('');
    await sendMessage(messageToSend);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Scroll to bottom when conversations change
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [conversations]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading assistant...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && error.includes('Database table not found')) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-muted-foreground" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <div className="mb-4">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium text-foreground mb-2">Setup Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The AI Assistant database table needs to be created.
            </p>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-medium mb-1">To enable the AI Assistant:</p>
              <p>1. Go to your Supabase dashboard</p>
              <p>2. Run the SQL script from create_conversations_table.sql</p>
              <p>3. Refresh this page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Gemini
            </Badge>
          </CardTitle>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Get personalized advice and insights for "{idea.title}"
        </p>
      </CardHeader>

      <Separator className="flex-shrink-0" />

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4 min-h-full">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Start a conversation with your AI assistant
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex gap-3 ${
                    conv.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {conv.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      conv.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {conv.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {conv.message}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{conv.message}</p>
                    )}
                    <p className={`text-xs mt-1 ${
                      conv.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {conv.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>

        <Separator className="flex-shrink-0" />

        <div className="p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your idea..."
              disabled={sending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!message.trim() || sending}
              size="sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
