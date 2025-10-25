import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationContext } from '@/lib/notifications/NotificationContext';

/**
 * NotificationButton Component
 * 
 * ใช้งานใน Navbar โดยครอบ button และ dropdown ด้วย relative container
 * เพื่อให้ dropdown แสดงในตำแหน่งที่สัมพันธ์กับปุ่มอย่างถูกต้อง
 * 
 * Updated Features:
 * - Integrated with NotificationContext for centralized state management
 * - Real-time unread count updates via Socket.IO
 * - Removed debug logs for production use
 */
export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotificationContext();

  // Listen for immediate updates and sync with context
  useEffect(() => {
    const handleImmediateUpdate = () => {
      // Also refresh notifications to get accurate count
      fetchNotifications();
    };

    window.addEventListener('update:notification_count', handleImmediateUpdate);
    return () => window.removeEventListener('update:notification_count', handleImmediateUpdate);
  }, [fetchNotifications]);

  // Use context count as primary source of truth
  const displayCount = unreadCount;
  

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-6 hover:text-orange-5 hover:bg-orange-1/40 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-orange-5 focus-visible:ring-offset-2"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread indicator */}
        {displayCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-5 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-medium">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      {/* Dropdown - positioned relative to parent container */}
      <NotificationDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}
