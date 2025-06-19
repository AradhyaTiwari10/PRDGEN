"use client";

import { useState } from "react";
import { Bell, Check, Trash2, MoreHorizontal, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { useCollaboration } from "@/hooks/use-collaboration";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";
import { useNavigate } from "react-router-dom";

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const {
    pendingRequests,
    acceptCollaborationRequest,
    declineCollaborationRequest
  } = useCollaboration();
  const [isOpen, setIsOpen] = useState(false);

  // Total notification count (general notifications + collaboration requests)
  const totalCount = unreadCount + pendingRequests.length;

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptCollaborationRequest(requestId, 'view');
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineCollaborationRequest(requestId);
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    // Use replace to update the URL and trigger the tab change
    window.location.href = '/dashboard?tab=notifications';
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'collaboration_invited':
        return '🤝';
      case 'collaboration_accepted':
        return '✅';
      case 'collaboration_removed':
        return '❌';
      case 'permission_changed':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'collaboration_invited':
        return 'bg-background border-l-4 border-l-blue-500';
      case 'collaboration_accepted':
        return 'bg-background border-l-4 border-l-green-500';
      case 'collaboration_removed':
        return 'bg-background border-l-4 border-l-red-500';
      case 'permission_changed':
        return 'bg-background border-l-4 border-l-orange-500';
      default:
        return 'bg-background border-l-4 border-l-gray-500';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 animate-scale-in" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-96">
          {totalCount === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {/* Collaboration Requests Section */}
              {pendingRequests.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Collaboration Requests
                    </h4>
                  </div>
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 rounded-lg border bg-background border-l-4 border-l-blue-500 hover:bg-muted/50 transition-smooth animate-slide-in"
                    >
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-sm truncate">
                            {request.idea_title || 'Untitled Idea'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="truncate block">from {request.requester_email}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </p>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              "{request.message}"
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 text-xs transition-bounce hover:scale-105"
                              onClick={() => handleAcceptRequest(request.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs transition-bounce hover:scale-105"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 0 && <Separator className="my-2" />}
                </>
              )}

              {/* General Notifications Section */}
              {notifications.length > 0 && (
                <>
                  <div className="px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recent Activity
                    </h4>
                  </div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-smooth hover:bg-muted/50 animate-slide-in ${
                        !notification.read ? getNotificationColor(notification.type) : 'bg-background'
                      }`}
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm truncate flex-1">
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.read && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {totalCount > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={handleViewAllNotifications}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
