import React, { useRef, useEffect } from 'react';
import { Bell, MessageSquare, Calendar, AlertCircle, X, DollarSign } from 'lucide-react';
import { useNotificationContext } from '@/lib/notifications/NotificationContext';
import Link from 'next/link';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead }: { 
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
  }; 
  onMarkAsRead: (id: number) => void; 
}) {
  // Map notification type to icon and color using design tokens
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
      className={`p-3 border-b border-gray-2 hover:bg-gray-1 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-bg border-l-4 border-l-blue' : ''
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="relative flex-shrink-0">
            <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {!notification.isRead && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-5 rounded-full border-2 border-white"></div>
            )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-ink text-sm2-medium leading-tight">
            {notification.title}
          </p>
          <p className="text-gray-6 text-xs2-regular mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-gray-4 text-xs2-regular mt-1">{notification.time}</p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotificationContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile - optional dark overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 md:bg-transparent" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dropdown positioned relative to parent */}
      <div 
        ref={dropdownRef}
        className="fixed top-16 right-2 w-[calc(100vw-1rem)] sm:absolute sm:top-full sm:right-0 sm:mt-2 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-5" />
              <h3 className="text-sm2-medium text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-5 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-1 rounded-lg transition-colors"
              aria-label="Close notifications"
            >
              <X className="flex items-center justify-center w-4 h-4 text-gray-6" />
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleMarkAllAsRead}
                className="text-orange-5 hover:text-orange-6 text-sm2-regular transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List with scrollbar */}
        <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-1 rounded-full mb-3">
                <Bell className="w-8 h-8 text-gray-4" />
              </div>
              <p className="text-sm2-regular text-gray-6">No notifications yet</p>
                     <p className="text-xs2-regular text-gray-4 mt-1">We&apos;ll notify you when something arrives!</p>
            </div>
          ) : (
            notifications.slice(0, 10).map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-2">
            <Link 
              href="/notifications"
              onClick={onClose} // ปิด dropdown เมื่อคลิก
              className="block w-full text-center text-blue-5 hover:text-blue-6 text-sm2-regular transition-colors"
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
