"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";

export function NotificationHistory() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    
    // Filter by search query
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
        return 'border-l-blue-500';
      case 'collaboration_accepted':
        return 'border-l-green-500';
      case 'collaboration_removed':
        return 'border-l-red-500';
      case 'permission_changed':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'collaboration_invited':
        return 'Invitation';
      case 'collaboration_accepted':
        return 'Accepted';
      case 'collaboration_removed':
        return 'Removed';
      case 'permission_changed':
        return 'Permission';
      default:
        return 'General';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification History</h2>
          <p className="text-muted-foreground">
            Manage your notifications and collaboration updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.read).length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="collaboration_invited">Invitations</SelectItem>
                <SelectItem value="collaboration_accepted">Accepted</SelectItem>
                <SelectItem value="collaboration_removed">Removed</SelectItem>
                <SelectItem value="permission_changed">Permissions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'ll see collaboration updates and other notifications here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'bg-muted/30 border-l-4 ' + getNotificationColor(notification.type) : 'bg-background'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{notification.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{notification.message}</p>
                    {notification.data?.idea_title && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm text-foreground">
                        <strong>Idea:</strong> {notification.data.idea_title}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
