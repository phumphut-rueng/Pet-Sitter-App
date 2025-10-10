import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUnreadCount = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันสำหรับดึง unread count จาก API
  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Fetching unread count for user:', userId);
      const response = await axios.get('/api/chat/unread-count');
      
      if (response.data.success) {
        const newCount = response.data.totalUnreadCount || 0;
        console.log('Unread count updated:', newCount);
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูล unread count เมื่อ component mount
  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
    }
  }, [userId]);

  // ฟัง unread_update event จาก custom events
  useEffect(() => {
    const handleUnreadUpdate = (event: CustomEvent) => {
      const data = event.detail;
      console.log('Received unread_update in navbar via custom event:', data);
      // Fetch ข้อมูลใหม่จาก API เพื่อความแม่นยำ
      fetchUnreadCount();
    };

    const handleReceiveMessage = (event: CustomEvent) => {
      const message = event.detail;
      console.log('Received message in navbar via custom event:', message);
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
  }, []); // ✅ ลบ userId ออกจาก dependency array

  return {
    unreadCount,
    loading,
    hasUnread: unreadCount > 0,
    refreshUnreadCount: fetchUnreadCount
  };
};
