/**
 * NotificationContext - Global notification state management
 * 
 * Added Features:
 * - Real-time notification updates via Socket.IO events
 * - Auto-refresh when window becomes visible or gains focus
 * - Centralized error handling with standardized error messages
 * - Socket event listeners for new_notification, notification_update, notification_delete
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { notificationSocket } from './NotificationSocket';

export interface Notification {
  id: number;
  type: 'message' | 'booking' | 'payment' | 'system' | 'admin';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  hasUnread: boolean;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) {
      setNotifications([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // จัดการ error ทุกประเภทให้ไม่แสดง error message
      // เพื่อไม่ให้กระทบต่อการใช้งานหลักของแอป
      setNotifications([]);
      setError(null);
      
      // Log error สำหรับ debugging
      if (axios.isAxiosError(err)) {
        console.warn('Notification API Error:', {
          status: err.response?.status,
          message: err.message,
          url: err.config?.url
        });
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.patch('/api/notifications', {
        action: 'markAsRead',
        notificationId
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('/api/notifications', {
        action: 'markAllAsRead'
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await axios.delete(`/api/notifications?notificationId=${notificationId}`);
      
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Load notifications when component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, fetchNotifications]);


  // Refresh notifications when page becomes visible
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh notifications when page becomes visible
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user?.id, fetchNotifications]);

  // Refresh notifications when window gains focus
  useEffect(() => {
    if (!session?.user?.id) return;

    const handleFocus = () => {
      // Refresh notifications when window gains focus
      fetchNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user?.id, fetchNotifications]);

         // Listen for real-time notification updates
         useEffect(() => {
           const handleNewNotification = (data: unknown) => {
             setNotifications(prev => [data as Notification, ...prev]);
           };

           const handleNotificationUpdate = (data: unknown) => {
             const notification = data as Notification;
             setNotifications(prev =>
               prev.map(notif =>
                 notif.id === notification.id
                   ? { ...notif, ...notification }
                   : notif
               )
             );
           };

           const handleNotificationDelete = (data: unknown) => {
             const notification = data as { id: number };
             setNotifications(prev =>
               prev.filter(notif => notif.id !== notification.id)
             );
           };

           const handleNotificationCountUpdate = () => {
             // Trigger a refresh when count changes
             fetchNotifications();
           };

           const handleNotificationRefresh = () => {
             // Force refresh notifications
             fetchNotifications();
           };

           // Listen for socket events using new NotificationSocket
           notificationSocket.on('socket:new_notification', handleNewNotification);
           notificationSocket.on('socket:notification_update', handleNotificationUpdate);
           notificationSocket.on('socket:notification_delete', handleNotificationDelete);
           notificationSocket.on('socket:notification_count_update', handleNotificationCountUpdate);
           notificationSocket.on('socket:notification_refresh', handleNotificationRefresh);

           // Listen for window events (fallback for external socket server issues)
           const handleWindowNotificationRefresh = () => {
             // Clear existing timeout
             if (refreshTimeout) {
               clearTimeout(refreshTimeout);
             }

             // Use debounce to prevent duplicate refreshes
             const timeout = setTimeout(() => {
               fetchNotifications();
               setRefreshTimeout(null);
             }, 1);

             setRefreshTimeout(timeout);
           };

           // Add handler for update:notification_count
           const handleUpdateNotificationCount = () => {
             // Optimistic update: add count immediately
             setNotifications(prev => {
               const newNotification = {
                 id: Date.now(), // temporary ID
                 type: 'system' as const,
                 title: 'New Notification',
                 message: 'You have a new notification',
                 time: 'Just now',
                 isRead: false,
                 createdAt: new Date().toISOString()
               };
               return [newNotification, ...prev];
             });
             
             // Then fetch real data
             fetchNotifications();
           };

           window.addEventListener('socket:notification_refresh', handleWindowNotificationRefresh);
           window.addEventListener('update:notification_count', handleUpdateNotificationCount);

           return () => {
             notificationSocket.off('socket:new_notification', handleNewNotification);
             notificationSocket.off('socket:notification_update', handleNotificationUpdate);
             notificationSocket.off('socket:notification_delete', handleNotificationDelete);
             notificationSocket.off('socket:notification_count_update', handleNotificationCountUpdate);
             notificationSocket.off('socket:notification_refresh', handleNotificationRefresh);

             // Clean up window event listener
             window.removeEventListener('socket:notification_refresh', handleWindowNotificationRefresh);
             window.removeEventListener('update:notification_count', handleUpdateNotificationCount);

             // Clear timeout on cleanup
             if (refreshTimeout) {
               clearTimeout(refreshTimeout);
             }
           };
         }, [fetchNotifications, refreshTimeout]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasUnread = unreadCount > 0;
  

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasUnread,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
