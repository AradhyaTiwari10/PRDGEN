"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CollaboratorsManagement } from "@/components/ui/collaborators-management";
import { 
  Users, 
  Eye, 
  Edit, 
  Crown, 
  ExternalLink,
  Calendar,
  User
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Idea } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface SharedIdeaWithDetails extends Idea {
  permission_level: 'read' | 'write';
  shared_at: string;
  owner_email: string;
}

export function SharedIdeasGrid() {
  const [sharedIdeas, setSharedIdeas] = useState<SharedIdeaWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSharedIdeas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get shared ideas where current user is a collaborator
      const { data: sharedData, error } = await supabase
        .from('shared_ideas')
        .select('*')
        .eq('collaborator_id', user.id);

      if (error) {
        console.error('Error fetching shared ideas:', error);
        // If table doesn't exist, show empty state
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          setSharedIdeas([]);
          return;
        }
        return;
      }

      // Transform the data and get idea details + owner emails
      const sharedIdeasWithDetails = await Promise.all(
        (sharedData || []).map(async (shared) => {
          // Get idea details
          const { data: ideaData, error: ideaError } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', shared.idea_id)
            .single();

          if (ideaError) {
            console.error('Error fetching idea details:', ideaError);
            return null;
          }

          // Get owner email (use owner_id from shared_ideas, not user_id from ideas)
          let ownerEmail = 'Unknown Owner';
          try {
            const ownerEmailResult = await supabase
              .rpc('get_user_by_email_reverse', { user_id: shared.owner_id });

            if (ownerEmailResult.data) {
              ownerEmail = ownerEmailResult.data;
            }
          } catch (error) {
            console.warn('Could not fetch owner email:', error);
            // Fallback to a more user-friendly display
            ownerEmail = `User ${shared.owner_id.slice(0, 8)}`;
          }

          return {
            ...ideaData,
            permission_level: shared.permission_level,
            shared_at: shared.created_at,
            owner_email: ownerEmail
          };
        })
      );

      // Filter out null values (failed idea fetches)
      const validSharedIdeas = sharedIdeasWithDetails.filter(idea => idea !== null);
      setSharedIdeas(validSharedIdeas);
    } catch (error) {
      console.error('Failed to fetch shared ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedIdeas();
  }, []);

  const getPermissionIcon = (permission: string) => {
    return permission === 'write' ? (
      <Edit className="h-3 w-3" />
    ) : (
      <Eye className="h-3 w-3" />
    );
  };

  const getPermissionBadge = (permission: string) => {
    return permission === 'write' ? (
      <Badge variant="default" className="gap-1">
        <Edit className="h-3 w-3" />
        Write
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <Eye className="h-3 w-3" />
        Read
      </Badge>
    );
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sharedIdeas.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Shared Ideas</h3>
        <p className="text-muted-foreground">
          Ideas shared with you by other users will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sharedIdeas.map((idea) => (
        <Card
          key={idea.id}
          className="group relative cursor-pointer hover:shadow-xl transition-all duration-300 ease-out flex flex-col h-full min-h-[280px] hover:scale-105 hover:-translate-y-2 transform-gpu overflow-hidden border hover:border-primary/20"
          onClick={() => navigate(`/idea/${idea.id}`)}
        >
          {/* Shared Indicator */}
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="outline" className="gap-1 bg-background/80 backdrop-blur-sm">
              <Users className="h-3 w-3" />
              Shared
            </Badge>
          </div>

          {/* Hover Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 pr-16">
              {idea.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-3 w-3" />
              <span>by {idea.owner_email}</span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 relative z-10">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                {idea.description}
              </p>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                  {capitalizeFirst(idea.status)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                  {capitalizeFirst(idea.priority)}
                </span>
                {getPermissionBadge(idea.permission_level)}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Shared {formatDistanceToNow(new Date(idea.shared_at), { addSuffix: true })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/idea/${idea.id}`);
                  }}
                  className="w-full gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Idea
                </Button>

                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="w-full"
                >
                  <CollaboratorsManagement 
                    idea={idea}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-sm px-3 py-2 min-h-[32px] flex items-center justify-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        View Collaborators
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
