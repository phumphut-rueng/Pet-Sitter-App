import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useUnreadCount = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันสำหรับดึง unread count จาก API
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/chat/unread-count');
      
      if (response.data.success) {
        const newCount = response.data.totalUnreadCount || 0;
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
  }, [fetchUnreadCount]); // ✅ เพิ่ม fetchUnreadCount ใน dependency array

  return {
    unreadCount,
    loading,
    hasUnread: unreadCount > 0,
    refreshUnreadCount: fetchUnreadCount
  };
};
