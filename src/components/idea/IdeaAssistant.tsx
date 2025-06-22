import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bot,
  User,
  Send,
  Trash2,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useIdeaConversations } from '@/hooks/use-idea-conversations';
import { Idea } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Enhanced typing animation component with realistic effects
const TypingAnimation = ({ text, onComplete, isWelcome = false }: { text: string; onComplete?: () => void; isWelcome?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Get dynamic typing speed based on character type and context
    const getTypingSpeed = (char: string, prevChar?: string, wordPosition?: number) => {
      // Welcome messages type faster overall
      const speedMultiplier = isWelcome ? 0.6 : 1;

      // Pauses after sentences
      if (['.', '!', '?'].includes(char)) return (isWelcome ? 80 : 150) * speedMultiplier;

      // Medium pause after commas and colons
      if ([',', ';', ':'].includes(char)) return (isWelcome ? 40 : 80) * speedMultiplier;

      // Quick for spaces within words
      if (char === ' ') return (isWelcome ? 15 : 25) * speedMultiplier;

      // Line breaks get a pause
      if (char === '\n') return (isWelcome ? 50 : 100) * speedMultiplier;

      // Bullet points get a slight pause
      if (char === '•' || (char === '*' && prevChar === ' ')) return (isWelcome ? 30 : 60) * speedMultiplier;

      // Faster typing within words (burst effect)
      if (wordPosition && wordPosition > 0) {
        return (Math.random() * 4 + (isWelcome ? 3 : 6)) * speedMultiplier; // 3-7ms for welcome, 6-10ms for regular
      }

      // Normal speed for word starts
      return (Math.random() * 8 + (isWelcome ? 6 : 12)) * speedMultiplier; // 6-14ms for welcome, 12-20ms for regular
    };

    // Track word position for burst typing effect
    const getWordPosition = (index: number) => {
      let wordStart = index;
      while (wordStart > 0 && text[wordStart - 1] !== ' ' && text[wordStart - 1] !== '\n') {
        wordStart--;
      }
      return index - wordStart;
    };

    if (currentIndex < text.length) {
      const currentChar = text[currentIndex];
      const prevChar = currentIndex > 0 ? text[currentIndex - 1] : undefined;
      const wordPosition = getWordPosition(currentIndex);

      const speed = getTypingSpeed(currentChar, prevChar, wordPosition);

      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentChar);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else {
      // Typing complete
      setIsTyping(false);
      // Small delay before calling onComplete for natural feel
      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 200);

      return () => clearTimeout(completeTimer);
    }
  }, [currentIndex, text, onComplete, isWelcome]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:mb-3 prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 prose-ul:mb-3 prose-ol:mb-3 prose-li:mb-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-sm text-foreground">
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="text-base font-bold mt-4 mb-2 text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold mt-3 mb-2 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-medium mt-3 mb-1 text-foreground">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-0 space-y-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-0 space-y-2 list-none">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-foreground leading-relaxed flex items-start gap-2 mb-2">
              <span className="text-primary mt-1 flex-shrink-0">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-3 my-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto my-3 text-xs">
              {children}
            </pre>
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>

      {/* Enhanced cursor with smooth animation - positioned immediately after text */}
      {isTyping && (
        <span className="inline-flex items-center animate-pulse">
          <span
            className="w-0.5 h-4 bg-primary rounded-full"
            style={{
              animation: 'cursor-blink 1.2s infinite ease-in-out',
              boxShadow: '0 0 4px rgba(var(--primary), 0.3)'
            }}
          />
        </span>
      )}

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes cursor-blink {
          0%, 45% {
            opacity: 1;
            transform: scaleY(1);
          }
          50%, 95% {
            opacity: 0.3;
            transform: scaleY(0.8);
          }
          100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        .typing-text {
          animation: fade-in 0.1s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0.7;
            transform: translateY(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

interface IdeaAssistantProps {
  idea: Idea;
}

export function IdeaAssistant({ idea }: IdeaAssistantProps) {
  const [message, setMessage] = useState('');
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [welcomeTypingMessage, setWelcomeTypingMessage] = useState<string | null>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    conversations,
    loading,
    sending,
    error,
    sendMessage,
    addTypedMessage,
    initializeConversation,
    clearConversation,
  } = useIdeaConversations(idea.id, idea);

  // Check if Nexi is currently active (thinking or typing)
  const isNexiActive = sending || !!typingMessage || !!welcomeTypingMessage;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isNexiActive) return;

    const messageToSend = message.trim();
    setMessage('');

    // Start typing animation
    await sendMessage(messageToSend, (response) => {
      setTypingMessage(response);
      setIsTypingComplete(false);
    });
  };

  const handleTypingComplete = async () => {
    if (typingMessage) {
      await addTypedMessage(typingMessage);
      setTypingMessage(null);
      setIsTypingComplete(true);
    }
  };

  const handleWelcomeTypingComplete = async () => {
    if (welcomeTypingMessage) {
      await addTypedMessage(welcomeTypingMessage);
      setWelcomeTypingMessage(null);
      setIsInitialized(true);
    }
  };

  // Reset initialization state when conversations are cleared
  useEffect(() => {
    if (conversations.length === 0) {
      setIsInitialized(false);
      setWelcomeTypingMessage(null);
    }
  }, [conversations.length]);

  // Initialize conversation with typing effect
  useEffect(() => {
    if (!loading && conversations.length === 0 && idea && !isInitialized && !welcomeTypingMessage) {
      initializeConversation((message) => {
        setWelcomeTypingMessage(message);
      });
    }
  }, [loading, conversations.length, idea, isInitialized, welcomeTypingMessage, initializeConversation]);

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
    // Scroll to bottom when conversations change or typing starts
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [conversations, typingMessage, welcomeTypingMessage]);

  // Smooth scroll during typing animation
  useEffect(() => {
    if (typingMessage || welcomeTypingMessage) {
      const interval = setInterval(() => {
        scrollToBottom();
      }, 100); // More frequent scrolling for smoother experience

      return () => clearInterval(interval);
    }
  }, [typingMessage, welcomeTypingMessage]);

  // Scroll when typing completes
  useEffect(() => {
    if (isTypingComplete) {
      scrollToBottom();
      setIsTypingComplete(false);
    }
  }, [isTypingComplete]);

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
    <div className="h-full flex flex-col bg-card rounded-lg border">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Nexi</h3>
          </div>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              disabled={isNexiActive}
              className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
              title={isNexiActive ? "Please wait for Nexi to finish responding" : "Clear conversation"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your AI product development assistant for "{idea.title}" Brainstorm with Nexi!!
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
          <div className="px-6 py-4 space-y-4">
              {/* Welcome typing message */}
              {welcomeTypingMessage && (
                <div className="flex gap-3 justify-start animate-in slide-in-from-left-2 duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted border border-primary/10 shadow-sm">
                    <TypingAnimation
                      text={welcomeTypingMessage}
                      onComplete={handleWelcomeTypingComplete}
                      isWelcome={true}
                    />
                  </div>
                </div>
              )}

              {conversations.length === 0 && !welcomeTypingMessage ? (
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
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      conv.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {conv.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:mb-3 prose-p:leading-relaxed prose-headings:mb-2 prose-headings:mt-4 prose-ul:mb-3 prose-ol:mb-3 prose-li:mb-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-3 leading-relaxed text-sm text-foreground">
                                {children}
                              </p>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-base font-bold mt-4 mb-2 text-foreground">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-sm font-semibold mt-3 mb-2 text-foreground">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-medium mt-3 mb-1 text-foreground">
                                {children}
                              </h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="mb-3 ml-0 space-y-2 list-none">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-3 ml-0 space-y-2 list-none">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm text-foreground leading-relaxed flex items-start gap-2 mb-2">
                                <span className="text-primary mt-1 flex-shrink-0">•</span>
                                <span className="flex-1">{children}</span>
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-foreground">
                                {children}
                              </em>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-primary pl-3 my-3 italic text-muted-foreground">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-3 rounded-md overflow-x-auto my-3 text-xs">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {conv.message}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{conv.message}</p>
                    )}
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

            {/* Typing animation for new AI response */}
            {typingMessage && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-left-2 duration-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted border border-primary/10 shadow-sm">
                  <TypingAnimation
                    text={typingMessage}
                    onComplete={handleTypingComplete}
                  />
                </div>
              </div>
            )}

            {/* Enhanced thinking indicator when generating response */}
            {sending && !typingMessage && (
              <div className="flex gap-3 justify-start animate-in slide-in-from-left-2 duration-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-3 border border-primary/5">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Nexi is thinking</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
        </ScrollArea>
      </div>

      <div className={`flex-shrink-0 border-t p-4 transition-opacity duration-200 ${isNexiActive ? 'opacity-75' : ''}`}>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isNexiActive
                ? "Please wait for Nexi to finish responding..."
                : "Ask about your idea..."
            }
            disabled={isNexiActive}
            className="flex-1 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={!message.trim() || isNexiActive}
            size="sm"
            title={isNexiActive ? "Please wait for Nexi to finish responding" : "Send message"}
            className="disabled:cursor-not-allowed"
          >
            {isNexiActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        {isNexiActive && (
          <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <span>Nexi is {sending ? 'thinking' : 'typing'}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
