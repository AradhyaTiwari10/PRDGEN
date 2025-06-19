import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw error;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .rpc('mark_notification_read', { notification_id: notificationId });

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: updatedCount, error } = await supabase
        .rpc('mark_all_notifications_read');

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      if (updatedCount > 0) {
        toast({
          title: 'Success',
          description: `Marked ${updatedCount} notifications as read`,
        });
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  const createNotification = async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const { data: notificationId, error } = await supabase
        .rpc('create_notification', {
          target_user_id: userId,
          notification_type: type,
          notification_title: title,
          notification_message: message,
          notification_data: data || {}
        });

      if (error) throw error;
      return notificationId;
    } catch (err) {
      console.error('Failed to create notification:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });

      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchNotifications();
    const cleanupPromise = setupSubscription();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}
