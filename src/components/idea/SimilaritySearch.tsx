import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  Lightbulb,
  Target,
  Zap,
  Loader2,
  Brain,
  Database,
  ArrowRight,
  Star,
  Users,
  BarChart3
} from 'lucide-react';
import { useSimilaritySearch, SimilarIdea } from '@/hooks/use-similarity-search';
import { Idea } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SimilaritySearchProps {
  currentIdea: Idea;
}

export function SimilaritySearch({ currentIdea }: SimilaritySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [useCurrentIdea, setUseCurrentIdea] = useState(true);
  const { searchSimilarIdeas, isSearching, results, error, clearResults } = useSimilaritySearch();
  const [searchLimit, setSearchLimit] = useState("10");
  const [minSimilarity, setMinSimilarity] = useState("0.1");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    await searchSimilarIdeas(
      searchQuery, 
      parseInt(searchLimit),
      parseFloat(minSimilarity)
    );
  };

  const handleSearchCurrentIdea = async () => {
    const query = `${currentIdea.title} ${currentIdea.description}`;
    await searchSimilarIdeas(
      query, 
      parseInt(searchLimit),
      parseFloat(minSimilarity)
    );
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (similarity >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (similarity >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (similarity >= 0.2) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return 'Excellent';
    if (similarity >= 0.6) return 'Very Similar';
    if (similarity >= 0.4) return 'Similar';
    if (similarity >= 0.2) return 'Related';
    return 'Different';
  };

  const formatUpvotes = (upvotes: number) => {
    if (upvotes >= 1000) return `${(upvotes / 1000).toFixed(1)}k`;
    return upvotes.toString();
  };

  const extractWebsiteUrl = (websites: string) => {
    if (!websites) return null;
    
    // Handle stringified array format like "['https://example.com']"
    if (websites.includes('[') && websites.includes(']')) {
      // Extract content between brackets
      const match = websites.match(/\['([^']+)'\]/);
      if (match) {
        return match[1]; // Return the URL without brackets and quotes
      }
    }
    
    // Handle comma-separated format
    const firstUrl = websites.split(',')[0];
    
    // Remove brackets and quotes if present
    return firstUrl.replace(/[\[\]'",]/g, '').trim();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Find Similar Startup Ideas
        </CardTitle>
        <CardDescription>
          Search through 120,000+ Product Hunt ideas using AI-powered analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-[540px] overflow-y-auto pr-2">
        {/* Search Configuration */}
        <div className="space-y-4">
          {/* Current Idea Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-current-idea"
              checked={useCurrentIdea}
              onChange={(e) => setUseCurrentIdea(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="use-current-idea" className="text-sm font-medium">
              Use current idea for search
            </Label>
          </div>

          {!useCurrentIdea ? (
            <div className="space-y-2">
              <Label htmlFor="search-query">Custom Search Query</Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  placeholder="Enter your startup idea to find similar ones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  size="sm"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Will search for ideas similar to:</p>
              <p className="font-medium">{currentIdea.title}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {currentIdea.description}
              </p>
            </div>
          )}

          {/* Search Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Results Limit</Label>
              <Select value={searchLimit} onValueChange={setSearchLimit}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Min Similarity</Label>
              <Select value={minSimilarity} onValueChange={setMinSimilarity}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">10% (Most results)</SelectItem>
                  <SelectItem value="0.3">30% (Many results)</SelectItem>
                  <SelectItem value="0.5">50% (Some results)</SelectItem>
                  <SelectItem value="0.7">70% (Similar)</SelectItem>
                  <SelectItem value="0.9">90% (Nearly identical)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Action</Label>
              <Button
                onClick={handleSearchCurrentIdea}
                disabled={isSearching}
                className="w-full h-9"
                size="sm"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Search This Idea
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            <Separator />
            
            {/* Fallback Warning */}
            {results.fallback && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Brain className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Fallback Mode Active
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Using basic search on local database. Configure environment variables for full AI search.
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
                  Found {results.ideas.length} similar ideas
                </span>
                {results.fallback && (
                  <Badge variant="outline" className="text-xs">
                    Local DB
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
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No similar ideas found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search parameters</p>
                </div>
              ) : (
                results.ideas.map((idea: SimilarIdea, index: number) => (
                                     <Card key={idea.id} className="hover:shadow-sm transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500">
                     <CardContent className="p-3">
                                              {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              #{idea.rank}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSimilarityColor(idea.similarity)}`}
                            >
                              {getSimilarityLabel(idea.similarity)} {idea.similarityPercentage}
                            </Badge>
                          </div>
                        </div>
                        
                        {idea.websites && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              const url = extractWebsiteUrl(idea.websites);
                              if (url) {
                                window.open(url, '_blank');
                              }
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </Button>
                        )}
                      </div>

                                             {/* Product Info */}
                       <div className="space-y-1.5">
                        <h4 className="font-semibold text-base leading-tight">
                          {idea.name}
                        </h4>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {idea.description}
                        </p>

                                                 {/* Metrics */}
                         <div className="flex items-center gap-4 pt-1.5">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {formatUpvotes(idea.upvotes || 0)}
                            </span>
                            <span className="text-xs text-muted-foreground">upvotes</span>
                          </div>
                          
                          {idea.category_tags && (
                            <Badge variant="secondary" className="text-xs">
                              {idea.category_tags.split(',')[0].replace(/['"[\]]/g, '')}
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

                 {/* Tips Section */}
         <div className="p-3 bg-muted/50 rounded-lg border">
           <div className="flex items-start gap-2">
             <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
             <div>
               <p className="text-sm font-medium mb-1">Tips for Better Results</p>
               <ul className="text-xs text-muted-foreground space-y-0.5">
                 <li>• Use natural language to describe your idea</li>
                 <li>• Lower similarity threshold for more diverse results</li>
                 <li>• Try different keyword combinations</li>
               </ul>
             </div>
           </div>
         </div>
      </CardContent>
    </Card>
  );
} 