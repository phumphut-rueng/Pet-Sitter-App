/**
 * useUnreadCount Hook - Chat unread count management
 * 
 *  Updated Features:
 * - Fetches unread count from /api/chat/unread-count endpoint
 * - Listens to socket:unread_update and socket:receive_message events
 * - Auto-refreshes when receiving new messages
 * - Returns unreadCount, loading state, and refresh function
 */
import { useState, useEffect, useCallback } from 'react';

export const useUnreadCount = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันสำหรับดึง unread count จาก API
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    try {
      // ดึง unread count จาก API
      const response = await fetch('/api/chat/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.totalUnreadCount || 0);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ดึงข้อมูล unread count เมื่อ component mount
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
    }
  }, [userId, fetchUnreadCount]);

  // ฟัง unread_update event จาก custom events
  useEffect(() => {
    const handleUnreadUpdate = () => {
      // Fetch ข้อมูลใหม่จาก API เพื่อความแม่นยำ
      fetchUnreadCount();
    };

    const handleReceiveMessage = () => {
      // เมื่อได้รับข้อความใหม่ ให้ refresh unread count
      fetchUnreadCount();
    };

    // เพิ่ม event listeners สำหรับ custom events
    window.addEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
    window.addEventListener('socket:receive_message', handleReceiveMessage as EventListener);

    return () => {
      window.removeEventListener('socket:unread_update', handleUnreadUpdate as EventListener);
      window.removeEventListener('socket:receive_message', handleReceiveMessage as EventListener);
    };
  }, [fetchUnreadCount]); //  เพิ่ม fetchUnreadCount ใน dependency array

  return {
    unreadCount,
    loading,
    hasUnread: unreadCount > 0,
    refreshUnreadCount: fetchUnreadCount
  };
};
