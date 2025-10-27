import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Bell, MessageSquare, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { PetPawLoading } from '@/components/loading/PetPawLoading';
import { useNotificationContext } from '@/lib/notifications/NotificationContext';
import axios from 'axios';


interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
  };
  onMarkAsRead: (id: number) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  // Map notification type to icon and color
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'message': return { icon: MessageSquare, color: 'bg-blue', textColor: 'text-white' };
      case 'booking': return { icon: Calendar, color: 'bg-green', textColor: 'text-white' };
      case 'payment': return { icon: DollarSign, color: 'bg-green', textColor: 'text-white' };
      case 'system': return { icon: AlertCircle, color: 'bg-orange-5', textColor: 'text-white' };
      case 'admin': return { icon: Bell, color: 'bg-red', textColor: 'text-white' };
      default: return { icon: Bell, color: 'bg-gray-5', textColor: 'text-white' };
    }
  };
  
  const { icon: Icon, color } = getIconAndColor(notification.type);
  
  
  return (
    <div 
      className={`p-4 border-b border-gray-2 hover:bg-gray-1 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-5 border-l-4 border-l-blue' : ''
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
        <div className="flex items-start gap-4">
          {/* Profile Picture / Icon */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            {!notification.isRead && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-5 rounded-full border-2 border-white"></div>
            )}
          </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-ink text-sm leading-relaxed">
                <span className="font-semibold">{notification.title}</span>
                <br />
                <span className="text-gray-6">{notification.message}</span>
              </p>
              <p className="text-gray-4 text-xs mt-2">{notification.time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotificationContext();
  
  // Redirect ถ้าไม่ได้ login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const [isClearing, setIsClearing] = useState(false);

  const handleClearNotifications = async () => {
    setIsClearing(true);
    try {
      await axios.delete('/api/notifications/clear');
      await refreshNotifications(); // รีเฟรชข้อมูล
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsClearing(false);
    }
  };



  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PetPawLoading message="Loading notifications..." size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // จะ redirect ไป login
  }

  return (
    <>
      <Head>
        <title>Notifications</title>
      </Head>

      <div className="min-h-screen bg-gray-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-orange-5" />
              <h1 className="text-2xl font-bold text-ink">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-orange-5 text-white text-sm px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-orange-5 hover:text-orange-6 text-sm font-medium"
                >
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearNotifications}
                  disabled={isClearing}
                  className="bg-red-5 hover:bg-red-6 disabled:bg-gray-4 text-orange-5 hover:text-orange-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-2 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-1 rounded-full mb-3">
                  <Bell className="w-8 h-8 text-gray-4" />
                </div>
                <p className="text-sm text-gray-6 mb-4">No notifications yet</p>
                <p className="text-xs text-gray-4 mb-4">We&apos;ll notify you when something arrives!</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
