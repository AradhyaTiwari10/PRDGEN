"use client";

import { useState } from "react";
import { Bell, Users, Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCollaboration } from "@/hooks/use-collaboration";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function CollaborationNotificationBanner() {
  const {
    pendingRequests,
    loading,
    acceptCollaborationRequest,
    declineCollaborationRequest
  } = useCollaboration();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Don't show banner if no pending requests
  if (loading || pendingRequests.length === 0) {
    return null;
  }

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await acceptCollaborationRequest(requestId, 'view');
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await declineCollaborationRequest(requestId);
    } catch (error) {
      console.error('Failed to decline request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 via-blue-600/5 to-purple-500/10 border-blue-500/20 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-blue-400 animate-pulse" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
              >
                {pendingRequests.length}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-lg text-blue-400">
                Collaboration Request{pendingRequests.length > 1 ? 's' : ''}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {pendingRequests.length} pending invitation{pendingRequests.length > 1 ? 's' : ''} waiting for your response
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {pendingRequests.map((request, index) => (
              <div key={request.id}>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-medium text-foreground truncate">
                        {request.idea_title || 'Untitled Idea'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{request.requester_email}</span>
                        {' '}wants to collaborate with you
                      </p>
                    </div>
                    
                    {request.message && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm text-muted-foreground italic">
                          "{request.message}"
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingRequest === request.id}
                      onClick={() => handleDeclineRequest(request.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      disabled={processingRequest === request.id}
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingRequest === request.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {index < pendingRequests.length - 1 && (
                  <Separator className="opacity-50" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Tip:</strong> Accepting a collaboration request gives the requester view access to your idea. 
              You can change permissions anytime using the "Manage" button on your idea.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
} 