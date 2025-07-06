import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  Lightbulb,
  Loader2,
  Brain,
  BarChart3,
  Filter,
  Database,
  RefreshCw,
  Search,
  Target,
  Code,
  Eye
} from 'lucide-react';
import { useSimilaritySearch, SimilarIdea } from '@/hooks/use-similarity-search';
import { Idea } from '@/types';

interface SimilaritySearchProps {
  currentIdea: Idea;
}

// Debug state interface
interface DebugInfo {
  cleanTitle: string;
  finalQuery: string;
  searchComponents: string[];
  coreProblem: string;
}

export function SimilaritySearch({ currentIdea }: SimilaritySearchProps) {
  const { 
    searchSimilarIdeas, 
    isSearching, 
    results, 
    error, 
    clearResults, 
    loadSavedResults,
    savedResults 
  } = useSimilaritySearch();

  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Load saved results when component mounts
  useEffect(() => {
    if (currentIdea.id && !hasLoadedSaved) {
      loadSavedResults(currentIdea.id);
      setHasLoadedSaved(true);
    }
  }, [currentIdea.id, loadSavedResults, hasLoadedSaved]);

  const extractCoreProblem = (title: string, description: string) => {
    // Focus on the main value proposition and problem being solved
    const text = `${title} ${description}`.toLowerCase();
    
    // Remove all generic platform/tech terms that create noise
    const cleanText = text
      .replace(/\b(platform|app|tool|system|solution|service|website|saas|software|technology|ai|ml|smart|intelligent|advanced|api|dashboard|interface|ui|ux|mobile|web|digital|online|cloud|database|server|analytics|integration|automation|optimization|framework|library|plugin|extension|widget|component|module|microservice|backend|frontend|fullstack|responsive|scalable|secure|reliable|efficient|user-friendly|intuitive|modern|cutting-edge|state-of-the-art|innovative|revolutionary|disruptive|next-generation|enterprise|professional|premium|pro|plus|beta|alpha|version|update|upgrade|feature|function|capability|ability|performance|quality|experience|interface|design|layout|theme|style|customization|personalization|configuration|setup|installation|deployment|launch|release|publish|subscribe|membership|account|profile|user|users|customer|customers|client|clients|business|businesses|company|companies|organization|organizations|team|teams|individual|individuals|people|person|everyone|anyone|somebody|someone)\b/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract core problem indicators - what pain point does this solve?
    const problemPatterns = [
      // Direct problem statements
      /(?:solves?|addresses?|fixes?|eliminates?|reduces?|prevents?|avoids?|overcomes?|tackles?)\s+([^.!?]*)/gi,
      // Pain point descriptions
      /(?:struggle|difficulty|challenge|problem|issue|pain|frustration|inefficiency|bottleneck|limitation|constraint|obstacle|barrier|hurdle|gap)\s+(?:with|in|of|around|regarding)\s+([^.!?]*)/gi,
      // Need/want statements
      /(?:need|want|require|demand|seek|looking for|searching for)\s+(?:to|a|an)?\s*([^.!?]*)/gi,
      // Improvement statements
      /(?:improve|enhance|optimize|streamline|simplify|automate|better|easier|faster|cheaper|more efficient)\s+([^.!?]*)/gi,
      // Lack/missing statements
      /(?:lack|missing|without|no|don't have|doesn't exist|isn't available)\s+([^.!?]*)/gi
    ];
    
    let problemConcepts = [];
    
    for (const pattern of problemPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          problemConcepts.push(match[1].trim());
        }
      }
    }
    
    // If no direct problem statements found, extract domain-specific terms
    if (problemConcepts.length === 0) {
      // Focus on the core domain/industry terms that matter
      const domainTerms = [
        // Core business domains
        'music', 'streaming', 'audio', 'songs', 'tracks', 'albums', 'playlists', 'radio',
        'calendar', 'scheduling', 'appointments', 'events', 'meetings', 'booking',
        'fitness', 'health', 'exercise', 'workout', 'training', 'nutrition', 'wellness',
        'education', 'learning', 'teaching', 'courses', 'lessons', 'training', 'certification',
        'finance', 'banking', 'payments', 'money', 'transactions', 'investing', 'budgeting',
        'travel', 'booking', 'hotels', 'flights', 'trips', 'vacation', 'destinations',
        'shopping', 'ecommerce', 'retail', 'products', 'marketplace', 'buying', 'selling',
        'social', 'networking', 'communication', 'messaging', 'chat', 'community', 'sharing',
        'productivity', 'tasks', 'projects', 'workflow', 'collaboration', 'management',
        'content', 'media', 'video', 'photos', 'documents', 'files', 'storage',
        'delivery', 'logistics', 'transportation', 'shipping', 'tracking',
        'review', 'rating', 'feedback', 'recommendations', 'discovery',
        'job', 'career', 'hiring', 'recruitment', 'freelance', 'gig', 'remote',
        'food', 'restaurant', 'dining', 'recipes', 'cooking', 'nutrition',
        'real estate', 'property', 'housing', 'rental', 'buying', 'selling',
        'gaming', 'entertainment', 'fun', 'leisure', 'hobbies',
        'news', 'information', 'updates', 'notifications', 'alerts'
      ];
      
      const foundDomains = domainTerms.filter(term => 
        text.includes(term) && 
        !text.includes(`${term} platform`) && 
        !text.includes(`${term} app`) &&
        !text.includes(`${term} tool`)
      );
      
      problemConcepts = foundDomains.slice(0, 3);
    }
    
    // Extract the most meaningful terms (not generic platform terms)
    const meaningfulTerms = cleanText
      .split(' ')
      .filter(word => 
        word.length > 3 && 
        !['that', 'this', 'with', 'from', 'they', 'them', 'their', 'have', 'will', 'can', 'are', 'and', 'for', 'the', 'you', 'your', 'all', 'any', 'our', 'use', 'get', 'new', 'more', 'like', 'work', 'make', 'take', 'give', 'help', 'find', 'see', 'know', 'way', 'time', 'day', 'life', 'home', 'world'].includes(word)
      )
      .slice(0, 5);
    
    return [...problemConcepts, ...meaningfulTerms]
      .filter(Boolean)
      .slice(0, 5)
      .join(' ')
      .trim();
  };

  const handleSearchCurrentIdea = async () => {
    const title = currentIdea.title || '';
    const description = currentIdea.description || '';
    const category = currentIdea.category || '';
    
    let finalQuery = '';
    let debugData: any = {};
    
    // Core Problem Mode - Focus on the main problem/value proposition
    const coreProblem = extractCoreProblem(title, description);
    
    // Build focused query
    const queryComponents = [
      coreProblem,
      category.toLowerCase()
    ].filter(Boolean);
    
    finalQuery = queryComponents.join(' ').trim();
    
    // Fallback if empty
    if (!finalQuery || finalQuery.length < 3) {
      finalQuery = title.toLowerCase()
        .replace(/\b(platform|app|tool|system|solution|service|website)\b/gi, '')
        .trim() || 'startup idea';
    }
    
    debugData = {
      cleanTitle: title,
      finalQuery,
      searchComponents: queryComponents,
      coreProblem
    };
    
    // Store debug information
    setDebugInfo(debugData);
    
    console.log('🔍 Search query:', finalQuery);
    console.log('🎯 Search mode:', 'core-problem');
    console.log('📊 Debug data:', debugData);
    
    await searchSimilarIdeas(
      finalQuery, 
      currentIdea.id,
      25, // Increased to 25 results for better variety
      0.3 // Lowered to 30% for more matches while maintaining quality
    );
  };

  const handleRefreshSearch = async () => {
    clearResults();
    setHasLoadedSaved(false);
    await handleSearchCurrentIdea();
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800';
    if (similarity >= 0.6) return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/30 dark:border-green-800';
    if (similarity >= 0.5) return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/30 dark:border-blue-800';
    if (similarity >= 0.4) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800';
    return 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/30 dark:border-orange-800';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.7) return 'Excellent Match';
    if (similarity >= 0.6) return 'Very Similar';
    if (similarity >= 0.5) return 'Similar';
    if (similarity >= 0.4) return 'Related';
    return 'Somewhat Related';
  };

  const formatUpvotes = (upvotes: number) => {
    if (upvotes >= 1000) return `${(upvotes / 1000).toFixed(1)}k`;
    return upvotes.toString();
  };

  const extractWebsiteUrl = (websites: string) => {
    if (!websites) return null;
    
    // Handle stringified array format like "['https://example.com']"
    if (websites.includes('[') && websites.includes(']')) {
      const match = websites.match(/\['([^']+)'\]/);
      if (match) {
        return match[1];
      }
    }
    
    // Handle comma-separated format
    const firstUrl = websites.split(',')[0];
    return firstUrl.replace(/[\[\]'",]/g, '').trim();
  };

  // Add dynamic color helpers
  const getMatchBadgeColor = (similarity: number) => {
    if (similarity >= 0.8) return 'bg-[#22C55E] text-white'; // green
    if (similarity >= 0.7) return 'bg-[#06B6D4] text-white'; // teal
    if (similarity >= 0.6) return 'bg-[#3B82F6] text-white'; // blue
    return 'bg-[#F59E42] text-white'; // orange
  };
  const getDescriptionColor = () => 'text-[#A1A1AA]';
  const getUpvoteColor = () => 'text-[#4ADE80]';
  const getCategoryBadgeColor = () => 'bg-[#334155] text-white';

  const getMatchNumberColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-[#22C55E]'; // green
    if (similarity >= 0.7) return 'text-[#06B6D4]'; // teal
    if (similarity >= 0.6) return 'text-[#3B82F6]'; // blue
    return 'text-[#F59E42]'; // orange
  };

  return (
    <div className="w-full space-y-4">
      <Card className="bg-[#232e2b] border border-[#5A827E]/40 text-white">
        <CardHeader className="pb-3 bg-[#232e2b] border-b border-[#5A827E]/40">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Sparkles className="h-5 w-5 text-[#5A827E]" />
            Find Similar Startup Ideas
          </CardTitle>

        </CardHeader>
        
        <CardContent className="space-y-4 pb-6 pt-6">
          {/* Search Configuration */}
          <div className="space-y-3">
            {/* Current Idea Display */}
            <div className="p-3 bg-[#1C1C1C] rounded-lg border border-[#5A827E]/40 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-[#5A827E]" />
                <p className="text-sm font-medium text-white">Searching for ideas similar to:</p>
              </div>
              <p className="font-medium text-white mb-1">{currentIdea.title}</p>
              <p className="text-sm text-white/80 line-clamp-2">
                {currentIdea.description}
              </p>
              {currentIdea.category && (
                <Badge variant="secondary" className="mt-2 text-xs bg-[#232e2b] text-white border border-[#5A827E]/40">
                  {currentIdea.category}
                </Badge>
              )}
            </div>

            {/* Search Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSearchCurrentIdea}
                disabled={isSearching}
                className="w-full bg-[#1C1C1C] text-white border border-[#5A827E]/40 hover:bg-[#232e2b]"
                size="default"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#5A827E] mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2 text-[#5A827E]" />
                    Find Similar Ideas
                  </>
                )}
              </Button>
              
              {(results || savedResults) && (
                <Button
                  onClick={handleRefreshSearch}
                  disabled={isSearching}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-[#232e2b] text-white border border-[#5A827E]/40 hover:bg-[#1C1C1C]"
                >
                  <RefreshCw className="h-3 w-3 mr-2 text-[#5A827E]" />
                  Refresh Search
                </Button>
              )}

              {/* Debug Toggle */}
              {debugInfo && (
                <Button
                  onClick={() => setShowDebug(!showDebug)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-[#232e2b] text-white border border-[#5A827E]/40 hover:bg-[#1C1C1C]"
                >
                  <Eye className="h-3 w-3 mr-2 text-[#5A827E]" />
                  {showDebug ? 'Hide' : 'Show'} AI Interpretation
                </Button>
              )}
            </div>
          </div>

          {/* AI Interpretation Debug Section */}
          {debugInfo && showDebug && (
            <div className="space-y-3">
              <Separator />
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4 text-blue-600" />
                    AI Interpretation & Search Query
                  </CardTitle>
                  <CardDescription className="text-xs">
                    What the AI extracted from your idea and how it's searching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Search Mode Indicator */}
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      🔧 Search Mode:
                    </p>
                    <Badge 
                      variant="default" 
                      className="text-xs"
                    >
                      Core Problem Focus
                    </Badge>
                  </div>

                  {/* Core Problem (if in core-problem mode) */}
                  {debugInfo.coreProblem && (
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                        🎯 Core Problem Extracted:
                      </p>
                      <p className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-2 rounded font-mono text-orange-800 dark:text-orange-200">
                        "{debugInfo.coreProblem}"
                      </p>
                    </div>
                  )}

                  {/* Cleaned Title */}
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      📝 Cleaned Title (removed generic terms):
                    </p>
                    <p className="bg-white dark:bg-gray-800 p-2 rounded border font-mono">
                      "{debugInfo.cleanTitle || 'No specific terms found'}"
                    </p>
                  </div>

                  {/* Search Components */}
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      🔧 Search Components (in priority order):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 bg-white dark:bg-gray-800 p-2 rounded border">
                      {debugInfo.searchComponents.map((component, i) => (
                        <li key={i} className="font-mono text-xs">
                          {component || '<empty>'}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Final Query */}
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                      🔍 Final Search Query Used:
                    </p>
                    <p className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded font-mono text-green-800 dark:text-green-200 font-medium">
                      "{debugInfo.finalQuery}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-3">
              <Separator />
              
              {/* Fallback Warning */}
              {results.fallback && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Database className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Local Database Search
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Using fallback search mode. Results may be limited.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Summary */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {results.ideas.length} similar ideas found
                  </span>
                  {savedResults && (
                    <Badge variant="outline" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>  
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{results.searchTime}ms</span>
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {results.ideas.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No similar ideas found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your idea might be quite unique! Try a different search approach.
                      </p>
                    </div>
                  </div>
                ) : (
                  results.ideas.map((idea: SimilarIdea, index: number) => (
                    <Card key={idea.id} className="hover:shadow-lg transition-all border-l-4 border-l-transparent hover:border-l-[#5A827E] bg-[#1C1C1C] border border-[#5A827E]/40 text-white">
                      <CardContent className="p-4">
                        {/* Header with improved spacing */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs font-mono px-2 py-1 bg-[#232e2b] text-white border border-[#5A827E]/40">
                              #{idea.rank}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-[#232e2b] text-white border border-[#5A827E]/40 flex items-center gap-1">
                              {getSimilarityLabel(idea.similarity)}
                              <span className={getMatchNumberColor(idea.similarity)}>
                                {idea.similarityPercentage}
                              </span>
                            </Badge>
                          </div>
                          
                          {idea.websites && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 text-xs bg-[#232e2b] text-white border border-[#5A827E]/40 hover:bg-[#1C1C1C]"
                              onClick={() => {
                                const url = extractWebsiteUrl(idea.websites);
                                if (url) {
                                  window.open(url, '_blank');
                                }
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-1 text-[#5A827E]" />
                              Visit
                            </Button>
                          )}
                        </div>

                        {/* Product Info with better typography */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base leading-tight text-white">
                            {idea.name}
                          </h4>
                          
                          <p className={`text-sm leading-relaxed ${getDescriptionColor()}`}> 
                            {idea.description}
                          </p>

                          {/* Enhanced Metrics */}
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-[#5A827E]" />
                              <span className={`text-sm font-semibold ${getUpvoteColor()}`}> 
                                {formatUpvotes(idea.upvotes || 0)}
                              </span>
                              <span className="text-xs text-white/70">upvotes</span>
                            </div>
                            
                            {idea.category_tags && (
                              <Badge variant="secondary" className={`text-xs ${getCategoryBadgeColor()} border border-[#5A827E]/40`}>
                                {idea.category_tags.split(',')[0].replace(/['"\[\]]/g, '')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Clear Results */}
              {results.ideas.length > 0 && (
                <div className="pt-2">
                  <Button variant="outline" onClick={clearResults} size="sm" className="w-full">
                    Clear Results
                  </Button>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
} 