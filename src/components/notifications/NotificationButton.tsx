import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationContext } from '@/lib/notifications/NotificationContext';

/**
 * NotificationButton Component
 * 
 * ใช้งานใน Navbar โดยครอบ button และ dropdown ด้วย relative container
 * เพื่อให้ dropdown แสดงในตำแหน่งที่สัมพันธ์กับปุ่มอย่างถูกต้อง
 */
export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotificationContext();

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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-5 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
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
