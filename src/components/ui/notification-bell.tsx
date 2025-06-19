"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollaboration, CollaborationRequest } from "@/hooks/use-collaboration";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const {
    pendingRequests,
    loading,
    acceptCollaborationRequest,
    declineCollaborationRequest,
  } = useCollaboration();
  
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pendingCount = pendingRequests.length;

  const handleAcceptRequest = async (requestId: string) => {
    try {
      console.log('NotificationBell: Accepting request with ID:', requestId);
      console.log('NotificationBell: Selected request:', selectedRequest);
      await acceptCollaborationRequest(requestId, 'view');
      setIsDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineCollaborationRequest(requestId);
      setIsDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const openRequestDialog = (request: CollaborationRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            title={`${pendingCount} pending collaboration requests`}
          >
            <Bell className={cn(
              "h-4 w-4 transition-colors",
              pendingCount > 0 && "text-primary animate-pulse"
            )} />
            {pendingCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {pendingCount > 9 ? '9+' : pendingCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration Requests
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {pendingCount === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              {pendingRequests.map((request) => (
                <DropdownMenuItem
                  key={request.id}
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                  onClick={() => openRequestDialog(request)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {request.idea_title || 'Untitled Idea'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        from {request.requester_email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(request.id);
                        }}
                        title="Accept"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeclineRequest(request.id);
                        }}
                        title="Decline"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {request.message && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <p className="line-clamp-3 whitespace-pre-line">
                        {request.message}
                      </p>
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Request Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collaboration Request</DialogTitle>
            <DialogDescription>
              Review the collaboration request details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Idea</h4>
                <p className="font-semibold">{selectedRequest.idea_title || 'Untitled Idea'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">From</h4>
                <p>{selectedRequest.requester_email}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Requested</h4>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}
                </p>
              </div>
              
              {selectedRequest.message && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Message</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    "{selectedRequest.message}"
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedRequest && handleDeclineRequest(selectedRequest.id)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={() => selectedRequest && handleAcceptRequest(selectedRequest.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
